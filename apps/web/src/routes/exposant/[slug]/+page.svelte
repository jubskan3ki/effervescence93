<!-- src/routes/exposant/[slug]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';
	import { favorites } from '$lib/stores/favorites';
	import { exhibitors, analytics } from '$lib/api';
	import type { Exhibitor } from '$lib/types';

	let slug = '';
	let exhibitor: Exhibitor | null = null;
	let loading = true;
	let error = '';
	let isFavorite = false;
	let isTogglingFavorite = false;
	let viewTracked = false;

	$: slug = $page.params.slug || '';
	$: if (slug) loadExhibitor(slug);

	async function loadExhibitor(exhibitorSlug: string) {
		loading = true;
		error = '';
		viewTracked = false;

		try {
			const data = await exhibitors.getBySlug(exhibitorSlug);
			exhibitor = data;

			if (data) {
				isFavorite = favorites.isFavorite(data.id);
				if (!viewTracked) {
					await analytics.trackView(data.id, 'detail_page');
					viewTracked = true;
				}
			}
		} catch (err) {
			console.error('Error loading exhibitor:', err);
			error = "Impossible de charger l'exposant";
			exhibitor = null;
		} finally {
			loading = false;
		}
	}

	async function toggleFavorite() {
		if (!exhibitor || isTogglingFavorite) return;
		isTogglingFavorite = true;
		try {
			const newState = await favorites.toggle(exhibitor);
			isFavorite = newState;
			toast.success(newState ? 'Ajouté aux favoris' : 'Retiré des favoris');
		} catch (err) {
			toast.error('Erreur lors de la mise à jour');
		} finally {
			isTogglingFavorite = false;
		}
	}

	function share() {
		if (!exhibitor) return;
		if (navigator.share) {
			navigator
				.share({
					title: exhibitor.name,
					text: `Découvrez ${exhibitor.name} au salon`,
					url: window.location.href,
				})
				.catch(() => copyToClipboard());
		} else {
			copyToClipboard();
		}
	}

	function copyToClipboard() {
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(window.location.href)
				.then(() => toast.success('Lien copié !'))
				.catch(() => toast.error('Impossible de copier'));
		}
	}

	onMount(() => console.log('Page mounted'));
</script>

