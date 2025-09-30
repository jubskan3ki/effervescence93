// src/lib/api/booths.ts
import { api } from './client';

import type { Booth } from '$lib/types';

interface BoothStats {
	total: number;
	occupied: number;
	available: number;
}

interface BoothData {
	number: string;
	polygonId: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation?: number;
}

export const booths = {
	// Liste avec recherche
	async list(query?: string): Promise<Booth[]> {
		const params = query ? `?q=${encodeURIComponent(query)}` : '';
		return api<Booth[]>(`/booths${params}`);
	},

	// Par ID
	async get(id: string): Promise<Booth> {
		return api<Booth>(`/booths/${id}`);
	},

	// Par numéro
	async getByNumber(number: string): Promise<Booth> {
		return api<Booth>(`/booths/by-number/${number}`);
	},

	// Par polygon ID
	async getByPolygon(polygonId: string): Promise<Booth> {
		return api<Booth>(`/booths/by-polygon/${polygonId}`);
	},

	// Par zone
	async getByArea(minX: number, minY: number, maxX: number, maxY: number): Promise<Booth[]> {
		const params = new URLSearchParams({
			minX: minX.toString(),
			minY: minY.toString(),
			maxX: maxX.toString(),
			maxY: maxY.toString(),
		});
		return api<Booth[]>(`/booths/area?${params}`);
	},

	// Proximité
	async getNearby(x: number, y: number, radius: number): Promise<Booth[]> {
		const params = new URLSearchParams({
			x: x.toString(),
			y: y.toString(),
			radius: radius.toString(),
		});
		return api<Booth[]>(`/booths/nearby?${params}`);
	},

	// Créer (admin)
	async create(data: BoothData): Promise<Booth> {
		return api<Booth>('/booths', {
			method: 'POST',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Créer en masse (admin)
	async bulkCreate(booths: BoothData[]): Promise<Booth[]> {
		return api<Booth[]>('/booths/bulk', {
			method: 'POST',
			body: JSON.stringify(booths),
			auth: true,
		});
	},

	// Mettre à jour (admin)
	async update(id: string, data: Partial<BoothData>): Promise<Booth> {
		return api<Booth>(`/booths/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			auth: true,
		});
	},

	// Supprimer (admin)
	async delete(id: string): Promise<void> {
		return api<void>(`/booths/${id}`, {
			method: 'DELETE',
			auth: true,
		});
	},

	// Stats (admin)
	async stats(): Promise<BoothStats> {
		return api<BoothStats>('/booths/stats/summary', { auth: true });
	},
};
