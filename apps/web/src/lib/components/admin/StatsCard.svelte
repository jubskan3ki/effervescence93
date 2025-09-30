<!-- src/lib/components/admin/StatsCard.svelte -->
<script lang="ts">
	export let title: string;
	export let value: string | number;
	export let change: number | null = null;
	export let changeLabel = 'vs mois dernier';
	export let icon: 'users' | 'exhibitors' | 'views' | 'revenue' = 'views';
	export let color: 'blue' | 'green' | 'purple' | 'amber' = 'blue';

	const colorClasses = {
		blue: 'bg-blue-100 text-blue-600',
		green: 'bg-green-100 text-green-600',
		purple: 'bg-purple-100 text-purple-600',
		amber: 'bg-amber-100 text-amber-600',
	};
</script>

<div class="stats-card">
	<div class="card-header">
		<div class="icon-wrapper {colorClasses[color]}">
			{#if icon === 'users'}
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
					/>
				</svg>
			{:else if icon === 'exhibitors'}
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7a2.5 2.5 0 010-5 2.5 2.5 0 010 5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"
					/>
				</svg>
			{:else if icon === 'views'}
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
					/>
				</svg>
			{:else if icon === 'revenue'}
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
					/>
				</svg>
			{/if}
		</div>
		<h3 class="card-title">{title}</h3>
	</div>

	<div class="card-value">
		{value}
	</div>

	{#if change !== null}
		<div class="card-change">
			<span class="change-value" class:positive={change > 0} class:negative={change < 0}>
				{change > 0 ? '+' : ''}{change}%
			</span>
			<span class="change-label">{changeLabel}</span>
		</div>
	{/if}
</div>

<style>
	.stats-card {
		@apply bg-white rounded-lg shadow-sm p-6 space-y-4;
	}

	.card-header {
		@apply flex items-center gap-4;
	}

	.icon-wrapper {
		@apply p-3 rounded-lg;
	}

	.card-title {
		@apply text-sm font-medium text-gray-500;
	}

	.card-value {
		@apply text-3xl font-bold text-gray-900;
	}

	.card-change {
		@apply flex items-center gap-2 text-sm;
	}

	.change-value {
		@apply font-semibold;
	}

	.change-value.positive {
		@apply text-green-600;
	}

	.change-value.negative {
		@apply text-red-600;
	}

	.change-label {
		@apply text-gray-500;
	}
</style>
