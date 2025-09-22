<!-- src/lib/components/search/SearchResults.svelte -->
<script lang="ts">
	import { searchStore, searchResults, isSearching, searchPagination } from '@stores/search';
	import Card from '../ui/Card.svelte';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import Spinner from '../ui/Spinner.svelte';
	import EmptyState from '../ui/EmptyState.svelte';
	import FavoriteButton from '../shared/FavoriteButton.svelte';

	interface Props {
		variant?: 'grid' | 'list' | 'compact';
		onExhibitorClick?: (exhibitor: any) => void;
	}

	let { variant = 'list', onExhibitorClick }: Props = $props();

	// Get state from store
	const results = $derived($searchResults);
	const loading = $derived($isSearching);
	const pagination = $derived($searchPagination);

	// Handle exhibitor click
	function handleExhibitorClick(exhibitor: any) {
		onExhibitorClick?.(exhibitor);
	}

	function nextPage() {
		searchStore.nextPage();
	}

	function previousPage() {
		searchStore.previousPage();
	}
</script>

<div class="search-results">
	{#if loading}
		<!-- Loading state -->
		<div class="flex items-center justify-center py-12">
			<Spinner size="lg">
				<span class="text-gray-600 ml-3">Recherche en cours...</span>
			</Spinner>
		</div>
	{:else if results.length === 0}
		<!-- No results -->
		<EmptyState
			icon="search"
			title="Aucun exposant trouvé"
			description="Essayez de modifier vos critères de recherche"
			actionLabel="Réinitialiser les filtres"
			onaction={() => searchStore.clearFilters()}
		/>
	{:else}
		<!-- Results header -->
		<div class="mb-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">
					{pagination.total} exposant{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
				</h2>

				<!-- View switcher -->
				<div class="flex gap-1 p-1 bg-gray-100 rounded-lg">
					<button
						type="button"
						onclick={() => (variant = 'list')}
						class="p-2 rounded {variant === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
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
						onclick={() => (variant = 'grid')}
						class="p-2 rounded {variant === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
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
						onclick={() => (variant = 'compact')}
						class="p-2 rounded {variant === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
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
		</div>

		<!-- Results list -->
		{#if variant === 'grid'}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each results as exhibitor}
					<Card hoverable clickable onclick={() => handleExhibitorClick(exhibitor)}>
						{#if exhibitor.logo}
							<div class="aspect-video bg-gray-100 rounded-t-lg overflow-hidden p-4">
								<img
									src={exhibitor.logo}
									alt={exhibitor.name}
									class="w-full h-full object-contain"
									loading="lazy"
								/>
							</div>
						{/if}

						<div class="p-4">
							<div class="flex items-start justify-between mb-2">
								{#if exhibitor.sector}
									<Badge variant="primary" size="sm">
										{exhibitor.sector.name}
									</Badge>
								{/if}
								<FavoriteButton exhibitorId={exhibitor.id} size="sm" />
							</div>

							<h3 class="font-semibold text-gray-900 mb-1">
								{exhibitor.name}
							</h3>

							{#if exhibitor.standNumber}
								<p class="text-sm text-gray-600 mb-2">
									Stand {exhibitor.standNumber}
								</p>
							{/if}

							{#if exhibitor.description}
								<p class="text-sm text-gray-500 line-clamp-2">
									{exhibitor.description}
								</p>
							{/if}

							{#if exhibitor.themes && exhibitor.themes.length > 0}
								<div class="flex flex-wrap gap-1 mt-3">
									{#each exhibitor.themes.slice(0, 3) as theme}
										<Badge variant="secondary" size="sm">
											{theme.name}
										</Badge>
									{/each}
								</div>
							{/if}
						</div>
					</Card>
				{/each}
			</div>
		{:else if variant === 'list'}
			<div class="space-y-4">
				{#each results as exhibitor}
					<Card hoverable clickable onclick={() => handleExhibitorClick(exhibitor)}>
						<div class="flex gap-4 p-4">
							{#if exhibitor.logo}
								<div class="flex-shrink-0">
									<img
										src={exhibitor.logo}
										alt={exhibitor.name}
										class="h-20 w-20 rounded-lg object-contain bg-gray-50 p-2"
										loading="lazy"
									/>
								</div>
							{:else}
								<div
									class="flex-shrink-0 h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center"
								>
									<svg
										class="h-8 w-8 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								</div>
							{/if}

							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between">
									<div>
										<div class="flex items-center gap-2 mb-1">
											{#if exhibitor.sector}
												<Badge variant="primary" size="sm">
													{exhibitor.sector.name}
												</Badge>
											{/if}
											{#if exhibitor.standNumber}
												<span class="text-sm text-gray-500">
													Stand {exhibitor.standNumber}
												</span>
											{/if}
										</div>
										<h3 class="font-semibold text-gray-900">
											{exhibitor.name}
										</h3>
									</div>
									<FavoriteButton exhibitorId={exhibitor.id} size="sm" />
								</div>

								{#if exhibitor.description}
									<p class="text-sm text-gray-500 mt-2 line-clamp-2">
										{exhibitor.description}
									</p>
								{/if}

								<div class="flex items-center gap-4 mt-3">
									{#if exhibitor.contacts && exhibitor.contacts.length > 0}
										<span class="inline-flex items-center text-sm text-gray-500">
											<svg
												class="h-4 w-4 mr-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
											{exhibitor.contacts.length} contact{exhibitor.contacts.length > 1
												? 's'
												: ''}
										</span>
									{/if}

									{#if exhibitor.themes && exhibitor.themes.length > 0}
										<div class="flex gap-1">
											{#each exhibitor.themes.slice(0, 3) as theme}
												<Badge variant="secondary" size="sm">
													{theme.name}
												</Badge>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{:else}
			<!-- Compact view -->
			<div class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
				{#each results as exhibitor}
					<button
						type="button"
						onclick={() => handleExhibitorClick(exhibitor)}
						class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
					>
						<div class="flex items-center gap-3">
							{#if exhibitor.sector}
								<Badge variant="primary" size="sm">
									{exhibitor.sector.name}
								</Badge>
							{/if}
							<div>
								<span class="font-medium text-gray-900">
									{exhibitor.name}
								</span>
								{#if exhibitor.standNumber}
									<span class="text-sm text-gray-500 ml-2">
										Stand {exhibitor.standNumber}
									</span>
								{/if}
							</div>
						</div>

						<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="flex items-center justify-center gap-2 mt-6">
				<Button variant="outline" size="sm" disabled={!pagination.hasPrevious} onclick={previousPage}>
					Précédent
				</Button>

				<span class="text-sm text-gray-600 px-4">
					Page {pagination.page} sur {pagination.totalPages}
				</span>

				<Button variant="outline" size="sm" disabled={!pagination.hasNext} onclick={nextPage}>Suivant</Button>
			</div>
		{/if}
	{/if}
</div>
