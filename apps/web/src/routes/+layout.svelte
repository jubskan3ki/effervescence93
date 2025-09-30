<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Navbar from '../lib/components/common/Navbar.svelte';
	import { Toaster } from 'svelte-sonner';
	import { ui } from '@stores/ui';
	import { session } from '@stores/session';
	import { favorites } from '@stores/favorites';
	import type { User } from '$lib/types';

	// Les données peuvent être vides ou contenir les infos de session
	interface PageData {
		sessionId?: string;
		user?: User | null;
		initialFavorites?: string[];
	}

	export let data: PageData = {};

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				refetchOnWindowFocus: false,
			},
		},
	});

	// Fonction pour initialiser les stores avec les données du serveur
	function initializeStores(pageData: PageData) {
		// Initialiser la session si on a un sessionId
		if (pageData.sessionId && typeof pageData.sessionId === 'string') {
			session.init({
				sessionId: pageData.sessionId,
				user: pageData.user || null,
			});
		} else {
			// Sinon initialiser côté client seulement
			session.init();
		}

		// Initialiser les favoris si on a des données
		if (pageData.initialFavorites && Array.isArray(pageData.initialFavorites)) {
			favorites.init(pageData.initialFavorites);
		} else {
			favorites.init();
		}
	}

	// Réagir aux changements de data
	$: if (data) {
		initializeStores(data);
	}

	onMount(() => {
		// Initialiser l'UI
		ui.init();

		// Si on n'a pas encore initialisé la session, le faire maintenant
		if (!data || !data.sessionId) {
			session.init();
			favorites.init();
		}
	});

	$: isAdminRoute = $page.url.pathname.startsWith('/admin');
	$: isAuthRoute = $page.url.pathname.startsWith('/auth');
	$: showHeader = !isAuthRoute && !isAdminRoute;
</script>

<QueryClientProvider client={queryClient}>
	<div class="app-container">
		<main class="main-content" class:full-height={isAuthRoute}>
			<slot />
		</main>
		{#if showHeader}
			<Navbar />
		{/if}
	</div>

	<Toaster
		position="top-right"
		toastOptions={{
			style: 'background: white; color: #333;',
			duration: 4000,
		}}
	/>
</QueryClientProvider>

<style>
	.app-container {
		@apply min-h-screen flex flex-col bg-gray-50;
	}

	.main-content {
		@apply flex-1;
	}

	.main-content.full-height {
		@apply flex items-center justify-center;
	}
</style>
