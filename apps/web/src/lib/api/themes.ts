// src/lib/api/themes.ts
import { api } from './client';

import type { Theme } from '$lib/types';

interface ThemeData {
	name: string;
	description?: string;
	order?: number;
	exhibitorIds?: string[];
}

export const themes = {
	// Liste publique
	async list(): Promise<Theme[]> {
		return api<Theme[]>('/themes');
	},

	// Détail
	async get(id: string): Promise<Theme> {
		return api<Theme>(`/themes/${id}`);
	},

	// Créer (admin)
	async create(data: ThemeData): Promise<Theme> {
		return api<Theme>('/themes', {
			method: 'POST',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Mettre à jour (admin)
	async update(id: string, data: Partial<ThemeData>): Promise<Theme> {
		return api<Theme>(`/themes/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Définir les exposants (admin)
	async setExhibitors(id: string, exhibitorIds: string[]): Promise<Theme> {
		return api<Theme>(`/themes/${id}/exhibitors`, {
			method: 'POST',
			body: JSON.stringify({ exhibitorIds }),
			auth: true,
		});
	},

	// Supprimer (admin)
	async delete(id: string): Promise<void> {
		return api(`/themes/${id}`, {
			method: 'DELETE',
			auth: true,
		});
	},
};
