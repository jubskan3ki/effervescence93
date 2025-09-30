<!-- src/routes/admin/parcours/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { themes, exhibitors } from '$lib/api';
	import type { Theme, Exhibitor } from '$lib/types';

	interface ThemeWithDetails extends Theme {
		slug?: string;
		exhibitors?: Exhibitor[];
		_count?: {
			exhibitors: number;
		};
	}

	let themesList: ThemeWithDetails[] = [];
	let exhibitorsList: Exhibitor[] = [];
	let loading = false;
	let error = '';
	let successMessage = '';

	// Formulaire de création
	let showCreateForm = false;
	let createForm = {
		name: '',
		description: '',
		order: 0,
		exhibitorIds: [] as string[],
	};

	// Modal d'édition
	let editingTheme: ThemeWithDetails | null = null;
	let editForm = {
		name: '',
		description: '',
		order: 0,
		exhibitorIds: [] as string[],
	};

	// Modal de gestion des exposants
	let managingTheme: ThemeWithDetails | null = null;
	let selectedExhibitorIds: Set<string> = new Set();
	let exhibitorSearchQuery = '';

	// Statistiques
	let stats = {
		total: 0,
		withExhibitors: 0,
		empty: 0,
		totalExhibitors: 0,
	};

	async function loadThemes() {
		loading = true;
		error = '';
		try {
			themesList = await themes.list();

			// Calculer les stats à partir de _count
			stats.total = themesList.length;
			stats.withExhibitors = themesList.filter((t) => t._count && t._count.exhibitors > 0).length;
			stats.empty = themesList.filter((t) => !t._count || t._count.exhibitors === 0).length;
			stats.totalExhibitors = themesList.reduce((sum, t) => sum + (t._count?.exhibitors || 0), 0);

			// Trier par ordre
			themesList.sort((a, b) => a.order - b.order);
		} catch (e: any) {
			error = e.message || 'Erreur de chargement des parcours';
		} finally {
			loading = false;
		}
	}

	async function loadExhibitors() {
		try {
			// exhibitors.list() retourne un tableau d'exposants
			// MAIS votre backend retourne peut-être un objet Paged avec 'data'
			const result = await exhibitors.list();

			// Si le résultat est déjà un tableau, on l'utilise directement
			if (Array.isArray(result)) {
				exhibitorsList = result;
			} else if (result && typeof result === 'object') {
				// Si c'est un objet, on cherche les données dans différentes propriétés possibles
				exhibitorsList = (result as any).data || (result as any).items || [];
			} else {
				exhibitorsList = [];
			}

			console.log('Exposants chargés:', exhibitorsList.length);
		} catch (e: any) {
			console.error('Erreur chargement exposants:', e);
			exhibitorsList = [];
		}
	}

	async function createTheme() {
		if (!createForm.name) {
			error = 'Le nom du parcours est requis';
			return;
		}

		loading = true;
		error = '';
		try {
			await themes.create(createForm);
			successMessage = 'Parcours créé avec succès';
			createForm = {
				name: '',
				description: '',
				order: 0,
				exhibitorIds: [],
			};
			showCreateForm = false;
			await loadThemes();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la création';
		} finally {
			loading = false;
		}
	}

	function openEdit(theme: ThemeWithDetails) {
		editingTheme = theme;
		editForm = {
			name: theme.name,
			description: theme.description || '',
			order: theme.order,
			exhibitorIds: theme.exhibitorIds || [],
		};
	}

	async function saveEdit() {
		if (!editingTheme) return;

		loading = true;
		error = '';
		try {
			// Pour l'édition, on ne met à jour que le nom, description et ordre
			// Les exposants sont gérés via la modal de gestion des exposants
			await themes.update(editingTheme.id, {
				name: editForm.name,
				description: editForm.description,
				order: editForm.order,
			});
			successMessage = 'Parcours mis à jour avec succès';
			editingTheme = null;
			await loadThemes();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la mise à jour';
		} finally {
			loading = false;
		}
	}

	async function deleteTheme(id: string, name: string) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer le parcours "${name}" ?\nCette action est irréversible.`)) {
			return;
		}

		loading = true;
		error = '';
		try {
			await themes.delete(id);
			successMessage = 'Parcours supprimé avec succès';
			await loadThemes();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la suppression';
		} finally {
			loading = false;
		}
	}

	async function openManageExhibitors(theme: ThemeWithDetails) {
		managingTheme = theme;

		// Charger les détails du thème pour obtenir la liste des exposants
		try {
			const themeDetails = await themes.get(theme.id);
			// Le thème détaillé contient un tableau 'exhibitors' avec les exposants
			const themeExhibitorIds = themeDetails.exhibitors?.map((e) => e.id) || [];
			selectedExhibitorIds = new Set(themeExhibitorIds);
		} catch (e: any) {
			console.error('Erreur lors du chargement des détails du thème:', e);
			selectedExhibitorIds = new Set();
		}

		exhibitorSearchQuery = '';
	}

	function toggleExhibitor(exhibitorId: string) {
		if (selectedExhibitorIds.has(exhibitorId)) {
			selectedExhibitorIds.delete(exhibitorId);
		} else {
			selectedExhibitorIds.add(exhibitorId);
		}
		selectedExhibitorIds = selectedExhibitorIds; // Trigger reactivity
	}

	async function saveExhibitors() {
		if (!managingTheme) return;

		loading = true;
		error = '';
		try {
			await themes.setExhibitors(managingTheme.id, Array.from(selectedExhibitorIds));
			successMessage = 'Exposants mis à jour avec succès';
			managingTheme = null;
			await loadThemes();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la mise à jour des exposants';
		} finally {
			loading = false;
		}
	}

	// Filtrer les exposants pour la recherche
	$: filteredExhibitors = exhibitorSearchQuery
		? exhibitorsList.filter(
				(e) =>
					e.name.toLowerCase().includes(exhibitorSearchQuery.toLowerCase()) ||
					e.sector?.name.toLowerCase().includes(exhibitorSearchQuery.toLowerCase())
			)
		: exhibitorsList;

	// Fonction pour réorganiser l'ordre des thèmes
	async function updateOrder(theme: ThemeWithDetails, newOrder: number) {
		try {
			await themes.update(theme.id, { order: newOrder });
			await loadThemes();
		} catch (e: any) {
			error = "Erreur lors de la mise à jour de l'ordre";
		}
	}

	// Correction de l'erreur TypeScript pour l'image
	function handleImageError(event: Event) {
		const target = event.currentTarget as HTMLImageElement;
		target.style.display = 'none';
	}

	onMount(async () => {
		await loadThemes();
		await loadExhibitors();
	});
</script>

<svelte:head>
	<title>Gestion des parcours thématiques - Admin</title>
</svelte:head>

<div class="p-4 lg:p-6 max-w-7xl mx-auto">
	<!-- Header avec stats -->
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h1 class="text-2xl font-bold text-gray-900">Parcours thématiques</h1>
			<button
				on:click={() => (showCreateForm = !showCreateForm)}
				class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
			>
				<i class="fas {showCreateForm ? 'fa-times' : 'fa-plus'}"></i>
				{showCreateForm ? 'Annuler' : 'Nouveau parcours'}
			</button>
		</div>

		<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-gray-900">{stats.total}</div>
				<div class="text-xs text-gray-500">Total parcours</div>
			</div>
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-green-600">{stats.withExhibitors}</div>
				<div class="text-xs text-gray-500">Avec exposants</div>
			</div>
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-amber-600">{stats.empty}</div>
				<div class="text-xs text-gray-500">Vides</div>
			</div>
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-blue-600">{stats.totalExhibitors}</div>
				<div class="text-xs text-gray-500">Total exposants</div>
			</div>
		</div>
	</div>

	<!-- Messages -->
	{#if error}
		<div class="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
			<i class="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
			<div class="text-sm text-red-700">{error}</div>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start gap-3">
			<i class="fas fa-check-circle text-green-500 mt-0.5"></i>
			<div class="text-sm text-green-700">{successMessage}</div>
		</div>
	{/if}

	<!-- Formulaire de création -->
	{#if showCreateForm}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
			<h2 class="text-lg font-semibold mb-4 text-gray-900">Créer un nouveau parcours</h2>
			<form on:submit|preventDefault={createTheme}>
				<div class="grid md:grid-cols-3 gap-4 mb-4">
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Nom du parcours <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							bind:value={createForm.name}
							required
							maxlength="100"
							placeholder="Ex: Innovation & Technologie"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1"> Ordre d'affichage </label>
						<input
							type="number"
							bind:value={createForm.order}
							min="0"
							placeholder="0"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
				</div>
				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700 mb-1"> Description </label>
					<textarea
						bind:value={createForm.description}
						rows="3"
						maxlength="500"
						placeholder="Description du parcours thématique..."
						class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
					></textarea>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						on:click={() => (showCreateForm = false)}
						class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={loading}
						class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Créer le parcours
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Liste des parcours -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
		{#if loading && themesList.length === 0}
			<div class="p-8 text-center">
				<i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
				<p class="text-gray-500">Chargement des parcours...</p>
			</div>
		{:else if themesList.length === 0}
			<div class="p-12 text-center">
				<i class="fas fa-route text-4xl text-gray-300 mb-3"></i>
				<p class="text-gray-500">Aucun parcours trouvé</p>
				<p class="text-sm text-gray-400 mt-2">Créez votre premier parcours thématique</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each themesList as theme (theme.id)}
					<div class="p-6 hover:bg-gray-50 transition-colors">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-2">
									<span
										class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold"
									>
										{theme.order}
									</span>
									<h3 class="text-lg font-semibold text-gray-900">{theme.name}</h3>
									{#if theme.slug}
										<span class="text-sm text-gray-500">@{theme.slug}</span>
									{/if}
								</div>

								{#if theme.description}
									<p class="text-sm text-gray-600 mb-3">{theme.description}</p>
								{/if}

								<div class="flex flex-wrap items-center gap-4">
									{#if theme._count && theme._count.exhibitors > 0}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
										>
											<i class="fas fa-store"></i>
											{theme._count.exhibitors} exposant{theme._count.exhibitors > 1 ? 's' : ''}
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
										>
											<i class="fas fa-inbox"></i>
											Aucun exposant
										</span>
									{/if}

									{#if theme.exhibitors && theme.exhibitors.length > 0}
										<div class="flex -space-x-2">
											{#each theme.exhibitors.slice(0, 5) as exhibitor}
												{#if exhibitor.logoUrl}
													<img
														src={exhibitor.logoUrl}
														alt={exhibitor.name}
														title={exhibitor.name}
														class="w-8 h-8 rounded-full border-2 border-white bg-white object-contain"
														on:error={handleImageError}
													/>
												{:else}
													<div
														class="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center"
														title={exhibitor.name}
													>
														<span class="text-xs font-medium text-gray-600">
															{exhibitor.name.charAt(0)}
														</span>
													</div>
												{/if}
											{/each}
											{#if theme.exhibitors.length > 5}
												<div
													class="w-8 h-8 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center"
												>
													<span class="text-xs font-medium text-white">
														+{theme.exhibitors.length - 5}
													</span>
												</div>
											{/if}
										</div>
									{/if}
								</div>
							</div>

							<div class="flex gap-2 ml-4">
								<button
									on:click={() => openManageExhibitors(theme)}
									class="px-3 py-1.5 text-xs font-medium bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
									title="Gérer les exposants"
									aria-label="Gérer les exposants du parcours {theme.name}"
								>
									<i class="fas fa-users"></i>
								</button>
								<button
									on:click={() => openEdit(theme)}
									class="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
									title="Modifier"
									aria-label="Modifier le parcours {theme.name}"
								>
									<i class="fas fa-edit"></i>
								</button>
								<button
									on:click={() => deleteTheme(theme.id, theme.name)}
									disabled={loading}
									class="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									title="Supprimer"
									aria-label="Supprimer le parcours {theme.name}"
								>
									<i class="fas fa-trash"></i>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Debug info pour voir les exposants -->
	{#if exhibitorsList.length === 0}
		<div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
			<p class="text-sm text-yellow-800">
				<i class="fas fa-info-circle mr-1"></i>
				Aucun exposant chargé. Vérifiez la console pour plus d'informations.
			</p>
		</div>
	{/if}
</div>

<!-- Modal d'édition -->
{#if editingTheme}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold text-gray-900">Modifier le parcours</h2>
					<button
						on:click={() => (editingTheme = null)}
						class="text-gray-400 hover:text-gray-600"
						aria-label="Fermer la fenêtre de modification"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>

				<form on:submit|preventDefault={saveEdit}>
					<div class="space-y-4">
						<div class="grid md:grid-cols-3 gap-4">
							<div class="md:col-span-2">
								<label class="block text-sm font-medium text-gray-700 mb-1">
									Nom du parcours <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									bind:value={editForm.name}
									required
									maxlength="100"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1"> Ordre </label>
								<input
									type="number"
									bind:value={editForm.order}
									min="0"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
								/>
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1"> Description </label>
							<textarea
								bind:value={editForm.description}
								rows="3"
								maxlength="500"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
							></textarea>
						</div>

						{#if editingTheme && editingTheme._count && editingTheme._count.exhibitors > 0}
							<div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p class="text-sm text-blue-800">
									<i class="fas fa-info-circle mr-1"></i>
									Ce parcours contient {editingTheme._count.exhibitors} exposant{editingTheme._count
										.exhibitors > 1
										? 's'
										: ''}. Utilisez le bouton "Gérer les exposants" pour modifier la liste.
								</p>
							</div>
						{/if}
					</div>

					<div class="flex justify-end gap-3 mt-6">
						<button
							type="button"
							on:click={() => (editingTheme = null)}
							class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={loading}
							class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Enregistrer les modifications
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Modal de gestion des exposants -->
{#if managingTheme}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
			<div class="p-6 border-b border-gray-200">
				<div class="flex justify-between items-center">
					<div>
						<h2 class="text-xl font-semibold text-gray-900">Gérer les exposants du parcours</h2>
						<p class="text-sm text-gray-600 mt-1">
							{managingTheme.name} - {selectedExhibitorIds.size} exposant{selectedExhibitorIds.size > 1
								? 's'
								: ''} sélectionné{selectedExhibitorIds.size > 1 ? 's' : ''}
						</p>
					</div>
					<button
						on:click={() => (managingTheme = null)}
						class="text-gray-400 hover:text-gray-600"
						aria-label="Fermer la fenêtre de gestion des exposants"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>
			</div>

			<div class="p-6 flex-1 overflow-y-auto">
				<!-- Recherche -->
				<div class="mb-4">
					<div class="relative">
						<input
							type="text"
							bind:value={exhibitorSearchQuery}
							placeholder="Rechercher un exposant..."
							class="w-full pl-10 pr-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
						/>
						<i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
					</div>
				</div>

				<!-- Liste des exposants -->
				{#if exhibitorsList.length > 0}
					<div class="grid md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
						{#each filteredExhibitors as exhibitor}
							<label
								class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {selectedExhibitorIds.has(
									exhibitor.id
								)
									? 'border-primary bg-primary-50'
									: 'border-gray-200'}"
							>
								<input
									type="checkbox"
									checked={selectedExhibitorIds.has(exhibitor.id)}
									on:change={() => toggleExhibitor(exhibitor.id)}
									class="mr-3 text-primary focus:ring-primary"
								/>
								<div class="flex items-center gap-3 flex-1">
									{#if exhibitor.logoUrl}
										<img
											src={exhibitor.logoUrl}
											alt={exhibitor.name}
											class="w-10 h-10 rounded object-contain bg-gray-100"
											on:error={handleImageError}
										/>
									{:else}
										<div class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
											<i class="fas fa-building text-gray-400 text-sm"></i>
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<p class="font-medium text-sm text-gray-900 truncate">{exhibitor.name}</p>
										{#if exhibitor.sector}
											<span
												class="inline-block px-2 py-0.5 text-xs rounded-full text-white mt-1"
												style="background-color: {exhibitor.sector.colorHex}"
											>
												{exhibitor.sector.name}
											</span>
										{/if}
									</div>
								</div>
							</label>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<i class="fas fa-inbox text-3xl text-gray-300 mb-2"></i>
						<p class="text-gray-500">Aucun exposant disponible</p>
					</div>
				{/if}
			</div>

			<div class="p-6 border-t border-gray-200 flex justify-between">
				<div class="flex gap-2">
					<button
						on:click={() => (selectedExhibitorIds = new Set())}
						class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
					>
						Tout déselectionner
					</button>
					<button
						on:click={() => (selectedExhibitorIds = new Set(exhibitorsList.map((e) => e.id)))}
						class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
					>
						Tout sélectionner
					</button>
				</div>
				<div class="flex gap-3">
					<button
						on:click={() => (managingTheme = null)}
						class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
					>
						Annuler
					</button>
					<button
						on:click={saveExhibitors}
						disabled={loading}
						class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Enregistrer la sélection
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
