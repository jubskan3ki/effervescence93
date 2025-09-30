<!-- src/lib/components/common/Navbar.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { favoriteIds } from '$lib/stores/favorites';

	$: currentPath = $page.url.pathname;
	$: favoritesCount = $favoriteIds.size;

	const navItems = [
		{
			path: '/',
			icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
		},
		{
			path: '/parcours',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
		},
		{
			path: '/favoris',
			icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
			badge: favoritesCount,
		},
	];

	function isActive(path: string): boolean {
		if (path === '/') return currentPath === '/';
		return currentPath.startsWith(path);
	}
</script>

<nav class="navbar">
	<div class="navbar-container">
		{#each navItems as item}
			<button class="nav-item" class:active={isActive(item.path)} on:click={() => goto(item.path)}>
				<div class="icon-wrapper">
					<svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
					</svg>
					{#if item.badge && item.badge > 0}
						<span class="badge">{item.badge}</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</nav>

<style>
	.navbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		padding: 0 16px 16px;
		pointer-events: none;
	}

	.navbar-container {
		max-width: 400px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-around;
		gap: 8px;
		background: white;
		border-radius: 16px;
		padding: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		pointer-events: auto;
	}

	.nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 10px 8px;
		background: none;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.15s;
		color: #6b7280;
	}

	.nav-item:hover {
		background: #f9fafb;
		color: #111827;
	}

	.nav-item.active {
		background: #111827;
		color: white;
	}

	.icon-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-icon {
		width: 24px;
		height: 24px;
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ef4444;
		color: white;
		font-size: 10px;
		font-weight: 600;
		border-radius: 9px;
		border: 2px solid white;
	}

	.nav-item.active .badge {
		border-color: #111827;
	}

	@media (min-width: 640px) {
		.navbar-container {
			max-width: 480px;
			gap: 12px;
			padding: 12px;
		}

		.nav-item {
			padding: 12px 16px;
		}
	}

	@media (max-width: 400px) {
		.navbar {
			padding: 0 12px 12px;
		}

		.navbar-container {
			gap: 4px;
			padding: 6px;
		}

		.nav-item {
			padding: 8px 4px;
			min-width: 0;
		}
	}
</style>
