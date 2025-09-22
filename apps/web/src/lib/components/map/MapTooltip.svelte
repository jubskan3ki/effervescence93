<!-- src/lib/components/map/MapTooltip.svelte -->
<script lang="ts">
	interface Stand {
		id: string;
		number: string;
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
		position: { x: number; y: number };
		offsetX?: number;
		offsetY?: number;
	}

	let { stand, position, offsetX = 10, offsetY = 10 }: Props = $props();

	// Calculate tooltip position to avoid edge overflow
	const tooltipStyle = $derived(() => {
		const x = position.x + offsetX;
		const y = position.y + offsetY;

		// Adjust if near right edge
		const adjustedX = position.x > window.innerWidth - 250 ? position.x - 250 : x;
		// Adjust if near bottom edge
		const adjustedY = position.y > window.innerHeight - 150 ? position.y - 150 : y;

		return `left: ${adjustedX}px; top: ${adjustedY}px;`;
	});

	// Get status label
	const statusLabel = $derived(() => {
		switch (stand.status) {
			case 'available':
				return 'Disponible';
			case 'occupied':
				return 'Occupé';
			case 'reserved':
				return 'Réservé';
			default:
				return '';
		}
	});

	// Get status color
	const statusColor = $derived(() => {
		switch (stand.status) {
			case 'available':
				return 'text-green-600 bg-green-50';
			case 'occupied':
				return 'text-blue-600 bg-blue-50';
			case 'reserved':
				return 'text-yellow-600 bg-yellow-50';
			default:
				return 'text-gray-600 bg-gray-50';
		}
	});
</script>

<div class="fixed z-50 pointer-events-none" style={tooltipStyle()}>
	<div class="bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-xs">
		<!-- Header with stand number -->
		<div class="flex items-center justify-between mb-2">
			<h4 class="font-semibold text-gray-900">
				Stand {stand.number}
			</h4>
			<span class="px-2 py-1 text-xs font-medium rounded-full {statusColor()}">
				{statusLabel()}
			</span>
		</div>

		<!-- Exhibitor info (if occupied) -->
		{#if stand.exhibitor}
			<div class="space-y-2">
				<!-- Logo and name -->
				<div class="flex items-center gap-3">
					{#if stand.exhibitor.logo}
						<img
							src={stand.exhibitor.logo}
							alt={stand.exhibitor.name}
							class="h-10 w-10 object-contain bg-gray-50 rounded p-1"
						/>
					{/if}
					<div class="flex-1">
						<p class="font-medium text-gray-800 text-sm">
							{stand.exhibitor.name}
						</p>
						{#if stand.exhibitor.sector}
							<p class="text-xs text-gray-500">
								{stand.exhibitor.sector.name}
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Stand details -->
		<div class="mt-2 pt-2 border-t border-gray-100">
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#if stand.size}
					<div>
						<span class="text-gray-500">Taille:</span>
						<span class="ml-1 text-gray-700 font-medium">{stand.size}</span>
					</div>
				{/if}
				{#if stand.zone}
					<div>
						<span class="text-gray-500">Zone:</span>
						<span class="ml-1 text-gray-700 font-medium">{stand.zone}</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Action hint -->
		{#if stand.status === 'occupied'}
			<div class="mt-2 pt-2 border-t border-gray-100">
				<p class="text-xs text-gray-500 italic">Cliquez pour voir les détails</p>
			</div>
		{:else if stand.status === 'available'}
			<div class="mt-2 pt-2 border-t border-gray-100">
				<p class="text-xs text-green-600 font-medium">✓ Ce stand est disponible à la location</p>
			</div>
		{:else if stand.status === 'reserved'}
			<div class="mt-2 pt-2 border-t border-gray-100">
				<p class="text-xs text-yellow-600">⏳ Stand en cours de réservation</p>
			</div>
		{/if}
	</div>

	<!-- Arrow pointing to stand -->
	<div
		class="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
		style="margin-left: {position.x > window.innerWidth - 250 ? '200px' : '0'}"
	></div>
</div>

<style>
	/* Tooltip animation */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.fixed {
		animation: fadeIn 0.2s ease-out;
	}
</style>
