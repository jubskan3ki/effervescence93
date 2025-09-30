// src/lib/api/client.ts
import { browser, dev } from '$app/environment';
import { goto } from '$app/navigation';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const DEFAULT_TIMEOUT = 15_000; // 15s

// ===== Types & erreurs =====
export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public data?: unknown,
		public url?: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

type ApiInit = RequestInit & {
	auth?: boolean; // Ajoute le Bearer
	sessionId?: boolean; // Ajoute x-session-id
	timeoutMs?: number; // Timeout custom
	signal?: AbortSignal; // Abort externe
};

// ===== Token (cookie + localStorage + mémoire) =====
let inMemoryToken: string | null = null;

function readCookie(name: string): string | null {
	if (!browser) return null;
	const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
	return m ? decodeURIComponent(m[1]) : null;
}

export function setAccessToken(token: string | null, opts?: { remember?: boolean }) {
	inMemoryToken = token;
	if (!browser) return;

	const base = 'Path=/; SameSite=Lax';
	const isHttps = typeof location !== 'undefined' && location.protocol === 'https:';
	const secure = isHttps ? '; Secure' : '';

	if (token) {
		// Cookie lisible côté client (permet à +layout.server.ts de le récupérer côté serveur)
		const maxAge = opts?.remember ? 60 * 60 * 24 * 7 : undefined; // 7 jours
		document.cookie = `access_token=${encodeURIComponent(token)}; ${base}${secure}${
			maxAge ? `; Max-Age=${maxAge}` : ''
		}`;
		// Fallback client
		localStorage.setItem('eff93_token', token);
	} else {
		// Supprime cookie + fallback
		document.cookie = `access_token=; ${base}${secure}; Max-Age=0`;
		localStorage.removeItem('eff93_token');
	}
}

export function clearAccessToken() {
	setAccessToken(null);
}

export function getAccessToken(): string | null {
	if (inMemoryToken) return inMemoryToken;
	if (!browser) return null;

	// Cookie prioritaire (utile entre onglets)
	const fromCookie = readCookie('access_token');
	if (fromCookie) {
		inMemoryToken = fromCookie;
		return fromCookie;
	}

	// Fallback localStorage
	const fromLS = localStorage.getItem('eff93_token');
	if (fromLS) inMemoryToken = fromLS;
	return inMemoryToken;
}

// ===== Session anonyme =====
export function getSessionId(): string | undefined {
	if (!browser) return undefined;
	let sid = localStorage.getItem('eff93_session_id');
	if (!sid) {
		sid = crypto.randomUUID();
		localStorage.setItem('eff93_session_id', sid);
	}
	return sid;
}

// ===== Helpers =====
export function withQuery(path: string, query?: Record<string, unknown>) {
	if (!query || Object.keys(query).length === 0) return path;
	const qs = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v === undefined || v === null) continue;
		qs.append(k, String(v));
	}
	return `${path}?${qs.toString()}`;
}

async function parseJSONSafe(res: Response) {
	const ct = res.headers.get('content-type') || '';
	if (!ct.includes('application/json')) return undefined;
	try {
		return await res.json();
	} catch {
		return undefined;
	}
}

function toAbsoluteUrl(path: string) {
	// Permet d'appeler api('/auth/login') ou api('http://…')
	if (/^https?:\/\//i.test(path)) return path;
	return `${API_URL}${path}`;
}

// ===== Client principal =====
export async function api<T>(path: string, options: ApiInit = {}): Promise<T> {
	const url = toAbsoluteUrl(path);
	const {
		auth = false,
		sessionId = true,
		timeoutMs = DEFAULT_TIMEOUT,
		signal: externalSignal,
		...fetchOptions
	} = options;

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	// Si un signal externe arrive, on annule aussi ce contrôleur
	if (externalSignal) {
		if (externalSignal.aborted) controller.abort();
		else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(fetchOptions.headers as Record<string, string>),
	};

	// Bearer pour routes protégées
	if (auth) {
		const token = getAccessToken();
		if (token) headers.Authorization = `Bearer ${token}`;
	}

	// Session anonyme
	if (sessionId && browser) {
		const sid = getSessionId();
		if (sid) headers['x-session-id'] = sid;
	}

	try {
		const res = await fetch(url, {
			...fetchOptions,
			headers,
			credentials: 'include', // envoie les cookies (ex: access_token si même site)
			signal: controller.signal,
		});

		// 204 No Content
		if (res.status === 204) return undefined as T;

		// Erreurs HTTP
		if (!res.ok) {
			// 401: purge token + redirection (uniquement côté client)
			if (res.status === 401 && auth && browser) {
				clearAccessToken();
				if (!location.pathname.startsWith('/auth')) {
					// évite boucle infinie si déjà sur /auth/*
					goto('/auth/login');
				}
			}

			const data = await parseJSONSafe(res);
			const message =
				(typeof data === 'object' && data && 'message' in (data as any) && (data as any).message) ||
				res.statusText ||
				'Erreur API';
			throw new ApiError(res.status, String(message), data, url);
		}

		// Réponse JSON | texte
		const data = await parseJSONSafe(res);
		return (data ?? ((await res.text()) as unknown)) as T;
	} catch (err: any) {
		if (dev) console.error(`[API] ${url}`, err);
		if (err?.name === 'AbortError') {
			throw new ApiError(0, 'Requête expirée', undefined, url);
		}
		throw err;
	} finally {
		clearTimeout(timer);
	}
}
