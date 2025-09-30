<!-- src/lib/components/common/Loading.svelte -->
<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let message = '';
	export let fullscreen = false;
	export let overlay = false;

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16',
	};
</script>

<div class="loading-container" class:fullscreen class:overlay>
	<div class="loading-content">
		<svg class="spinner {sizeClasses[size]}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>

		{#if message}
			<p class="loading-message">{message}</p>
		{/if}
	</div>
</div>

<style>
	.loading-container {
		@apply flex items-center justify-center p-8;
	}

	.loading-container.fullscreen {
		@apply fixed inset-0 z-50 bg-white;
	}

	.loading-container.overlay {
		@apply absolute inset-0 z-30 bg-white/80 backdrop-blur-sm;
	}

	.loading-content {
		@apply flex flex-col items-center gap-4;
	}

	.spinner {
		@apply animate-spin text-primary;
	}

	.loading-message {
		@apply text-sm text-gray-600 animate-pulse;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
