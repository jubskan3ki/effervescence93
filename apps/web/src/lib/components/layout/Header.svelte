<!-- src/lib/components/layout/Header.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { uiStore } from '@stores/ui';
	import { favoriteCount } from '@stores/favorites';
	import Button from '../ui/Button.svelte';

	interface Props {
		transparent?: boolean;
		sticky?: boolean;
	}

	let { transparent = false, sticky = true }: Props = $props();

	let isScrolled = $state(false);

	// Track scroll position
	$effect(() => {
		if (typeof window === 'undefined') return;

		function handleScroll() {
			isScrolled = window.scrollY > 10;
		}

		window.addEventListener('scroll', handleScroll);
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	const isActive = (path: string) => $page.url.pathname === path;

	const navigation = [
		{ name: 'Plan', href: '/', icon: 'map' },
		{ name: 'Exposants', href: '/exposants', icon: 'users' },
		{ name: 'Parcours', href: '/parcours', icon: 'route' },
		{ name: 'Informations', href: '/informations', icon: 'info' },
	];
</script>

<header
	class="w-full {sticky ? 'sticky top-0 z-40' : ''} transition-all duration-300 {transparent && !isScrolled
		? 'bg-transparent'
		: 'bg-white shadow-sm border-b border-gray-200'}"
>
	<div class="container-app">
		<div class="flex items-center justify-between h-16 md:h-20">
			<!-- Logo / Brand -->
			<div class="flex items-center gap-4">
				<!-- Mobile menu button -->
				<button
					type="button"
					class="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
					onclick={() => uiStore.toggleMobileMenu()}
					aria-label="Menu principal"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<!-- Logo -->
				<a href="/" class="flex items-center gap-3">
					<div class="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary-600 flex items-center justify-center">
						<span class="text-white font-bold text-lg md:text-xl">E93</span>
					</div>
					<div class="hidden sm:block">
						<h1 class="text-lg md:text-xl font-bold text-gray-900">Effervescence 93</h1>
						<p class="text-xs text-gray-500">Plan interactif</p>
					</div>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden md:flex items-center gap-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {isActive(item.href)
							? 'bg-primary-50 text-primary-700'
							: 'text-gray-700 hover:bg-gray-100'}"
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.name}
					</a>
				{/each}
			</nav>

			<!-- Actions -->
			<div class="flex items-center gap-2">
				<!-- Search button -->
				<button
					type="button"
					class="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
					onclick={() => uiStore.toggleSearchDrawer()}
					aria-label="Rechercher"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>

				<!-- Favorites -->
				<a
					href="/favoris"
					class="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
					aria-label="Favoris"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
					{#if $favoriteCount > 0}
						<span
							class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
						>
							{$favoriteCount}
						</span>
					{/if}
				</a>

				<!-- CTA Button (desktop only) -->
				<div class="hidden sm:block">
					<Button variant="primary" size="sm" href="/plan">
						<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
						Voir le plan
					</Button>
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	.container-app {
		@apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
	}
</style>
