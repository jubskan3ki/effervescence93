<!-- src/lib/components/common/Modal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let open = false;
	export let title = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let closeOnBackdrop = true;

	const dispatch = createEventDispatcher();

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
	};

	function handleClose() {
		dispatch('close');
	}

	function handleBackdropClick() {
		if (closeOnBackdrop) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open}
	<div class="modal-backdrop" transition:fade={{ duration: 200 }}>
		<div
			class="modal-container {sizeClasses[size]}"
			transition:scale={{ duration: 200, start: 0.95 }}
			on:click={handleBackdropClick}
			on:keydown={handleKeydown}
			on:keyup={(e) => {
				if (e.key === 'Enter') handleBackdropClick();
			}}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
			tabindex="0"
		>
			{#if title || $$slots.header}
				<div class="modal-header">
					{#if $$slots.header}
						<slot name="header" />
					{:else}
						<h2 id="modal-title" class="modal-title">{title}</h2>
					{/if}
					<button class="close-btn" on:click={handleClose} aria-label="Fermer">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<div class="modal-body">
				<slot />
			</div>

			{#if $$slots.footer}
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		@apply fixed inset-0 z-50 overflow-y-auto;
		@apply bg-black/50 backdrop-blur-sm;
		@apply flex items-center justify-center p-4;
	}

	.modal-container {
		@apply relative w-full bg-white rounded-xl shadow-xl;
		@apply flex flex-col max-h-[90vh];
	}

	.modal-header {
		@apply flex items-center justify-between p-6 border-b;
	}

	.modal-title {
		@apply text-xl font-semibold text-gray-900;
	}

	.close-btn {
		@apply p-2 rounded-lg hover:bg-gray-100 transition-colors;
		@apply text-gray-400 hover:text-gray-600;
	}

	.modal-body {
		@apply flex-1 p-6 overflow-y-auto;
	}

	.modal-footer {
		@apply flex items-center justify-end gap-3 p-6 border-t;
	}

	@media (max-width: 640px) {
		.modal-container {
			@apply max-h-full h-full rounded-none;
		}
	}
</style>
