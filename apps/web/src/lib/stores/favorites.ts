// src/lib/stores/favorites.ts

import { writable, derived, get } from 'svelte/store';

import { API_ENDPOINTS } from '@lib/constants/api';
import { APP_CONFIG } from '@lib/constants/config';
import type { Exhibitor } from '@lib/types/models';

interface FavoritesState {
	items: string[]; // Exhibitor IDs
	isLoading: boolean;
	error: string | null;
}

function createFavoritesStore() {
	const { subscribe, update } = writable<FavoritesState>({
		items: [],
		isLoading: false,
		error: null,
	});

	// Initialize from localStorage
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(APP_CONFIG.storage.favorites);
		if (stored) {
			try {
				const items = JSON.parse(stored);
				if (Array.isArray(items)) {
					update((state) => ({ ...state, items }));
				}
			} catch (e) {
				console.error('Failed to load favorites from storage:', e);
			}
		}
	}

	// Get session ID
	const getSessionId = () => {
		if (typeof window === 'undefined') return '';
		return localStorage.getItem(APP_CONFIG.storage.sessionId) || '';
	};

	// Save to localStorage
	const saveToStorage = (items: string[]) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(APP_CONFIG.storage.favorites, JSON.stringify(items));
		}
	};

	return {
		subscribe,

		async add(exhibitorId: string) {
			const state = get({ subscribe });

			// Check if already in favorites
			if (state.items.includes(exhibitorId)) {
				return;
			}

			// Check max limit
			if (state.items.length >= APP_CONFIG.limits.maxFavorites) {
				update((s) => ({
					...s,
					error: `Maximum de ${APP_CONFIG.limits.maxFavorites} favoris atteint`,
				}));
				return;
			}

			// Optimistic update
			const newItems = [...state.items, exhibitorId];
			update((s) => ({ ...s, items: newItems, error: null }));
			saveToStorage(newItems);

			// Send to API
			try {
				await fetch(API_ENDPOINTS.FAVORITES.ADD, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-session-id': getSessionId(),
					},
					body: JSON.stringify({ exhibitorId }),
				});
			} catch (error) {
				console.error('Failed to sync favorite:', error);
				// Keep the local change even if API fails
			}
		},

		async remove(exhibitorId: string) {
			const state = get({ subscribe });

			// Optimistic update
			const newItems = state.items.filter((id) => id !== exhibitorId);
			update((s) => ({ ...s, items: newItems, error: null }));
			saveToStorage(newItems);

			// Send to API
			try {
				await fetch(API_ENDPOINTS.FAVORITES.REMOVE(exhibitorId), {
					method: 'DELETE',
					headers: {
						'x-session-id': getSessionId(),
					},
				});
			} catch (error) {
				console.error('Failed to sync favorite removal:', error);
				// Keep the local change even if API fails
			}
		},

		toggle(exhibitorId: string) {
			const state = get({ subscribe });
			if (state.items.includes(exhibitorId)) {
				this.remove(exhibitorId);
			} else {
				this.add(exhibitorId);
			}
		},

		has(exhibitorId: string): boolean {
			const state = get({ subscribe });
			return state.items.includes(exhibitorId);
		},

		async load() {
			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const response = await fetch(API_ENDPOINTS.FAVORITES.LIST, {
					headers: {
						'x-session-id': getSessionId(),
					},
				});

				if (!response.ok) {
					throw new Error('Failed to load favorites');
				}

				const favorites: Exhibitor[] = await response.json();
				const items = favorites.map((f) => f.id);

				update((state) => ({
					...state,
					items,
					isLoading: false,
				}));

				saveToStorage(items);
			} catch (error) {
				console.error('Failed to load favorites:', error);
				update((state) => ({
					...state,
					isLoading: false,
					error: 'Impossible de charger les favoris',
				}));
			}
		},

		async clear() {
			// Optimistic update
			update((state) => ({ ...state, items: [], error: null }));

			if (typeof window !== 'undefined') {
				localStorage.removeItem(APP_CONFIG.storage.favorites);
			}

			// Send to API
			try {
				await fetch(API_ENDPOINTS.FAVORITES.CLEAR, {
					method: 'DELETE',
					headers: {
						'x-session-id': getSessionId(),
					},
				});
			} catch (error) {
				console.error('Failed to clear favorites:', error);
			}
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const favoritesStore = createFavoritesStore();

// Derived stores
export const favoriteCount = derived(favoritesStore, ($favorites) => $favorites.items.length);

export const hasFavorites = derived(favoritesStore, ($favorites) => $favorites.items.length > 0);

export const isFavorite = (exhibitorId: string) =>
	derived(favoritesStore, ($favorites) => $favorites.items.includes(exhibitorId));
