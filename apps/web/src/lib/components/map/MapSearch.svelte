<!-- src/lib/components/map/MapSearch.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Sector, Exhibitor, Booth } from '$lib/types';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let sectors: Sector[] = [];
	export let exhibitors: Exhibitor[] = [];
	export let booths: Booth[] = [];

	const dispatch = createEventDispatcher();

	let searchQuery = '';
	let selectedSectorId: string | undefined = undefined;
	let showSectorDropdown = false;

	onMount(() => {
		console.log('🔍 MapSearch mounted with:', {
			sectors: sectors.length,
			exhibitors: exhibitors.length,
			booths: booths.length,
		});
	});

	function filterData(query: string, sectorId: string | undefined) {
		let results = [...exhibitors];

		if (sectorId) {
			results = results.filter((exhibitor) => exhibitor.sectorId === sectorId);
		}

		if (query && query.trim() !== '') {
			const searchLower = query.toLowerCase().trim();

			results = results.filter((exhibitor) => {
				if (exhibitor.name && exhibitor.name.toLowerCase().includes(searchLower)) return true;
				if (exhibitor.description && exhibitor.description.toLowerCase().includes(searchLower)) return true;

				let boothNumber = null;
				if (exhibitor.booth?.number) {
					boothNumber = exhibitor.booth.number;
				} else if (exhibitor.boothId) {
					const booth = booths.find((b) => b.id === exhibitor.boothId);
					if (booth) boothNumber = booth.number;
				} else {
					const booth = booths.find((b) => b.exhibitorId === exhibitor.id);
					if (booth) boothNumber = booth.number;
				}

				if (boothNumber && boothNumber.toLowerCase().includes(searchLower)) return true;

				if (exhibitor.contacts && Array.isArray(exhibitor.contacts)) {
					const contactMatch = exhibitor.contacts.some(
						(contact) =>
							(contact.firstName && contact.firstName.toLowerCase().includes(searchLower)) ||
							(contact.lastName && contact.lastName.toLowerCase().includes(searchLower)) ||
							(contact.role && contact.role.toLowerCase().includes(searchLower))
					);
					if (contactMatch) return true;
				}

				return false;
			});
		}

		return results;
	}

	$: filteredResults = filterData(searchQuery, selectedSectorId);

	$: visibleBoothIds = (() => {
		const ids = new Set<string>();
		filteredResults.forEach((exhibitor) => {
			if (exhibitor.booth?.id) {
				ids.add(exhibitor.booth.id);
			} else if (exhibitor.boothId) {
				ids.add(exhibitor.boothId);
			} else {
				const booth = booths.find((b) => b.exhibitorId === exhibitor.id);
				if (booth) ids.add(booth.id);
			}
		});
		return ids;
	})();

	$: {
		dispatch('filterChange', {
			results: filteredResults,
			visibleBoothIds,
			query: searchQuery,
			sectorId: selectedSectorId,
		});
	}

	function handleSearch(e: Event) {
		searchQuery = (e.target as HTMLInputElement).value;
	}

	function clearSearch() {
		searchQuery = '';
	}

	function selectSector(id: string | undefined) {
		selectedSectorId = id;
		showSectorDropdown = false;
	}

	function clearAllFilters() {
		searchQuery = '';
		selectedSectorId = undefined;
	}

	function getExhibitorCountBySector(sectorId: string): number {
		return exhibitors.filter((e) => e.sectorId === sectorId).length;
	}

	$: hasFilters = !!(searchQuery || selectedSectorId);
	$: selectedSector = sectors.find((s) => s.id === selectedSectorId);
	$: totalExhibitors = exhibitors.length;

	function handleClickOutside(e: MouseEvent) {
		if (!(e.target as HTMLElement).closest('.sector-dropdown-container')) {
			showSectorDropdown = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="search-panel">
	<div class="search-main">
		<div class="search-input-wrapper">
			<svg
				class="search-icon"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				placeholder="Rechercher un exposant, stand..."
				bind:value={searchQuery}
				on:input={handleSearch}
				class="search-input"
			/>
			{#if searchQuery}
				<button class="clear-btn" on:click={clearSearch}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>

		<div class="sector-dropdown-container">
			<button
				class="sector-btn"
				class:active={selectedSectorId}
				on:click={() => (showSectorDropdown = !showSectorDropdown)}
			>
				{#if selectedSector}
					<span class="sector-dot" style="background: {selectedSector.colorHex}"></span>
					<span class="sector-label">{selectedSector.name}</span>
				{:else}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 7h18M3 12h18M3 17h18" />
					</svg>
					<span class="sector-label">Secteur</span>
				{/if}
				<svg
					class="chevron"
					class:open={showSectorDropdown}
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if showSectorDropdown}
				<div class="dropdown" transition:fly={{ y: -8, duration: 150 }}>
					<button
						class="dropdown-item"
						class:active={!selectedSectorId}
						on:click={() => selectSector(undefined)}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M5 13l4 4L19 7" />
						</svg>
						<span>Tous les secteurs</span>
						<span class="count">{totalExhibitors}</span>
					</button>

					<div class="dropdown-divider"></div>

					{#each sectors as sector}
						{@const count = getExhibitorCountBySector(sector.id)}
						<button
							class="dropdown-item"
							class:active={selectedSectorId === sector.id}
							on:click={() => selectSector(sector.id)}
						>
							<span class="sector-dot" style="background: {sector.colorHex}"></span>
							<span>{sector.name}</span>
							<span class="count">{count}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#if hasFilters}
		<div class="results-bar">
			<span class="results-text">
				<strong>{filteredResults.length}</strong>
				{filteredResults.length === 1 ? 'résultat' : 'résultats'}
			</span>

			<button class="clear-all" on:click={clearAllFilters}> Tout effacer </button>
		</div>
	{/if}
</div>

<style>
	.search-panel {
		background: white;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border: 1px solid #e5e7eb;
	}

	.search-main {
		display: flex;
		gap: 8px;
	}

	.search-input-wrapper {
		flex: 1;
		position: relative;
		min-width: 0;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 10px 40px 10px 36px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 14px;
		color: #111827;
		transition: all 0.15s;
	}

	.search-input::placeholder {
		color: #9ca3af;
	}

	.search-input:focus {
		outline: none;
		background: white;
		border-color: #d1d5db;
		box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.02);
	}

	.clear-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		width: 24px;
		height: 24px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #6b7280;
		transition: all 0.15s;
	}

	.clear-btn:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.sector-dropdown-container {
		position: relative;
		flex-shrink: 0;
	}

	.sector-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 12px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 13px;
		color: #374151;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
		font-weight: 500;
	}

	.sector-btn:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.sector-btn.active {
		border-color: #9ca3af;
		background: white;
	}

	.sector-dot {
		width: 8px;
		height: 8px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.sector-label {
		font-weight: 500;
	}

	.chevron {
		color: #9ca3af;
		transition: transform 0.15s;
		margin-left: 2px;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		min-width: 240px;
		background: white;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		max-height: 280px;
		overflow-y: auto;
		z-index: 100;
		padding: 4px;
	}

	.dropdown-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		background: none;
		border: none;
		border-radius: 4px;
		text-align: left;
		cursor: pointer;
		font-size: 13px;
		color: #374151;
		transition: background 0.15s;
	}

	.dropdown-item:hover {
		background: #f9fafb;
	}

	.dropdown-item.active {
		background: #f3f4f6;
		font-weight: 500;
	}

	.dropdown-item svg {
		color: #10b981;
		flex-shrink: 0;
	}

	.dropdown-divider {
		height: 1px;
		background: #f3f4f6;
		margin: 4px 0;
	}

	.count {
		margin-left: auto;
		padding: 2px 6px;
		background: #f3f4f6;
		border-radius: 3px;
		font-size: 11px;
		font-weight: 600;
		color: #6b7280;
	}

	.dropdown-item.active .count {
		background: white;
		color: #374151;
	}

	.results-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid #f3f4f6;
	}

	.results-text {
		font-size: 13px;
		color: #6b7280;
	}

	.results-text strong {
		font-weight: 600;
		color: #111827;
	}

	.clear-all {
		padding: 4px 10px;
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		font-size: 12px;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
		font-weight: 500;
	}

	.clear-all:hover {
		background: #f9fafb;
		color: #374151;
		border-color: #d1d5db;
	}

	@media (max-width: 640px) {
		.search-main {
			flex-direction: column;
		}

		.sector-btn {
			width: 100%;
			justify-content: center;
		}

		.dropdown {
			left: 0;
			right: 0;
		}
	}
</style>
