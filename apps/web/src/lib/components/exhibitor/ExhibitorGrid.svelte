<!-- src/lib/components/exhibitor/ExhibitorGrid.svelte -->
<script lang="ts">
	import ExhibitorCard from './ExhibitorCard.svelte';
	import Spinner from '../ui/Spinner.svelte';
	import EmptyState from '../ui/EmptyState.svelte';
	import Button from '../ui/Button.svelte';
	import Select from '../ui/Select.svelte';

	interface Exhibitor {
		id: string;
		name: string;
		slug?: string;
		description?: string;
		logo?: string;
		standNumber?: string;
		sector?: { id: string; name: string };
		themes?: Array<{ id: string; name: string }>;
		contacts?: Array<{ name: string; role?: string }>;
		featured?: boolean;
	}

	interface Props {
		exhibitors: Exhibitor[];
		loading?: boolean;
		variant?: 'grid' | 'list' | 'compact';
		columns?: 1 | 2 | 3 | 4;
		showFilters?: boolean;
		showSort?: boolean;
		emptyMessage?: string;
		emptyIcon?: 'inbox' | 'search' | 'users';
		onExhibitorClick?: (exhibitor: Exhibitor) => void;
		onLoadMore?: () => void;
		hasMore?: boolean;
	}

	let {
		exhibitors,
		loading = false,
		variant = 'grid',
		columns = 3,
		showFilters = false,
		showSort = true,
		emptyMessage = 'Aucun exposant trouvé',
		emptyIcon = 'users',
		onExhibitorClick,
		onLoadMore,
		hasMore = false,
	}: Props = $props();

	let sortBy = $state<'name' | 'stand' | 'sector'>('name');
	let filterSector = $state<string>('');
	let displayVariant = $state(variant);

	// Get unique sectors for filter
	const sectors = $derived(() => {
		const sectorMap = new Map();
		exhibitors.forEach((e) => {
			if (e.sector) {
				sectorMap.set(e.sector.id, e.sector.name);
			}
		});
		return Array.from(sectorMap.entries()).map(([id, name]) => ({ value: id, label: name }));
	});

	// Sort and filter exhibitors
	const processedExhibitors = $derived(() => {
		let result = [...exhibitors];

		// Filter by sector
		if (filterSector) {
			result = result.filter((e) => e.sector?.id === filterSector);
		}

		// Sort
		result.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'stand':
					return (a.standNumber || '').localeCompare(b.standNumber || '');
				case 'sector':
					return (a.sector?.name || '').localeCompare(b.sector?.name || '');
				default:
					return 0;
			}
		});

		// Put featured exhibitors first
		result.sort((a, b) => {
			if (a.featured && !b.featured) return -1;
			if (!a.featured && b.featured) return 1;
			return 0;
		});

		return result;
	});

	// Grid column classes
	const gridClasses = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 sm:grid-cols-2',
		3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
	};
</script>

<div class="exhibitor-grid">
	<!-- Toolbar -->
	{#if (showSort || showFilters) && exhibitors.length > 0}
		<div class="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
			<div class="flex flex-wrap gap-3 items-center">
				{#if showFilters && sectors().length > 0}
					<Select
						value={filterSector}
						options={[{ value: '', label: 'Tous les secteurs' }, ...sectors()]}
						onchange={(e) => (filterSector = (e.target as HTMLSelectElement).value)}
					/>
				{/if}

				{#if showSort}
					<Select
						value={sortBy}
						options={[
							{ value: 'name', label: 'Nom' },
							{ value: 'stand', label: 'Stand' },
							{ value: 'sector', label: 'Secteur' },
						]}
						onchange={(e) =>
							(sortBy = (e.target as HTMLSelectElement).value as 'name' | 'stand' | 'sector')}
					/>
				{/if}
			</div>

			<!-- View switcher -->
			<div class="flex gap-1 p-1 bg-gray-100 rounded-lg">
				<button
					type="button"
					onclick={() => (displayVariant = 'list')}
					class="p-2 rounded {displayVariant === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
					aria-label="Vue liste"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<button
					type="button"
					onclick={() => (displayVariant = 'grid')}
					class="p-2 rounded {displayVariant === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
					aria-label="Vue grille"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						/>
					</svg>
				</button>
				<button
					type="button"
					onclick={() => (displayVariant = 'compact')}
					class="p-2 rounded {displayVariant === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
					aria-label="Vue compacte"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Results count -->
		<p class="text-sm text-gray-600 mb-4">
			{processedExhibitors().length} exposant{processedExhibitors().length > 1 ? 's' : ''}
			{filterSector ? ' dans ce secteur' : ''}
		</p>
	{/if}

	<!-- Content -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Spinner size="lg">
				<span class="text-gray-600 ml-3">Chargement des exposants...</span>
			</Spinner>
		</div>
	{:else if processedExhibitors().length === 0}
		<EmptyState
			icon={emptyIcon}
			title={emptyMessage}
			description={filterSector ? 'Essayez de changer de secteur' : 'Aucun exposant à afficher'}
			actionLabel={filterSector ? 'Réinitialiser le filtre' : undefined}
			onaction={filterSector ? () => (filterSector = '') : undefined}
		/>
	{:else if displayVariant === 'grid'}
		<div class="grid {gridClasses[columns]} gap-4">
			{#each processedExhibitors() as exhibitor}
				<ExhibitorCard
					{exhibitor}
					variant={exhibitor.featured ? 'featured' : 'default'}
					onClick={onExhibitorClick}
				/>
			{/each}
		</div>
	{:else if displayVariant === 'list'}
		<div class="space-y-4">
			{#each processedExhibitors() as exhibitor}
				<ExhibitorCard {exhibitor} variant="default" onClick={onExhibitorClick} />
			{/each}
		</div>
	{:else}
		<div class="space-y-2">
			{#each processedExhibitors() as exhibitor}
				<ExhibitorCard {exhibitor} variant="compact" onClick={onExhibitorClick} />
			{/each}
		</div>
	{/if}

	<!-- Load more button -->
	{#if hasMore && !loading}
		<div class="mt-8 text-center">
			<Button variant="outline" onclick={onLoadMore}>Charger plus d'exposants</Button>
		</div>
	{/if}
</div>
