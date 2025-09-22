<!-- src/lib/components/shared/FavoriteButton.svelte -->
<script lang="ts">
	import { favoritesStore } from '@stores/favorites';

	interface Props {
		exhibitorId: string;
		size?: 'sm' | 'md' | 'lg';
		showLabel?: boolean;
		variant?: 'icon' | 'button';
	}

	let { exhibitorId, size = 'md', showLabel = false, variant = 'icon' }: Props = $props();

	// Subscribe to favorites store
	const isFavorite = $derived(favoritesStore.has(exhibitorId));

	const sizes = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	const buttonSizes = {
		sm: 'px-2 py-1 text-sm',
		md: 'px-3 py-1.5 text-base',
		lg: 'px-4 py-2 text-lg',
	};

	function toggleFavorite() {
		if (isFavorite) {
			favoritesStore.remove(exhibitorId);
		} else {
			favoritesStore.add(exhibitorId);
		}
	}
</script>

{#if variant === 'icon'}
	<button
		type="button"
		onclick={toggleFavorite}
		class="inline-flex items-center justify-center rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
		aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
	>
		<svg
			class="{sizes[size]} transition-colors duration-200 {isFavorite
				? 'text-red-500 fill-red-500'
				: 'text-gray-400'}"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			fill={isFavorite ? 'currentColor' : 'none'}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/>
		</svg>
		{#if showLabel}
			<span class="ml-2 text-gray-700">
				{isFavorite ? 'Favori' : 'Ajouter'}
			</span>
		{/if}
	</button>
{:else}
	<button
		type="button"
		onclick={toggleFavorite}
		class="inline-flex items-center rounded-lg border {buttonSizes[
			size
		]} font-medium transition-all duration-200 {isFavorite
			? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
			: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
	>
		<svg
			class="{sizes[size]} mr-2 transition-colors duration-200"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			fill={isFavorite ? 'currentColor' : 'none'}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/>
		</svg>
		{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
	</button>
{/if}
