<!-- src/lib/components/common/Header.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { ui } from '@stores/ui';
	import { session, isAuthenticated } from '@stores/session';
	import { goto } from '$app/navigation';

	export let variant: 'public' | 'admin' = 'public';

	$: isAdminRoute = $page.url.pathname.startsWith('/admin');

	function handleSearch() {
		ui.toggleSearch();
	}

	function toggleMenu() {
		if ($ui.isMobile) {
			ui.toggleMobileMenu();
		} else if (isAdminRoute) {
			ui.toggleSidebar();
		}
	}
</script>

<header class="header {variant}">
	<div class="header-container">
		<!-- Logo & Brand -->
		<div class="header-brand">
			{#if isAdminRoute}
				<button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={$ui.isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
						/>
					</svg>
				</button>
			{/if}

			<a href="/" class="brand-link">
				<img src="/logo-eff93.png" alt="Effervescence 93" class="logo" width="180" height="40" />
			</a>
		</div>

		<!-- Navigation Desktop -->
		{#if !$ui.isMobile}
			<nav class="header-nav">
				{#if variant === 'public'}
					<a href="/" class="nav-link" class:active={$page.url.pathname === '/'}> Plan </a>
					<a href="/favoris" class="nav-link" class:active={$page.url.pathname === '/favoris'}> Favoris </a>
					<button class="nav-link" on:click={handleSearch}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						Rechercher
					</button>
				{/if}
			</nav>
		{/if}

		<!-- Actions -->
		<div class="header-actions">
			{#if $ui.isMobile && variant === 'public'}
				<button class="action-btn" on:click={handleSearch} aria-label="Rechercher">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>
			{/if}

			{#if variant === 'admin' && $isAuthenticated}
				<div class="user-menu">
					<span class="user-email">{$session.user?.email}</span>
					<button class="btn-logout" on:click={() => goto('/auth/logout')}> Déconnexion </button>
				</div>
			{:else if !isAdminRoute}
				<a href="/admin" class="btn-admin"> Espace Admin </a>
			{/if}

			{#if $ui.isMobile}
				<button class="menu-toggle" on:click={toggleMenu} aria-label="Menu">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={$ui.isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
</header>

<!-- Mobile Menu -->
{#if $ui.isMobileMenuOpen && variant === 'public'}
	<nav class="mobile-menu">
		<a href="/" class="mobile-link" on:click={() => ui.toggleMobileMenu()}> Plan interactif </a>
		<a href="/favoris" class="mobile-link" on:click={() => ui.toggleMobileMenu()}> Mes favoris </a>
		<button
			class="mobile-link"
			on:click={() => {
				handleSearch();
				ui.toggleMobileMenu();
			}}
		>
			Rechercher un exposant
		</button>
		<div class="mobile-divider"></div>
		<a href="/admin" class="mobile-link" on:click={() => ui.toggleMobileMenu()}> Espace Admin </a>
	</nav>
{/if}
