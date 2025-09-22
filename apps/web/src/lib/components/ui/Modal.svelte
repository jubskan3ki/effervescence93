<!-- src/lib/components/ui/Modal.svelte -->
<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	interface Props {
		open?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		showClose?: boolean;
		onclose?: () => void;
		children?: any;
		footer?: any;
	}

	let {
		open = $bindable(false),
		title = '',
		size = 'md',
		closeOnOutsideClick = true,
		closeOnEscape = true,
		showClose = true,
		onclose,
		children,
		footer,
	}: Props = $props();

	const sizes: Record<string, string> = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
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

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = open ? 'hidden' : '';
		}

		return () => {
			if (typeof document !== 'undefined') {
				document.body.style.overflow = '';
			}
		};
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<div class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
			<!-- Background overlay -->
			<button
				type="button"
				transition:fade={{ duration: 200 }}
				class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
				aria-label="Fermer la fenêtre modale"
				onclick={handleOutsideClick}
				tabindex="-1"
			></button>

			<!-- Modal panel -->
			<span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

			<div
				transition:scale={{ duration: 200, start: 0.95 }}
				class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:align-middle {sizes[
					size
				]}"
				role="presentation"
				onclick={(e) => e.stopPropagation()}
			>
				{#if title || showClose}
					<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
						{#if title}
							<h3 id="modal-title" class="text-lg font-semibold text-gray-900">
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

				<div class="px-6 py-4">
					{@render children?.()}
				</div>

				{#if footer}
					<div class="border-t border-gray-200 px-6 py-4">
						{@render footer()}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
