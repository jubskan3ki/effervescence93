<!-- src/lib/components/map/StandPolygon.svelte -->
<script lang="ts">
	interface Stand {
		id: string;
		number: string;
		polygon: string;
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

	interface Props {
		stand: Stand;
		selected?: boolean;
		highlighted?: boolean;
		dimmed?: boolean;
		onclick?: () => void;
		onmouseenter?: () => void;
		onmouseleave?: () => void;
	}

	let {
		stand,
		selected = false,
		highlighted = false,
		dimmed = false,
		onclick,
		onmouseenter,
		onmouseleave,
	}: Props = $props();

	// Get fill color based on status and sector
	const fillColor = $derived(() => {
		if (stand.status === 'available') {
			return '#e5e7eb'; // gray-200
		}
		if (stand.status === 'reserved') {
			return '#fef3c7'; // yellow-100
		}
		if (stand.exhibitor?.sector?.color) {
			return stand.exhibitor.sector.color;
		}
		return '#bfdbfe'; // blue-200
	});

	// Get stroke color based on state
	const strokeColor = $derived(() => {
		if (selected) return '#3b82f6'; // blue-500
		if (highlighted) return '#10b981'; // green-500
		if (stand.status === 'available') return '#9ca3af'; // gray-400
		return '#6b7280'; // gray-500
	});

	// Get stroke width based on state
	const strokeWidth = $derived(() => {
		if (selected) return '3';
		if (highlighted) return '2.5';
		return '1';
	});

	// Get opacity based on state
	const opacity = $derived(() => {
		if (dimmed) return 0.3;
		if (highlighted || selected) return 1;
		return 0.8;
	});

	// Check if stand is clickable
	const isClickable = $derived(stand.status === 'occupied' && !!stand.exhibitor);

	// Get cursor style
	const cursorStyle = $derived(isClickable ? 'pointer' : 'default');

	// Calculate text position from polygon center
	const textPosition = $derived(() => {
		const points = parsePolygonPoints(stand.polygon);
		if (points.length === 0) return { x: 0, y: 0 };

		const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
		const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

		return { x: centerX, y: centerY };
	});

	function parsePolygonPoints(pathData: string): Array<{ x: number; y: number }> {
		const points: Array<{ x: number; y: number }> = [];
		const regex = /([ML])\s*(-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)/g;
		let match;

		while ((match = regex.exec(pathData)) !== null) {
			points.push({ x: parseFloat(match[2]), y: parseFloat(match[3]) });
		}

		return points;
	}

	// Handle click (supports both MouseEvent and KeyboardEvent)
	function handleClick(e: MouseEvent | KeyboardEvent) {
		if (isClickable) {
			e.stopPropagation();
			onclick?.();
		}
	}

	// Handle mouse enter
	function handleMouseEnter(e: MouseEvent) {
		if (isClickable) {
			e.stopPropagation();
			onmouseenter?.();
		}
	}

	// Handle mouse leave
	function handleMouseLeave(e: MouseEvent) {
		e.stopPropagation();
		onmouseleave?.();
	}
</script>

<g
	class="stand-group"
	role="button"
	tabindex={isClickable ? 0 : -1}
	aria-label={`Stand ${stand.number}${stand.exhibitor ? `, ${stand.exhibitor.name}` : ''}`}
	onclick={handleClick}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onkeydown={isClickable
		? (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick(e);
				}
			}
		: undefined}
	style="cursor: {cursorStyle};"
>
	<!-- Stand polygon -->
	<path
		d={stand.polygon}
		fill={fillColor()}
		stroke={strokeColor()}
		stroke-width={strokeWidth()}
		opacity={opacity()}
		class="map-stand-transition"
	/>

	<!-- Highlight effect for selected stand -->
	{#if selected}
		<path d={stand.polygon} fill="none" stroke="#3b82f6" stroke-width="5" opacity="0.3" class="animate-pulse" />
	{/if}

	<!-- Stand number text -->
	<text
		x={textPosition().x}
		y={textPosition().y - 5}
		text-anchor="middle"
		font-size="12"
		font-weight="bold"
		fill={stand.status === 'occupied' ? '#1f2937' : '#6b7280'}
		opacity={opacity()}
		pointer-events="none"
		class="select-none"
	>
		{stand.number}
	</text>

	<!-- Exhibitor name (if occupied) -->
	{#if stand.exhibitor && !dimmed}
		<text
			x={textPosition().x}
			y={textPosition().y + 8}
			text-anchor="middle"
			font-size="10"
			fill="#4b5563"
			opacity={opacity()}
			pointer-events="none"
			class="select-none"
		>
			{stand.exhibitor.name.length > 20 ? stand.exhibitor.name.substring(0, 17) + '...' : stand.exhibitor.name}
		</text>
	{/if}

	<!-- Status indicator -->
	{#if stand.status === 'reserved'}
		<text
			x={textPosition().x}
			y={textPosition().y + 8}
			text-anchor="middle"
			font-size="9"
			font-style="italic"
			fill="#92400e"
			opacity={opacity()}
			pointer-events="none"
			class="select-none"
		>
			Réservé
		</text>
	{/if}

	<!-- Available indicator -->
	{#if stand.status === 'available'}
		<text
			x={textPosition().x}
			y={textPosition().y + 8}
			text-anchor="middle"
			font-size="9"
			fill="#059669"
			opacity={opacity()}
			pointer-events="none"
			class="select-none"
		>
			Disponible
		</text>
	{/if}
</g>

<style>
	.stand-group:hover path:first-child {
		filter: brightness(1.1);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
