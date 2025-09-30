<!-- src/routes/parcours/[theme]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { themes, exhibitors } from '$lib/api';
	import type { Theme, Exhibitor } from '$lib/types';

	let themeId = '';
	let theme: Theme | null = null;
	let themeExhibitors: Exhibitor[] = [];
	let loading = true;
	let error = '';
	let activeStep = 0;
	let viewMode: 'list' | 'steps' = 'steps';

	$: themeId = $page.params.theme || '';
	$: if (themeId) loadTheme(themeId);
	$: estimatedTime = themeExhibitors.length * 5;
	$: progressPercentage = themeExhibitors.length > 0 ? ((activeStep + 1) / themeExhibitors.length) * 100 : 0;

	async function loadTheme(id: string) {
		loading = true;
		error = '';

		try {
			theme = await themes.get(id);

			if (theme?.exhibitorIds && theme.exhibitorIds.length > 0) {
				await loadThemeExhibitors(theme.exhibitorIds);
			} else if ((theme as any)?.exhibitors) {
				themeExhibitors = (theme as any).exhibitors;
			}
		} catch (err) {
			console.error('Error loading theme:', err);
			error = 'Impossible de charger le parcours';
			theme = null;
		} finally {
			loading = false;
		}
	}

	async function loadThemeExhibitors(exhibitorIds: string[]) {
		try {
			const allExhibitors = await exhibitors.list();
			themeExhibitors = allExhibitors
				.filter((e) => exhibitorIds.includes(e.id))
				.sort((a, b) => exhibitorIds.indexOf(a.id) - exhibitorIds.indexOf(b.id));
		} catch (err) {
			console.error('Error loading exhibitors:', err);
			themeExhibitors = [];
		}
	}

	function startParcours() {
		if (!theme) return;
		const ids = theme.exhibitorIds || [];
		goto(`/?theme=${themeId}&highlight=${ids.join(',')}`);
	}

	function getStepStatus(index: number): 'active' | 'completed' | 'upcoming' {
		if (index === activeStep) return 'active';
		if (index < activeStep) return 'completed';
		return 'upcoming';
	}

	onMount(() => console.log('Parcours page mounted'));
</script>

