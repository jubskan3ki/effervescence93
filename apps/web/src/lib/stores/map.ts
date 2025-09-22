// src/lib/stores/map.ts

import { writable, derived, get } from 'svelte/store';

import { MAP_CONFIG } from '@lib/constants/map';
import type { Booth } from '@lib/types/models';

interface MapState {
	// Viewport
	zoom: number;
	center: { x: number; y: number };
	viewBox: { x: number; y: number; width: number; height: number };

	// Selection
	selectedBoothId: string | null;
	hoveredBoothId: string | null;
	highlightedBoothIds: string[];

	// Interaction
	isDragging: boolean;
	isPanning: boolean;

	// Settings
	showLegend: boolean;
	showMinimap: boolean;
	enableClustering: boolean;
}

function createMapStore() {
	const initialState: MapState = {
		zoom: MAP_CONFIG.zoom.default,
		center: { x: 0, y: 0 },
		viewBox: MAP_CONFIG.viewBox,
		selectedBoothId: null,
		hoveredBoothId: null,
		highlightedBoothIds: [],
		isDragging: false,
		isPanning: false,
		showLegend: true,
		showMinimap: false,
		enableClustering: false,
	};

	const { subscribe, set, update } = writable<MapState>(initialState);

	return {
		subscribe,

		// Zoom controls
		zoomIn() {
			update((state) => ({
				...state,
				zoom: Math.min(state.zoom + MAP_CONFIG.zoom.step, MAP_CONFIG.zoom.max),
			}));
		},

		zoomOut() {
			update((state) => ({
				...state,
				zoom: Math.max(state.zoom - MAP_CONFIG.zoom.step, MAP_CONFIG.zoom.min),
			}));
		},

		setZoom(zoom: number) {
			update((state) => ({
				...state,
				zoom: Math.max(MAP_CONFIG.zoom.min, Math.min(zoom, MAP_CONFIG.zoom.max)),
			}));
		},

		resetZoom() {
			update((state) => ({
				...state,
				zoom: MAP_CONFIG.zoom.default,
				center: { x: 0, y: 0 },
			}));
		},

		// Pan controls
		pan(deltaX: number, deltaY: number) {
			update((state) => ({
				...state,
				center: {
					x: state.center.x + deltaX,
					y: state.center.y + deltaY,
				},
			}));
		},

		setCenter(x: number, y: number) {
			update((state) => ({
				...state,
				center: { x, y },
			}));
		},

		// Selection
		selectBooth(boothId: string | null) {
			update((state) => ({
				...state,
				selectedBoothId: boothId,
			}));
		},

		hoverBooth(boothId: string | null) {
			update((state) => ({
				...state,
				hoveredBoothId: boothId,
			}));
		},

		// Highlighting
		highlightBooths(boothIds: string[]) {
			update((state) => ({
				...state,
				highlightedBoothIds: boothIds,
			}));
		},

		addHighlight(boothId: string) {
			update((state) => ({
				...state,
				highlightedBoothIds: [...state.highlightedBoothIds, boothId],
			}));
		},

		removeHighlight(boothId: string) {
			update((state) => ({
				...state,
				highlightedBoothIds: state.highlightedBoothIds.filter((id) => id !== boothId),
			}));
		},

		clearHighlights() {
			update((state) => ({
				...state,
				highlightedBoothIds: [],
			}));
		},

		// Focus on specific booth
		focusOnBooth(booth: Booth, zoomLevel = 2) {
			// Calculate center based on booth polygon
			// This is simplified - in real app, you'd calculate from actual polygon coordinates
			const centerX = 600; // Default center
			const centerY = 400;

			update((state) => ({
				...state,
				selectedBoothId: booth.id,
				zoom: zoomLevel,
				center: { x: centerX, y: centerY },
			}));
		},

		// Interaction states
		setDragging(isDragging: boolean) {
			update((state) => ({ ...state, isDragging }));
		},

		setPanning(isPanning: boolean) {
			update((state) => ({ ...state, isPanning }));
		},

		// Settings
		toggleLegend() {
			update((state) => ({ ...state, showLegend: !state.showLegend }));
		},

		toggleMinimap() {
			update((state) => ({ ...state, showMinimap: !state.showMinimap }));
		},

		toggleClustering() {
			update((state) => ({ ...state, enableClustering: !state.enableClustering }));
		},

		// Reset
		reset() {
			set(initialState);
		},

		// Get current state
		getState(): MapState {
			return get({ subscribe });
		},
	};
}

export const mapStore = createMapStore();

// Derived stores
export const currentZoom = derived(mapStore, ($map) => $map.zoom);

export const selectedBooth = derived(mapStore, ($map) => $map.selectedBoothId);

export const isBoothSelected = (boothId: string) => derived(mapStore, ($map) => $map.selectedBoothId === boothId);

export const isBoothHovered = (boothId: string) => derived(mapStore, ($map) => $map.hoveredBoothId === boothId);

export const isBoothHighlighted = (boothId: string) =>
	derived(mapStore, ($map) => $map.highlightedBoothIds.includes(boothId));

export const mapViewBox = derived(mapStore, ($map) => {
	const { viewBox, zoom, center } = $map;
	return {
		x: viewBox.x + center.x,
		y: viewBox.y + center.y,
		width: viewBox.width / zoom,
		height: viewBox.height / zoom,
	};
});
