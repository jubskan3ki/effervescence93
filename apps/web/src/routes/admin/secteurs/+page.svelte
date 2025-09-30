<!-- src/routes/admin/secteurs/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { sectors } from '$lib/api/sectors';
	import type { Sector } from '$lib/types';

	interface SectorWithCount extends Sector {
		_count?: {
			exhibitors: number;
		};
	}

	let sectorsList: SectorWithCount[] = [];
	let loading = false;
	let error = '';
	let successMessage = '';
	let searchQuery = '';

	// Statistiques globales
	let globalStats = {
		total: 0,
		withExhibitors: 0,
		empty: 0,
		totalExhibitors: 0,
	};

	// Formulaire de création
	let showCreateForm = false;
	let createForm = {
		name: '',
		colorHex: '#8B5CF6',
	};

	// Modal d'édition
	let editingSector: SectorWithCount | null = null;
	let editForm = {
		name: '',
		colorHex: '#000000',
	};

	// Palette de couleurs prédéfinies
	const colorPresets = [
		'#8B5CF6',
		'#10B981',
		'#F59E0B',
		'#3B82F6',
		'#EF4444',
		'#EC4899',
		'#06B6D4',
		'#84CC16',
		'#A855F7',
		'#0EA5E9',
		'#22C55E',
		'#6366F1',
		'#F97316',
		'#14B8A6',
		'#8B5A2B',
		'#475569',
	];

	// Filtrage local des secteurs
	$: filteredSectors = searchQuery
		? sectorsList.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: sectorsList;

	// Fonction pour normaliser le format de couleur
	function normalizeColor(color: string): string {
		let normalized = color.trim();

		// Ajouter # si manquant
		if (!normalized.startsWith('#')) {
			normalized = '#' + normalized;
		}

		// Convertir en majuscules
		return normalized.toUpperCase();
	}

	// Fonction pour valider le format de couleur
	function isValidHexColor(color: string): boolean {
		return /^#[0-9A-F]{6}$/i.test(color);
	}

	async function loadSectors() {
		loading = true;
		error = '';
		try {
			const baseSectors = await sectors.list();
			sectorsList = baseSectors as SectorWithCount[];

			// Calculer les stats globales
			globalStats.total = sectorsList.length;
			globalStats.withExhibitors = sectorsList.filter((s) => s._count && s._count.exhibitors > 0).length;
			globalStats.empty = sectorsList.filter((s) => !s._count || s._count.exhibitors === 0).length;
			globalStats.totalExhibitors = sectorsList.reduce((sum, s) => sum + (s._count?.exhibitors || 0), 0);
		} catch (e: any) {
			error = e.message || 'Erreur de chargement des secteurs';
			sectorsList = [];
		} finally {
			loading = false;
		}
	}

	async function handleSearch() {
		await loadSectors();
	}

	async function createSector() {
		if (!createForm.name || !createForm.colorHex) {
			error = 'Le nom et la couleur sont requis';
			return;
		}

		// Normaliser et valider la couleur
		const normalizedColor = normalizeColor(createForm.colorHex);

		if (!isValidHexColor(normalizedColor)) {
			error = 'Format de couleur invalide. Utilisez le format #RRGGBB (ex: #8B5CF6)';
			return;
		}

		loading = true;
		error = '';
		try {
			await sectors.create({
				name: createForm.name.trim(),
				colorHex: normalizedColor,
			});
			successMessage = 'Secteur créé avec succès';
			createForm = {
				name: '',
				colorHex: '#8B5CF6',
			};
			showCreateForm = false;
			await loadSectors();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la création';
		} finally {
			loading = false;
		}
	}

	function openEdit(sector: SectorWithCount) {
		editingSector = sector;
		editForm = {
			name: sector.name,
			colorHex: normalizeColor(sector.colorHex),
		};
	}

	async function saveEdit() {
		if (!editingSector) return;

		if (!editForm.name || !editForm.colorHex) {
			error = 'Le nom et la couleur sont requis';
			return;
		}

		// Normaliser et valider la couleur
		const normalizedColor = normalizeColor(editForm.colorHex);

		if (!isValidHexColor(normalizedColor)) {
			error = 'Format de couleur invalide. Utilisez le format #RRGGBB (ex: #8B5CF6)';
			return;
		}

		loading = true;
		error = '';
		try {
			await sectors.update(editingSector.id, {
				name: editForm.name.trim(),
				colorHex: normalizedColor,
			});
			successMessage = 'Secteur mis à jour avec succès';
			editingSector = null;
			await loadSectors();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la mise à jour';
		} finally {
			loading = false;
		}
	}

	async function deleteSector(id: string, name: string) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer le secteur "${name}" ?\nCette action est irréversible.`)) {
			return;
		}

		loading = true;
		error = '';
		try {
			await sectors.delete(id);
			successMessage = 'Secteur supprimé avec succès';
			await loadSectors();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			if (e.message?.includes('exposant')) {
				error = 'Impossible de supprimer ce secteur car des exposants y sont associés';
			} else {
				error = e.message || 'Erreur lors de la suppression';
			}
		} finally {
			loading = false;
		}
	}

	// Fonction pour gérer le changement de couleur
	function handleColorInput(event: Event, formType: 'create' | 'edit') {
		const target = event.target as HTMLInputElement;
		if (formType === 'create') {
			createForm.colorHex = target.value;
		} else {
			editForm.colorHex = target.value;
		}
	}

	onMount(loadSectors);
</script>

<svelte:head>
	<title>Gestion des secteurs - Admin</title>
</svelte:head>

<div class="p-4 lg:p-6 max-w-7xl mx-auto">
	<!-- Header avec stats -->
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h1 class="text-2xl font-bold text-gray-900">Gestion des secteurs</h1>
			<button
				on:click={() => (showCreateForm = !showCreateForm)}
				class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
			>
				<i class="fas {showCreateForm ? 'fa-times' : 'fa-plus'}"></i>
				{showCreateForm ? 'Annuler' : 'Nouveau secteur'}
			</button>
		</div>

		<!-- Cartes de statistiques -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-gray-900">{globalStats.total}</div>
				<div class="text-xs text-gray-500">Total</div>
			</div>
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-green-600">{globalStats.withExhibitors}</div>
				<div class="text-xs text-gray-500">Avec exposants</div>
			</div>
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-amber-600">{globalStats.empty}</div>
				<div class="text-xs text-gray-500">Sans exposant</div>
			</div>
			<div class="bg-white rounded-lg p-3 border border-gray-200">
				<div class="text-2xl font-bold text-blue-600">{globalStats.totalExhibitors}</div>
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
			<h2 class="text-lg font-semibold mb-4 text-gray-900">Créer un nouveau secteur</h2>
			<form on:submit|preventDefault={createSector}>
				<div class="grid md:grid-cols-2 gap-4 mb-4">
					<div>
						<label for="sector-name" class="block text-sm font-medium text-gray-700 mb-1">
							Nom du secteur <span class="text-red-500">*</span>
						</label>
						<input
							id="sector-name"
							type="text"
							bind:value={createForm.name}
							required
							maxlength="80"
							placeholder="Ex: Innovation, Commerce, Artisanat..."
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label for="sector-color" class="block text-sm font-medium text-gray-700 mb-1">
							Code couleur <span class="text-red-500">*</span>
						</label>
						<div class="flex gap-2">
							<input
								id="sector-color"
								type="color"
								value={createForm.colorHex}
								on:input={(e) => handleColorInput(e, 'create')}
								required
								class="h-10 w-16 border border-gray-300 rounded cursor-pointer"
							/>
							<input
								type="text"
								bind:value={createForm.colorHex}
								required
								maxlength="7"
								placeholder="#8B5CF6"
								class="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
								aria-label="Code hexadécimal de la couleur"
							/>
						</div>
						<div class="text-xs text-gray-500 mt-1">Format: #RRGGBB (ex: #8B5CF6)</div>
					</div>
				</div>

				<!-- Palette de couleurs -->
				<div class="mb-4">
					<span class="block text-sm font-medium text-gray-700 mb-2">Couleurs suggérées</span>
					<div class="flex flex-wrap gap-2">
						{#each colorPresets as color}
							<button
								type="button"
								on:click={() => (createForm.colorHex = color)}
								class="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 {normalizeColor(
									createForm.colorHex
								) === normalizeColor(color)
									? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
									: 'border-gray-300'}"
								style="background-color: {color}"
								title={color}
								aria-label="Sélectionner la couleur {color}"
							></button>
						{/each}
					</div>
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
						Créer le secteur
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Barre de recherche -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
		<div class="flex flex-col sm:flex-row gap-3">
			<div class="flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Rechercher un secteur..."
					on:keyup={(e) => e.key === 'Enter' && handleSearch()}
					class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				/>
			</div>
			<button
				on:click={handleSearch}
				disabled={loading}
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				<i class="fas fa-search"></i>
				Rechercher
			</button>
			<button
				on:click={loadSectors}
				disabled={loading}
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				<i class="fas fa-sync-alt {loading ? 'animate-spin' : ''}"></i>
				Actualiser
			</button>
		</div>
	</div>

	<!-- Table des secteurs -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
		{#if loading && sectorsList.length === 0}
			<div class="p-8 text-center">
				<i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
				<p class="text-gray-500">Chargement des secteurs...</p>
			</div>
		{:else if filteredSectors.length === 0}
			<div class="p-12 text-center">
				<i class="fas fa-palette text-4xl text-gray-300 mb-3"></i>
				<p class="text-gray-500">
					{searchQuery ? 'Aucun secteur trouvé avec cette recherche' : 'Aucun secteur trouvé'}
				</p>
				<p class="text-sm text-gray-400 mt-2">
					{searchQuery ? "Essayez avec d'autres termes" : "Créez votre premier secteur d'activité"}
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Couleur</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Nom</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Code couleur</th
							>
							<th
								class="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Exposants</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Statut</th
							>
							<th
								class="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each filteredSectors as sector}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div
										class="w-10 h-10 rounded-lg shadow-sm"
										style="background-color: {sector.colorHex}"
										title={sector.colorHex}
									></div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-gray-900">{sector.name}</div>
								</td>
								<td class="px-6 py-4">
									<code class="text-sm font-mono text-gray-600">
										{normalizeColor(sector.colorHex)}
									</code>
								</td>
								<td class="px-6 py-4 text-center">
									<span class="text-sm font-semibold text-gray-900">
										{sector._count?.exhibitors || 0}
									</span>
								</td>
								<td class="px-6 py-4">
									{#if sector._count && sector._count.exhibitors > 0}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
										>
											<i class="fas fa-check-circle text-[10px]"></i>
											Actif
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
										>
											<i class="fas fa-circle text-[10px]"></i>
											Vide
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex justify-end gap-2">
										<button
											on:click={() => openEdit(sector)}
											class="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
											title="Modifier ce secteur"
											aria-label="Modifier ce secteur"
										>
											<i class="fas fa-edit"></i>
										</button>
										{#if !sector._count || sector._count.exhibitors === 0}
											<button
												on:click={() => deleteSector(sector.id, sector.name)}
												disabled={loading}
												class="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												title="Supprimer ce secteur"
												aria-label="Supprimer ce secteur"
											>
												<i class="fas fa-trash"></i>
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Modal d'édition -->
{#if editingSector}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold text-gray-900">Modifier le secteur</h2>
					<button
						on:click={() => (editingSector = null)}
						class="text-gray-400 hover:text-gray-600"
						aria-label="Fermer"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>

				<form on:submit|preventDefault={saveEdit}>
					<div class="space-y-4">
						<div>
							<label for="edit-sector-name" class="block text-sm font-medium text-gray-700 mb-1">
								Nom du secteur <span class="text-red-500">*</span>
							</label>
							<input
								id="edit-sector-name"
								type="text"
								bind:value={editForm.name}
								required
								maxlength="80"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>

						<div>
							<label for="edit-sector-color" class="block text-sm font-medium text-gray-700 mb-1">
								Couleur <span class="text-red-500">*</span>
							</label>
							<div class="flex gap-2 mb-3">
								<input
									id="edit-sector-color"
									type="color"
									value={editForm.colorHex}
									on:input={(e) => handleColorInput(e, 'edit')}
									required
									class="h-10 w-20 border border-gray-300 rounded cursor-pointer"
								/>
								<input
									type="text"
									bind:value={editForm.colorHex}
									required
									maxlength="7"
									class="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
									aria-label="Code hexadécimal de la couleur"
								/>
							</div>
							<div class="text-xs text-gray-500 mb-2">Format: #RRGGBB (ex: #8B5CF6)</div>

							<!-- Palette de couleurs -->
							<div class="flex flex-wrap gap-2">
								{#each colorPresets as color}
									<button
										type="button"
										on:click={() => (editForm.colorHex = color)}
										class="w-8 h-8 rounded border-2 transition-all hover:scale-110 {normalizeColor(
											editForm.colorHex
										) === normalizeColor(color)
											? 'border-gray-900 ring-1 ring-offset-1 ring-gray-400'
											: 'border-gray-300'}"
										style="background-color: {color}"
										aria-label="Sélectionner la couleur {color}"
									></button>
								{/each}
							</div>
						</div>

						{#if editingSector._count && editingSector._count.exhibitors > 0}
							<div class="p-3 bg-amber-50 border border-amber-200 rounded-md">
								<p class="text-sm text-amber-800">
									<i class="fas fa-info-circle mr-1"></i>
									Ce secteur contient {editingSector._count.exhibitors} exposant{editingSector._count
										.exhibitors > 1
										? 's'
										: ''}. La modification affectera tous les exposants associés.
								</p>
							</div>
						{/if}
					</div>

					<div class="flex justify-end gap-3 mt-6">
						<button
							type="button"
							on:click={() => (editingSector = null)}
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
