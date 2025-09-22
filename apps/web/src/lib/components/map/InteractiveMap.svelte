<!-- InteractiveMap.svelte -->
<script module lang="ts">
	function getZoneColor(type: string): string {
		const colors: Record<string, string> = {
			exhibitors: '#3b82f6',
			entrance: '#10b981',
			exit: '#ef4444',
			restroom: '#8b5cf6',
			food: '#f59e0b',
			conference: '#06b6d4',
			info: '#6b7280',
		};
		return colors[type] || '#6b7280';
	}
</script>

<!-- src/lib/components/map/InteractiveMap.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import MapControls from './MapControls.svelte';
	import StandPolygon from './StandPolygon.svelte';
	import MapLegend from './MapLegend.svelte';
	import MapTooltip from './MapTooltip.svelte';
	import MapZoomPan from './MapZoomPan.svelte';

	interface Stand {
		id: string;
		number: string;
		polygon: string; // SVG path data
		exhibitor?: {
			id: string;
			name: string;
			logo?: string;
			sector?: { id: string; name: string; color: string };
		};
		status: 'available' | 'occupied' | 'reserved';
		size?: string;
		zone?: string;
	}

	interface Zone {
		id: string;
		name: string;
		type: 'exhibitors' | 'entrance' | 'exit' | 'restroom' | 'food' | 'conference' | 'info';
		polygon: string;
		icon?: string;
	}

	interface Props {
		stands: Stand[];
		zones?: Zone[];
		selectedStandId?: string;
		highlightedStands?: string[];
		searchQuery?: string;
		showLegend?: boolean;
		showControls?: boolean;
		onStandClick?: (stand: Stand) => void;
		onZoneClick?: (zone: Zone) => void;
	}

	let {
		stands,
		zones = [],
		selectedStandId,
		highlightedStands = [],
		searchQuery = '',
		showLegend = true,
		showControls = true,
		onStandClick,
		onZoneClick,
	}: Props = $props();

	let svgElement = $state<SVGSVGElement>();
	let containerElement = $state<HTMLDivElement>();

	// Map state
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let hoveredStand = $state<Stand | null>(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	// Map dimensions
	const mapWidth = 1200;
	const mapHeight = 800;
	const minZoom = 0.5;
	const maxZoom = 4;

	// Computed transform
	const transform = $derived(`translate(${panX}, ${panY}) scale(${zoom})`);

	// Filter stands based on search
	const filteredStands = $derived(() => {
		if (!searchQuery) return stands;

		return stands.filter((stand) => {
			const query = searchQuery.toLowerCase();
			return (
				stand.number.toLowerCase().includes(query) ||
				stand.exhibitor?.name.toLowerCase().includes(query) ||
				stand.exhibitor?.sector?.name.toLowerCase().includes(query)
			);
		});
	});

	// Check if stand is highlighted
	function isHighlighted(standId: string): boolean {
		return (
			highlightedStands.includes(standId) ||
			(searchQuery !== '' && filteredStands().some((s) => s.id === standId))
		);
	}

	// Handle stand click
	function handleStandClick(stand: Stand) {
		if (stand.status === 'occupied' && stand.exhibitor) {
			onStandClick?.(stand);
		}
	}

	// Handle mouse events
	function handleMouseMove(event: MouseEvent) {
		if (isDragging && svgElement) {
			const scale = zoom;
			panX += event.movementX / scale;
			panY += event.movementY / scale;
		}

		// Update tooltip position
		if (hoveredStand) {
			tooltipPosition = {
				x: event.clientX,
				y: event.clientY,
			};
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (event.button === 0 && !event.ctrlKey) {
			isDragging = true;
			event.preventDefault();
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Handle keyboard navigation for the map
		switch (event.key) {
			case 'ArrowLeft':
				panX += 20;
				break;
			case 'ArrowRight':
				panX -= 20;
				break;
			case 'ArrowUp':
				panY += 20;
				break;
			case 'ArrowDown':
				panY -= 20;
				break;
			case '+':
			case '=':
				zoomIn();
				break;
			case '-':
				zoomOut();
				break;
			case '0':
				resetView();
				break;
			case ' ':
				event.preventDefault();
				isDragging = !isDragging;
				break;
		}
	}

	// Zoom controls
	function zoomIn() {
		zoom = Math.min(zoom * 1.2, maxZoom);
	}

	function zoomOut() {
		zoom = Math.max(zoom / 1.2, minZoom);
	}

	function resetView() {
		zoom = 1;
		panX = 0;
		panY = 0;
	}

	function fitToScreen() {
		if (!containerElement) return;

		const containerRect = containerElement.getBoundingClientRect();
		const scaleX = containerRect.width / mapWidth;
		const scaleY = containerRect.height / mapHeight;

		zoom = Math.min(scaleX, scaleY) * 0.9;
		panX = (containerRect.width - mapWidth * zoom) / 2 / zoom;
		panY = (containerRect.height - mapHeight * zoom) / 2 / zoom;
	}

	// Center on specific stand
	function centerOnStand(standId: string) {
		const stand = stands.find((s) => s.id === standId);
		if (!stand || !containerElement) return;

		// Parse polygon to get center point
		const points = parsePolygonPoints(stand.polygon);
		if (points.length === 0) return;

		const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
		const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

		const containerRect = containerElement.getBoundingClientRect();
		zoom = 2;
		panX = (containerRect.width / 2 - centerX * zoom) / zoom;
		panY = (containerRect.height / 2 - centerY * zoom) / zoom;
	}

	function parsePolygonPoints(pathData: string): Array<{ x: number; y: number }> {
		const points: Array<{ x: number; y: number }> = [];
		const regex = /([ML])\s*(-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)/g;
		let match;

		while ((match = regex.exec(pathData)) !== null) {
			points.push({ x: parseFloat(match[2]), y: parseFloat(match[3]) });
		}

		return points;
	}

	// Handle wheel zoom
	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		const delta = event.deltaY > 0 ? 0.9 : 1.1;
		const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * delta));

		if (newZoom !== zoom && svgElement) {
			// Zoom towards mouse position
			const rect = svgElement.getBoundingClientRect();
			const x = (event.clientX - rect.left) / zoom - panX;
			const y = (event.clientY - rect.top) / zoom - panY;

			zoom = newZoom;

			panX = (event.clientX - rect.left) / zoom - x;
			panY = (event.clientY - rect.top) / zoom - y;
		}
	}

	// Center on selected stand when it changes
	$effect(() => {
		if (selectedStandId) {
			centerOnStand(selectedStandId);
		}
	});

	onMount(() => {
		fitToScreen();
	});

	// Compute cursor class
	const cursorClass = $derived(isDragging ? 'cursor-grabbing' : 'cursor-grab');
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={containerElement}
	class="relative w-full h-full bg-gray-50 overflow-hidden select-none"
	role="application"
	aria-label="Carte interactive du salon"
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={() => (isDragging = false)}
	onkeydown={handleKeyDown}
	tabindex="0"
