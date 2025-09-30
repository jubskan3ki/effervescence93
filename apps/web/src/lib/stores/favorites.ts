// src/lib/stores/favorites.ts
import { writable, derived, get } from 'svelte/store';

import { browser } from '$app/environment';
import * as api from '$lib/api';
import { getSessionId } from '$lib/api/client';
import type { Exhibitor, FavoriteItem } from '$lib/types';

interface FavoriteState {
	ids: Set<string>;
	data: Map<string, Exhibitor>;
	isLoading: boolean;
	isInitialized: boolean;
	lastSync: Date | null;
}

const STORAGE_KEY = 'eff93_favorites';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

function createFavoritesStore() {
	const { subscribe, set, update } = writable<FavoriteState>({
		ids: new Set(),
		data: new Map(),
		isLoading: false,
		isInitialized: false,
		lastSync: null,
	});

	// Sauvegarder dans localStorage et cookie
	function persist(ids: Set<string>) {
		if (!browser) return;

		const idsArray = Array.from(ids);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray));

		// Cookie non-httpOnly pour SSR
		document.cookie = `eff93_favorites=${encodeURIComponent(JSON.stringify(idsArray))}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
	}

	// Charger depuis localStorage
	function loadFromStorage(): Set<string> {
		if (!browser) return new Set();

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? new Set(JSON.parse(stored)) : new Set();
		} catch {
			return new Set();
		}
	}

	// Synchroniser avec l'API
	async function syncWithAPI(): Promise<void> {
		const sessionId = getSessionId();
		if (!sessionId) return;

		try {
			const apiResponse = await api.favorites.list();
			const apiData = new Map<string, Exhibitor>();
			const apiIds = new Set<string>();

			apiResponse.forEach((item: FavoriteItem) => {
				if (item.exhibitor) {
					apiIds.add(item.exhibitor.id);
					apiData.set(item.exhibitor.id, item.exhibitor);
				}
			});

			update((state) => ({
				...state,
				ids: apiIds,
				data: apiData,
				lastSync: new Date(),
			}));

			persist(apiIds);
		} catch (error) {
			console.error('Sync with API failed:', error);
		}
	}

	return {
		subscribe,

		// Initialisation
		async init(serverIds?: string[]) {
			// Si on a des IDs du serveur, les utiliser
			if (serverIds && serverIds.length > 0) {
				update((state) => ({
					...state,
					ids: new Set(serverIds),
					isInitialized: true,
				}));
			} else {
				// Sinon charger depuis localStorage
				const localIds = loadFromStorage();
				update((state) => ({
					...state,
					ids: localIds,
					isInitialized: true,
				}));
			}

			// Lancer une sync en arrière-plan si on a une session
			if (browser && getSessionId()) {
				update((state) => ({ ...state, isLoading: true }));
				await syncWithAPI();
				update((state) => ({ ...state, isLoading: false }));
			}
		},

		// Ajouter un favori
		async add(exhibitor: Exhibitor): Promise<boolean> {
			const state = get({ subscribe });

			// Si déjà en favori, retourner true sans rien faire
			if (state.ids.has(exhibitor.id)) return true;

			// Mise à jour optimiste
			update((s) => {
				const newIds = new Set(s.ids).add(exhibitor.id);
				const newData = new Map(s.data).set(exhibitor.id, exhibitor);
				persist(newIds);
				return { ...s, ids: newIds, data: newData };
			});

			// Sync avec API et track seulement si ajout réussi
			try {
				const success = await api.favorites.add(exhibitor.id);
				if (success) {
					// Track l'ajout seulement ici
					await api.analytics.trackFavorite(exhibitor.id, 'add');
					return true;
				}
			} catch (error) {
				console.error('Failed to add favorite:', error);
			}

			// Rollback si échec
			update((s) => {
				const newIds = new Set(s.ids);
				newIds.delete(exhibitor.id);
				const newData = new Map(s.data);
				newData.delete(exhibitor.id);
				persist(newIds);
				return { ...s, ids: newIds, data: newData };
			});

			return false;
		},

		// Retirer un favori
		async remove(exhibitorId: string): Promise<boolean> {
			const state = get({ subscribe });

			// Si pas en favori, retourner true sans rien faire
			if (!state.ids.has(exhibitorId)) return true;

			const exhibitor = state.data.get(exhibitorId);

			// Mise à jour optimiste
			update((s) => {
				const newIds = new Set(s.ids);
				newIds.delete(exhibitorId);
				const newData = new Map(s.data);
				newData.delete(exhibitorId);
				persist(newIds);
				return { ...s, ids: newIds, data: newData };
			});

			// Sync avec API - PAS de track pour remove
			try {
				const success = await api.favorites.remove(exhibitorId);
				if (success) {
					// Track le remove pour les stats par exposant seulement
					await api.analytics.trackFavorite(exhibitorId, 'remove');
					return true;
				}
			} catch (error) {
				console.error('Failed to remove favorite:', error);
			}

			// Rollback si échec
			if (exhibitor) {
				update((s) => {
					const newIds = new Set(s.ids).add(exhibitorId);
					const newData = new Map(s.data).set(exhibitorId, exhibitor);
					persist(newIds);
					return { ...s, ids: newIds, data: newData };
				});
			}

			return false;
		},

		// Toggle favori
		async toggle(exhibitor: Exhibitor): Promise<boolean> {
			const state = get({ subscribe });
			if (state.ids.has(exhibitor.id)) {
				await this.remove(exhibitor.id);
				return false;
			} else {
				await this.add(exhibitor);
				return true;
			}
		},

		// Vider tous les favoris
		async clear(): Promise<void> {
			const prevState = get({ subscribe });

			// Mise à jour optimiste
			update((s) => ({ ...s, ids: new Set(), data: new Map() }));
			persist(new Set());

			// Sync avec API
			try {
				const success = await api.favorites.clear();
				if (success) {
					// Track le clear
					await api.analytics.trackFavorite('', 'clear');
				} else {
					throw new Error('Failed to clear');
				}
			} catch (error) {
				// Rollback si échec
				set(prevState);
				persist(prevState.ids);
				throw error;
			}
		},

		// Rafraîchir depuis l'API
		async refresh(): Promise<void> {
			const state = get({ subscribe });
			const now = new Date();

			// Ne pas sync trop souvent
			if (state.lastSync && now.getTime() - state.lastSync.getTime() < SYNC_INTERVAL) {
				return;
			}

			update((s) => ({ ...s, isLoading: true }));
			await syncWithAPI();
			update((s) => ({ ...s, isLoading: false }));
		},

		// Vérifier si un exposant est en favori
		isFavorite(exhibitorId: string): boolean {
			const state = get({ subscribe });
			return state.ids.has(exhibitorId);
		},

		// Récupérer les données complètes des favoris
		async loadFavoritesData(exhibitors: Exhibitor[]): Promise<void> {
			const state = get({ subscribe });
			const newData = new Map(state.data);

			exhibitors.forEach((exhibitor) => {
				if (state.ids.has(exhibitor.id)) {
					newData.set(exhibitor.id, exhibitor);
				}
			});

			update((s) => ({ ...s, data: newData }));
		},
	};
}

export const favorites = createFavoritesStore();

// Derived stores
export const favoriteIds = derived(favorites, ($f) => $f.ids);
export const favoritesCount = derived(favorites, ($f) => $f.ids.size);
export const favoritesArray = derived(favorites, ($f) => Array.from($f.data.values()));
export const favoritesLoading = derived(favorites, ($f) => $f.isLoading);
export const isFavoritesInitialized = derived(favorites, ($f) => $f.isInitialized);
