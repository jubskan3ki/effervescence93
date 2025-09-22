<!-- src/lib/components/map/MapZoomPan.svelte -->
<script lang="ts">
	interface Props {
		zoom: number;
		panX: number;
		panY: number;
		mapWidth: number;
		mapHeight: number;
		currentZoom?: number;
		currentPanX?: number;
		currentPanY?: number;
		position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		showMinimap?: boolean;
	}

	let {
		zoom,
		panX,
		panY,
		mapWidth,
		mapHeight,
		currentZoom = $bindable(zoom),
		currentPanX = $bindable(panX),
		currentPanY = $bindable(panY),
		position = 'bottom-right',
		showMinimap = true,
	}: Props = $props();

	let minimapElement = $state<HTMLDivElement>();

	const positionClasses = {
		'top-left': 'top-20 left-4',
		'top-right': 'top-20 right-4',
		'bottom-left': 'bottom-20 left-4',
		'bottom-right': 'bottom-20 right-4',
	};

	// Minimap dimensions
	const minimapWidth = 150;
	const minimapHeight = 100;
	const scale = $derived(Math.min(minimapWidth / mapWidth, minimapHeight / mapHeight));

	// Viewport rectangle in minimap
	const viewportRect = $derived(() => {
		const viewWidth = window.innerWidth / zoom;
		const viewHeight = window.innerHeight / zoom;

		return {
			x: -panX * scale,
			y: -panY * scale,
			width: Math.min(viewWidth * scale, minimapWidth),
			height: Math.min(viewHeight * scale, minimapHeight),
		};
	});

	// Handle minimap click to navigate
	function handleMinimapClick(event: MouseEvent) {
		if (!minimapElement) return;

		const rect = minimapElement.getBoundingClientRect();
		const x = (event.clientX - rect.left) / scale;
		const y = (event.clientY - rect.top) / scale;

		// Center the view on clicked point
		const viewWidth = window.innerWidth / zoom;
		const viewHeight = window.innerHeight / zoom;

		currentPanX = -(x - viewWidth / 2);
		currentPanY = -(y - viewHeight / 2);
	}

	function handleMinimapKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			// Use the center of the minimap for keyboard activation
			const x = minimapWidth / 2 / scale;
			const y = minimapHeight / 2 / scale;

			const viewWidth = window.innerWidth / zoom;
			const viewHeight = window.innerHeight / zoom;

			currentPanX = -(x - viewWidth / 2);
			currentPanY = -(y - viewHeight / 2);
		}
	}

	// Drag viewport in minimap
	let isDraggingViewport = $state(false);

	function handleViewportDragStart(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDraggingViewport = true;
	}

	function handleViewportKeyDown(event: KeyboardEvent) {
		const step = 10;
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				currentPanX += step;
				break;
			case 'ArrowRight':
				event.preventDefault();
				currentPanX -= step;
				break;
			case 'ArrowUp':
				event.preventDefault();
				currentPanY += step;
				break;
			case 'ArrowDown':
				event.preventDefault();
				currentPanY -= step;
				break;
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDraggingViewport || !minimapElement) return;

		const rect = minimapElement.getBoundingClientRect();
		const x = (event.clientX - rect.left) / scale;
		const y = (event.clientY - rect.top) / scale;

		const viewWidth = window.innerWidth / zoom;
		const viewHeight = window.innerHeight / zoom;

		currentPanX = -(x - viewWidth / 2);
		currentPanY = -(y - viewHeight / 2);
	}

	function handleMouseUp() {
		isDraggingViewport = false;
	}

	// Keyboard shortcuts info
	const shortcuts = [
		{ key: '+/-', action: 'Zoomer' },
		{ key: '0', action: 'Réinitialiser' },
		{ key: '↑↓←→', action: 'Déplacer' },
		{ key: 'Espace', action: 'Glisser' },
	];

	// Compute cursor class for viewport
	const viewportCursorClass = $derived(isDraggingViewport ? 'cursor-grabbing' : 'cursor-grab');
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

{#if showMinimap}
	<div class="absolute {positionClasses[position]} z-10">
		<div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
			<!-- Minimap header -->
			<div class="px-3 py-2 bg-gray-50 border-b border-gray-200">
				<h4 class="text-xs font-medium text-gray-700">Vue d'ensemble</h4>
			</div>

			<!-- Minimap -->
			<div
				bind:this={minimapElement}
				class="relative cursor-crosshair bg-gray-100"
				style="width: {minimapWidth}px; height: {minimapHeight}px;"
				role="button"
				tabindex="0"
				aria-label="Minimap - cliquer pour naviguer"
				onclick={handleMinimapClick}
				onkeydown={handleMinimapKeyDown}
			>
				<!-- Map outline -->
				<div
					class="absolute border border-gray-400 bg-white opacity-50"
					style="
						width: {mapWidth * scale}px;
						height: {mapHeight * scale}px;
						left: 0;
						top: 0;
					"
				></div>

				<!-- Current viewport -->
				<div
					class="absolute border-2 border-primary-500 bg-primary-500 bg-opacity-20 {viewportCursorClass}"
					style="
						left: {viewportRect().x}px;
						top: {viewportRect().y}px;
						width: {viewportRect().width}px;
						height: {viewportRect().height}px;
					"
					role="slider"
					aria-label="Zone de visualisation actuelle"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow={Math.round((viewportRect().x / minimapWidth) * 100)}
					tabindex="0"
					onmousedown={handleViewportDragStart}
					onkeydown={handleViewportKeyDown}
				>
					<!-- Viewport corners -->
					<div class="absolute -top-1 -left-1 w-2 h-2 bg-primary-500 rounded-full"></div>
					<div class="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
					<div class="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-500 rounded-full"></div>
					<div class="absolute -bottom-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
				</div>
			</div>

			<!-- Coordinates display -->
			<div class="px-3 py-2 bg-gray-50 border-t border-gray-200">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div>
						<span class="text-gray-500">Zoom:</span>
						<span class="ml-1 font-medium text-gray-700">{Math.round(zoom * 100)}%</span>
					</div>
					<div>
						<span class="text-gray-500">Position:</span>
						<span class="ml-1 font-medium text-gray-700">
							{Math.round(-panX)}, {Math.round(-panY)}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Keyboard shortcuts -->
		<div class="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
			<h4 class="text-xs font-medium text-gray-700 mb-2">Raccourcis clavier</h4>
			<div class="grid grid-cols-2 gap-x-4 gap-y-1">
				{#each shortcuts as shortcut}
					<div class="flex items-center gap-2 text-xs">
						<kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">
							{shortcut.key}
						</kbd>
						<span class="text-gray-600">{shortcut.action}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	kbd {
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.cursor-grab {
		cursor: grab;
	}

	.cursor-grabbing {
		cursor: grabbing;
	}

	.cursor-crosshair {
		cursor: crosshair;
	}
</style>
