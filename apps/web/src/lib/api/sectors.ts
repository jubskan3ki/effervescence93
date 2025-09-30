// src/lib/api/sectors.ts
import { api } from './client';

import type { Sector } from '$lib/types';

interface SectorStats {
	totalExhibitors: number;
	totalViews: number;
}

export const sectors = {
	// Liste publique
	async list(): Promise<Sector[]> {
		return api<Sector[]>('/sectors');
	},

	// Détail
	async get(id: string): Promise<Sector> {
		return api<Sector>(`/sectors/${id}`);
	},

	// Créer (admin)
	async create(data: { name: string; colorHex: string }): Promise<Sector> {
		return api<Sector>('/sectors', {
			method: 'POST',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Mettre à jour (admin)
	async update(id: string, data: Partial<{ name: string; colorHex: string }>): Promise<Sector> {
		return api<Sector>(`/sectors/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Supprimer (admin)
	async delete(id: string): Promise<void> {
		return api(`/sectors/${id}`, {
			method: 'DELETE',
			auth: true,
		});
	},

	// Stats (admin)
	async stats(id: string): Promise<SectorStats> {
		return api<SectorStats>(`/sectors/${id}/stats`, { auth: true });
	},
};
