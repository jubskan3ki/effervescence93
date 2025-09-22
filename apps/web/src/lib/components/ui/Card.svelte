<!-- src/lib/components/ui/Card.svelte -->
<script lang="ts">
	interface Props {
		hoverable?: boolean;
		clickable?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		onclick?: (e: MouseEvent) => void;
		children?: any;
		header?: any;
		footer?: any;
	}

	let {
		hoverable = false,
		clickable = false,
		padding = 'md',
		onclick,
		children,
		header,
		footer,
		...restProps
	}: Props = $props();

	const classes = $derived(
		[
			'rounded-lg border border-gray-200 bg-white shadow-sm',
			hoverable && 'transition-shadow duration-200 hover:shadow-lg',
			clickable && 'cursor-pointer',
		]
			.filter(Boolean)
			.join(' ')
	);

	const paddingClasses: Record<string, string> = {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6',
	};
</script>

<div class={classes} {onclick} {...restProps}>
	{#if header}
		<div class="border-b border-gray-200 px-6 py-4">
			{@render header()}
		</div>
	{/if}

	<div class={paddingClasses[padding]}>
		{@render children?.()}
	</div>

	{#if footer}
		<div class="border-t border-gray-200 px-6 py-4">
			{@render footer()}
		</div>
	{/if}
</div>
