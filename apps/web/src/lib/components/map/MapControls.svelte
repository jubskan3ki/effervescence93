<!-- src/lib/components/map/MapControls.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ui } from '$lib/stores/ui';

	export let scale = 1;
	export let minScale = 0.3;
	export let maxScale = 4;

	const dispatch = createEventDispatcher();

	$: canZoomIn = scale < maxScale;
	$: canZoomOut = scale > minScale;
</script>

<div class="controls">
	<button class="control-btn zoom" on:click={() => dispatch('zoomIn')} disabled={!canZoomIn} aria-label="Zoom avant">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<path d="M12 5v14m7-7H5" />
		</svg>
	</button>

	<button
		class="control-btn zoom"
		on:click={() => dispatch('zoomOut')}
		disabled={!canZoomOut}
		aria-label="Zoom arrière"
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<path d="M5 12h14" />
		</svg>
	</button>

	<div class="separator"></div>

	<button class="control-btn" on:click={() => dispatch('resetView')} aria-label="Recentrer">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path
				d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
			/>
		</svg>
	</button>

	<button
		class="control-btn"
		class:active={$ui.showLegend}
		on:click={() => ui.toggleLegend()}
		aria-label="Informations"
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	</button>

	<button
		class="control-btn"
		class:active={$ui.showFilters}
		on:click={() => ui.toggleFilters()}
		aria-label="Recherche"
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	</button>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: white;
		border-radius: 10px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		overflow: hidden;
	}

	.control-btn {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border: none;
		cursor: pointer;
		color: #374151;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.control-btn:hover:not(:disabled) {
		background: #f9fafb;
		color: #111827;
	}

	.control-btn:active:not(:disabled) {
		background: #f3f4f6;
		transform: scale(0.95);
	}

	.control-btn:disabled {
		opacity: 0.25;
		cursor: not-allowed;
	}

	.control-btn.active {
		background: #111827;
		color: white;
	}

	.control-btn.active:hover {
		background: #1f2937;
	}

	.separator {
		height: 6px;
		background: #f3f4f6;
	}

	/* Tablet: Boutons légèrement plus petits */
	@media (min-width: 768px) and (max-width: 1023px) {
		.control-btn {
			width: 44px;
			height: 44px;
		}

		.control-btn svg {
			width: 18px;
			height: 18px;
		}

		.separator {
			height: 5px;
		}
	}

	/* Mobile: Orientation horizontale */
	@media (max-width: 767px) {
		.controls {
			flex-direction: column;
			border-radius: 8px;
		}

		.control-btn {
			width: 44px;
			height: 44px;
		}

		.control-btn svg {
			width: 18px;
			height: 18px;
		}

		.separator {
			height: 5px;
			width: auto;
		}
	}

	/* Très petits écrans: Boutons encore plus compacts */
	@media (max-width: 380px) {
		.control-btn {
			width: 40px;
			height: 40px;
		}

		.control-btn svg {
			width: 16px;
			height: 16px;
		}

		.separator {
			height: 4px;
		}
	}

	/* Landscape mobile: Horizontal layout */
	@media (max-width: 767px) and (orientation: landscape) {
		.controls {
			flex-direction: row;
		}

		.separator {
			width: 5px;
			height: auto;
		}
	}
</style>
