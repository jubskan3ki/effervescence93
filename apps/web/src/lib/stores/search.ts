// src/lib/stores/search.ts

import { writable, derived, get } from 'svelte/store';

import { APP_CONFIG } from '@lib/constants/config';
import { debounce } from '@lib/utils/debounce';

interface SearchState {
	// Search query
	query: string;

	// Filters
	sectorId: string | null;
	themeId: string | null;
	hasLogo: boolean | null;
	hasContacts: boolean | null;

	// Results
	results: any[];
	totalResults: number;

	// State
	isSearching: boolean;
	hasSearched: boolean;
	error: string | null;

	// Pagination
	page: number;
	limit: number;
}

function createSearchStore() {
	const initialState: SearchState = {
		query: '',
		sectorId: null,
		themeId: null,
		hasLogo: null,
		hasContacts: null,
		results: [],
		totalResults: 0,
		isSearching: false,
		hasSearched: false,
		error: null,
		page: 1,
		limit: APP_CONFIG.pagination.defaultLimit,
	};

	const { subscribe, set, update } = writable<SearchState>(initialState);

	// Debounced search function
	const performSearch = debounce(async () => {
		const state = get({ subscribe });

		// Don't search if query is too short (unless filters are active)
		if (!state.query && !state.sectorId && !state.themeId) {
			update((s) => ({
				...s,
				results: [],
				totalResults: 0,
				isSearching: false,
				hasSearched: false,
			}));
			return;
		}

		if (state.query && state.query.length < APP_CONFIG.limits.minSearchLength) {
			return;
		}

		update((s) => ({ ...s, isSearching: true, error: null }));

		try {
			// Build query params
			const params = new URLSearchParams();
			if (state.query) params.append('q', state.query);
			if (state.sectorId) params.append('sectorId', state.sectorId);
			if (state.themeId) params.append('themeId', state.themeId);
			if (state.hasLogo !== null) params.append('hasLogo', String(state.hasLogo));
			if (state.hasContacts !== null) params.append('hasContacts', String(state.hasContacts));
			params.append('page', String(state.page));
			params.append('limit', String(state.limit));

			const response = await fetch(`/api/exhibitors?${params}`);

			if (!response.ok) {
				throw new Error('Erreur lors de la recherche');
			}

			const data = await response.json();

			update((s) => ({
				...s,
				results: data.items || [],
				totalResults: data.total || 0,
				isSearching: false,
				hasSearched: true,
			}));
		} catch (error) {
			update((s) => ({
				...s,
				isSearching: false,
				hasSearched: true,
				error: error instanceof Error ? error.message : 'Erreur de recherche',
			}));
		}
	}, APP_CONFIG.limits.searchDebounceMs);

	return {
		subscribe,

		// Search query
		setQuery(query: string) {
			update((state) => ({ ...state, query, page: 1 }));
			performSearch();
		},

		// Filters
		setSector(sectorId: string | null) {
			update((state) => ({ ...state, sectorId, page: 1 }));
			performSearch();
		},

		setTheme(themeId: string | null) {
			update((state) => ({ ...state, themeId, page: 1 }));
			performSearch();
		},

		setHasLogo(hasLogo: boolean | null) {
			update((state) => ({ ...state, hasLogo, page: 1 }));
			performSearch();
		},

		setHasContacts(hasContacts: boolean | null) {
			update((state) => ({ ...state, hasContacts, page: 1 }));
			performSearch();
		},

		// Pagination
		setPage(page: number) {
			update((state) => ({ ...state, page }));
			performSearch();
		},

		nextPage() {
			const state = get({ subscribe });
			const maxPage = Math.ceil(state.totalResults / state.limit);
			if (state.page < maxPage) {
				this.setPage(state.page + 1);
			}
		},

		previousPage() {
			const state = get({ subscribe });
			if (state.page > 1) {
				this.setPage(state.page - 1);
			}
		},

		// Clear
		clearFilters() {
			update((state) => ({
				...state,
				sectorId: null,
				themeId: null,
				hasLogo: null,
				hasContacts: null,
				page: 1,
			}));
			performSearch();
		},

		clearAll() {
			set(initialState);
		},

		reset() {
			set(initialState);
		},

		// Manual search trigger
		search() {
			performSearch();
		},

		// Error handling
		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const searchStore = createSearchStore();

// Derived stores
export const searchQuery = derived(searchStore, ($search) => $search.query);

export const searchResults = derived(searchStore, ($search) => $search.results);

export const isSearching = derived(searchStore, ($search) => $search.isSearching);

export const hasActiveFilters = derived(
	searchStore,
	($search) =>
		!!(
			$search.query ||
			$search.sectorId ||
			$search.themeId ||
			$search.hasLogo !== null ||
			$search.hasContacts !== null
		)
);

export const activeFilterCount = derived(searchStore, ($search) => {
	let count = 0;
	if ($search.query) count++;
	if ($search.sectorId) count++;
	if ($search.themeId) count++;
	if ($search.hasLogo !== null) count++;
	if ($search.hasContacts !== null) count++;
	return count;
});

export const searchPagination = derived(searchStore, ($search) => ({
	page: $search.page,
	limit: $search.limit,
	total: $search.totalResults,
	totalPages: Math.ceil($search.totalResults / $search.limit),
	hasNext: $search.page < Math.ceil($search.totalResults / $search.limit),
	hasPrevious: $search.page > 1,
}));
