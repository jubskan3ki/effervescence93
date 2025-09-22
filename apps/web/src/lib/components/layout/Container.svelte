<!-- src/lib/components/layout/Container.svelte -->
<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		padding?: 'none' | 'sm' | 'md' | 'lg' | 'responsive';
		center?: boolean;
		class?: string;
		children?: any;
	}

	let { size = 'lg', padding = 'responsive', center = true, class: className = '', children }: Props = $props();

	const sizeClasses: Record<string, string> = {
		sm: 'max-w-2xl',
		md: 'max-w-4xl',
		lg: 'max-w-7xl',
		xl: 'max-w-screen-2xl',
		full: 'max-w-full',
	};

	const paddingClasses: Record<string, string> = {
		none: '',
		sm: 'px-4',
		md: 'px-6',
		lg: 'px-8',
		responsive: 'px-4 sm:px-6 lg:px-8',
	};

	const classes = $derived(
		['w-full', center && 'mx-auto', sizeClasses[size], paddingClasses[padding], className].filter(Boolean).join(' ')
	);
</script>

<div class={classes}>
	{@render children?.()}
</div>
