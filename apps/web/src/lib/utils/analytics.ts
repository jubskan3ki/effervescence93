// src/lib/utils/analytics.ts

/**
 * Analytics utility for tracking user interactions
 */

import { APP_CONFIG } from '@lib/constants/config';

interface TrackEventData {
	type: 'view' | 'search' | 'filter' | 'share' | 'qr_scan' | 'favorite';
	sessionId?: string;
	exhibitorId?: string;
	searchQuery?: string;
	userAgent?: string;
	payload?: Record<string, any>;
}

class Analytics {
	private endpoint = '/api/analytics/track';

	private getSessionId(): string {
		return localStorage.getItem(APP_CONFIG.storage.sessionId) || '';
	}

	async track(type: TrackEventData['type'], data: Partial<TrackEventData> = {}): Promise<void> {
		try {
			const eventData: TrackEventData = {
				type,
				sessionId: this.getSessionId(),
				userAgent: navigator.userAgent,
				...data,
			};

			// Fire and forget - don't await
			fetch(this.endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-session-id': this.getSessionId(),
				},
				body: JSON.stringify(eventData),
			}).catch((error) => {
				console.error('Analytics track error:', error);
			});
		} catch (error) {
			console.error('Analytics error:', error);
		}
	}

	// Specific tracking methods
	trackView(exhibitorId: string): void {
		this.track('view', { exhibitorId });
	}

	trackSearch(query: string, resultsCount?: number): void {
		this.track('search', {
			searchQuery: query,
			payload: { resultsCount },
		});
	}

	trackFilter(filterType: string, filterValue: any): void {
		this.track('filter', {
			payload: { filterType, filterValue },
		});
	}

	trackShare(exhibitorId: string, method: 'link' | 'qr' | 'email'): void {
		this.track('share', {
			exhibitorId,
			payload: { method },
		});
	}

	trackQRScan(exhibitorId?: string, boothNumber?: string): void {
		this.track('qr_scan', {
			exhibitorId,
			payload: { boothNumber },
		});
	}

	trackFavorite(exhibitorId: string, action: 'add' | 'remove'): void {
		this.track('favorite', {
			exhibitorId,
			payload: { action },
		});
	}
}

export const analytics = new Analytics();
