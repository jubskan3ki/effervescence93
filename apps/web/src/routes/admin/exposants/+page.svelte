<!-- src/routes/admin/exposants/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { exhibitors, sectors, booths } from '$lib/api';
	import type { Exhibitor, Sector, Booth, Contact } from '$lib/types';
	import debounce from 'just-debounce-it';

	// Type pour les données d'exposant
	interface ExhibitorData {
		name: string;
		logoUrl?: string;
		description?: string;
		websiteUrl?: string;
		linkedinUrl?: string;
		pdfUrl?: string;
		sectorId: string;
		boothId?: string;
		contacts?: Contact[];
	}

	// État de la liste
	let exhibitorsList: Exhibitor[] = [];
	let totalExhibitors = 0;
	let currentPage = 1;
	let pageSize = 20;
	let totalPages = 1;

	// Chargement et messages
	let loading = false;
	let initialLoading = true;
	let error = '';
	let successMessage = '';

	// Filtres
	let searchQuery = '';
	let selectedSectorId = '';
	let sectorsList: Sector[] = [];
	let allBooths: Booth[] = [];
	let availableBooths: Booth[] = [];

	// Modal de détail
	let selectedExhibitor: Exhibitor | null = null;

	// Modal de création
	let showCreateModal = false;
	let createLoading = false;
	let createForm = {
		name: '',
		logoUrl: '',
		description: '',
		websiteUrl: '',
		linkedinUrl: '',
		pdfUrl: '',
		sectorId: '',
		boothId: '',
		contacts: [] as Contact[],
	};

	// Modal d'édition
	let showEditModal = false;
	let editLoading = false;
	let editingExhibitor: Exhibitor | null = null;
	let editForm = {
		name: '',
		logoUrl: '',
		description: '',
		websiteUrl: '',
		linkedinUrl: '',
		pdfUrl: '',
		sectorId: '',
		boothId: '',
		contacts: [] as Contact[],
	};

	// Import du type nécessaire
	interface ExhibitorData {
		name: string;
		logoUrl?: string;
		description?: string;
		websiteUrl?: string;
		linkedinUrl?: string;
		pdfUrl?: string;
		sectorId: string;
		boothId?: string;
		contacts?: Contact[];
	}
	let tempContact = {
		firstName: '',
		lastName: '',
		role: '',
		email: '',
		phone: '',
	};

	// Recherche avec debounce
	const debouncedSearch = debounce(async (query: string) => {
		searchQuery = query;
		currentPage = 1;
		await loadExhibitors();
	}, 300);

	async function loadExhibitors() {
		if (loading && !initialLoading) return;

		loading = true;
		error = '';

		try {
			const result = await exhibitors.search(searchQuery, currentPage, pageSize, selectedSectorId || undefined);

			// Le backend retourne un objet avec 'data' au lieu de 'items'
			const data = (result as any).data || result.items || [];

			exhibitorsList = data;
			totalExhibitors = result.total || 0;
			totalPages = result.totalPages || 1;
		} catch (e: any) {
			console.error('Erreur chargement exposants:', e);
			error = e.message || 'Erreur de chargement des exposants';
			exhibitorsList = [];
			totalExhibitors = 0;
			totalPages = 1;
		} finally {
			loading = false;
			initialLoading = false;
		}
	}

	async function loadSectors() {
		try {
			sectorsList = await sectors.list();
		} catch (e: any) {
			console.error('Erreur chargement secteurs:', e);
			sectorsList = [];
		}
	}

	async function loadBooths() {
		try {
			allBooths = await booths.list();
		} catch (e: any) {
			console.error('Erreur chargement stands:', e);
			allBooths = [];
		}
	}

	// Fonction pour obtenir les stands disponibles
	function getAvailableBooths(excludeExhibitorId?: string): Booth[] {
		return allBooths.filter((booth) => {
			// Stand disponible si:
			// 1. Pas d'exposant (exhibitorId null)
			// 2. OU c'est le stand actuel de l'exposant en cours d'édition
			if (!booth.exhibitorId) return true;
			if (excludeExhibitorId) {
				// Pour l'édition, on vérifie si c'est le stand actuellement assigné à cet exposant
				const exhibitor = exhibitorsList.find((e) => e.id === excludeExhibitorId);
				return exhibitor && exhibitor.boothId === booth.id;
			}
			return false;
		});
	}

	function openCreateModal() {
		showCreateModal = true;
		resetCreateForm();
		// Charger les stands disponibles pour la création
		availableBooths = getAvailableBooths();
	}

	function closeCreateModal() {
		showCreateModal = false;
		resetCreateForm();
	}

	function resetCreateForm() {
		createForm = {
			name: '',
			logoUrl: '',
			description: '',
			websiteUrl: '',
			linkedinUrl: '',
			pdfUrl: '',
			sectorId: '',
			boothId: '',
			contacts: [],
		};
		tempContact = {
			firstName: '',
			lastName: '',
			role: '',
			email: '',
			phone: '',
		};
	}

	function openEditModal(exhibitor: Exhibitor) {
		editingExhibitor = exhibitor;
		showEditModal = true;

		// Charger les stands disponibles pour l'édition
		availableBooths = getAvailableBooths(exhibitor.id);

		// Préparer le formulaire d'édition
		editForm = {
			name: exhibitor.name || '',
			logoUrl: exhibitor.logoUrl || '',
			description: exhibitor.description || '',
			websiteUrl: exhibitor.websiteUrl || '',
			linkedinUrl: exhibitor.linkedinUrl || '',
			pdfUrl: exhibitor.pdfUrl || '',
			sectorId: exhibitor.sectorId || '',
			boothId: exhibitor.boothId || '',
			contacts: exhibitor.contacts ? [...exhibitor.contacts] : [],
		};

		editNewContact = {
			firstName: '',
			lastName: '',
			role: '',
			email: '',
			phone: '',
		};
	}

	function closeEditModal() {
		showEditModal = false;
		editingExhibitor = null;
		resetEditForm();
	}

	function resetEditForm() {
		editForm = {
			name: '',
			logoUrl: '',
			description: '',
			websiteUrl: '',
			linkedinUrl: '',
			pdfUrl: '',
			sectorId: '',
			boothId: '',
			contacts: [],
		};
		tempContact = {
			firstName: '',
			lastName: '',
			role: '',
			email: '',
			phone: '',
		};
	}

	function addContact(isEdit = false) {
		if (!tempContact.firstName || !tempContact.lastName || !tempContact.role || !tempContact.email) {
			error = 'Veuillez remplir tous les champs obligatoires du contact';
			setTimeout(() => (error = ''), 3000);
			return;
		}

		const form = isEdit ? editForm : createForm;
		if (form.contacts.length >= 5) {
			error = 'Maximum 5 contacts par exposant';
			setTimeout(() => (error = ''), 3000);
			return;
		}

		form.contacts = [...form.contacts, { ...tempContact }];
		tempContact = {
			firstName: '',
			lastName: '',
			role: '',
			email: '',
			phone: '',
		};
	}

	function removeContact(index: number, isEdit = false) {
		if (isEdit) {
			editForm.contacts = editForm.contacts.filter((_, i) => i !== index);
		} else {
			createForm.contacts = createForm.contacts.filter((_, i) => i !== index);
		}
	}

	async function handleCreate() {
		if (!createForm.name || !createForm.sectorId) {
			error = 'Le nom et le secteur sont obligatoires';
			return;
		}

		createLoading = true;
		error = '';

		try {
			// Préparer les données pour l'API
			const data = {
				name: createForm.name,
				sectorId: createForm.sectorId,
				...(createForm.logoUrl && { logoUrl: createForm.logoUrl }),
				...(createForm.description && { description: createForm.description }),
				...(createForm.websiteUrl && { websiteUrl: createForm.websiteUrl }),
				...(createForm.linkedinUrl && { linkedinUrl: createForm.linkedinUrl }),
				...(createForm.pdfUrl && { pdfUrl: createForm.pdfUrl }),
				...(createForm.boothId && { boothId: createForm.boothId }),
				...(createForm.contacts.length > 0 && { contacts: createForm.contacts }),
			};

			await exhibitors.create(data);
			successMessage = 'Exposant créé avec succès';
			closeCreateModal();
			await loadExhibitors();
			await loadBooths(); // Recharger les stands
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la création';
		} finally {
			createLoading = false;
		}
	}

	async function handleEdit() {
		if (!editingExhibitor) return;

		if (!editForm.name || !editForm.sectorId) {
			error = 'Le nom et le secteur sont obligatoires';
			return;
		}

		editLoading = true;
		error = '';

		try {
			// Préparer les données pour l'API - utiliser undefined au lieu de null
			const data: Partial<ExhibitorData> = {
				name: editForm.name,
				sectorId: editForm.sectorId,
				contacts: editForm.contacts,
			};

			// Ajouter les champs optionnels seulement s'ils ont une valeur
			if (editForm.logoUrl) data.logoUrl = editForm.logoUrl;
			if (editForm.description) data.description = editForm.description;
			if (editForm.websiteUrl) data.websiteUrl = editForm.websiteUrl;
			if (editForm.linkedinUrl) data.linkedinUrl = editForm.linkedinUrl;
			if (editForm.pdfUrl) data.pdfUrl = editForm.pdfUrl;
			if (editForm.boothId) data.boothId = editForm.boothId;

			await exhibitors.update(editingExhibitor.id, data);
			successMessage = 'Exposant mis à jour avec succès';
			closeEditModal();
			await loadExhibitors();
			await loadBooths(); // Recharger les stands
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la mise à jour';
		} finally {
			editLoading = false;
		}
	}

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer l'exposant "${name}" ?\nCette action est irréversible.`)) {
			return;
		}

		loading = true;
		error = '';

		try {
			await exhibitors.delete(id);
			successMessage = 'Exposant supprimé avec succès';
			await loadExhibitors();
			await loadBooths(); // Recharger les stands
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la suppression';
		} finally {
			loading = false;
		}
	}

	function viewDetails(exhibitor: Exhibitor) {
		selectedExhibitor = exhibitor;
	}

	function closeDetailModal() {
		selectedExhibitor = null;
	}

	function changePage(page: number) {
		if (page >= 1 && page <= totalPages && !loading) {
			currentPage = page;
			loadExhibitors();
		}
	}

	function handleImageError(event: Event) {
		const target = event.currentTarget as HTMLImageElement;
		target.style.display = 'none';
	}

	function handleSectorChange() {
		currentPage = 1;
		loadExhibitors();
	}

	onMount(async () => {
		await Promise.all([loadSectors(), loadBooths(), loadExhibitors()]);
	});
