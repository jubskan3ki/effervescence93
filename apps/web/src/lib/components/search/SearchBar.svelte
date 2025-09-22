<!-- src/lib/components/search/SearchBar.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { searchStore, searchQuery, isSearching } from '@stores/search';

	interface Props {
		placeholder?: string;
		focusOnMount?: boolean; // Renommé pour éviter l'attribut HTML autofocus
		size?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'minimal' | 'hero';
		onSearch?: (query: string) => void;
	}

	let {
		placeholder = 'Rechercher un exposant, un stand...',
		focusOnMount = false, // Renommé
		size = 'md',
		variant = 'default',
		onSearch,
	}: Props = $props();

	let inputElement: HTMLInputElement;
	let localQuery = $state($searchQuery);

	// Size classes
	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2.5 text-base',
		lg: 'px-6 py-3.5 text-lg',
	};

	const iconSizes = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	// Gestion du focus au montage de manière accessible
	onMount(() => {
		if (focusOnMount && inputElement) {
			// Utiliser un timeout pour s'assurer que le DOM est prêt
			// et que les lecteurs d'écran peuvent annoncer correctement le focus
			setTimeout(() => {
				inputElement.focus();
			}, 100);
		}
	});

	// Handle input change
	function handleInput(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		localQuery = value;
		searchStore.setQuery(value);
		onSearch?.(value);
	}

	// Handle form submission
	function handleSubmit(event: Event) {
		event.preventDefault();
		searchStore.search();
		inputElement?.blur();
	}

	// Handle clear
	function handleClear() {
		localQuery = '';
		searchStore.setQuery('');
		inputElement?.focus();
	}

	// Sync with store changes
	$effect(() => {
		localQuery = $searchQuery;
	});
</script>

<div class="relative w-full {variant === 'hero' ? 'max-w-2xl mx-auto' : ''}">
	<form onsubmit={handleSubmit} class="relative">
		<div class="relative">
			<!-- Search Icon -->
			<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				{#if $isSearching}
					<svg class="{iconSizes[size]} animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				{:else}
					<svg class="{iconSizes[size]} text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				{/if}
			</div>

			<!-- Input -->
			<input
				bind:this={inputElement}
				type="search"
				value={localQuery}
				{placeholder}
				oninput={handleInput}
				class="
					w-full rounded-lg border border-gray-300 bg-white
					pl-10 pr-10
					{sizeClasses[size]}
					focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500
					{variant === 'hero' ? 'shadow-lg' : ''}
					{variant === 'minimal' ? 'border-transparent bg-gray-100' : ''}
				"
				autocomplete="off"
				aria-label="Recherche"
				aria-describedby={localQuery ? 'search-clear-button' : undefined}
			/>

			<!-- Clear button -->
			{#if localQuery}
				<button
					id="search-clear-button"
					type="button"
					onclick={handleClear}
					class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700"
					aria-label="Effacer la recherche"
				>
					<svg class="{iconSizes[size]} text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</form>
</div>
