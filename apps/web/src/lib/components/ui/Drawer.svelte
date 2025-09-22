<!-- src/lib/components/ui/Drawer.svelte -->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	interface Props {
		open?: boolean;
		position?: 'left' | 'right' | 'top' | 'bottom';
		size?: 'sm' | 'md' | 'lg';
		title?: string;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		showClose?: boolean;
		onclose?: () => void;
		children?: any;
		footer?: any;
	}

	let {
		open = $bindable(false),
		position = 'right',
		size = 'md',
		title = '',
		closeOnOutsideClick = true,
		closeOnEscape = true,
		showClose = true,
		onclose,
		children,
		footer,
	}: Props = $props();

	const sizes: Record<string, string> = {
		sm: position === 'left' || position === 'right' ? 'w-64' : 'h-64',
		md: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
		lg: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
	};

	const positions: Record<string, string> = {
		left: 'left-0 top-0 h-full',
		right: 'right-0 top-0 h-full',
		top: 'top-0 left-0 w-full',
		bottom: 'bottom-0 left-0 w-full',
	};

	const transitions: Record<string, { x?: number; y?: number; duration: number }> = {
		left: { x: -320, duration: 300 },
		right: { x: 320, duration: 300 },
		top: { y: -320, duration: 300 },
		bottom: { y: 320, duration: 300 },
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && closeOnEscape) {
			close();
		}
	}

	function handleOutsideClick() {
		if (closeOnOutsideClick) {
			close();
		}
	}

	function close() {
		open = false;
		onclose?.();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50" role="dialog" aria-modal="true" tabindex="-1" onkeydown={handleKeydown}>
		<!-- Backdrop -->
		<button
			type="button"
			transition:fade={{ duration: 200 }}
			class="fixed inset-0 bg-gray-900 bg-opacity-50"
			onclick={handleOutsideClick}
			tabindex="-1"
			aria-label="Fermer"
		></button>

		<!-- Drawer -->
		<div
			transition:fly={transitions[position]}
			class="fixed {positions[position]} {sizes[size]} bg-white shadow-xl"
		>
			{#if title || showClose}
				<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
					{#if title}
						<h3 class="text-lg font-semibold text-gray-900">
							{title}
						</h3>
					{/if}

					{#if showClose}
						<button
							type="button"
							class="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
							onclick={close}
							aria-label="Fermer"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					{/if}
				</div>
			{/if}

			<div class="flex-1 overflow-y-auto p-6">
				{@render children?.()}
			</div>

			{#if footer}
				<div class="border-t border-gray-200 px-6 py-4">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