</script>

<svelte:head>
	<title>Gestion des exposants - Admin</title>
</svelte:head>

<div class="p-4 lg:p-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Gestion des exposants</h1>
				<p class="text-sm text-gray-600 mt-1">
					{totalExhibitors} exposant{totalExhibitors !== 1 ? 's' : ''} enregistré{totalExhibitors !== 1
						? 's'
						: ''}
				</p>
			</div>
			<button
				on:click={openCreateModal}
				class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
			>
				<i class="fas fa-plus"></i>
				Nouvel exposant
			</button>
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

	<!-- Filtres -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
		<div class="flex flex-col md:flex-row gap-3">
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						placeholder="Rechercher par nom, stand, description..."
						on:input={(e) => debouncedSearch(e.currentTarget.value)}
						class="w-full pl-10 pr-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
					/>
					<i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
				</div>
			</div>
			<select
				bind:value={selectedSectorId}
				on:change={handleSectorChange}
				class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
			>
				<option value="">Tous les secteurs</option>
				{#each sectorsList as sector}
					<option value={sector.id}>{sector.name}</option>
				{/each}
			</select>
			<button
				on:click={loadExhibitors}
				disabled={loading}
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
			>
				<i class="fas fa-sync-alt {loading ? 'animate-spin' : ''}"></i>
				Actualiser
			</button>
		</div>
	</div>

	<!-- Grille des exposants -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200">
		{#if initialLoading}
			<div class="p-8 text-center">
				<i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
				<p class="text-gray-500">Chargement des exposants...</p>
			</div>
		{:else if exhibitorsList.length === 0}
			<div class="p-12 text-center">
				<i class="fas fa-store text-4xl text-gray-300 mb-3"></i>
				<p class="text-gray-500">Aucun exposant trouvé</p>
				<p class="text-sm text-gray-400 mt-2">
					{searchQuery || selectedSectorId
						? "Essayez avec d'autres critères de recherche"
						: 'Créez votre premier exposant'}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
				{#each exhibitorsList as exhibitor}
					<div class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
						<div class="p-4 border-b border-gray-100">
							<div class="flex items-start justify-between">
								<div class="flex items-center gap-3 flex-1">
									{#if exhibitor.logoUrl}
										<img
											src={exhibitor.logoUrl}
											alt={exhibitor.name}
											class="w-12 h-12 rounded-lg object-contain bg-gray-100"
											on:error={handleImageError}
										/>
									{:else}
										<div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
											<i class="fas fa-building text-gray-400"></i>
										</div>
									{/if}
									<div class="min-w-0 flex-1">
										<h3 class="font-semibold text-gray-900 truncate">{exhibitor.name}</h3>
										<p class="text-xs text-gray-500">@{exhibitor.slug}</p>
									</div>
								</div>
							</div>
						</div>

						<div class="p-4 space-y-3">
							{#if exhibitor.description}
								<p class="text-sm text-gray-600 line-clamp-2">
									{exhibitor.description}
								</p>
							{/if}

							<div class="flex flex-wrap gap-2">
								{#if exhibitor.sector}
									<span
										class="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
										style="background-color: {exhibitor.sector.colorHex}"
									>
										{exhibitor.sector.name}
									</span>
								{/if}

								{#if exhibitor.booth}
									<span
										class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
									>
										<i class="fas fa-map-marker-alt text-[10px]"></i>
										Stand {exhibitor.booth.number}
									</span>
								{:else}
									<span
										class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700"
									>
										<i class="fas fa-exclamation-triangle text-[10px]"></i>
										Sans stand
									</span>
								{/if}
							</div>

							{#if exhibitor.contacts && exhibitor.contacts.length > 0}
								<div class="flex items-center gap-2 text-xs text-gray-500">
									<i class="fas fa-users"></i>
									<span
										>{exhibitor.contacts.length} contact{exhibitor.contacts.length > 1
											? 's'
											: ''}</span
									>
								</div>
							{/if}

							<div class="flex items-center gap-4 text-xs text-gray-500">
								{#if exhibitor.websiteUrl}
									<span title="Site web"><i class="fas fa-globe text-blue-500"></i></span>
								{/if}
								{#if exhibitor.linkedinUrl}
									<span title="LinkedIn"><i class="fab fa-linkedin text-blue-600"></i></span>
								{/if}
								{#if exhibitor.pdfUrl}
									<span title="Brochure PDF"><i class="fas fa-file-pdf text-red-500"></i></span>
								{/if}
							</div>
						</div>

						<div class="p-4 border-t border-gray-100 flex justify-between">
							<button
								on:click={() => viewDetails(exhibitor)}
								class="text-sm text-blue-600 hover:text-blue-700 font-medium"
							>
								Voir détails
							</button>
							<div class="flex gap-3">
								<button
									on:click={() => openEditModal(exhibitor)}
									class="p-1.5 text-blue-600 hover:text-blue-700 transition-colors"
									title="Modifier"
								>
									<i class="fas fa-edit"></i>
								</button>
								<button
									on:click={() => handleDelete(exhibitor.id, exhibitor.name)}
									disabled={loading}
									class="p-1.5 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
									title="Supprimer"
								>
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
					<div class="text-sm text-gray-700">
						Page {currentPage} sur {totalPages}
					</div>
					<div class="flex gap-2">
						<button
							on:click={() => changePage(currentPage - 1)}
							disabled={currentPage === 1}
							class="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<i class="fas fa-chevron-left"></i>
						</button>

						{#each Array(Math.min(5, totalPages)) as _, i}
							{@const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i))}
							{#if pageNum > 0 && pageNum <= totalPages && Math.abs(pageNum - currentPage) <= 2}
								<button
									on:click={() => changePage(pageNum)}
									class="px-3 py-1 text-sm rounded transition-colors {pageNum === currentPage
										? 'bg-primary text-white'
										: 'bg-white border border-gray-300 hover:bg-gray-50'}"
								>
									{pageNum}
								</button>
							{/if}
						{/each}

						<button
							on:click={() => changePage(currentPage + 1)}
							disabled={currentPage === totalPages}
							class="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<i class="fas fa-chevron-right"></i>
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Modal de création -->
{#if showCreateModal}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex items-center justify-center min-h-screen p-4">
			<div class="fixed inset-0 bg-black bg-opacity-50" on:click={closeCreateModal}></div>

			<div class="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div class="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
					<div class="flex justify-between items-center">
						<h2 class="text-xl font-semibold text-gray-900">Créer un nouvel exposant</h2>
						<button on:click={closeCreateModal} class="text-gray-400 hover:text-gray-600">
							<i class="fas fa-times text-xl"></i>
						</button>
					</div>
				</div>

				<form on:submit|preventDefault={handleCreate} class="p-6">
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Informations générales -->
						<div class="space-y-4">
							<h3 class="font-medium text-gray-900 border-b pb-2">Informations générales</h3>

							<div>
								<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
									Nom de l'exposant <span class="text-red-500">*</span>
								</label>
								<input
									id="name"
									type="text"
									bind:value={createForm.name}
									required
									maxlength="120"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
									placeholder="Nom de l'entreprise"
								/>
							</div>

							<div>
								<label for="sector" class="block text-sm font-medium text-gray-700 mb-1">
									Secteur d'activité <span class="text-red-500">*</span>
								</label>
								<select
									id="sector"
									bind:value={createForm.sectorId}
									required
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								>
									<option value="">Sélectionner un secteur</option>
									{#each sectorsList as sector}
										<option value={sector.id}>{sector.name}</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="booth" class="block text-sm font-medium text-gray-700 mb-1">
									Stand
									<span class="text-xs text-gray-500 ml-1">
										({availableBooths.length} disponible{availableBooths.length > 1 ? 's' : ''})
									</span>
								</label>
								<select
									id="booth"
									bind:value={createForm.boothId}
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								>
									<option value="">Pas de stand attribué</option>
									{#each availableBooths as booth}
										<option value={booth.id}>Stand {booth.number}</option>
									{/each}
								</select>
								{#if availableBooths.length === 0}
									<p class="text-xs text-amber-600 mt-1">
										<i class="fas fa-info-circle"></i> Aucun stand disponible
									</p>
								{/if}
							</div>

							<div>
								<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									id="description"
									bind:value={createForm.description}
									rows="4"
									maxlength="800"
									placeholder="Décrivez l'activité de l'exposant..."
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								></textarea>
							</div>
						</div>

						<!-- Liens et médias -->
						<div class="space-y-4">
							<h3 class="font-medium text-gray-900 border-b pb-2">Liens et médias</h3>

							<div>
								<label for="logo" class="block text-sm font-medium text-gray-700 mb-1">
									URL du logo
								</label>
								<input
									id="logo"
									type="url"
									bind:value={createForm.logoUrl}
									placeholder="https://example.com/logo.png"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>

							<div>
								<label for="website" class="block text-sm font-medium text-gray-700 mb-1">
									Site web
								</label>
								<input
									id="website"
									type="url"
									bind:value={createForm.websiteUrl}
									placeholder="https://www.example.com"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>

							<div>
								<label for="linkedin" class="block text-sm font-medium text-gray-700 mb-1">
									LinkedIn
								</label>
								<input
									id="linkedin"
									type="url"
									bind:value={createForm.linkedinUrl}
									placeholder="https://linkedin.com/company/example"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>

							<div>
								<label for="pdf" class="block text-sm font-medium text-gray-700 mb-1">
									Brochure PDF
								</label>
								<input
									id="pdf"
									type="url"
									bind:value={createForm.pdfUrl}
									placeholder="https://example.com/brochure.pdf"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>
						</div>
					</div>

					<!-- Contacts -->
					<div class="mt-6">
						<h3 class="font-medium text-gray-900 border-b pb-2 mb-4">
							Contacts ({createForm.contacts.length}/5)
						</h3>

						<div class="bg-gray-50 p-4 rounded-lg mb-4">
							<div class="grid md:grid-cols-2 gap-3 mb-3">
								<input
									type="text"
									bind:value={tempContact.firstName}
									placeholder="Prénom *"
									maxlength="60"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="text"
									bind:value={tempContact.lastName}
									placeholder="Nom *"
									maxlength="60"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="text"
									bind:value={tempContact.role}
									placeholder="Fonction *"
									maxlength="80"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="email"
									bind:value={tempContact.email}
									placeholder="Email *"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="tel"
									bind:value={tempContact.phone}
									placeholder="Téléphone"
									maxlength="30"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<button
									type="button"
									on:click={() => addContact(false)}
									disabled={createForm.contacts.length >= 5}
									class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<i class="fas fa-plus mr-1"></i>
									Ajouter
								</button>
							</div>
						</div>

						{#if createForm.contacts.length > 0}
							<div class="space-y-2">
								{#each createForm.contacts as contact, index}
									<div
										class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
									>
										<div>
											<div class="font-medium text-sm">
												{contact.firstName}
												{contact.lastName}
											</div>
											<div class="text-xs text-gray-600">{contact.role}</div>
											<div class="text-xs text-gray-500">{contact.email}</div>
											{#if contact.phone}
												<div class="text-xs text-gray-500">{contact.phone}</div>
											{/if}
										</div>
										<button
											type="button"
											on:click={() => removeContact(index, false)}
											class="text-red-600 hover:text-red-700"
										>
											<i class="fas fa-trash"></i>
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<div class="flex justify-end gap-3 mt-6 pt-6 border-t">
						<button
							type="button"
							on:click={closeCreateModal}
							class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={createLoading}
							class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if createLoading}
								<i class="fas fa-spinner fa-spin mr-2"></i>
							{/if}
							Créer l'exposant
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Modal d'édition -->
{#if showEditModal && editingExhibitor}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex items-center justify-center min-h-screen p-4">
			<div class="fixed inset-0 bg-black bg-opacity-50" on:click={closeEditModal}></div>

			<div class="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div class="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
					<div class="flex justify-between items-center">
						<h2 class="text-xl font-semibold text-gray-900">Modifier l'exposant</h2>
						<button on:click={closeEditModal} class="text-gray-400 hover:text-gray-600">
							<i class="fas fa-times text-xl"></i>
						</button>
					</div>
				</div>

				<form on:submit|preventDefault={handleEdit} class="p-6">
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Informations générales -->
						<div class="space-y-4">
							<h3 class="font-medium text-gray-900 border-b pb-2">Informations générales</h3>

							<div>
								<label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">
									Nom de l'exposant <span class="text-red-500">*</span>
								</label>
								<input
									id="edit-name"
									type="text"
									bind:value={editForm.name}
									required
									maxlength="120"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
									placeholder="Nom de l'entreprise"
								/>
							</div>

							<div>
								<label for="edit-sector" class="block text-sm font-medium text-gray-700 mb-1">
									Secteur d'activité <span class="text-red-500">*</span>
								</label>
								<select
									id="edit-sector"
									bind:value={editForm.sectorId}
									required
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								>
									<option value="">Sélectionner un secteur</option>
									{#each sectorsList as sector}
										<option value={sector.id}>{sector.name}</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="edit-booth" class="block text-sm font-medium text-gray-700 mb-1">
									Stand
									<span class="text-xs text-gray-500 ml-1">
										({availableBooths.length} disponible{availableBooths.length > 1 ? 's' : ''})
									</span>
								</label>
								<select
									id="edit-booth"
									bind:value={editForm.boothId}
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								>
									<option value="">Pas de stand attribué</option>
									{#each availableBooths as booth}
										<option value={booth.id}>
											Stand {booth.number}
											{booth.id === editingExhibitor.boothId ? ' (actuel)' : ''}
										</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									id="edit-description"
									bind:value={editForm.description}
									rows="4"
									maxlength="800"
									placeholder="Décrivez l'activité de l'exposant..."
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								></textarea>
							</div>
						</div>

						<!-- Liens et médias -->
						<div class="space-y-4">
							<h3 class="font-medium text-gray-900 border-b pb-2">Liens et médias</h3>

							<div>
								<label for="edit-logo" class="block text-sm font-medium text-gray-700 mb-1">
									URL du logo
								</label>
								<input
									id="edit-logo"
									type="url"
									bind:value={editForm.logoUrl}
									placeholder="https://example.com/logo.png"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>

							<div>
								<label for="edit-website" class="block text-sm font-medium text-gray-700 mb-1">
									Site web
								</label>
								<input
									id="edit-website"
									type="url"
									bind:value={editForm.websiteUrl}
									placeholder="https://www.example.com"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>

							<div>
								<label for="edit-linkedin" class="block text-sm font-medium text-gray-700 mb-1">
									LinkedIn
								</label>
								<input
									id="edit-linkedin"
									type="url"
									bind:value={editForm.linkedinUrl}
									placeholder="https://linkedin.com/company/example"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>

							<div>
								<label for="edit-pdf" class="block text-sm font-medium text-gray-700 mb-1">
									Brochure PDF
								</label>
								<input
									id="edit-pdf"
									type="url"
									bind:value={editForm.pdfUrl}
									placeholder="https://example.com/brochure.pdf"
									class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
							</div>
						</div>
					</div>

					<!-- Contacts -->
					<div class="mt-6">
						<h3 class="font-medium text-gray-900 border-b pb-2 mb-4">
							Contacts ({editForm.contacts.length}/5)
						</h3>

						<div class="bg-gray-50 p-4 rounded-lg mb-4">
							<div class="grid md:grid-cols-2 gap-3 mb-3">
								<input
									type="text"
									bind:value={tempContact.firstName}
									placeholder="Prénom *"
									maxlength="60"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="text"
									bind:value={tempContact.lastName}
									placeholder="Nom *"
									maxlength="60"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="text"
									bind:value={tempContact.role}
									placeholder="Fonction *"
									maxlength="80"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="email"
									bind:value={tempContact.email}
									placeholder="Email *"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<input
									type="tel"
									bind:value={tempContact.phone}
									placeholder="Téléphone"
									maxlength="30"
									class="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
								/>
								<button
									type="button"
									on:click={() => addContact(true)}
									disabled={editForm.contacts.length >= 5}
									class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<i class="fas fa-plus mr-1"></i>
									Ajouter
								</button>
							</div>
						</div>

						{#if editForm.contacts.length > 0}
							<div class="space-y-2">
								{#each editForm.contacts as contact, index}
									<div
										class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
									>
										<div>
											<div class="font-medium text-sm">
												{contact.firstName}
												{contact.lastName}
											</div>
											<div class="text-xs text-gray-600">{contact.role}</div>
											<div class="text-xs text-gray-500">{contact.email}</div>
											{#if contact.phone}
												<div class="text-xs text-gray-500">{contact.phone}</div>
											{/if}
										</div>
										<button
											type="button"
											on:click={() => removeContact(index, true)}
											class="text-red-600 hover:text-red-700"
										>
											<i class="fas fa-trash"></i>
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<div class="flex justify-end gap-3 mt-6 pt-6 border-t">
						<button
							type="button"
							on:click={closeEditModal}
							class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={editLoading}
							class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if editLoading}
								<i class="fas fa-spinner fa-spin mr-2"></i>
							{/if}
							Enregistrer les modifications
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Détail -->
{#if selectedExhibitor}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex items-center justify-center min-h-screen p-4">
			<div class="fixed inset-0 bg-black bg-opacity-50" on:click={closeDetailModal}></div>

			<div class="relative bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
				<div class="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
					<div class="flex justify-between items-center">
						<h2 class="text-xl font-semibold text-gray-900">Détails de l'exposant</h2>
						<button on:click={closeDetailModal} class="text-gray-400 hover:text-gray-600">
							<i class="fas fa-times text-xl"></i>
						</button>
					</div>
				</div>

				<div class="p-6">
					<div class="flex items-start gap-4 mb-6">
						{#if selectedExhibitor.logoUrl}
							<img
								src={selectedExhibitor.logoUrl}
								alt={selectedExhibitor.name}
								class="w-24 h-24 rounded-lg object-contain bg-gray-100"
							/>
						{:else}
							<div class="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
								<i class="fas fa-building text-2xl text-gray-400"></i>
							</div>
						{/if}
						<div class="flex-1">
							<h3 class="text-2xl font-bold text-gray-900">{selectedExhibitor.name}</h3>
							<p class="text-sm text-gray-500 mb-2">@{selectedExhibitor.slug}</p>
							<div class="flex flex-wrap gap-2">
								{#if selectedExhibitor.sector}
									<span
										class="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
										style="background-color: {selectedExhibitor.sector.colorHex}"
									>
										{selectedExhibitor.sector.name}
									</span>
								{/if}
								{#if selectedExhibitor.booth}
									<span
										class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
									>
										<i class="fas fa-map-marker-alt"></i>
										Stand {selectedExhibitor.booth.number}
									</span>
								{/if}
							</div>
						</div>
					</div>

					{#if selectedExhibitor.description}
						<div class="mb-6">
							<h4 class="font-medium text-gray-900 mb-2">Description</h4>
							<p class="text-sm text-gray-600">{selectedExhibitor.description}</p>
						</div>
					{/if}

					<div class="mb-6">
						<h4 class="font-medium text-gray-900 mb-2">Liens</h4>
						<div class="space-y-2">
							{#if selectedExhibitor.websiteUrl}
								<a
									href={selectedExhibitor.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
								>
									<i class="fas fa-globe"></i>
									Site web
								</a>
							{/if}
							{#if selectedExhibitor.linkedinUrl}
								<a
									href={selectedExhibitor.linkedinUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
								>
									<i class="fab fa-linkedin"></i>
									LinkedIn
								</a>
							{/if}
							{#if selectedExhibitor.pdfUrl}
								<a
									href={selectedExhibitor.pdfUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
								>
									<i class="fas fa-file-pdf"></i>
									Brochure PDF
								</a>
							{/if}
						</div>
					</div>

					{#if selectedExhibitor.contacts && selectedExhibitor.contacts.length > 0}
						<div class="mb-6">
							<h4 class="font-medium text-gray-900 mb-3">
								Contacts ({selectedExhibitor.contacts.length})
							</h4>
							<div class="grid md:grid-cols-2 gap-3">
								{#each selectedExhibitor.contacts as contact}
									<div class="p-3 bg-gray-50 rounded-lg">
										<p class="font-medium text-sm text-gray-900">
											{contact.firstName}
											{contact.lastName}
										</p>
										{#if contact.role}
											<p class="text-xs text-gray-600 mt-1">{contact.role}</p>
										{/if}
										{#if contact.email}
											<p class="text-xs text-gray-500 mt-1">
												<i class="fas fa-envelope mr-1"></i>
												{contact.email}
											</p>
										{/if}
										{#if contact.phone}
											<p class="text-xs text-gray-500 mt-1">
												<i class="fas fa-phone mr-1"></i>
												{contact.phone}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
