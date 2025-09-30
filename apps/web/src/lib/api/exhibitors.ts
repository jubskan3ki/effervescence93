// src/lib/api/exhibitors.ts
import { api } from './client';

import type { Exhibitor, Paged, Contact } from '$lib/types';

interface ExhibitorData {
	name: string;
	logoUrl?: string;
	description?: string;
	websiteUrl?: string;
	linkedinUrl?: string;
	pdfUrl?: string;
	sectorId: string;
	boothId?: string;
	contacts?: Contact[];
}

export const exhibitors = {
	// Liste simple (première page)
	async list(): Promise<Exhibitor[]> {
		try {
			const result = await api<Paged<Exhibitor>>('/exhibitors?limit=300');
			const items = (result as any).data || result.items || [];
			return items;
		} catch (error) {
			console.error('Erreur lors du chargement des exposants:', error);
			return [];
		}
	},

	// Récupérer TOUS les exposants (avec pagination)
	async listAll(): Promise<Exhibitor[]> {
		try {
			const allExhibitors: Exhibitor[] = [];
			let page = 1;
			let hasMore = true;

			while (hasMore) {
				const result = await api<Paged<Exhibitor>>(`/exhibitors?page=${page}&limit=100`);
				const items = (result as any).data || result.items || [];
				const total = result.total || 0;

				allExhibitors.push(...items);
				hasMore = allExhibitors.length < total && items.length > 0;
				page++;

				if (page > 20) break; // Sécurité
			}

			console.log(`✅ Loaded ${allExhibitors.length} exhibitors total`);
			return allExhibitors;
		} catch (error) {
			console.error('Erreur lors du chargement des exposants:', error);
			return [];
		}
	},

	// Recherche avec pagination et filtres
	async search(query = '', page = 1, limit = 300, sectorId?: string): Promise<Paged<Exhibitor>> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		// N'ajouter les paramètres que s'ils ont une valeur
		if (query && query.trim()) {
			params.append('q', query);
		}
		if (sectorId) {
			params.append('sectorId', sectorId);
		}

		const url = `/exhibitors?${params}`;
		console.log('🔍 API search request:', url);

		return api<Paged<Exhibitor>>(url);
	},

	// Détail par ID
	async get(id: string): Promise<Exhibitor> {
		return api<Exhibitor>(`/exhibitors/${id}`);
	},

	// Détail par slug
	async getBySlug(slug: string): Promise<Exhibitor> {
		return api<Exhibitor>(`/exhibitors/by-slug/${slug}`);
	},

	// Créer (admin)
	async create(data: ExhibitorData): Promise<Exhibitor> {
		return api<Exhibitor>('/exhibitors', {
			method: 'POST',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Mettre à jour (admin)
	async update(id: string, data: Partial<ExhibitorData>): Promise<Exhibitor> {
		return api<Exhibitor>(`/exhibitors/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Supprimer (admin)
	async delete(id: string): Promise<void> {
		return api(`/exhibitors/${id}`, {
			method: 'DELETE',
			auth: true,
		});
	},

	// Gestion des contacts (admin)
	async updateContacts(exhibitorId: string, contacts: Contact[]): Promise<Exhibitor> {
		return api<Exhibitor>(`/exhibitors/${exhibitorId}/contacts`, {
			method: 'PUT',
			body: JSON.stringify({ contacts }),
			auth: true,
		});
	},
};
