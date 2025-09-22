<!-- src/lib/components/map/MapControls.svelte -->
<script lang="ts">
	interface Props {
		zoom: number;
		minZoom: number;
		maxZoom: number;
		onZoomIn?: () => void;
		onZoomOut?: () => void;
		onReset?: () => void;
		onFitToScreen?: () => void;
		position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	}

	let {
		zoom,
		minZoom,
		maxZoom,
		onZoomIn,
		onZoomOut,
		onReset,
		onFitToScreen,
		position = 'top-right',
	}: Props = $props();

	const zoomPercentage = $derived(Math.round(((zoom - minZoom) / (maxZoom - minZoom)) * 100));
	const zoomLevel = $derived(Math.round(zoom * 100));

	const positionClasses = {
		'top-left': 'top-4 left-4',
		'top-right': 'top-4 right-4',
		'bottom-left': 'bottom-4 left-4',
		'bottom-right': 'bottom-4 right-4',
	};
</script>

<div class="absolute {positionClasses[position]} z-10">
	<div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
		<!-- Zoom controls -->
		<div class="flex flex-col">
			<!-- Zoom in -->
			<button
				type="button"
				onclick={onZoomIn}
				disabled={zoom >= maxZoom}
				class="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-gray-200"
				aria-label="Zoom avant"
				title="Zoom avant (+ ou molette souris)"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>

			<!-- Zoom level indicator -->
			<div class="px-2 py-1 text-center border-b border-gray-200">
				<span class="text-xs font-medium text-gray-600">
					{zoomLevel}%
				</span>
				<div class="w-20 h-1 bg-gray-200 rounded-full mt-1">
					<div class="h-1 bg-primary-500 rounded-full transition-all" style="width: {zoomPercentage}%"></div>
				</div>
			</div>

			<!-- Zoom out -->
			<button
				type="button"
				onclick={onZoomOut}
				disabled={zoom <= minZoom}
				class="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-gray-200"
				aria-label="Zoom arrière"
				title="Zoom arrière (- ou molette souris)"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
				</svg>
			</button>

			<!-- Fit to screen -->
			<button
				type="button"
				onclick={onFitToScreen}
				class="p-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
				aria-label="Adapter à l'écran"
				title="Adapter à l'écran"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
					/>
				</svg>
			</button>

			<!-- Reset view -->
			<button
				type="button"
				onclick={onReset}
				class="p-2 hover:bg-gray-100 transition-colors"
				aria-label="Réinitialiser la vue"
				title="Réinitialiser la vue (0)"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Help tooltip -->
	<div class="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
		<p class="text-xs text-gray-600 font-medium mb-1">Navigation</p>
		<ul class="text-xs text-gray-500 space-y-1">
			<li class="flex items-center gap-1">
				<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 15l-2 5L9 9l11 4-5 2z"
					/>
				</svg>
				<span>Cliquer-glisser pour déplacer</span>
			</li>
			<li class="flex items-center gap-1">
				<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<span>Molette pour zoomer</span>
			</li>
			<li class="flex items-center gap-1">
				<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<span>Clic sur un stand pour détails</span>
			</li>
		</ul>
	</div>
</div>

<style>
	button:hover:not(:disabled) {
		background-color: rgba(243, 244, 246, 1);
	}
</style>
