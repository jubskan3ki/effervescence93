<!-- src/lib/components/map/MapLegend.svelte -->
<script lang="ts">
	interface LegendItem {
		label: string;
		color?: string;
		icon?: string;
		pattern?: 'solid' | 'striped' | 'dotted';
	}

	interface Props {
		position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		collapsed?: boolean;
		onToggle?: (collapsed: boolean) => void;
	}

	let { position = 'bottom-left', collapsed: initialCollapsed = false, onToggle }: Props = $props();

	let collapsed = $state(initialCollapsed);

	const positionClasses = {
		'top-left': 'top-4 left-4',
		'top-right': 'top-4 right-4',
		'bottom-left': 'bottom-4 left-4',
		'bottom-right': 'bottom-4 right-4',
	};

	// Legend items
	const standStatus: LegendItem[] = [
		{ label: 'Stand occupé', color: '#bfdbfe' },
		{ label: 'Stand disponible', color: '#e5e7eb' },
		{ label: 'Stand réservé', color: '#fef3c7' },
	];

	const sectors: LegendItem[] = [
		{ label: 'Technologies', color: '#3b82f6' },
		{ label: 'Industrie', color: '#10b981' },
		{ label: 'Services', color: '#8b5cf6' },
		{ label: 'Commerce', color: '#f59e0b' },
		{ label: 'Artisanat', color: '#ef4444' },
	];

	const zones: LegendItem[] = [
		{ label: 'Entrée', icon: '🚪', color: '#10b981' },
		{ label: 'Sortie', icon: '🚪', color: '#ef4444' },
		{ label: 'Restauration', icon: '🍴', color: '#f59e0b' },
		{ label: 'Sanitaires', icon: '🚻', color: '#8b5cf6' },
		{ label: 'Conférences', icon: '🎤', color: '#06b6d4' },
		{ label: 'Information', icon: 'ℹ️', color: '#6b7280' },
	];

	function toggleCollapsed() {
		collapsed = !collapsed;
		onToggle?.(collapsed);
	}
</script>

<div class="absolute {positionClasses[position]} z-10 max-w-xs">
	<div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
		<!-- Header -->
		<button
			type="button"
			onclick={toggleCollapsed}
			class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
		>
			<h3 class="text-sm font-semibold text-gray-900">Légende</h3>
			<svg
				class="h-4 w-4 text-gray-500 transform transition-transform {collapsed ? '' : 'rotate-180'}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Content -->
		{#if !collapsed}
			<div class="px-4 py-3 space-y-4 border-t border-gray-200">
				<!-- Stand status -->
				<div>
					<h4 class="text-xs font-medium text-gray-700 uppercase mb-2">État des stands</h4>
					<div class="space-y-1">
						{#each standStatus as item}
							<div class="flex items-center gap-2">
								<div
									class="w-4 h-4 rounded border border-gray-400"
									style="background-color: {item.color}"
								></div>
								<span class="text-xs text-gray-600">{item.label}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Sectors -->
				<div>
					<h4 class="text-xs font-medium text-gray-700 uppercase mb-2">Secteurs d'activité</h4>
					<div class="space-y-1">
						{#each sectors as item}
							<div class="flex items-center gap-2">
								<div
									class="w-4 h-4 rounded border border-gray-400"
									style="background-color: {item.color}"
								></div>
								<span class="text-xs text-gray-600">{item.label}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Zones -->
				<div>
					<h4 class="text-xs font-medium text-gray-700 uppercase mb-2">Zones</h4>
					<div class="space-y-1">
						{#each zones as item}
							<div class="flex items-center gap-2">
								{#if item.icon}
									<span class="text-base leading-none">{item.icon}</span>
								{:else}
									<div class="w-4 h-4 rounded-full border-2" style="border-color: {item.color}"></div>
								{/if}
								<span class="text-xs text-gray-600">{item.label}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Selected indicator -->
				<div class="pt-2 border-t border-gray-200">
					<div class="space-y-1">
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded border-2 border-primary-500 ring-2 ring-primary-200"></div>
							<span class="text-xs text-gray-600">Stand sélectionné</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded border-2 border-green-500"></div>
							<span class="text-xs text-gray-600">Résultat de recherche</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
