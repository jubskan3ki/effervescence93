<!-- src/routes/admin/stands/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { booths } from '$lib/api/booths';
	import type { Booth } from '$lib/types';

	let boothsList: Booth[] = [];
	let stats: any = null;
	let loading = false;
	let error = '';
	let successMessage = '';
	let searchQuery = '';

	// Formulaire de création
	let showCreateForm = false;
	let createForm = {
		number: '',
		polygonId: '',
		x: 0,
		y: 0,
		width: 120,
		height: 80,
		rotation: 0,
	};

	// Modal d'édition
	let editingBooth: Booth | null = null;
	let editForm = {
		number: '',
		polygonId: '',
		x: 0,
		y: 0,
		width: 120,
		height: 80,
		rotation: 0,
	};

	// Fonction pour calculer les statistiques correctement
	function calculateStats(booths: Booth[]) {
		const total = booths.length;
		const occupied = booths.filter((booth) => booth.exhibitor).length;
		const available = total - occupied;
		const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) + '%' : '0%';

		return {
			total,
			occupied,
			available,
			occupancyRate,
		};
	}

	async function loadBooths() {
		loading = true;
		error = '';
		try {
			// Charger uniquement la liste des stands
			const boothsData = await booths.list(searchQuery);
			boothsList = boothsData;

			// Calculer les statistiques côté client basées sur les données réelles
			stats = calculateStats(boothsList);

			console.log('Booths:', boothsList);
			console.log('Calculated stats:', stats);
		} catch (e: any) {
			error = e.message || 'Erreur de chargement';
		} finally {
			loading = false;
		}
	}

	async function handleSearch() {
		await loadBooths();
	}

	async function createBooth() {
		if (!createForm.number || !createForm.polygonId) {
			error = 'Le numéro et le polygon ID sont requis';
			return;
		}

		loading = true;
		error = '';
		try {
			await booths.create(createForm);
			successMessage = 'Stand créé avec succès';
			createForm = {
				number: '',
				polygonId: '',
				x: 0,
				y: 0,
				width: 120,
				height: 80,
				rotation: 0,
			};
			showCreateForm = false;
			await loadBooths();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la création';
		} finally {
			loading = false;
		}
	}

	function openEdit(booth: Booth) {
		editingBooth = booth;
		editForm = {
			number: booth.number,
			polygonId: booth.polygonId || '',
			x: booth.x,
			y: booth.y,
			width: booth.width || 120,
			height: booth.height || 80,
			rotation: booth.rotation || 0,
		};
	}

	async function saveEdit() {
		if (!editingBooth) return;

		loading = true;
		error = '';
		try {
			await booths.update(editingBooth.id, editForm);
			successMessage = 'Stand mis à jour avec succès';
			editingBooth = null;
			await loadBooths();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la mise à jour';
		} finally {
			loading = false;
		}
	}

	async function deleteBooth(id: string, number: string) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer le stand ${number} ?\nCette action est irréversible.`)) return;

		loading = true;
		error = '';
		try {
			await booths.delete(id);
			successMessage = 'Stand supprimé avec succès';
			await loadBooths();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la suppression';
		} finally {
			loading = false;
		}
	}

	onMount(loadBooths);
</script>

<svelte:head>
	<title>Gestion des stands - Admin</title>
</svelte:head>

<div class="p-4 lg:p-6 max-w-7xl mx-auto">
	<!-- Header avec stats -->
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h1 class="text-2xl font-bold text-gray-900">Gestion des stands</h1>
			<button
				on:click={() => (showCreateForm = !showCreateForm)}
				class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
			>
				<i class="fas {showCreateForm ? 'fa-times' : 'fa-plus'}"></i>
				{showCreateForm ? 'Annuler' : 'Nouveau stand'}
			</button>
		</div>

		{#if stats}
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-gray-900">{stats.total}</div>
					<div class="text-xs text-gray-500">Total</div>
				</div>
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-red-600">{stats.occupied}</div>
					<div class="text-xs text-gray-500">Occupés</div>
				</div>
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-green-600">{stats.available}</div>
					<div class="text-xs text-gray-500">Disponibles</div>
				</div>
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-blue-600">{stats.occupancyRate}</div>
					<div class="text-xs text-gray-500">Taux d'occupation</div>
				</div>
			</div>
		{/if}
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
			<h2 class="text-lg font-semibold mb-4 text-gray-900">Créer un nouveau stand</h2>
			<form on:submit|preventDefault={createBooth}>
				<div class="grid md:grid-cols-3 gap-4 mb-4">
					<div>
						<label for="create-number" class="block text-sm font-medium text-gray-700 mb-1">
							Numéro <span class="text-red-500">*</span>
						</label>
						<input
							id="create-number"
							type="text"
							bind:value={createForm.number}
							required
							placeholder="Ex: A12"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label for="create-polygonId" class="block text-sm font-medium text-gray-700 mb-1">
							Polygon ID <span class="text-red-500">*</span>
						</label>
						<input
							id="create-polygonId"
							type="text"
							bind:value={createForm.polygonId}
							required
							placeholder="Ex: poly_a12"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label for="create-rotation" class="block text-sm font-medium text-gray-700 mb-1">
							Rotation (°)
						</label>
						<input
							id="create-rotation"
							type="number"
							bind:value={createForm.rotation}
							min="-360"
							max="360"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
				</div>
				<div class="grid md:grid-cols-4 gap-4">
					<div>
						<label for="create-x" class="block text-sm font-medium text-gray-700 mb-1">Position X</label>
						<input
							id="create-x"
							type="number"
							bind:value={createForm.x}
							min="0"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label for="create-y" class="block text-sm font-medium text-gray-700 mb-1">Position Y</label>
						<input
							id="create-y"
							type="number"
							bind:value={createForm.y}
							min="0"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label for="create-width" class="block text-sm font-medium text-gray-700 mb-1">Largeur</label>
						<input
							id="create-width"
							type="number"
							bind:value={createForm.width}
							min="1"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label for="create-height" class="block text-sm font-medium text-gray-700 mb-1">Hauteur</label>
						<input
							id="create-height"
							type="number"
							bind:value={createForm.height}
							min="1"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
				</div>
				<div class="mt-4 flex justify-end gap-3">
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
						Créer le stand
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
					placeholder="Rechercher par numéro de stand..."
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
				on:click={loadBooths}
				disabled={loading}
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				<i class="fas fa-sync-alt {loading ? 'animate-spin' : ''}"></i>
				Actualiser
			</button>
		</div>
	</div>

	<!-- Table des stands -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
		{#if loading && boothsList.length === 0}
			<div class="p-8 text-center">
				<i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
				<p class="text-gray-500">Chargement des stands...</p>
			</div>
		{:else if boothsList.length === 0}
			<div class="p-12 text-center">
				<i class="fas fa-th text-4xl text-gray-300 mb-3"></i>
				<p class="text-gray-500">Aucun stand trouvé</p>
				<p class="text-sm text-gray-400 mt-2">Créez votre premier stand pour commencer</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Numéro</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Polygon ID</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Position</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Dimensions</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Rotation</th
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
						{#each boothsList as booth}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-gray-900">{booth.number}</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-600 font-mono">{booth.polygonId}</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-600">
										<span class="font-mono">({booth.x}, {booth.y})</span>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-600">
										<span class="font-mono">{booth.width || 120} × {booth.height || 80}</span>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-600">
										{booth.rotation || 0}°
									</div>
								</td>
								<td class="px-6 py-4">
									{#if booth.exhibitor}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
										>
											<i class="fas fa-store text-[10px]"></i>
											Occupé
										</span>
										<div class="text-xs text-gray-500 mt-1">
											{booth.exhibitor.name}
										</div>
									{:else}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
										>
											<i class="fas fa-check-circle text-[10px]"></i>
											Disponible
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex justify-end gap-2">
										<button
											on:click={() => openEdit(booth)}
											class="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
											title="Modifier ce stand"
											aria-label="Modifier ce stand"
										>
											<i class="fas fa-edit"></i>
										</button>
										{#if !booth.exhibitor}
											<button
												on:click={() => deleteBooth(booth.id, booth.number)}
												disabled={loading}
												class="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												title="Supprimer ce stand"
												aria-label="Supprimer ce stand"
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
{#if editingBooth}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold text-gray-900">
						Modifier le stand {editingBooth.number}
					</h2>
					<button
						on:click={() => (editingBooth = null)}
						class="text-gray-400 hover:text-gray-600"
						aria-label="Fermer la fenêtre de modification"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>

				<form on:submit|preventDefault={saveEdit}>
					<div class="grid md:grid-cols-2 gap-4 mb-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
							<input
								type="text"
								bind:value={editForm.number}
								required
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Polygon ID</label>
							<input
								type="text"
								bind:value={editForm.polygonId}
								required
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
					</div>
					<div class="grid md:grid-cols-3 gap-4 mb-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Position X</label>
							<input
								type="number"
								bind:value={editForm.x}
								min="0"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Position Y</label>
							<input
								type="number"
								bind:value={editForm.y}
								min="0"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Rotation (°)</label>
							<input
								type="number"
								bind:value={editForm.rotation}
								min="-360"
								max="360"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
					</div>
					<div class="grid md:grid-cols-2 gap-4 mb-6">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Largeur</label>
							<input
								type="number"
								bind:value={editForm.width}
								min="1"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Hauteur</label>
							<input
								type="number"
								bind:value={editForm.height}
								min="1"
								class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							/>
						</div>
					</div>

					<div class="flex justify-end gap-3">
						<button
							type="button"
							on:click={() => (editingBooth = null)}
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
