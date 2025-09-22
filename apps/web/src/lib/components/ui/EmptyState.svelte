<!-- src/lib/components/ui/EmptyState.svelte -->
<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		title?: string;
		description?: string;
		icon?: 'inbox' | 'search' | 'users' | 'document' | 'heart';
		actionLabel?: string;
		actionHref?: string;
		onaction?: () => void;
		children?: any;
		iconSlot?: any;
	}

	let {
		title = '',
		description = '',
		icon = 'inbox',
		actionLabel = '',
		actionHref = '',
		onaction,
		children,
		iconSlot,
	}: Props = $props();

	const icons: Record<string, string> = {
		inbox: `<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
				d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
		</svg>`,
		search: `<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>`,
		users: `<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
				d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>`,
		document: `<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
		</svg>`,
		heart: `<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
		</svg>`,
	};
</script>

<div class="text-center py-12">
	{#if icon || iconSlot}
		<div class="mx-auto h-12 w-12 text-gray-400">
			{#if iconSlot}
				{@render iconSlot()}
			{:else}
				{@html icons[icon]}
			{/if}
		</div>
	{/if}

	{#if title}
		<h3 class="mt-2 text-sm font-semibold text-gray-900">
			{title}
		</h3>
	{/if}

	{#if description}
		<p class="mt-1 text-sm text-gray-500">
			{description}
		</p>
	{/if}

	{#if children}
		<div class="mt-4">
			{@render children()}
		</div>
	{/if}

	{#if actionLabel}
		<div class="mt-6">
			<Button variant="primary" href={actionHref} onclick={onaction}>
				{actionLabel}
			</Button>
		</div>
	{/if}
</div>
