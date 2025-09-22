<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		children?: any;
	}

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		href,
		onclick,
		children,
		...restProps
	}: Props = $props();

	const classes = $derived(
		[
			'inline-flex items-center justify-center font-medium transition-colors duration-200',
			'focus:outline-none focus:ring-2 focus:ring-offset-2',
			'disabled:opacity-50 disabled:cursor-not-allowed',

			// Variants
			variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
			variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
			variant === 'outline' &&
				'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
			variant === 'ghost' && 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
			variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',

			// Sizes
			size === 'sm' && 'px-3 py-1.5 text-sm rounded-md',
			size === 'md' && 'px-4 py-2 text-base rounded-lg',
			size === 'lg' && 'px-6 py-3 text-lg rounded-lg',

			fullWidth && 'w-full',
		]
			.filter(Boolean)
			.join(' ')
	);

	const actualDisabled = $derived(disabled || loading);
</script>

{#if href && !actualDisabled}
	<a {href} class={classes} {...restProps}>
		{#if loading}
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button {type} disabled={actualDisabled} class={classes} {onclick} {...restProps}>
		{#if loading}
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		{@render children?.()}
	</button>
{/if}
