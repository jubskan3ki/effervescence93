<!-- src/lib/components/admin/DataTable.svelte -->
<script lang="ts" generics="T">
	import type { ComponentType } from 'svelte';

	export let data: T[] = [];
	export let columns: Array<{
		key: string; // Changed from keyof T | string to just string
		label: string;
		sortable?: boolean;
		formatter?: (value: any) => string;
		component?: ComponentType;
		width?: string;
	}> = [];
	export let onRowClick: ((row: T) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'Aucune donnée';

	let sortBy: string | null = null;
	let sortOrder: 'asc' | 'desc' = 'asc';

	$: sortedData = sortData(data, sortBy, sortOrder);

	function sortData(items: T[], key: string | null, order: 'asc' | 'desc'): T[] {
		if (!key) return items;

		return [...items].sort((a, b) => {
			const aVal = getNestedValue(a, key);
			const bVal = getNestedValue(b, key);

			if (aVal < bVal) return order === 'asc' ? -1 : 1;
			if (aVal > bVal) return order === 'asc' ? 1 : -1;
			return 0;
		});
	}

	function getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((acc, part) => acc?.[part], obj);
	}

	function handleSort(columnKey: string) {
		if (sortBy === columnKey) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = columnKey;
			sortOrder = 'asc';
		}
	}

	function getCellValue(row: T, key: string): any {
		return getNestedValue(row, key);
	}
</script>

<div class="data-table-container">
	{#if loading}
		<div class="loading-overlay">
			<div class="spinner"></div>
		</div>
	{/if}

	<div class="table-wrapper">
		<table class="data-table">
			<thead>
				<tr>
					{#each columns as column}
						<th
							class="table-header"
							class:sortable={column.sortable}
							style={column.width ? `width: ${column.width}` : ''}
							on:click={() => column.sortable && handleSort(column.key)}
							role={column.sortable ? 'button' : undefined}
							tabindex={column.sortable ? 0 : undefined}
						>
							<div class="header-content">
								<span>{column.label}</span>
								{#if column.sortable}
									<span class="sort-icon" aria-label="Sort column">
										{#if sortBy === column.key}
											{sortOrder === 'asc' ? '↑' : '↓'}
										{:else}
											↕
										{/if}
									</span>
								{/if}
							</div>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#if sortedData.length === 0}
					<tr>
						<td colspan={columns.length} class="empty-cell">
							{emptyMessage}
						</td>
					</tr>
				{:else}
					{#each sortedData as row}
						<tr
							class="table-row"
							class:clickable={onRowClick}
							on:click={() => onRowClick?.(row)}
							role={onRowClick ? 'button' : undefined}
							tabindex={onRowClick ? 0 : undefined}
						>
							{#each columns as column}
								<td class="table-cell">
									{#if column.component}
										<svelte:component
											this={column.component}
											value={getCellValue(row, column.key)}
											{row}
										/>
									{:else if column.formatter}
										{column.formatter(getCellValue(row, column.key))}
									{:else}
										{getCellValue(row, column.key) ?? '-'}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.data-table-container {
		@apply relative bg-white rounded-lg shadow-sm overflow-hidden;
	}

	.loading-overlay {
		@apply absolute inset-0 bg-white/80 flex items-center justify-center z-10;
	}

	.spinner {
		@apply w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin;
	}

	.table-wrapper {
		@apply overflow-x-auto;
	}

	.data-table {
		@apply w-full;
	}

	.table-header {
		@apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
		@apply bg-gray-50 border-b border-gray-200;
	}

	.table-header.sortable {
		@apply cursor-pointer hover:bg-gray-100 select-none;
	}

	.header-content {
		@apply flex items-center justify-between gap-2;
	}

	.sort-icon {
		@apply text-gray-400;
	}

	.table-row {
		@apply border-b border-gray-200 hover:bg-gray-50 transition-colors;
	}

	.table-row.clickable {
		@apply cursor-pointer;
	}

	.table-cell {
		@apply px-6 py-4 text-sm text-gray-900;
	}

	.empty-cell {
		@apply text-center py-8 text-gray-500;
	}
</style>
