// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

import { dev } from '$app/environment';
import type { User } from '$lib/types';

interface LayoutData {
	sessionId: string;
	user: User | null;
	initialFavorites: string[];
}

export const load: LayoutServerLoad = async ({ cookies, locals }): Promise<LayoutData> => {
	// Récupérer ou créer un session ID
	let sessionId = cookies.get('eff93_session_id');

	if (!sessionId) {
		// Générer un nouveau session ID
		sessionId = crypto.randomUUID();

		// Stocker dans un cookie httpOnly pour plus de sécurité
		cookies.set('eff93_session_id', sessionId, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 jours
		});
	}

	// Récupérer les favoris depuis le cookie (pour SSR initial)
	const favoritesCookie = cookies.get('eff93_favorites');
	let initialFavorites: string[] = [];

	if (favoritesCookie) {
		try {
			const parsed = JSON.parse(decodeURIComponent(favoritesCookie));
			if (Array.isArray(parsed)) {
				initialFavorites = parsed;
			}
		} catch (e) {
			// Si erreur de parsing, on ignore
			initialFavorites = [];
		}
	}

	// Récupérer l'utilisateur depuis locals (si authentifié)
	const user = locals.user || null;

	// Toujours retourner un objet avec toutes les propriétés
	return {
		sessionId,
		user,
		initialFavorites,
	};
};
