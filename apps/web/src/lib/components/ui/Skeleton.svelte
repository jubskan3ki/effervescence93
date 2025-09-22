<!-- src/lib/components/ui/Skeleton.svelte -->
<script lang="ts">
	interface Props {
		variant?: 'text' | 'circular' | 'rectangular';
		width?: string;
		height?: string;
		animation?: boolean;
		children?: any;
	}

	let { variant = 'text', width = '', height = '', animation = true, children, ...restProps }: Props = $props();

	const classes = $derived(
		[
			'bg-gray-200',
			animation && 'animate-pulse',
			variant === 'text' && 'rounded',
			variant === 'circular' && 'rounded-full',
			variant === 'rectangular' && 'rounded-lg',
		]
			.filter(Boolean)
			.join(' ')
	);

	const style = $derived(
		[
			width && `width: ${width}`,
			height && `height: ${height}`,
			variant === 'text' && !height && 'height: 1em',
			variant === 'circular' && !width && 'width: 40px',
			variant === 'circular' && !height && 'height: 40px',
			variant === 'rectangular' && !height && 'height: 100px',
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

<div class={classes} {style} {...restProps}>
	<span class="invisible">
		{@render children?.()}
	</span>
</div>
