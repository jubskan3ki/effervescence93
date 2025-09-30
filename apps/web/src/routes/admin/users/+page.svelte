<!-- src/routes/admin/users/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { users } from '$lib/api/users';
	import { auth } from '$lib/api/auth';
	import { page } from '$app/stores';
	import type { User } from '$lib/types';

	let usersList: User[] = [];
	let loading = false;
	let error = '';
	let successMessage = '';
	let statusFilter: 'all' | 'pending' | 'approved' = 'all';
	let stats: any = null;
	let currentUserId: string | null = null;

	// Formulaire de création
	let showCreateForm = false;
	let newEmail = '';
	let newPassword = '';
	let newRole: 'ADMIN' | 'EDITOR' = 'EDITOR';

	// Récupérer l'ID de l'utilisateur connecté
	onMount(async () => {
		try {
			// Récupérer l'utilisateur connecté depuis les données de layout
			const layoutData = $page.data;
			if (layoutData?.user?.id) {
				currentUserId = layoutData.user.id;
			}
		} catch (e) {
			console.error('Erreur récupération user actuel:', e);
		}
		await loadUsers();
	});

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			const [usersData, statsData] = await Promise.all([users.list(statusFilter), users.stats()]);
			usersList = usersData;
			stats = statsData;
		} catch (e: any) {
			error = e.message || 'Erreur de chargement';
		} finally {
			loading = false;
		}
	}

	async function createUser() {
		if (!newEmail || !newPassword) {
			error = 'Email et mot de passe requis';
			return;
		}

		if (newPassword.length < 8) {
			error = 'Le mot de passe doit contenir au moins 8 caractères';
			return;
		}

		loading = true;
		error = '';
		try {
			await auth.register(newEmail, newPassword, newRole);
			successMessage = 'Utilisateur créé avec succès';
			newEmail = '';
			newPassword = '';
			newRole = 'EDITOR';
			showCreateForm = false;
			await loadUsers();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la création';
		} finally {
			loading = false;
		}
	}

	async function handleApprove(userId: string) {
		loading = true;
		error = '';
		try {
			await users.approve(userId);
			successMessage = 'Utilisateur approuvé';
			await loadUsers();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || "Erreur lors de l'approbation";
		} finally {
			loading = false;
		}
	}

	// Validation sécurité : empêcher de supprimer le dernier admin
	async function handleRoleChange(userId: string, newRole: string) {
		if (newRole !== 'ADMIN' && newRole !== 'EDITOR') return;

		// Si on retire le rôle ADMIN, vérifier qu'il reste d'autres admins
		const user = usersList.find((u) => u.id === userId);
		if (user?.role === 'ADMIN' && newRole === 'EDITOR') {
			const adminCount = usersList.filter((u) => u.role === 'ADMIN').length;
			if (adminCount <= 1) {
				error = 'Impossible de retirer le dernier administrateur';
				setTimeout(() => (error = ''), 3000);
				return;
			}
		}

		loading = true;
		error = '';
		try {
			await users.changeRole(userId, newRole as 'ADMIN' | 'EDITOR');
			successMessage = 'Rôle modifié avec succès';
			await loadUsers();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors du changement de rôle';
		} finally {
			loading = false;
		}
	}

	async function handleDelete(userId: string, email: string) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?\nCette action est irréversible.`))
			return;

		loading = true;
		error = '';
		try {
			await users.delete(userId);
			successMessage = 'Utilisateur supprimé';
			await loadUsers();
			setTimeout(() => (successMessage = ''), 3000);
		} catch (e: any) {
			error = e.message || 'Erreur lors de la suppression';
		} finally {
			loading = false;
		}
	}

	// Mapping status from backend
	function getUserStatus(user: User): 'APPROVED' | 'PENDING' | 'REJECTED' {
		if ('status' in user) return user.status as any;
		if ('isApproved' in user) return (user as any).isApproved ? 'APPROVED' : 'PENDING';
		return 'PENDING';
	}

	onMount(loadUsers);
</script>

<svelte:head>
	<title>Gestion des utilisateurs - Admin</title>
</svelte:head>

<div class="p-4 lg:p-6 max-w-7xl mx-auto">
	<!-- Header avec stats -->
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h1 class="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
			<button
				on:click={() => (showCreateForm = !showCreateForm)}
				class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
			>
				<i class="fas {showCreateForm ? 'fa-times' : 'fa-plus'}"></i>
				{showCreateForm ? 'Annuler' : 'Nouvel utilisateur'}
			</button>
		</div>

		{#if stats}
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-gray-900">{stats.total}</div>
					<div class="text-xs text-gray-500">Total</div>
				</div>
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-green-600">{stats.byStatus?.approved || 0}</div>
					<div class="text-xs text-gray-500">Approuvés</div>
				</div>
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-amber-600">{stats.byStatus?.pending || 0}</div>
					<div class="text-xs text-gray-500">En attente</div>
				</div>
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<div class="text-2xl font-bold text-blue-600">{stats.byRole?.admins || 0}</div>
					<div class="text-xs text-gray-500">Admins</div>
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
			<h2 class="text-lg font-semibold mb-4 text-gray-900">Créer un compte administrateur</h2>
			<form on:submit|preventDefault={createUser}>
				<div class="grid md:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Email professionnel <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							bind:value={newEmail}
							required
							placeholder="email@entreprise.com"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Mot de passe <span class="text-red-500">*</span>
						</label>
						<input
							type="password"
							bind:value={newPassword}
							required
							placeholder="Min. 8 caractères"
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Rôle <span class="text-red-500">*</span>
						</label>
						<select
							bind:value={newRole}
							class="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						>
							<option value="EDITOR">Éditeur</option>
							<option value="ADMIN">Administrateur</option>
						</select>
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
						disabled={loading || !newEmail || !newPassword}
						class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Créer l'utilisateur
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Filtres -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
		<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
			<span class="text-sm font-medium text-gray-700">Filtrer :</span>
			<div class="flex flex-wrap gap-2">
				<button
					on:click={() => {
						statusFilter = 'all';
						loadUsers();
					}}
					class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors {statusFilter === 'all'
						? 'bg-primary text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					Tous ({stats?.total || 0})
				</button>
				<button
					on:click={() => {
						statusFilter = 'approved';
						loadUsers();
					}}
					class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors {statusFilter === 'approved'
						? 'bg-primary text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					Approuvés ({stats?.byStatus?.approved || 0})
				</button>
				<button
					on:click={() => {
						statusFilter = 'pending';
						loadUsers();
					}}
					class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors {statusFilter === 'pending'
						? 'bg-primary text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					En attente ({stats?.byStatus?.pending || 0})
				</button>
			</div>
			<button
				on:click={loadUsers}
				disabled={loading}
				class="sm:ml-auto px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				<i class="fas fa-sync-alt {loading ? 'animate-spin' : ''}"></i>
				Actualiser
			</button>
		</div>
	</div>

	<!-- Table des utilisateurs -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
		{#if loading && usersList.length === 0}
			<div class="p-8 text-center">
				<i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
				<p class="text-gray-500">Chargement des utilisateurs...</p>
			</div>
		{:else if usersList.length === 0}
			<div class="p-12 text-center">
				<i class="fas fa-users text-4xl text-gray-300 mb-3"></i>
				<p class="text-gray-500">Aucun utilisateur trouvé</p>
				<p class="text-sm text-gray-400 mt-2">Créez votre premier utilisateur pour commencer</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Utilisateur</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Rôle</th
							>
							<th class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Statut</th
							>
							<th
								class="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell"
								>Date</th
							>
							<th
								class="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each usersList as user}
							{@const status = getUserStatus(user)}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div>
										<div class="text-sm font-medium text-gray-900">{user.email}</div>
										<div class="text-xs text-gray-500 sm:hidden">
											{new Date(user.createdAt).toLocaleDateString('fr-FR')}
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									{#if user.id === currentUserId}
										<span
											class="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md"
										>
											{user.role === 'ADMIN' ? 'Admin' : 'Éditeur'}
											<span class="ml-1 text-xs text-gray-500">(vous)</span>
										</span>
									{:else}
										<select
											value={user.role}
											on:change={(e) => handleRoleChange(user.id, e.currentTarget.value)}
											disabled={loading}
											class="w-full text-sm px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
										>
											<option value="EDITOR" selected={user.role === 'EDITOR'}>Éditeur</option>
											<option value="ADMIN" selected={user.role === 'ADMIN'}>Admin</option>
										</select>
									{/if}
								</td>
								<td class="px-6 py-4">
									{#if status === 'APPROVED'}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
										>
											<i class="fas fa-check-circle text-[10px]"></i>
											Approuvé
										</span>
									{:else if status === 'PENDING'}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
										>
											<i class="fas fa-clock text-[10px]"></i>
											En attente
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
										>
											<i class="fas fa-times-circle text-[10px]"></i>
											Rejeté
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
									{new Date(user.createdAt).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'short',
										year: 'numeric',
									})}
								</td>
								<td class="px-6 py-4">
									<div class="flex justify-end gap-2">
										{#if status !== 'APPROVED'}
											<button
												on:click={() => handleApprove(user.id)}
												disabled={loading}
												class="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												title="Approuver cet utilisateur"
												aria-label="Approuver cet utilisateur"
											>
												<i class="fas fa-check"></i>
											</button>
										{/if}
										{#if user.id !== currentUserId}
											<button
												on:click={() => handleDelete(user.id, user.email)}
												disabled={loading}
												class="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												title="Supprimer cet utilisateur"
												aria-label="Supprimer cet utilisateur"
											>
												<i class="fas fa-trash-alt"></i>
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
