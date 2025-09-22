<!-- src/lib/components/search/SearchFilters.svelte -->
<script lang="ts">
	import { searchStore, hasActiveFilters, activeFilterCount } from '@stores/search';
	import Checkbox from '../ui/Checkbox.svelte';
	import Select from '../ui/Select.svelte';
	import Button from '../ui/Button.svelte';
	import Badge from '../ui/Badge.svelte';

	interface Props {
		sectors?: Array<{ id: string; name: string; count?: number }>;
		themes?: Array<{ id: string; name: string; count?: number }>;
		showCounts?: boolean;
		variant?: 'sidebar' | 'inline' | 'dropdown';
		onApply?: () => void;
		onReset?: () => void;
	}

	let { sectors = [], themes = [], showCounts = true, variant = 'sidebar', onApply, onReset }: Props = $props();

	// Local state
	let selectedSector = $state<string | null>(null);
	let selectedTheme = $state<string | null>(null);
	let hasLogo = $state<boolean | null>(null);
	let hasContacts = $state<boolean | null>(null);
	let isExpanded = $state(true);

	// Apply filters
	function applyFilters() {
		searchStore.setSector(selectedSector);
		searchStore.setTheme(selectedTheme);
		searchStore.setHasLogo(hasLogo);
		searchStore.setHasContacts(hasContacts);
		onApply?.();
	}

	// Reset filters
	function resetFilters() {
		selectedSector = null;
		selectedTheme = null;
		hasLogo = null;
		hasContacts = null;
		searchStore.clearFilters();
		onReset?.();
	}

	// Handle checkbox changes
	function handleLogoChange(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		hasLogo = checked ? true : null;
		if (variant === 'inline') {
			applyFilters();
		}
	}

	function handleContactsChange(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		hasContacts = checked ? true : null;
		if (variant === 'inline') {
			applyFilters();
		}
	}

	// Handle select changes
	function handleSectorChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		selectedSector = value || null;
		if (variant === 'inline') {
			applyFilters();
		}
	}

	function handleThemeChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		selectedTheme = value || null;
		if (variant === 'inline') {
			applyFilters();
		}
	}
</script>

<div class="search-filters search-filters-{variant}">
	{#if variant === 'sidebar'}
		<!-- Sidebar variant -->
		<div class="bg-white rounded-lg border border-gray-200 p-4">
			<!-- Header -->
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Filtres</h3>
				{#if $activeFilterCount > 0}
					<Badge variant="primary" size="sm">
						{$activeFilterCount}
					</Badge>
				{/if}
			</div>

			<!-- Filters -->
			<div class="space-y-4">
				<!-- Secteur -->
				{#if sectors.length > 0}
					<div>
						<label for="sector-select" class="block text-sm font-medium text-gray-700 mb-2">
							Secteur d'activité
						</label>
						<Select
							id="sector-select"
							value={selectedSector || ''}
							options={[
								{ value: '', label: 'Tous les secteurs' },
								...sectors.map((s) => ({
									value: s.id,
									label: showCounts && s.count ? `${s.name} (${s.count})` : s.name,
								})),
							]}
							onchange={handleSectorChange}
						/>
					</div>
				{/if}

				<!-- Thème -->
				{#if themes.length > 0}
					<div>
						<label for="theme-select" class="block text-sm font-medium text-gray-700 mb-2">
							Thématique
						</label>
						<Select
							id="theme-select"
							value={selectedTheme || ''}
							options={[
								{ value: '', label: 'Toutes les thématiques' },
								...themes.map((t) => ({
									value: t.id,
									label: showCounts && t.count ? `${t.name} (${t.count})` : t.name,
								})),
							]}
							onchange={handleThemeChange}
						/>
					</div>
				{/if}

				<!-- Options -->
				<div class="space-y-2">
					<Checkbox checked={hasLogo === true} label="Avec logo uniquement" onchange={handleLogoChange} />
					<Checkbox
						checked={hasContacts === true}
						label="Avec contacts uniquement"
						onchange={handleContactsChange}
					/>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-2 mt-6">
				<Button variant="primary" size="sm" fullWidth onclick={applyFilters}>Appliquer</Button>
				<Button variant="outline" size="sm" fullWidth onclick={resetFilters} disabled={!$hasActiveFilters}>
					Réinitialiser
				</Button>
			</div>
		</div>
	{:else if variant === 'inline'}
		<!-- Inline variant -->
		<div class="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
			{#if sectors.length > 0}
				<div class="flex-1 min-w-[200px]">
					<Select
						value={selectedSector || ''}
						options={[
							{ value: '', label: 'Tous les secteurs' },
							...sectors.map((s) => ({ value: s.id, label: s.name })),
						]}
						placeholder="Secteur"
						onchange={handleSectorChange}
					/>
				</div>
			{/if}

			{#if themes.length > 0}
				<div class="flex-1 min-w-[200px]">
					<Select
						value={selectedTheme || ''}
						options={[
							{ value: '', label: 'Toutes les thématiques' },
							...themes.map((t) => ({ value: t.id, label: t.name })),
						]}
						placeholder="Thématique"
						onchange={handleThemeChange}
					/>
				</div>
			{/if}

			<div class="flex items-center gap-4">
				<Checkbox checked={hasLogo === true} label="Avec logo" onchange={handleLogoChange} />
				<Checkbox checked={hasContacts === true} label="Avec contacts" onchange={handleContactsChange} />
			</div>

			{#if $hasActiveFilters}
				<Button variant="ghost" size="sm" onclick={resetFilters}>
					<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
					Effacer
				</Button>
			{/if}
		</div>
	{:else if variant === 'dropdown'}
		<!-- Dropdown variant -->
		<div class="relative">
			<Button variant="outline" onclick={() => (isExpanded = !isExpanded)}>
				<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
					/>
				</svg>
				Filtres
				{#if $activeFilterCount > 0}
					<Badge variant="primary" size="sm">
						{$activeFilterCount}
					</Badge>
				{/if}
			</Button>

			{#if isExpanded}
				<div class="absolute top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
					<!-- Same content as sidebar but in dropdown -->
					<div class="space-y-4">
						{#if sectors.length > 0}
							<Select
								value={selectedSector || ''}
								options={[
									{ value: '', label: 'Tous les secteurs' },
									...sectors.map((s) => ({ value: s.id, label: s.name })),
								]}
								label="Secteur"
								onchange={handleSectorChange}
							/>
						{/if}

						{#if themes.length > 0}
							<Select
								value={selectedTheme || ''}
								options={[
									{ value: '', label: 'Toutes les thématiques' },
									...themes.map((t) => ({ value: t.id, label: t.name })),
								]}
								label="Thématique"
								onchange={handleThemeChange}
							/>
						{/if}

						<div class="space-y-2">
							<Checkbox
								checked={hasLogo === true}
								label="Avec logo uniquement"
								onchange={handleLogoChange}
							/>
							<Checkbox
								checked={hasContacts === true}
								label="Avec contacts uniquement"
								onchange={handleContactsChange}
							/>
						</div>

						<div class="flex gap-2 pt-2">
							<Button
								variant="primary"
								size="sm"
								fullWidth
								onclick={() => {
									applyFilters();
									isExpanded = false;
								}}
							>
								Appliquer
							</Button>
							<Button variant="outline" size="sm" onclick={resetFilters}>Réinitialiser</Button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search-filters-sidebar {
		min-width: 250px;
	}

	.search-filters-inline {
		width: 100%;
	}
</style>
