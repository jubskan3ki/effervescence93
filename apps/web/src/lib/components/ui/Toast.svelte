<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface Props {
		type?: 'success' | 'error' | 'info' | 'warning';
		message?: string;
		duration?: number;
		dismissible?: boolean;
		onclose?: () => void;
	}

	let { type = 'info', message = '', duration = 5000, dismissible = true, onclose }: Props = $props();

	const icons: Record<string, string> = {
		success: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>`,
		error: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>`,
		warning: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
		</svg>`,
		info: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>`,
	};

	const colors: Record<string, string> = {
		success: 'bg-green-50 text-green-800 border-green-200',
		error: 'bg-red-50 text-red-800 border-red-200',
		warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
		info: 'bg-blue-50 text-blue-800 border-blue-200',
	};

	function close() {
		onclose?.();
	}

	onMount(() => {
		if (duration > 0) {
			const timeout = setTimeout(close, duration);
			return () => clearTimeout(timeout);
		}
	});
</script>

<div
	transition:fly={{ y: -20, duration: 300 }}
	class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border {colors[type]} shadow-lg"
>
	<div class="p-4">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				{@html icons[type]}
			</div>
			<div class="ml-3 w-0 flex-1">
				<p class="text-sm font-medium">
					{message}
				</p>
			</div>
			{#if dismissible}
				<button
					type="button"
					class="ml-4 inline-flex flex-shrink-0 rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
					onclick={close}
				>
					<span class="sr-only">Fermer</span>
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
	</div>
</div>