>
	<!-- SVG Map -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<svg
		bind:this={svgElement}
		width="100%"
		height="100%"
		viewBox="0 0 {mapWidth} {mapHeight}"
		class={cursorClass}
		role="img"
		aria-label="Plan du salon d'exposition"
		onmousedown={handleMouseDown}
		onwheel={handleWheel}
	>
		<g {transform}>
			<!-- Background -->
			<rect width={mapWidth} height={mapHeight} fill="#f9fafb" stroke="#e5e7eb" stroke-width="2" />

			<!-- Grid (optional) -->
			<g class="opacity-10">
				{#each Array(Math.floor(mapWidth / 50)) as _, x}
					<line x1={x * 50} y1="0" x2={x * 50} y2={mapHeight} stroke="#6b7280" stroke-width="0.5" />
				{/each}
				{#each Array(Math.floor(mapHeight / 50)) as _, y}
					<line x1="0" y1={y * 50} x2={mapWidth} y2={y * 50} stroke="#6b7280" stroke-width="0.5" />
				{/each}
			</g>

			<!-- Zones -->
			{#each zones as zone}
				<g
					role="button"
					tabindex="0"
					aria-label="Zone {zone.name}"
					onclick={() => onZoneClick?.(zone)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onZoneClick?.(zone);
						}
					}}
					class="cursor-pointer"
				>
					<path
						d={zone.polygon}
						fill={getZoneColor(zone.type)}
						fill-opacity="0.2"
						stroke={getZoneColor(zone.type)}
						stroke-width="2"
						stroke-dasharray={zone.type === 'exhibitors' ? 'none' : '5,5'}
					/>
					{#if zone.icon}
						<text x="50" y="50" font-size="24" text-anchor="middle" fill={getZoneColor(zone.type)}>
							{zone.icon}
						</text>
					{/if}
				</g>
			{/each}

			<!-- Stands -->
			{#each stands as stand}
				<StandPolygon
					{stand}
					selected={stand.id === selectedStandId}
					highlighted={isHighlighted(stand.id)}
					dimmed={searchQuery !== '' && !filteredStands().includes(stand)}
					onclick={() => handleStandClick(stand)}
					onmouseenter={() => (hoveredStand = stand)}
					onmouseleave={() => (hoveredStand = null)}
				/>
			{/each}
		</g>
	</svg>

	<!-- Controls -->
	{#if showControls}
		<MapControls
			{zoom}
			{minZoom}
			{maxZoom}
			onZoomIn={zoomIn}
			onZoomOut={zoomOut}
			onReset={resetView}
			onFitToScreen={fitToScreen}
		/>
	{/if}

	<!-- Legend -->
	{#if showLegend}
		<MapLegend />
	{/if}

	<!-- Tooltip -->
	{#if hoveredStand}
		<MapTooltip stand={hoveredStand} position={tooltipPosition} />
	{/if}

	<!-- Zoom/Pan helper -->
	<MapZoomPan
		{zoom}
		{panX}
		{panY}
		{mapWidth}
		{mapHeight}
		bind:currentZoom={zoom}
		bind:currentPanX={panX}
		bind:currentPanY={panY}
	/>
</div>

<style>
	:global(.map-stand-transition) {
		transition:
			fill 0.2s,
			stroke 0.2s,
			opacity 0.2s;
	}

	.cursor-grab {
		cursor: grab;
	}

	.cursor-grabbing {
		cursor: grabbing;
	}
</style>
