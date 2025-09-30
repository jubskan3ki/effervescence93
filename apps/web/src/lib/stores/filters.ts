import { writable, derived, get } from 'svelte/store';

import type { ID, ExhibitorFilters, MapViewport } from '$lib/types';

interface FilterState extends ExhibitorFilters {
	selectedBoothId: ID | null;
	highlightedBoothIds: Set<ID>;
	viewport: MapViewport;
}

function createFiltersStore() {
	const { subscribe, set, update } = writable<FilterState>({
		q: '',
		sectorId: undefined,
		themeId: undefined,
		hasBooth: undefined,
		selectedBoothId: null,
		highlightedBoothIds: new Set(),
		viewport: {
			x: 0,
			y: 0,
			zoom: 1,
		},
	});

	return {
		subscribe,

		// Search and filters
		setSearch(query: string) {
			update((s) => ({ ...s, q: query }));
		},

		setSector(sectorId: ID | undefined) {
			update((s) => ({ ...s, sectorId }));
		},

		setTheme(themeId: ID | undefined) {
			update((s) => ({ ...s, themeId }));
		},

		setHasBooth(hasBooth: boolean | undefined) {
			update((s) => ({ ...s, hasBooth }));
		},

		// Booth selection
		selectBooth(boothId: ID | null) {
			update((s) => ({ ...s, selectedBoothId: boothId }));
		},

		// Highlighting methods
		highlightBooths(boothIds: ID[]) {
			update((s) => ({
				...s,
				highlightedBoothIds: new Set(boothIds),
			}));
		},

		setHighlightedBooths(boothIds: Set<ID>) {
			update((s) => ({
				...s,
				highlightedBoothIds: boothIds,
			}));
		},

		addHighlightedBooth(boothId: ID) {
			update((s) => {
				const newSet = new Set(s.highlightedBoothIds);
				newSet.add(boothId);
				return { ...s, highlightedBoothIds: newSet };
			});
		},

		removeHighlightedBooth(boothId: ID) {
			update((s) => {
				const newSet = new Set(s.highlightedBoothIds);
				newSet.delete(boothId);
				return { ...s, highlightedBoothIds: newSet };
			});
		},

		clearHighlights() {
			update((s) => ({
				...s,
				highlightedBoothIds: new Set(),
			}));
		},

		// Viewport management
		setViewport(viewport: Partial<MapViewport>) {
			update((s) => ({
				...s,
				viewport: { ...s.viewport, ...viewport },
			}));
		},

		// Combined actions
		applyFilters(filters: Partial<ExhibitorFilters>) {
			update((s) => ({
				...s,
				...filters,
			}));
		},

		// Clear specific filter
		clearSearch() {
			update((s) => ({ ...s, q: '' }));
		},

		clearSector() {
			update((s) => ({ ...s, sectorId: undefined }));
		},

		clearTheme() {
			update((s) => ({ ...s, themeId: undefined }));
		},

		// Reset methods
		clear() {
			update((s) => ({
				...s,
				q: '',
				sectorId: undefined,
				themeId: undefined,
				hasBooth: undefined,
				highlightedBoothIds: new Set(),
			}));
		},

		reset() {
			set({
				q: '',
				sectorId: undefined,
				themeId: undefined,
				hasBooth: undefined,
				selectedBoothId: null,
				highlightedBoothIds: new Set(),
				viewport: { x: 0, y: 0, zoom: 1 },
			});
		},

		resetViewport() {
			update((s) => ({
				...s,
				viewport: { x: 0, y: 0, zoom: 1 },
			}));
		},

		// URL query params
		getQueryParams(): URLSearchParams {
			const state = get({ subscribe });
			const params = new URLSearchParams();

			if (state.q) params.set('q', state.q);
			if (state.sectorId) params.set('sector', state.sectorId);
			if (state.themeId) params.set('theme', state.themeId);
			if (state.selectedBoothId) params.set('booth', state.selectedBoothId);
			if (state.hasBooth !== undefined) params.set('hasBooth', state.hasBooth.toString());

			return params;
		},

		// Load from URL params
		loadFromParams(params: URLSearchParams) {
			update((s) => ({
				...s,
				q: params.get('q') || '',
				sectorId: params.get('sector') || undefined,
				themeId: params.get('theme') || undefined,
				selectedBoothId: params.get('booth') || null,
				hasBooth: params.has('hasBooth') ? params.get('hasBooth') === 'true' : undefined,
			}));
		},

		// Get current state (utility)
		getState(): FilterState {
			return get({ subscribe });
		},
	};
}

export const filters = createFiltersStore();

// Derived stores
export const hasActiveFilters = derived(
	filters,
	($filters) =>
		!!(
			$filters.q ||
			$filters.sectorId ||
			$filters.themeId ||
			$filters.hasBooth !== undefined ||
			$filters.highlightedBoothIds.size > 0
		)
);

export const activeFilterCount = derived(filters, ($filters) => {
	let count = 0;
	if ($filters.q) count++;
	if ($filters.sectorId) count++;
	if ($filters.themeId) count++;
	if ($filters.hasBooth !== undefined) count++;
	if ($filters.highlightedBoothIds.size > 0) count++;
	return count;
});

export const isFiltered = derived(filters, ($filters) => !!($filters.q || $filters.sectorId || $filters.themeId));

export const hasHighlights = derived(filters, ($filters) => $filters.highlightedBoothIds.size > 0);

// Detailed filter summary
export const filterSummary = derived(filters, ($filters) => {
	const parts: string[] = [];

	if ($filters.q) {
		parts.push(`Recherche: "${$filters.q}"`);
	}
	if ($filters.sectorId) {
		parts.push('Secteur filtré');
	}
	if ($filters.themeId) {
		parts.push('Parcours actif');
	}
	if ($filters.hasBooth === true) {
		parts.push('Avec stand uniquement');
	}
	if ($filters.hasBooth === false) {
		parts.push('Sans stand uniquement');
	}
	if ($filters.highlightedBoothIds.size > 0) {
		parts.push(`${$filters.highlightedBoothIds.size} stands sélectionnés`);
	}

	return parts.join(' • ');
});
