<!-- src/lib/components/common/Pagination.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentPage = 1;
	export let totalPages = 1;
	export let totalItems = 0;
	export let itemsPerPage = 20;
	export let showInfo = true;

	const dispatch = createEventDispatcher();

	$: startItem = (currentPage - 1) * itemsPerPage + 1;
	$: endItem = Math.min(currentPage * itemsPerPage, totalItems);
	$: pages = generatePages(currentPage, totalPages);

	function generatePages(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		if (current <= 3) {
			return [1, 2, 3, 4, 5, '...', total];
		}

		if (current >= total - 2) {
			return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
		}

		return [1, '...', current - 1, current, current + 1, '...', total];
	}

	function handlePageChange(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			dispatch('change', page);
		}
	}
</script>

<div class="pagination">
	{#if showInfo && totalItems > 0}
		<div class="pagination-info">
			<span class="text-sm text-gray-600">
				{startItem}-{endItem} sur {totalItems}
			</span>
		</div>
	{/if}

	<nav class="pagination-nav" aria-label="Pagination">
		<button
			class="page-btn prev"
			on:click={() => handlePageChange(currentPage - 1)}
			disabled={currentPage === 1}
			aria-label="Page précédente"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		{#each pages as page}
			{#if page === '...'}
				<span class="page-dots">...</span>
			{:else}
				<button
					class="page-btn"
					class:active={page === currentPage}
					on:click={() => handlePageChange(page)}
					aria-label="Page {page}"
					aria-current={page === currentPage ? 'page' : undefined}
				>
					{page}
				</button>
			{/if}
		{/each}

		<button
			class="page-btn next"
			on:click={() => handlePageChange(currentPage + 1)}
			disabled={currentPage === totalPages}
			aria-label="Page suivante"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</nav>
</div>

<style>
	.pagination {
		@apply flex flex-col sm:flex-row items-center justify-between gap-4;
		@apply py-3;
	}

	.pagination-info {
		@apply flex-shrink-0;
	}

	.pagination-nav {
		@apply flex items-center gap-1;
	}

	.page-btn {
		@apply px-3 py-2 text-sm font-medium rounded-lg;
		@apply text-gray-700 bg-white border border-gray-300;
		@apply hover:bg-gray-50 transition-colors;
		@apply disabled:opacity-50 disabled:cursor-not-allowed;
	}

	.page-btn.active {
		@apply bg-primary text-white border-primary;
		@apply hover:bg-primary-600;
	}

	.page-btn.prev,
	.page-btn.next {
		@apply px-2;
	}

	.page-dots {
		@apply px-2 text-gray-500;
	}

	@media (max-width: 640px) {
		.pagination {
			@apply flex-col-reverse;
		}

		.page-btn:not(.prev):not(.next):not(.active) {
			@apply hidden;
		}
	}
</style>
