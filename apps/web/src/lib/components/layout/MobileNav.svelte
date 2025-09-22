<!-- src/lib/components/layout/MobileNav.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { uiStore, isMobileMenuOpen } from '@stores/ui';
	import { favoriteCount } from '@stores/favorites';
	import { fade, fly } from 'svelte/transition';

	const navigation = [
		{
			name: 'Plan',
			href: '/',
			icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
			description: 'Plan interactif du salon',
		},
		{
			name: 'Exposants',
			href: '/exposants',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			description: 'Liste des exposants',
		},
		{
			name: 'Parcours',
			href: '/parcours',
			icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
			description: 'Parcours thématiques',
		},
		{
			name: 'Favoris',
			href: '/favoris',
			icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
			description: 'Vos stands favoris',
			badge: $favoriteCount > 0 ? $favoriteCount : null,
		},
		{
			name: 'Informations',
			href: '/informations',
			icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			description: 'Infos pratiques',
		},
	];

	const quickLinks = [
		{ name: 'Programme', href: '/programme' },
		{ name: 'Conférences', href: '/conferences' },
		{ name: 'Ateliers', href: '/ateliers' },
		{ name: 'Restauration', href: '/restauration' },
		{ name: 'Accès', href: '/acces' },
		{ name: 'Contact', href: '/contact' },
	];

	function closeMenu() {
		uiStore.toggleMobileMenu(false);
	}

	$effect(() => {
		// Close menu on route change
		$page.url.pathname;
		closeMenu();
	});

	// Lock body scroll when menu is open
	$effect(() => {
		if (typeof document === 'undefined') return;

		if ($isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if $isMobileMenuOpen}
	<!-- Overlay -->
	<div class="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
		<!-- Background overlay -->
		<button
			type="button"
			transition:fade={{ duration: 200 }}
			class="fixed inset-0 bg-gray-900 bg-opacity-50"
			onclick={closeMenu}
			aria-label="Fermer le menu"
		></button>

		<!-- Menu panel -->
		<nav
			transition:fly={{ x: -320, duration: 300 }}
			class="fixed left-0 top-0 h-full w-full max-w-xs bg-white shadow-xl overflow-y-auto"
		>
			<!-- Header -->
			<div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
							<span class="text-white font-bold text-lg">E93</span>
						</div>
						<div>
							<h2 class="text-lg font-bold text-gray-900">Effervescence 93</h2>
							<p class="text-xs text-gray-500">Plan interactif</p>
						</div>
					</div>
					<button
						type="button"
						class="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
						onclick={closeMenu}
						aria-label="Fermer"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Main Navigation -->
			<div class="px-4 py-6">
				<h3 class="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
					Navigation principale
				</h3>
				<ul class="space-y-1">
					{#each navigation as item}
						<li>
							<a
								href={item.href}
								onclick={closeMenu}
								class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors {$page.url
									.pathname === item.href
									? 'bg-primary-50 text-primary-700'
									: 'text-gray-700 hover:bg-gray-50'}"
								aria-current={$page.url.pathname === item.href ? 'page' : undefined}
							>
								<svg
									class="h-5 w-5 flex-shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={item.icon}
									/>
								</svg>
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="font-medium">{item.name}</span>
										{#if item.badge}
											<span
												class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full"
											>
												{item.badge}
											</span>
										{/if}
									</div>
									{#if item.description}
										<p class="text-xs text-gray-500 mt-0.5">{item.description}</p>
									{/if}
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Quick Links -->
			<div class="px-4 py-6 border-t border-gray-200">
				<h3 class="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Accès rapides</h3>
				<ul class="grid grid-cols-2 gap-2">
					{#each quickLinks as link}
						<li>
							<a
								href={link.href}
								onclick={closeMenu}
								class="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
							>
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Search Bar -->
			<div class="px-4 py-6 border-t border-gray-200">
				<button
					type="button"
					onclick={() => {
						closeMenu();
						uiStore.toggleSearchDrawer(true);
					}}
					class="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<span class="font-medium">Rechercher un exposant</span>
				</button>
			</div>

			<!-- Footer Info -->
			<div class="px-4 py-6 border-t border-gray-200">
				<div class="px-3 space-y-3 text-sm text-gray-600">
					<div class="flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>9h00 - 18h00</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
						<span>Parc des Expositions</span>
					</div>
				</div>
			</div>
		</nav>
	</div>
{/if}
