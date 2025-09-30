// src/lib/api/favorites.ts
import { api } from './client';

import type { FavoriteItem } from '$lib/types';

export const favorites = {
	// Liste des favoris - utilise automatiquement x-session-id via le client
	async list(): Promise<FavoriteItem[]> {
		try {
			const response = await api<{ id: string; exhibitor: any; createdAt: string }[]>('/favorites');
			// Adapter la réponse au type FavoriteItem
			return response.map((item) => ({
				exhibitorId: item.exhibitor.id,
				exhibitor: item.exhibitor,
				sessionId: '',
				createdAt: item.createdAt,
			}));
		} catch (error) {
			console.error('Failed to fetch favorites:', error);
			return [];
		}
	},

	// Ajouter un favori
	async add(exhibitorId: string): Promise<boolean> {
		try {
			await api('/favorites', {
				method: 'POST',
				body: JSON.stringify({ exhibitorId }),
			});
			return true;
		} catch (error: any) {
			// Si déjà en favori (409), on considère comme succès
			if (error.status === 409) {
				return true;
			}
			console.error('Failed to add favorite:', error);
			return false;
		}
	},

	// Retirer un favori
	async remove(exhibitorId: string): Promise<boolean> {
		try {
			await api(`/favorites/${exhibitorId}`, {
				method: 'DELETE',
			});
			return true;
		} catch (error: any) {
			// Si pas trouvé (404), on considère comme succès
			if (error.status === 404) {
				return true;
			}
			console.error('Failed to remove favorite:', error);
			return false;
		}
	},

	// Vider tous les favoris
	async clear(): Promise<boolean> {
		try {
			await api('/favorites', {
				method: 'DELETE',
			});
			return true;
		} catch (error) {
			console.error('Failed to clear favorites:', error);
			return false;
		}
	},
};
