<!-- src/routes/parcours/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { themes } from '$lib/api';
	import type { Theme } from '$lib/types';

	let loading = true;
	let error = '';
	let themesList: Theme[] = [];

	onMount(async () => {
		await loadThemes();
	});

	async function loadThemes() {
		loading = true;
		error = '';
		try {
			themesList = await themes.list();
			console.log('Themes loaded:', themesList);
		} catch (err) {
			console.error('Error loading themes:', err);
			error = 'Impossible de charger les parcours';
		} finally {
			loading = false;
		}
	}

	const icons = ['🎯', '🚀', '💡', '🌱', '⚡', '🔬', '🎨', '🏆', '🌟', '🎪'];
	const getIcon = (i: number) => icons[i % icons.length];
	const getCount = (theme: Theme) => theme.exhibitorIds?.length || (theme as any)._count?.exhibitors || 0;
	const getTime = (theme: Theme) => {
		const mins = getCount(theme) * 5;
		if (mins < 60) return `${mins} min`;
		const hrs = Math.floor(mins / 60);
		const remaining = mins % 60;
		return remaining > 0 ? `${hrs}h${remaining}` : `${hrs}h`;
	};
</script>

<svelte:head>
	<title>Parcours thématiques - Effervescence 93</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-28">
	<!-- Hero -->
	<section class="bg-white border-b">
		<div class="container-max py-12 md:py-16">
			<div class="max-w-3xl mx-auto text-center">
				<div
					class="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
						/>
					</svg>
					Parcours guidés
				</div>

				<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Parcours thématiques</h1>

				<p class="text-lg text-gray-600 mb-8">
					Découvrez les exposants par thématique pour une visite optimisée
				</p>

				<div class="flex justify-center gap-12 text-center">
					<div>
						<div class="text-3xl font-bold text-gray-900">{themesList.length}</div>
						<div class="text-sm text-gray-500 mt-1">Parcours</div>
					</div>
					<div>
						<div class="text-3xl font-bold text-gray-900">
							{themesList.reduce((acc, t) => acc + getCount(t), 0)}
						</div>
						<div class="text-sm text-gray-500 mt-1">Exposants</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Main -->
	<main class="py-8">
		<div class="container-max">
			{#if loading}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each Array(6) as _, i}
						<div
							class="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
							style="animation-delay: {i * 50}ms"
						>
							<div class="h-24 bg-gray-200"></div>
							<div class="p-5 space-y-3">
								<div class="h-6 bg-gray-200 rounded w-3/4"></div>
								<div class="h-4 bg-gray-200 rounded w-full"></div>
								<div class="h-4 bg-gray-200 rounded w-2/3"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if error}
				<div class="text-center py-12 bg-white rounded-lg border" in:fade>
					<div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
					<p class="text-gray-600 mb-4">{error}</p>
					<button class="btn-primary" on:click={loadThemes}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Réessayer
					</button>
				</div>
			{:else if themesList.length === 0}
				<div class="text-center py-16 bg-white rounded-lg border" in:fade>
					<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 mb-2">Aucun parcours disponible</h2>
					<p class="text-gray-600 mb-6">Les parcours seront bientôt disponibles</p>
					<button class="btn-primary" on:click={() => goto('/')}>Retour au plan</button>
				</div>
			{:else}
				<div class="space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 text-center">Choisissez votre parcours</h2>

					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each themesList as theme, i (theme.id)}
							<article
								class="group bg-white rounded-lg shadow-sm hover:shadow-md border hover:border-gray-300 overflow-hidden transition-all cursor-pointer"
								in:fly={{ y: 20, duration: 300, delay: i * 50 }}
								on:click={() => goto(`/parcours/${theme.id}`)}
								role="button"
								tabindex="0"
								on:keypress={(e) => e.key === 'Enter' && goto(`/parcours/${theme.id}`)}
							>
								<!-- Header -->
								<div class="p-5 border-b bg-gray-50 flex items-center justify-between">
									<div
										class="w-12 h-12 bg-white border rounded-lg flex items-center justify-center text-2xl shadow-sm"
									>
										{getIcon(i)}
									</div>
									{#if theme.order > 0}
										<span
											class="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
										>
											#{theme.order}
										</span>
									{/if}
								</div>

								<!-- Body -->
								<div class="p-5 space-y-3">
									<h3
										class="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors"
									>
										{theme.name}
									</h3>

									{#if theme.description}
										<p class="text-sm text-gray-600 line-clamp-2">
											{theme.description}
										</p>
									{:else}
										<p class="text-sm text-gray-500 italic">Parcours thématique</p>
									{/if}

									<div class="flex items-center gap-4 pt-2 text-sm text-gray-600">
										<div class="flex items-center gap-1.5">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
											<span class="font-medium">{getCount(theme)}</span> exposants
										</div>
										<div class="flex items-center gap-1.5">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											~{getTime(theme)}
										</div>
									</div>
								</div>

								<!-- Footer -->
								<div class="px-5 pb-5">
									<div
										class="flex items-center justify-between text-sm font-medium text-primary group-hover:text-primary-700"
									>
										<span>Découvrir</span>
										<svg
											class="w-4 h-4 group-hover:translate-x-1 transition-transform"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
							</article>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</main>

	<!-- CTA -->
	{#if !loading && !error && themesList.length > 0}
		<section class="py-8" in:fade={{ delay: 200 }}>
			<div class="container-max">
				<div
					class="bg-gray-100 border rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6"
				>
					<div class="text-center md:text-left">
						<h3 class="text-xl font-bold text-gray-900 mb-1">Visite libre</h3>
						<p class="text-gray-600">Explorez le plan pour voir tous les exposants</p>
					</div>
					<button class="btn-primary" on:click={() => goto('/')}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
						Voir le plan
					</button>
				</div>
			</div>
		</section>
	{/if}
</div>
