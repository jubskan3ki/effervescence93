// src/lib/api/analytics.ts
import { api } from './client';

import type { AnalyticsStats, TopExhibitor } from '$lib/types';

type EventType = 'view' | 'search' | 'filter' | 'favorite' | 'share' | 'click';

interface TrackEventPayload {
	type: EventType;
	sessionId?: string;
	exhibitorId?: string;
	searchQuery?: string;
	payload?: Record<string, any>;
}

// Générer ou récupérer un sessionId unique pour cet utilisateur
function getSessionId(): string {
	if (typeof window === 'undefined') return '';

	const STORAGE_KEY = 'analytics_session_id';
	let sessionId = sessionStorage.getItem(STORAGE_KEY);

	if (!sessionId) {
		// Générer un ID unique basé sur timestamp + random
		sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
		sessionStorage.setItem(STORAGE_KEY, sessionId);
	}

	return sessionId;
}

export const analytics = {
	// Track un événement
	async track(event: TrackEventPayload): Promise<void> {
		try {
			await api('/analytics/track', {
				method: 'POST',
				body: JSON.stringify({
					...event,
					sessionId: event.sessionId || getSessionId(),
					userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
				}),
			});
		} catch (error) {
			console.error('Analytics track failed:', error);
		}
	},

	// Track une vue d'exposant
	async trackView(exhibitorId: string, source = 'web'): Promise<void> {
		await this.track({
			type: 'view',
			exhibitorId,
			payload: { source },
		});
	},

	// Track une recherche
	async trackSearch(query: string, filters?: Record<string, any>): Promise<void> {
		await this.track({
			type: 'search',
			searchQuery: query,
			payload: { filters },
		});
	},

	// Track une action sur les favoris
	async trackFavorite(exhibitorId: string, action: 'add' | 'remove' | 'clear'): Promise<void> {
		// Tracker tous les favoris pour les stats par exposant
		await this.track({
			type: 'favorite',
			exhibitorId: action === 'clear' ? undefined : exhibitorId,
			payload: { action },
		});
	},

	// Track un partage
	async trackShare(exhibitorId: string, method = 'unknown'): Promise<void> {
		await this.track({
			type: 'share',
			exhibitorId,
			payload: { method },
		});
	},

	// === ADMIN ENDPOINTS ===

	// Obtenir les statistiques globales (admin)
	async getStats(from?: string, to?: string): Promise<AnalyticsStats> {
		try {
			const params = new URLSearchParams();
			if (from) params.append('from', from);
			if (to) params.append('to', to);

			const url = params.toString() ? `/analytics/stats?${params}` : '/analytics/stats';
			const response = await api<any>(url, { auth: true });

			// Le backend retourne maintenant les bonnes valeurs
			return {
				totalViews: response.totalViews || 0,
				uniqueSessions: response.uniqueSessions || 0,
				totalSearches: response.totalSearches || 0,
				totalFavorites: response.totalFavorites || 0,
				topSearchTerms:
					response.topSearches?.map((s: any) => ({
						term: s.query,
						count: s.count,
					})) || [],
			};
		} catch (error) {
			console.error('Failed to get analytics stats:', error);
			return {
				totalViews: 0,
				uniqueSessions: 0,
				totalSearches: 0,
				totalFavorites: 0,
				topSearchTerms: [],
			};
		}
	},

	// Obtenir les top exposants
	async getTopExhibitors(limit = 10): Promise<TopExhibitor[]> {
		try {
			const response = await api<any[]>(`/analytics/top-exhibitors?limit=${limit}`, { auth: true });

			return response.map((item) => ({
				id: item.id,
				name: item.name,
				slug: item.slug,
				views: item.views || 0,
				favorites: item.favorites || 0,
				sector: item.sector,
			}));
		} catch (error) {
			console.error('Failed to get top exhibitors:', error);
			return [];
		}
	},
};
