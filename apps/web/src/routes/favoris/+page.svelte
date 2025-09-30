<!-- src/routes/favoris/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { toast } from 'svelte-sonner';
	import { favorites, favoritesArray, favoritesCount, favoritesLoading } from '$lib/stores/favorites';
	import type { Exhibitor } from '$lib/types';

	let removingId: string | null = null;
	let showClearModal = false;
	let isRefreshing = false;
	let searchQuery = '';
	let selectedSector: string = 'all';

	$: filteredFavorites = $favoritesArray.filter((exhibitor) => {
		const matchesSearch =
			exhibitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			exhibitor.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSector = selectedSector === 'all' || exhibitor.sectorId === selectedSector;
		return matchesSearch && matchesSector;
	});

	$: sectors = [...new Set($favoritesArray.map((e) => e.sector).filter(Boolean))];

	onMount(async () => {
		if (!$favoritesLoading) {
			isRefreshing = true;
			await favorites.refresh();
			isRefreshing = false;
		}
	});

	async function removeFavorite(exhibitor: Exhibitor) {
		if (removingId) return;
		removingId = exhibitor.id;
		try {
			const success = await favorites.remove(exhibitor.id);
			if (success) {
				toast.success(`${exhibitor.name} retiré des favoris`);
			} else {
				toast.error('Erreur lors de la suppression');
			}
		} catch (error) {
			toast.error('Une erreur est survenue');
		} finally {
			removingId = null;
		}
	}

	async function clearAll() {
		showClearModal = false;
		try {
			await favorites.clear();
			toast.success('Tous les favoris ont été supprimés');
		} catch (error) {
			toast.error('Erreur lors de la suppression');
		}
	}

	function exportFavorites() {
		const csv = [
			['Nom', 'Secteur', 'Stand', 'Description'],
			...$favoritesArray.map((e) => [e.name, e.sector?.name || '', e.booth?.number || '', e.description || '']),
		]
			.map((row) => row.map((cell) => `"${cell}"`).join(','))
			.join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'favoris-effervescence93.csv';
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Liste exportée');
	}
</script>

