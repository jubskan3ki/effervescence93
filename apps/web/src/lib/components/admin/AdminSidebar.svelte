<!-- src/lib/components/admin/AdminSidebar.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import Badge from '../ui/Badge.svelte';

	interface Props {
		collapsed?: boolean;
		mobile?: boolean;
		onclose?: () => void;
	}

	let { collapsed = false, mobile = false, onclose }: Props = $props();

	interface NavItem {
		label: string;
		href: string;
		icon: string;
		badge?: number | string;
		children?: NavItem[];
	}

	const navigation: NavItem[] = [
		{
			label: 'Tableau de bord',
			href: '/admin',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		},
		{
			label: 'Exposants',
			href: '/admin/exposants',
			icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
			badge: 156,
		},
		{
			label: 'Stands',
			href: '/admin/stands',
			icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
			badge: 'B12',
		},
		{
			label: 'Secteurs',
			href: '/admin/secteurs',
			icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
		},
		{
			label: 'Parcours',
			href: '/admin/parcours',
			icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
			children: [
				{ label: 'Financement', href: '/admin/parcours/financement', icon: '' },
				{ label: 'Innovation', href: '/admin/parcours/innovation', icon: '' },
				{ label: 'RSE', href: '/admin/parcours/rse', icon: '' },
				{ label: 'Export', href: '/admin/parcours/export', icon: '' },
			],
		},
		{
			label: 'Analytics',
			href: '/admin/analytics',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
		},
		{
			label: 'Utilisateurs',
			href: '/admin/users',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
		},
		{
			label: 'Paramètres',
			href: '/admin/settings',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
		},
	];

	const bottomNavigation: NavItem[] = [
		{
			label: 'Documentation',
			href: '/admin/docs',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
		},
		{
			label: 'Support',
			href: '/admin/support',
			icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
		},
	];

	let expandedItems = $state<Set<string>>(new Set());

	function toggleExpanded(href: string) {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(href)) {
			newExpanded.delete(href);
		} else {
			newExpanded.add(href);
		}
		expandedItems = newExpanded;
	}

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	function isParentActive(item: NavItem): boolean {
		if (isActive(item.href)) return true;
		if (item.children) {
			return item.children.some((child) => isActive(child.href));
		}
		return false;
	}
</script>

<!-- Mobile overlay -->
{#if mobile}
	<button
		type="button"
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
		aria-label="Fermer l’overlay"
		onclick={onclose}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				onclose?.();
			}
		}}
		tabindex="0"
	></button>
{/if}

<!-- Sidebar -->
<aside
	class="
		{mobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
		flex flex-col
		{collapsed && !mobile ? 'w-20' : 'w-64'}
		h-full bg-gray-900 text-white
		transition-all duration-300
	"
	class:translate-x-0={!mobile || mobile}
	class:-translate-x-full={mobile && false}
>
	<!-- Logo -->
	<div class="flex items-center justify-between h-16 px-4 border-b border-gray-800">
		<a href="/admin" class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
				<span class="text-white font-bold text-lg">E93</span>
			</div>
			{#if !collapsed || mobile}
				<div transition:fade={{ duration: 200 }}>
					<h2 class="text-lg font-bold">Admin</h2>
					<p class="text-xs text-gray-400">Effervescence 93</p>
				</div>
			{/if}
		</a>

		{#if mobile}
			<button
				type="button"
				class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
				onclick={onclose}
				aria-label="Fermer la barre latérale"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto py-4">
		<ul class="space-y-1">
			{#each navigation as item}
				<li>
					{#if item.children}
						<!-- Parent with children -->
						<button
							type="button"
							class="w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors
								{isParentActive(item) ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}"
							onclick={() => toggleExpanded(item.href)}
						>
							<div class="flex items-center gap-3">
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
								{#if !collapsed || mobile}
									<span>{item.label}</span>
								{/if}
							</div>
							{#if !collapsed || mobile}
								<svg
									class="h-4 w-4 transition-transform {expandedItems.has(item.href)
										? 'rotate-90'
										: ''}"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							{/if}
						</button>

						<!-- Children -->
						{#if expandedItems.has(item.href) && (!collapsed || mobile)}
							<ul class="mt-1 ml-8 space-y-1" transition:fade={{ duration: 200 }}>
								{#each item.children as child}
									<li>
										<a
											href={child.href}
											class="block px-4 py-2 text-sm rounded-lg transition-colors
												{isActive(child.href) ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}"
										>
											{child.label}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					{:else}
						<!-- Regular item -->
						<a
							href={item.href}
							class="flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors
								{isActive(item.href) ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}"
							title={collapsed && !mobile ? item.label : ''}
						>
							<div class="flex items-center gap-3">
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
								{#if !collapsed || mobile}
									<span>{item.label}</span>
								{/if}
							</div>
							{#if item.badge && (!collapsed || mobile)}
								<Badge variant={typeof item.badge === 'string' ? 'warning' : 'primary'} size="sm">
									{item.badge}
								</Badge>
							{/if}
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Bottom section -->
	<div class="border-t border-gray-800 py-4">
		<ul class="space-y-1">
			{#each bottomNavigation as item}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
						title={collapsed && !mobile ? item.label : ''}
					>
						<svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
						</svg>
						{#if !collapsed || mobile}
							<span>{item.label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Collapse toggle (desktop only) -->
		{#if !mobile}
			<div class="px-4 mt-4">
				<button
					type="button"
					class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
					onclick={() => (collapsed = !collapsed)}
				>
					{#if collapsed}
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 5l7 7-7 7M5 5l7 7-7 7"
							/>
						</svg>
					{:else}
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
							/>
						</svg>
						<span>Réduire</span>
					{/if}
				</button>
			</div>
		{/if}
	</div>
</aside>
