// src/lib/stores/session.ts
import { writable, derived, get } from 'svelte/store';

import { browser } from '$app/environment';
import type { User } from '$lib/types';

interface SessionState {
	sessionId: string | null;
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isEditor: boolean;
	isInitialized: boolean;
}

function createSessionStore() {
	const { subscribe, update } = writable<SessionState>({
		sessionId: null,
		user: null,
		isAuthenticated: false,
		isAdmin: false,
		isEditor: false,
		isInitialized: false,
	});

	return {
		subscribe,

		// Initialisation depuis les données du serveur
		init(serverData?: { sessionId: string; user?: User | null }) {
			if (serverData?.sessionId) {
				update((state) => ({
					...state,
					sessionId: serverData.sessionId,
					user: serverData.user || null,
					isAuthenticated: !!serverData.user,
					isAdmin: serverData.user?.role === 'ADMIN',
					isEditor: serverData.user?.role === 'EDITOR' || serverData.user?.role === 'ADMIN',
					isInitialized: true,
				}));
			} else if (browser) {
				// Fallback si pas de données serveur
				const sessionId = localStorage.getItem('eff93_session_id') || crypto.randomUUID();
				if (!localStorage.getItem('eff93_session_id')) {
					localStorage.setItem('eff93_session_id', sessionId);
				}

				update((state) => ({
					...state,
					sessionId,
					isInitialized: true,
				}));
			}
		},

		getSessionId(): string | null {
			const state = get({ subscribe });
			return state.sessionId;
		},

		setUser(user: User | null) {
			update((state) => ({
				...state,
				user,
				isAuthenticated: !!user,
				isAdmin: user?.role === 'ADMIN',
				isEditor: user?.role === 'EDITOR' || user?.role === 'ADMIN',
			}));
		},

		clear() {
			if (browser) {
				localStorage.removeItem('eff93_token');
				// On garde le sessionId même après logout
			}
			update((state) => ({
				...state,
				user: null,
				isAuthenticated: false,
				isAdmin: false,
				isEditor: false,
			}));
		},

		// Méthode pour vérifier si la session est prête
		async waitForInit(): Promise<void> {
			return new Promise((resolve) => {
				const unsubscribe = subscribe((state) => {
					if (state.isInitialized) {
						unsubscribe();
						resolve();
					}
				});
			});
		},
	};
}

export const session = createSessionStore();

// Derived stores
export const isAuthenticated = derived(session, ($session) => $session.isAuthenticated);
export const isAdmin = derived(session, ($session) => $session.isAdmin);
export const isEditor = derived(session, ($session) => $session.isEditor);
export const currentUser = derived(session, ($session) => $session.user);
export const sessionId = derived(session, ($session) => $session.sessionId);
