<!-- src/lib/components/admin/StatsCard.svelte -->
<script lang="ts">
	import Spinner from '../ui/Spinner.svelte';

	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		change?: number;
		changeLabel?: string;
		icon?: string;
		iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
		loading?: boolean;
		href?: string;
		chart?: any;
		actions?: any;
	}

	let {
		title,
		value,
		subtitle = '',
		change,
		changeLabel = '',
		icon = '',
		iconColor = 'primary',
		loading = false,
		href = '',
		chart,
		actions,
	}: Props = $props();

	const isPositiveChange = $derived(change !== undefined && change > 0);
	const isNegativeChange = $derived(change !== undefined && change < 0);

	const iconColors = {
		primary: 'bg-primary-100 text-primary-600',
		success: 'bg-green-100 text-green-600',
		warning: 'bg-yellow-100 text-yellow-600',
		danger: 'bg-red-100 text-red-600',
		info: 'bg-blue-100 text-blue-600',
	};

	const iconBgClass = $derived(iconColors[iconColor]);

	const formattedChange = $derived(() => {
		if (change === undefined) return null;
		const sign = change > 0 ? '+' : '';
		return `${sign}${change.toFixed(1)}%`;
	});

	const Component = href ? 'a' : 'div';
</script>

<svelte:element
	this={Component}
	{href}
	class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 {href
		? 'cursor-pointer'
		: ''}"
>
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<!-- Header -->
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-medium text-gray-600">
					{title}
				</h3>
				{#if actions}
					<div class="ml-4">
						{@render actions()}
					</div>
				{/if}
			</div>

			<!-- Value -->
			{#if loading}
				<div class="mb-4">
					<Spinner size="md" />
				</div>
			{:else}
				<div class="mb-2">
					<p class="text-2xl font-bold text-gray-900">
						{value}
					</p>
				</div>
			{/if}

			<!-- Change indicator -->
			{#if change !== undefined && !loading}
				<div class="flex items-center gap-2 mb-2">
					{#if isPositiveChange}
						<div class="flex items-center text-green-600">
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
								/>
							</svg>
							<span class="ml-1 text-sm font-medium">
								{formattedChange()}
							</span>
						</div>
					{:else if isNegativeChange}
						<div class="flex items-center text-red-600">
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
								/>
							</svg>
							<span class="ml-1 text-sm font-medium">
								{formattedChange()}
							</span>
						</div>
					{:else}
						<div class="flex items-center text-gray-500">
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
							</svg>
							<span class="ml-1 text-sm font-medium">
								{formattedChange()}
							</span>
						</div>
					{/if}

					{#if changeLabel}
						<span class="text-sm text-gray-500">
							{changeLabel}
						</span>
					{/if}
				</div>
			{/if}

			<!-- Subtitle -->
			{#if subtitle && !loading}
				<p class="text-xs text-gray-500">
					{subtitle}
				</p>
			{/if}

			<!-- Chart -->
			{#if chart && !loading}
				<div class="mt-4">
					{@render chart()}
				</div>
			{/if}
		</div>

		<!-- Icon -->
		{#if icon}
			<div class="ml-4">
				<div class="p-3 rounded-lg {iconBgClass}">
					{@html icon}
				</div>
			</div>
		{/if}
	</div>

	<!-- Link indicator -->
	{#if href}
		<div class="mt-4 flex items-center text-sm text-primary-600 font-medium">
			<span>Voir les détails</span>
			<svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</div>
	{/if}
</svelte:element>

<style>
	/* Mini chart styles if needed */
	:global(.mini-chart) {
		height: 60px;
		width: 100%;
	}
</style>