<svelte:head>
	{#if theme}
		<title>Parcours {theme.name} - Effervescence 93</title>
		<meta name="description" content={theme.description || `Parcours ${theme.name}`} />
	{/if}
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-28">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<div
					class="spinner w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full mx-auto mb-4"
				></div>
				<p class="text-gray-600">Chargement du parcours...</p>
			</div>
		</div>
	{:else if error || !theme}
		<div class="flex items-center justify-center min-h-screen p-4" in:fade>
			<div class="empty-state">
				<div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900 mb-2">Parcours introuvable</h1>
				<p class="text-gray-600 mb-6">{error || "Ce parcours n'existe pas"}</p>
				<div class="flex gap-3 justify-center">
					<button class="btn-outline" on:click={() => goto('/parcours')}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
						Tous les parcours
					</button>
					<button class="btn-primary" on:click={() => goto('/')}> Plan du salon </button>
				</div>
			</div>
		</div>
	{:else}
		<div in:fade>
			<!-- Header -->
			<header class="bg-white border-b sticky top-0 z-20 shadow-sm">
				<div class="container-max">
					<nav class="py-4">
						<button
							on:click={() => goto('/parcours')}
							class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							Tous les parcours
						</button>
					</nav>

					<div class="pb-6">
						<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{theme.name}</h1>
						{#if theme.description}
							<p class="text-lg text-gray-600 mb-6 max-w-3xl">{theme.description}</p>
						{/if}

						<div class="flex flex-wrap items-center gap-3 mb-6">
							<div class="badge-primary text-sm">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								{themeExhibitors.length} exposants
							</div>
							<div
								class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								~{estimatedTime} minutes
							</div>
						</div>

						<button class="btn-primary btn-lg" on:click={startParcours}>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
								/>
							</svg>
							Démarrer le parcours
						</button>
					</div>
				</div>
			</header>

			<!-- Content -->
			<section class="section">
				<div class="container-max">
					{#if themeExhibitors.length === 0}
						<div class="card text-center py-16">
							<div
								class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
							>
								<svg
									class="w-10 h-10 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
							<h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun exposant</h3>
							<p class="text-gray-600">Ce parcours sera bientôt disponible</p>
						</div>
					{:else}
						<!-- View Toggle -->
						<div class="inline-flex gap-1 mb-8 bg-white rounded-lg p-1 border shadow-sm">
							<button
								class="view-toggle {viewMode === 'steps' ? 'active' : ''}"
								on:click={() => (viewMode = 'steps')}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
									/>
								</svg>
								Par étapes
							</button>
							<button
								class="view-toggle {viewMode === 'list' ? 'active' : ''}"
								on:click={() => (viewMode = 'list')}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
								Vue liste
							</button>
						</div>

						{#if viewMode === 'steps'}
							<!-- Progress Section -->
							<div class="bg-white rounded-2xl shadow-sm border p-8 mb-8">
								<div class="max-w-4xl mx-auto">
									<!-- Progress Header -->
									<div class="flex items-center justify-between mb-6">
										<div>
											<h3 class="text-lg font-bold text-gray-900 mb-1">Votre progression</h3>
											<p class="text-sm text-gray-600">
												Découvrez chaque exposant étape par étape
											</p>
										</div>
										<div class="text-right">
											<div class="text-3xl font-bold text-primary mb-1">
												{activeStep + 1}/{themeExhibitors.length}
											</div>
											<p class="text-xs text-gray-500">Étapes complétées</p>
										</div>
									</div>

									<!-- Progress Bar -->
									<div
										class="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-6 shadow-inner"
									>
										<div
											class="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-600 rounded-full transition-all duration-700 ease-out shadow-sm"
											style="width: {progressPercentage}%"
										></div>
										<div
											class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"
										></div>
									</div>
								</div>
							</div>

							<!-- Step Card -->
							{#key activeStep}
								{@const exhibitor = themeExhibitors[activeStep]}
								<div
									class="bg-white rounded-2xl shadow-lg border overflow-hidden"
									in:fly={{ x: 20, duration: 300 }}
								>
									<!-- Card Header -->
									<div
										class="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 px-8 py-6 border-b"
									>
										<div class="flex items-start justify-between gap-4">
											<div class="flex items-start gap-4 flex-1">
												<!-- Step Badge -->
												<div
													class="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0"
												>
													{activeStep + 1}
												</div>

												<!-- Exhibitor Info -->
												<div class="flex-1">
													<div
														class="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 mb-3 shadow-sm"
													>
														<svg
															class="w-3.5 h-3.5"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fill-rule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
																clip-rule="evenodd"
															/>
														</svg>
														Étape {activeStep + 1} sur {themeExhibitors.length}
													</div>
													<h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
														{exhibitor.name}
													</h2>
													<div class="flex flex-wrap items-center gap-2">
														{#if exhibitor.sector}
															<span
																class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm"
																style="background: color-mix(in srgb, {exhibitor.sector
																	.colorHex} 15%, white); color: {exhibitor.sector
																	.colorHex};"
															>
																{exhibitor.sector.name}
															</span>
														{/if}
														{#if exhibitor.booth}
															<span
																class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shadow-sm"
															>
																<svg
																	class="w-4 h-4"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fill-rule="evenodd"
																		d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
																		clip-rule="evenodd"
																	/>
																</svg>
																Stand {exhibitor.booth.number}
															</span>
														{/if}
													</div>
												</div>
											</div>

											<!-- Logo -->
											{#if exhibitor.logoUrl}
												<div
													class="w-20 h-20 bg-white rounded-xl border-2 border-gray-100 p-3 flex items-center justify-center flex-shrink-0 shadow-md"
												>
													<img
														src={exhibitor.logoUrl}
														alt={exhibitor.name}
														class="w-full h-full object-contain"
													/>
												</div>
											{:else}
												<div
													class="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md"
													style="background: linear-gradient(135deg, {exhibitor.sector
														?.colorHex || '#E20A16'}, color-mix(in srgb, {exhibitor.sector
														?.colorHex || '#E20A16'} 70%, black))"
												>
													{exhibitor.name.substring(0, 2).toUpperCase()}
												</div>
											{/if}
										</div>
									</div>

									<!-- Card Content -->
									<div class="px-8 py-8">
										{#if exhibitor.description}
											<div class="mb-6">
												<h3
													class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3"
												>
													À propos
												</h3>
												<p class="text-gray-700 leading-relaxed text-lg">
													{exhibitor.description}
												</p>
											</div>
										{/if}

										<button
											class="btn-outline"
											on:click={() => goto(`/exposant/${exhibitor.slug}`)}
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Voir tous les détails
										</button>
									</div>

									<!-- Card Footer -->
									<div class="px-8 py-6 border-t bg-gray-50 flex justify-between items-center gap-4">
										<button
											class="btn-outline"
											on:click={() => activeStep--}
											disabled={activeStep === 0}
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 19l-7-7 7-7"
												/>
											</svg>
											Précédent
										</button>

										<div class="text-center flex-1">
											<p class="text-sm text-gray-600">
												{#if activeStep === themeExhibitors.length - 1}
													Dernière étape du parcours
												{:else}
													Encore {themeExhibitors.length - activeStep - 1} exposant{themeExhibitors.length -
														activeStep -
														1 >
													1
														? 's'
														: ''} à découvrir
												{/if}
											</p>
										</div>

										{#if activeStep === themeExhibitors.length - 1}
											<button class="btn-primary btn-lg" on:click={() => goto('/parcours')}>
												<svg
													class="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
												Terminer le parcours
											</button>
										{:else}
											<button class="btn-primary btn-lg" on:click={() => activeStep++}>
												Suivant
												<svg
													class="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M13 7l5 5m0 0l-5 5m5-5H6"
													/>
												</svg>
											</button>
										{/if}
									</div>
								</div>
							{/key}
						{:else}
							<!-- List View -->
							<div class="space-y-3">
								{#each themeExhibitors as exhibitor, i (exhibitor.id)}
									<div
										class="card-interactive p-5 flex gap-5 group"
										on:click={() => goto(`/exposant/${exhibitor.slug}`)}
										in:fade={{ delay: i * 50 }}
									>
										<div
											class="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 rounded-xl flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
										>
											{i + 1}
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-start justify-between gap-4 mb-2">
												<h3
													class="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors"
												>
													{exhibitor.name}
												</h3>
												{#if exhibitor.booth}
													<span class="badge-primary text-xs whitespace-nowrap">
														<svg
															class="w-3.5 h-3.5"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fill-rule="evenodd"
																d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
																clip-rule="evenodd"
															/>
														</svg>
														Stand {exhibitor.booth.number}
													</span>
												{/if}
											</div>
											{#if exhibitor.description}
												<p class="text-sm text-gray-600 line-clamp-2 mb-3">
													{exhibitor.description}
												</p>
											{/if}
											{#if exhibitor.sector}
												<span
													class="badge text-xs"
													style="background: color-mix(in srgb, {exhibitor.sector
														.colorHex} 12%, white); color: {exhibitor.sector.colorHex};"
												>
													{exhibitor.sector.name}
												</span>
											{/if}
										</div>
										<div class="flex-shrink-0 self-center">
											<svg
												class="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
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
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</section>
		</div>
	{/if}
</div>

<style>
	.view-toggle {
		@apply flex items-center gap-2 px-4 py-2 text-gray-600 rounded-md text-sm font-medium transition-all;
	}

	.view-toggle.active {
		@apply bg-gray-900 text-white;
	}

	.step-dot {
		@apply w-8 h-8 rounded-full flex items-center justify-center transition-all;
	}

	.step-dot.completed {
		@apply bg-success-500 text-white;
	}

	.step-dot.active {
		@apply bg-primary text-white ring-4 ring-primary-100;
	}

	.step-dot.upcoming {
		@apply bg-gray-300;
	}

	.step-dot:hover:not(.active) {
		@apply bg-gray-400;
	}
</style>