<div class="min-h-screen bg-gray-50 pb-28">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<div
					class="spinner w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full mx-auto mb-4"
				></div>
				<p class="text-gray-600">Chargement...</p>
			</div>
		</div>
	{:else if error || !exhibitor}
		<div class="flex items-center justify-center min-h-screen p-4" in:fly={{ y: 20, duration: 300 }}>
			<div class="text-center max-w-md">
				<div class="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900 mb-2">Exposant introuvable</h1>
				<p class="text-gray-600 mb-6">{error || "Cet exposant n'existe pas"}</p>
				<button class="btn-primary" on:click={() => goto('/')}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Retour au plan
				</button>
			</div>
		</div>
	{:else if exhibitor}
		<div in:fade>
			<!-- Simple Header -->
			<div class="bg-white border-b">
				<div class="container-max py-4">
					<button
						class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
						on:click={() => goto('/')}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
						Retour au plan
					</button>
				</div>
			</div>

			<!-- Main Content -->
			<div class="container-max py-8">
				<div class="max-w-5xl mx-auto">
					<!-- Header Card -->
					<div class="bg-white rounded-xl border shadow-sm p-8 mb-6">
						<div class="flex flex-col md:flex-row gap-6">
							<!-- Logo -->
							<div class="flex-shrink-0">
								{#if exhibitor.logoUrl}
									<div
										class="w-24 h-24 bg-white rounded-lg border p-3 flex items-center justify-center"
									>
										<img
											src={exhibitor.logoUrl}
											alt={exhibitor.name}
											class="w-full h-full object-contain"
										/>
									</div>
								{:else}
									<div
										class="w-24 h-24 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
										style="background: linear-gradient(135deg, {exhibitor.sector?.colorHex ||
											'#E20A16'}, color-mix(in srgb, {exhibitor.sector?.colorHex ||
											'#E20A16'} 70%, black))"
									>
										{exhibitor.name.substring(0, 2).toUpperCase()}
									</div>
								{/if}
							</div>

							<!-- Info -->
							<div class="flex-1 min-w-0">
								<h1 class="text-3xl font-bold text-gray-900 mb-3">{exhibitor.name}</h1>

								<div class="flex flex-wrap gap-2 mb-4">
									{#if exhibitor.sector}
										<span
											class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium"
											style="background: color-mix(in srgb, {exhibitor.sector
												.colorHex} 12%, white); color: {exhibitor.sector.colorHex};"
										>
											{exhibitor.sector.name}
										</span>
									{/if}
									{#if exhibitor.booth}
										<span
											class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
										>
											<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
									<p class="text-gray-600 leading-relaxed mb-4">{exhibitor.description}</p>
								{/if}

								<!-- Actions -->
								<div class="flex flex-wrap gap-2">
									<button
										class="btn-sm {isFavorite ? 'btn-primary' : 'btn-outline'}"
										on:click={toggleFavorite}
										disabled={isTogglingFavorite}
									>
										<svg
											class="w-4 h-4"
											fill={isFavorite ? 'currentColor' : 'none'}
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
										{isFavorite ? 'Favori' : 'Ajouter'}
									</button>

									{#if exhibitor.booth}
										<button
											class="btn-sm btn-primary"
											on:click={() =>
												exhibitor?.booth && goto(`/?stand=${exhibitor.booth.number}`)}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
											Localiser
										</button>
									{/if}

									<button class="btn-sm btn-ghost" on:click={share}>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.024a3 3 0 10-2.684 4.024m-2.684-4.024a3 3 0 102.684 4.024"
											/>
										</svg>
										Partager
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Two Column Layout -->
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<!-- Main Column -->
						<div class="lg:col-span-2 space-y-6">
							<!-- Contacts -->
							{#if exhibitor.contacts && exhibitor.contacts.length > 0}
								<div class="bg-white rounded-xl border shadow-sm p-6">
									<h2 class="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
									<div class="space-y-3">
										{#each exhibitor.contacts as contact}
											<div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
												<div
													class="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center font-semibold flex-shrink-0"
												>
													{(contact.firstName || 'X')[0]}{(contact.lastName || 'X')[0]}
												</div>
												<div class="flex-1 min-w-0">
													<div class="font-medium text-gray-900">
														{contact.firstName}
														{contact.lastName}
													</div>
													{#if contact.role}
														<div class="text-sm text-gray-600 mb-2">{contact.role}</div>
													{/if}
													<div class="flex flex-wrap gap-2">
														{#if contact.email}
															<a
																href="mailto:{contact.email}"
																class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border rounded-md text-xs text-gray-700 hover:border-gray-400 transition-colors"
															>
																<svg
																	class="w-3.5 h-3.5"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		stroke-linecap="round"
																		stroke-linejoin="round"
																		stroke-width="2"
																		d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
																	/>
																</svg>
																Email
															</a>
														{/if}
														{#if contact.phone}
															<a
																href="tel:{contact.phone}"
																class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border rounded-md text-xs text-gray-700 hover:border-gray-400 transition-colors"
															>
																<svg
																	class="w-3.5 h-3.5"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		stroke-linecap="round"
																		stroke-linejoin="round"
																		stroke-width="2"
																		d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
																	/>
																</svg>
																Tél.
															</a>
														{/if}
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<!-- Sidebar -->
						<div class="space-y-6">
							<!-- Links -->
							{#if exhibitor.websiteUrl || exhibitor.linkedinUrl || exhibitor.pdfUrl}
								<div class="bg-white rounded-xl border shadow-sm p-6">
									<h3 class="text-lg font-semibold text-gray-900 mb-4">Liens</h3>
									<div class="space-y-2">
										{#if exhibitor.websiteUrl}
											<a
												href={exhibitor.websiteUrl}
												target="_blank"
												rel="noopener"
												class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors group"
											>
												<svg
													class="w-5 h-5 text-gray-400 group-hover:text-gray-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
													/>
												</svg>
												<span class="flex-1 font-medium">Site web</span>
												<svg
													class="w-4 h-4 text-gray-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
													/>
												</svg>
											</a>
										{/if}
										{#if exhibitor.linkedinUrl}
											<a
												href={exhibitor.linkedinUrl}
												target="_blank"
												rel="noopener"
												class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors group"
											>
												<svg
													class="w-5 h-5 text-[#0A66C2]"
													fill="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
													/>
												</svg>
												<span class="flex-1 font-medium">LinkedIn</span>
												<svg
													class="w-4 h-4 text-gray-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
													/>
												</svg>
											</a>
										{/if}
										{#if exhibitor.pdfUrl}
											<a
												href={exhibitor.pdfUrl}
												target="_blank"
												rel="noopener"
												class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors group"
											>
												<svg
													class="w-5 h-5 text-red-500"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
													/>
												</svg>
												<span class="flex-1 font-medium">Brochure PDF</span>
												<svg
													class="w-4 h-4 text-gray-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											</a>
										{/if}
									</div>
								</div>
							{/if}

							<!-- Info -->
							<div class="bg-white rounded-xl border shadow-sm p-6">
								<h3 class="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
								<div class="space-y-3">
									{#if exhibitor.sector}
										<div class="flex justify-between py-2">
											<span class="text-sm text-gray-500">Secteur</span>
											<span
												class="text-sm font-medium"
												style="color: {exhibitor.sector.colorHex}"
											>
												{exhibitor.sector.name}
											</span>
										</div>
									{/if}
									{#if exhibitor.booth}
										<div class="flex justify-between py-2">
											<span class="text-sm text-gray-500">Stand</span>
											<span class="text-sm font-semibold text-gray-900"
												>{exhibitor.booth.number}</span
											>
										</div>
									{/if}
									{#if exhibitor.contacts}
										<div class="flex justify-between py-2">
											<span class="text-sm text-gray-500">Contacts</span>
											<span class="text-sm font-medium text-gray-900"
												>{exhibitor.contacts.length}</span
											>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.spinner {
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
