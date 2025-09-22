<!-- src/lib/components/admin/AdminHeader.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import Button from '../ui/Button.svelte';
	import Badge from '../ui/Badge.svelte';

	interface Props {
		user?: {
			name: string;
			email: string;
			role: string;
			avatar?: string;
		};
		title?: string;
		onmenubuttonclick?: () => void;
	}

	let {
		user = {
			name: 'Administrateur',
			email: 'admin@effervescence93.fr',
			role: 'Admin',
			avatar: '',
		},
		title = 'Administration',
		onmenubuttonclick,
	}: Props = $props();

	let showUserMenu = $state(false);
	let showNotifications = $state(false);

	// Mock notifications (in real app, would come from API/store)
	const notifications = [
		{ id: 1, type: 'info', message: 'Nouvel exposant inscrit', time: 'Il y a 5 min', unread: true },
		{ id: 2, type: 'warning', message: 'Stand B12 sans attribution', time: 'Il y a 1h', unread: true },
		{ id: 3, type: 'success', message: 'Import CSV terminé', time: 'Il y a 2h', unread: false },
	];

	const unreadCount = $derived(notifications.filter((n) => n.unread).length);

	// Get breadcrumb from current route
	const breadcrumbs = $derived(() => {
		const path = $page.url.pathname;
		const parts = path.split('/').filter(Boolean);

		return parts.map((part, index) => {
			const href = '/' + parts.slice(0, index + 1).join('/');
			const label = part.charAt(0).toUpperCase() + part.slice(1);
			return { label, href, active: index === parts.length - 1 };
		});
	});

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-30">
	<div class="px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Left side -->
			<div class="flex items-center">
				<!-- Mobile menu button -->
				<button
					type="button"
					class="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
					onclick={onmenubuttonclick}
					aria-label="Ouvrir le menu"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<!-- Title & Breadcrumbs -->
				<div class="ml-4 lg:ml-0">
					<h1 class="text-xl font-semibold text-gray-900">{title}</h1>
					{#if breadcrumbs().length > 0}
						<nav class="hidden sm:flex items-center space-x-1 text-sm text-gray-500 mt-1">
							{#each breadcrumbs() as crumb, index}
								{#if index > 0}
									<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
								{#if crumb.active}
									<span class="text-gray-700 font-medium">{crumb.label}</span>
								{:else}
									<a href={crumb.href} class="hover:text-gray-700 transition-colors">
										{crumb.label}
									</a>
								{/if}
							{/each}
						</nav>
					{/if}
				</div>
			</div>

			<!-- Right side -->
			<div class="flex items-center gap-3">
				<!-- Quick Actions -->
				<Button variant="primary" size="sm" href="/admin/exposants/new">
					<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Nouvel exposant
				</Button>

				<!-- Search -->
				<button
					type="button"
					class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
					aria-label="Rechercher"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>

				<!-- Notifications -->
				<div class="relative">
					<button
						type="button"
						class="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
						onclick={() => (showNotifications = !showNotifications)}
						aria-label="Notifications"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
						{#if unreadCount > 0}
							<span
								class="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
							></span>
						{/if}
					</button>

					<!-- Notifications dropdown -->
					{#if showNotifications}
						<div
							class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
						>
							<div class="p-4 border-b border-gray-200">
								<div class="flex items-center justify-between">
									<h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
									{#if unreadCount > 0}
										<Badge variant="primary" size="sm">{unreadCount} nouvelle(s)</Badge>
									{/if}
								</div>
							</div>
							<div class="max-h-96 overflow-y-auto">
								{#each notifications as notification}
									<div
										class="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 {notification.unread
											? 'bg-blue-50'
											: ''}"
									>
										<div class="flex items-start gap-3">
											<div class="flex-shrink-0 mt-0.5">
												{#if notification.type === 'info'}
													<div
														class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"
													>
														<svg
															class="h-4 w-4 text-blue-600"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													</div>
												{:else if notification.type === 'warning'}
													<div
														class="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center"
													>
														<svg
															class="h-4 w-4 text-yellow-600"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
															/>
														</svg>
													</div>
												{:else}
													<div
														class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"
													>
														<svg
															class="h-4 w-4 text-green-600"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													</div>
												{/if}
											</div>
											<div class="flex-1">
												<p class="text-sm text-gray-900">{notification.message}</p>
												<p class="text-xs text-gray-500 mt-1">{notification.time}</p>
											</div>
										</div>
									</div>
								{/each}
							</div>
							<div class="p-4 border-t border-gray-200">
								<a
									href="/admin/notifications"
									class="text-sm text-primary-600 hover:text-primary-700 font-medium"
								>
									Voir toutes les notifications
								</a>
							</div>
						</div>
					{/if}
				</div>

				<!-- User menu -->
				<div class="relative">
					<button
						type="button"
						class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
						onclick={() => (showUserMenu = !showUserMenu)}
					>
						{#if user.avatar}
							<img src={user.avatar} alt={user.name} class="h-8 w-8 rounded-full object-cover" />
						{:else}
							<div
								class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium"
							>
								{getInitials(user.name)}
							</div>
						{/if}
						<div class="hidden lg:block text-left">
							<p class="text-sm font-medium text-gray-900">{user.name}</p>
							<p class="text-xs text-gray-500">{user.role}</p>
						</div>
						<svg
							class="hidden lg:block h-4 w-4 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					<!-- User dropdown -->
					{#if showUserMenu}
						<div
							class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
						>
							<div class="p-4 border-b border-gray-200">
								<p class="text-sm font-medium text-gray-900">{user.name}</p>
								<p class="text-xs text-gray-500">{user.email}</p>
							</div>
							<div class="py-1">
								<a
									href="/admin/profile"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									Mon profil
								</a>
								<a
									href="/admin/settings"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									Paramètres
								</a>
								<a
									href="/"
									target="_blank"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									Voir le site
								</a>
							</div>
							<div class="py-1 border-t border-gray-200">
								<button
									type="button"
									class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
								>
									Déconnexion
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>