<svelte:head>
	<title>Mes favoris ({$favoritesCount}) - Effervescence 93</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-28">
	<!-- Header -->
	<header class="bg-white border-b sticky top-0 z-20">
		<div class="container-max">
			<div class="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white flex-shrink-0"
					>
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
							/>
						</svg>
					</div>
					<div>
						<h1 class="text-2xl font-bold text-gray-900">Mes favoris</h1>
						<p class="text-gray-600 text-sm">
							{#if $favoritesCount > 0}
								<span
									class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded font-medium text-xs"
								>
									{$favoritesCount} exposant{$favoritesCount > 1 ? 's' : ''}
								</span>
							{:else}
								Aucun exposant sauvegardé
							{/if}
						</p>
					</div>
				</div>

				{#if $favoritesCount > 0}
					<div class="flex flex-wrap gap-2" in:fly={{ x: 20, duration: 300 }}>
						<button class="btn-primary" on:click={() => goto('/')}>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
								/>
							</svg>
							Plan
						</button>
						<button class="btn-outline" on:click={exportFavorites}>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Exporter
						</button>
						<button
							class="btn-outline text-red-600 border-red-200 hover:bg-red-50"
							on:click={() => (showClearModal = true)}
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Supprimer
						</button>
					</div>
				{/if}
			</div>

			<!-- Filters -->
			{#if $favoritesCount > 3}
				<div class="pb-6 flex flex-col sm:flex-row gap-3" in:fly={{ y: -10, duration: 300 }}>
					<div class="relative flex-1 max-w-md">
						<svg
							class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input type="text" placeholder="Rechercher..." bind:value={searchQuery} class="input pl-10" />
					</div>
					{#if sectors.length > 1}
						<select bind:value={selectedSector} class="select">
							<option value="all">Tous les secteurs</option>
							{#each sectors as sector}
								{#if sector}
									<option value={sector.id}>{sector.name}</option>
								{/if}
							{/each}
						</select>
					{/if}
				</div>
			{/if}
		</div>
	</header>

	<!-- Main Content -->
	<main class="py-8">
		<div class="container-max">
			{#if $favoritesLoading || isRefreshing}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each Array(6) as _, i}
						<div
							class="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
							style="animation-delay: {i * 50}ms"
						>
							<div class="h-40 bg-gray-200"></div>
							<div class="p-5 space-y-3">
								<div class="h-4 bg-gray-200 rounded w-20"></div>
								<div class="h-5 bg-gray-200 rounded w-3/4"></div>
								<div class="h-4 bg-gray-200 rounded w-full"></div>
								<div class="h-4 bg-gray-200 rounded w-2/3"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if $favoritesCount > 0}
				{#if searchQuery || selectedSector !== 'all'}
					<div class="mb-4 text-sm text-gray-600" in:fade>
						{filteredFavorites.length} résultat{filteredFavorites.length > 1 ? 's' : ''}
						{#if searchQuery}pour "{searchQuery}"{/if}
					</div>
				{/if}

				{#if filteredFavorites.length > 0}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each filteredFavorites as exhibitor (exhibitor.id)}
							<article
								class="group bg-white rounded-lg shadow-sm hover:shadow-md border hover:border-gray-300 overflow-hidden transition-all {removingId ===
								exhibitor.id
									? 'opacity-50 scale-95 pointer-events-none'
									: ''}"
								animate:flip={{ duration: 300 }}
								in:fly={{ y: 20, duration: 300 }}
								out:scale={{ duration: 200 }}
							>
								<!-- Card Header -->
								<div class="relative h-40 bg-gray-50 flex items-center justify-center p-4 border-b">
									<!-- Logo -->
									<button
										class="relative z-10 transition-transform group-hover:scale-105"
										on:click={() => goto(`/exposant/${exhibitor.slug}`)}
									>
										{#if exhibitor.logoUrl}
											<img
												src={exhibitor.logoUrl}
												alt={exhibitor.name}
												class="max-h-24 max-w-32 object-contain"
											/>
										{:else}
											<div
												class="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
												style="background: linear-gradient(135deg, {exhibitor.sector
													?.colorHex || '#E20A16'}, color-mix(in srgb, {exhibitor.sector
													?.colorHex || '#E20A16'} 70%, black))"
											>
												{exhibitor.name.substring(0, 2).toUpperCase()}
											</div>
										{/if}
									</button>

									<!-- Bouton Favori -->
									<button
										class="absolute top-3 right-3 p-2 rounded-lg bg-white hover:bg-red-50 text-red-500 hover:shadow-md transition-all"
										on:click={() => removeFavorite(exhibitor)}
										disabled={removingId === exhibitor.id}
										aria-label="Retirer"
									>
										<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path
												d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
											/>
										</svg>
									</button>
								</div>

								<!-- Card Body -->
								<div class="p-4 space-y-3">
									<!-- Badges -->
									<div class="flex flex-wrap gap-2">
										{#if exhibitor.sector}
											<span
												class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
												style="background: color-mix(in srgb, {exhibitor.sector
													.colorHex} 10%, white); color: {exhibitor.sector.colorHex};"
											>
												{exhibitor.sector.name}
											</span>
										{/if}
										{#if exhibitor.booth}
											<span
												class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
											>
												<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
													<path
														fill-rule="evenodd"
														d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
														clip-rule="evenodd"
													/>
												</svg>
												{exhibitor.booth.number}
											</span>
										{/if}
									</div>

									<!-- Title -->
									<h3 class="font-bold text-gray-900 line-clamp-2">
										<button
											class="hover:text-primary transition-colors text-left"
											on:click={() => goto(`/exposant/${exhibitor.slug}`)}
										>
											{exhibitor.name}
										</button>
									</h3>

									<!-- Description -->
									{#if exhibitor.description}
										<p class="text-sm text-gray-600 line-clamp-2">{exhibitor.description}</p>
									{/if}

									<!-- Meta -->
									{#if exhibitor.contacts && exhibitor.contacts.length > 0}
										<div class="flex items-center gap-1.5 text-xs text-gray-500 pt-1 border-t">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
											<span
												>{exhibitor.contacts.length} contact{exhibitor.contacts.length > 1
													? 's'
													: ''}</span
											>
										</div>
									{/if}
								</div>

								<!-- Card Footer -->
								<div class="px-4 pb-4 flex gap-2">
									<button
										class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
										on:click={() => goto(`/exposant/${exhibitor.slug}`)}
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
										Détails
									</button>
									{#if exhibitor.booth}
										<button
											class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white hover:bg-primary-700 rounded-lg text-sm font-medium transition-all"
											on:click={() =>
												exhibitor.booth && goto(`/?stand=${exhibitor.booth.number}`)}
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
											Plan
										</button>
									{/if}
								</div>
							</article>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12 bg-white rounded-lg border" in:fade>
						<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-gray-900 mb-1">Aucun résultat</h3>
						<p class="text-gray-600">Essayez avec d'autres critères</p>
					</div>
				{/if}
			{:else}
				<div class="text-center py-16 bg-white rounded-lg border" in:fade>
					<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 mb-2">Aucun exposant en favori</h2>
					<p class="text-gray-600 mb-6">
						Parcourez le plan et cliquez sur le cœur pour sauvegarder vos exposants préférés
					</p>
					<button class="btn-primary" on:click={() => goto('/')}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
						Explorer le salon
					</button>
				</div>
			{/if}
		</div>
	</main>

	<!-- Clear Modal -->
	{#if showClearModal}
		<div
			class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			transition:fade
			on:click={() => (showClearModal = false)}
		>
			<div
				class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
				transition:scale
				on:click|stopPropagation
			>
				<div
					class="w-12 h-12 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<div class="text-center">
					<h3 class="text-lg font-bold text-gray-900 mb-2">Supprimer tous les favoris ?</h3>
					<p class="text-gray-600">
						Cette action est irréversible. Vous pourrez les ajouter à nouveau plus tard.
					</p>
				</div>
				<div class="flex gap-3">
					<button class="flex-1 btn-outline" on:click={() => (showClearModal = false)}>Annuler</button>
					<button
						class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
						on:click={clearAll}>Supprimer</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
