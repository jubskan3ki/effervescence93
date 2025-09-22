<!-- src/lib/components/ui/Badge.svelte -->
<script lang="ts">
	interface Props {
		variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		pill?: boolean;
		removable?: boolean;
		onremove?: () => void;
		children?: any;
	}

	let { variant = 'default', size = 'md', pill = false, removable = false, onremove, children }: Props = $props();

	const classes = $derived(
		[
			'inline-flex items-center font-medium',

			// Variants
			variant === 'default' && 'bg-gray-100 text-gray-800',
			variant === 'primary' && 'bg-primary-100 text-primary-800',
			variant === 'secondary' && 'bg-gray-100 text-gray-800',
			variant === 'success' && 'bg-green-100 text-green-800',
			variant === 'warning' && 'bg-yellow-100 text-yellow-800',
			variant === 'danger' && 'bg-red-100 text-red-800',

			// Sizes
			size === 'sm' && 'px-2 py-0.5 text-xs',
			size === 'md' && 'px-2.5 py-1 text-sm',
			size === 'lg' && 'px-3 py-1.5 text-base',

			// Shape
			pill ? 'rounded-full' : 'rounded-md',
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<span class={classes}>
	{@render children?.()}
	{#if removable}
		<button
			type="button"
			class="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-200 focus:text-gray-500 focus:outline-none"
			onclick={onremove}
		>
			<span class="sr-only">Retirer</span>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	{/if}
</span>
