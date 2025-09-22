<!-- src/lib/components/admin/DataTable.svelte -->
<script lang="ts">
	import Input from '../ui/Input.svelte';
	import Button from '../ui/Button.svelte';
	import Checkbox from '../ui/Checkbox.svelte';
	import Spinner from '../ui/Spinner.svelte';

	interface Column<T = any> {
		key: string;
		label: string;
		sortable?: boolean;
		searchable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		render?: (value: any, row: T) => any;
		className?: string;
	}

	interface Props<T = any> {
		columns: Column<T>[];
		data: T[];
		searchable?: boolean;
		sortable?: boolean;
		selectable?: boolean;
		pagination?: boolean;
		pageSize?: number;
		loading?: boolean;
		emptyMessage?: string;
		actions?: (row: T) => any;
		bulkActions?: any;
		onrowclick?: (row: T) => void;
		onselectionchange?: (selected: T[]) => void;
	}

	let {
		columns,
		data = [],
		searchable = true,
		sortable = true,
		selectable = false,
		pagination = true,
		pageSize = 10,
		loading = false,
		emptyMessage = 'Aucune donnée disponible',
		actions,
		bulkActions,
		onrowclick,
		onselectionchange,
	}: Props = $props();

	// State
	let searchQuery = $state('');
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let currentPage = $state(1);
	let selectedRows = $state<Set<any>>(new Set());

	// Computed
	const searchableColumns = $derived(columns.filter((col) => col.searchable !== false));

	const filteredData = $derived(() => {
		if (!searchQuery) return data;

		return data.filter((row) => {
			return searchableColumns.some((col) => {
				const value = (row as any)[col.key];
				if (value === null || value === undefined) return false;
				return String(value).toLowerCase().includes(searchQuery.toLowerCase());
			});
		});
	});

	const sortedData = $derived(() => {
		if (!sortColumn) return filteredData();

		return [...filteredData()].sort((a, b) => {
			if (!sortColumn) return 0;
			const aVal = (a as any)[sortColumn];
			const bVal = (b as any)[sortColumn];

			if (aVal === null || aVal === undefined) return 1;
			if (bVal === null || bVal === undefined) return -1;

			let comparison = 0;
			if (aVal < bVal) comparison = -1;
			if (aVal > bVal) comparison = 1;

			return sortDirection === 'asc' ? comparison : -comparison;
		});
	});

	const totalPages = $derived(Math.ceil(sortedData().length / pageSize));

	const paginatedData = $derived(() => {
		if (!pagination) return sortedData();

		const start = (currentPage - 1) * pageSize;
		const end = start + pageSize;
		return sortedData().slice(start, end);
	});

	const isAllSelected = $derived(paginatedData().length > 0 && paginatedData().every((row) => selectedRows.has(row)));

	const selectedRowsArray = $derived(Array.from(selectedRows));

	// Functions
	function handleSort(column: Column) {
		if (!sortable || column.sortable === false) return;

		if (sortColumn === column.key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column.key;
			sortDirection = 'asc';
		}
	}

	function toggleRowSelection(row: any) {
		const newSelection = new Set(selectedRows);
		if (newSelection.has(row)) {
			newSelection.delete(row);
		} else {
			newSelection.add(row);
		}
		selectedRows = newSelection;
		onselectionchange?.(Array.from(newSelection));
	}

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedRows = new Set();
		} else {
			selectedRows = new Set(paginatedData());
		}
		onselectionchange?.(Array.from(selectedRows));
	}

	function clearSelection() {
		selectedRows = new Set();
		onselectionchange?.([]);
	}

	function goToPage(page: number) {
		currentPage = Math.max(1, Math.min(page, totalPages));
	}

	function handleCheckboxClick(e: Event) {
		e.stopPropagation();
	}

	// Reset page when data changes
	$effect(() => {
		data;
		currentPage = 1;
	});

	// Pagination range
	function getPaginationRange(): (number | string)[] {
		const range: (number | string)[] = [];
		const delta = 2;
		const start = Math.max(1, currentPage - delta);
		const end = Math.min(totalPages, currentPage + delta);

		if (start > 1) {
			range.push(1);
			if (start > 2) range.push('...');
		}

		for (let i = start; i <= end; i++) {
			range.push(i);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) range.push('...');
			range.push(totalPages);
		}

		return range;
	}
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200">
	<!-- Header -->
	<div class="px-6 py-4 border-b border-gray-200">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<!-- Search -->
			{#if searchable}
				<div class="flex-1 max-w-md">
					<Input type="search" bind:value={searchQuery} placeholder="Rechercher..." />
				</div>
			{/if}

			<!-- Bulk Actions -->
			{#if selectable && selectedRowsArray.length > 0 && bulkActions}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">
						{selectedRowsArray.length} sélectionné(s)
					</span>
					{@render bulkActions(selectedRowsArray, clearSelection)}
				</div>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<Spinner size="lg">
					<span class="text-gray-600">Chargement...</span>
				</Spinner>
			</div>
		{:else if paginatedData().length === 0}
			<div class="py-12 text-center text-gray-500">
				{emptyMessage}
			</div>
		{:else}
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						{#if selectable}
							<th class="px-6 py-3 text-left">
								<Checkbox checked={isAllSelected} onchange={toggleSelectAll} label="" />
							</th>
						{/if}

						{#each columns as column}
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider {column.className ||
									''}"
								style={column.width ? `width: ${column.width}` : ''}
							>
								{#if sortable && column.sortable !== false}
									<button
										type="button"
										class="group inline-flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
										onclick={() => handleSort(column)}
									>
										{column.label}
										<span class="flex-shrink-0">
											{#if sortColumn === column.key}
												{#if sortDirection === 'asc'}
													<svg
														class="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M5 15l7-7 7 7"
														/>
													</svg>
												{:else}
													<svg
														class="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												{/if}
											{:else}
												<svg
													class="h-4 w-4 text-gray-400 group-hover:text-gray-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M8 9l4-4 4 4m0 6l-4 4-4-4"
													/>
												</svg>
											{/if}
										</span>
									</button>
								{:else}
									{column.label}
								{/if}
							</th>
						{/each}

						{#if actions}
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						{/if}
					</tr>
				</thead>

				<tbody class="bg-white divide-y divide-gray-200">
					{#each paginatedData() as row}
						<tr
							class="hover:bg-gray-50 transition-colors {onrowclick ? 'cursor-pointer' : ''}"
							onclick={() => onrowclick?.(row)}
						>
							{#if selectable}
								<td class="px-6 py-4 whitespace-nowrap" onclick={handleCheckboxClick}>
									<Checkbox
										checked={selectedRows.has(row)}
										onchange={() => toggleRowSelection(row)}
										label=""
									/>
								</td>
							{/if}

							{#each columns as column}
								<td
									class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 {column.className || ''}"
									style="text-align: {column.align || 'left'}"
								>
									{#if column.render}
										{@html column.render((row as any)[column.key], row)}
									{:else}
										{(row as any)[column.key] ?? '-'}
									{/if}
								</td>
							{/each}

							{#if actions}
								<td
									class="px-6 py-4 whitespace-nowrap text-right text-sm"
									onclick={handleCheckboxClick}
								>
									{@render actions(row)}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<!-- Pagination -->
	{#if pagination && totalPages > 1 && !loading}
		<div class="px-6 py-4 border-t border-gray-200">
			<div class="flex items-center justify-between">
				<div class="text-sm text-gray-700">
					Affichage de
					<span class="font-medium">{(currentPage - 1) * pageSize + 1}</span>
					à
					<span class="font-medium">{Math.min(currentPage * pageSize, sortedData().length)}</span>
					sur
					<span class="font-medium">{sortedData().length}</span>
					résultats
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</Button>

					{#each getPaginationRange() as page}
						{#if page === '...'}
							<span class="px-3 py-1 text-sm text-gray-500">...</span>
						{:else if typeof page === 'number'}
							<Button
								variant={page === currentPage ? 'primary' : 'outline'}
								size="sm"
								onclick={() => goToPage(page)}
							>
								{page}
							</Button>
						{/if}
					{/each}

					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
