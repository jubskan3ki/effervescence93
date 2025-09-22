<!-- src/lib/components/search/QuickFilter.svelte -->
<script lang="ts">
	import { searchStore } from '@stores/search';

	interface FilterOption {
		type: 'sector' | 'theme' | 'logo' | 'contacts';
		id?: string;
		value: string | boolean;
		label: string;
		icon?: string;
		color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
		count?: number;
	}

	interface Props {
		options?: FilterOption[];
		sectors?: Array<{ id: string; name: string; count?: number }>;
		themes?: Array<{ id: string; name: string; count?: number }>;
		showCounts?: boolean;
		variant?: 'pills' | 'chips' | 'buttons';
		size?: 'sm' | 'md' | 'lg';
	}

	let { options, sectors = [], themes = [], showCounts = true, variant = 'pills', size = 'md' }: Props = $props();

	// Build filter options from sectors and themes if not provided
	const filterOptions = $derived(() => {
		if (options) return options;

		const opts: FilterOption[] = [];

		// Add top sectors
		sectors.slice(0, 4).forEach((sector) => {
			opts.push({
				type: 'sector',
				id: sector.id,
				value: sector.id,
				label: sector.name,
				color: 'primary',
				count: sector.count,
			});
		});

		// Add top themes
		themes.slice(0, 3).forEach((theme) => {
			opts.push({
				type: 'theme',
				id: theme.id,
				value: theme.id,
				label: theme.name,
				color: 'success',
				count: theme.count,
			});
		});

		// Add special filters
		opts.push({
			type: 'logo',
			value: true,
			label: 'Avec logo',
			icon: '🖼️',
			color: 'warning',
		});

		opts.push({
			type: 'contacts',
			value: true,
			label: 'Avec contacts',
			icon: '👥',
			color: 'secondary',
		});

		return opts;
	});

	// Track active filters
	let activeFilters = $state<Set<string>>(new Set());

	// Check if a filter is active
	function isActive(option: FilterOption): boolean {
		const key = `${option.type}-${option.value}`;
		return activeFilters.has(key);
	}

	// Toggle filter
	function toggleFilter(option: FilterOption) {
		const key = `${option.type}-${option.value}`;
		const newActive = new Set(activeFilters);

		if (newActive.has(key)) {
			// Remove filter
			newActive.delete(key);

			// Update store
			switch (option.type) {
				case 'sector':
					searchStore.setSector(null);
					break;
				case 'theme':
					searchStore.setTheme(null);
					break;
				case 'logo':
					searchStore.setHasLogo(null);
					break;
				case 'contacts':
					searchStore.setHasContacts(null);
					break;
			}
		} else {
			// Clear same type filters (single selection per type)
			for (const k of newActive) {
				if (k.startsWith(option.type + '-')) {
					newActive.delete(k);
				}
			}

			// Add filter
			newActive.add(key);

			// Update store
			switch (option.type) {
				case 'sector':
					searchStore.setSector(option.id || (option.value as string));
					break;
				case 'theme':
					searchStore.setTheme(option.id || (option.value as string));
					break;
				case 'logo':
					searchStore.setHasLogo(option.value as boolean);
					break;
				case 'contacts':
					searchStore.setHasContacts(option.value as boolean);
					break;
			}
		}

		activeFilters = newActive;
	}

	// Clear all filters
	function clearAll() {
		activeFilters = new Set();
		searchStore.clearFilters();
	}

	// Get tag classes
	function getTagClasses(option: FilterOption, active: boolean): string {
		const baseClasses =
			'inline-flex items-center gap-1.5 font-medium transition-all duration-200 cursor-pointer select-none';

		const sizeClasses = {
			sm: 'px-2.5 py-1 text-xs',
			md: 'px-3 py-1.5 text-sm',
			lg: 'px-4 py-2 text-base',
		};

		const variantClasses = {
			pills: `rounded-full ${
				active ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
			}`,
			chips: `rounded-lg border ${
				active
					? 'border-primary-500 bg-primary-50 text-primary-700'
					: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
			}`,
			buttons: `rounded-lg ${
				active
					? 'bg-primary-600 text-white shadow-sm'
					: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
			}`,
		};

		return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
	}
</script>

<div class="quick-filter">
	<!-- Header with clear button -->
	{#if activeFilters.size > 0}
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm text-gray-600">
				{activeFilters.size} filtre{activeFilters.size > 1 ? 's' : ''} rapide{activeFilters.size > 1 ? 's' : ''}
			</span>
			<button
				type="button"
				onclick={clearAll}
				class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
			>
				Tout effacer
			</button>
		</div>
	{/if}

	<!-- Filter tags -->
	<div class="flex flex-wrap gap-2">
		{#each filterOptions() as option}
			<button
				type="button"
				onclick={() => toggleFilter(option)}
				class={getTagClasses(option, isActive(option))}
				aria-pressed={isActive(option)}
			>
				{#if option.icon}
					<span class="text-base" role="img" aria-hidden="true">
						{option.icon}
					</span>
				{/if}

				<span>{option.label}</span>

				{#if showCounts && option.count}
					<span class="opacity-75">
						({option.count})
					</span>
				{/if}

				{#if isActive(option)}
					<svg class="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>
		{/each}
	</div>
</div>
