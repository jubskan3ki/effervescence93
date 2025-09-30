<!-- src/lib/components/admin/Sidebar.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/api/auth';

	export let user: { id: string; email: string; role: 'ADMIN' | 'EDITOR' };

	let isOpen = false;

	const menuItems = [
		{ label: 'Dashboard', href: '/admin', icon: 'fa-home' },
		{ label: 'Exposants', href: '/admin/exposants', icon: 'fa-building' },
		{ label: 'Stands', href: '/admin/stands', icon: 'fa-th' },
		{ label: 'Secteurs', href: '/admin/secteurs', icon: 'fa-palette' },
		{ label: 'Parcours', href: '/admin/parcours', icon: 'fa-route' },
		{ label: 'Utilisateurs', href: '/admin/users', icon: 'fa-users', adminOnly: true },
		{ label: 'Import / Export', href: '/admin/import-export', icon: 'fa-file-export', adminOnly: true },
	];

	$: currentPath = $page.url.pathname;
	$: visibleItems = user.role === 'ADMIN' ? menuItems : menuItems.filter((item) => !item.adminOnly);

	async function handleLogout() {
		auth.logout();
		await goto('/auth/login');
	}

	function toggleSidebar() {
		isOpen = !isOpen;
	}
</script>

<!-- Mobile toggle button -->
<button class="sidebar-toggle lg:hidden" on:click={toggleSidebar} aria-label="Toggle sidebar">
	<i class="fas fa-bars"></i>
</button>

<aside class="sidebar" class:open={isOpen}>
	<!-- Logo -->
	<div class="sidebar-header">
		<a href="/" class="flex items-center gap-3">
			<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
				<span class="text-white font-bold">E93</span>
			</div>
			<span class="text-lg font-semibold text-white">Effervescence 93</span>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="sidebar-nav">
		{#each visibleItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={currentPath === item.href}
				on:click={() => (isOpen = false)}
			>
				<i class="fas {item.icon} w-5 text-center"></i>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<!-- Footer -->
	<div class="sidebar-footer">
		<div class="user-info">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
					<span class="text-white text-sm font-medium">
						{user.email.charAt(0).toUpperCase()}
					</span>
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-xs text-primary font-semibold uppercase">
						{user.role === 'ADMIN' ? 'Admin' : 'Éditeur'}
					</div>
					<div class="text-sm text-gray-400 truncate">
						{user.email}
					</div>
				</div>
			</div>

			<button class="btn-logout" on:click={handleLogout}>
				<i class="fas fa-sign-out-alt mr-2"></i>
				<span>Déconnexion</span>
			</button>
		</div>
	</div>
</aside>

<!-- Mobile overlay -->
{#if isOpen}
	<div
		class="sidebar-overlay lg:hidden"
		on:click={() => (isOpen = false)}
		on:keydown={(e) => e.key === 'Escape' && (isOpen = false)}
		role="button"
		tabindex="0"
		aria-label="Fermer le menu"
	/>
{/if}

<style>
	.sidebar-toggle {
		@apply fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg;
		@apply hover:bg-gray-800 transition-colors;
		left: auto;
		right: 1rem;
	}

	.sidebar {
		@apply fixed top-0 left-0 z-40;
		@apply w-[var(--sidebar-width)] h-screen;
		@apply bg-gray-900 text-gray-300;
		@apply flex flex-col;
		@apply transform -translate-x-full lg:translate-x-0;
		@apply transition-transform duration-200;
	}

	.sidebar.open {
		@apply translate-x-0;
	}

	.sidebar-header {
		@apply p-6 border-b border-gray-800;
	}

	.sidebar-nav {
		@apply flex-1 overflow-y-auto py-4;
	}

	.nav-item {
		@apply flex items-center gap-3 px-6 py-3;
		@apply hover:bg-gray-800 hover:text-white;
		@apply transition-colors;
	}

	.nav-item.active {
		@apply bg-gray-800 text-white;
		@apply border-l-4 border-primary pl-5;
	}

	.sidebar-footer {
		@apply p-4 border-t border-gray-800;
	}

	.user-info {
		@apply space-y-2;
	}

	.btn-logout {
		@apply w-full flex items-center justify-center gap-2;
		@apply px-4 py-2 bg-gray-800 hover:bg-gray-700;
		@apply text-gray-300 hover:text-white;
		@apply rounded-lg transition-colors;
		@apply text-sm font-medium;
	}

	.sidebar-overlay {
		@apply fixed inset-0 bg-black/50 z-30;
	}
</style>
