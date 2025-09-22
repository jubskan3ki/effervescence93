<!-- src/lib/components/shared/ErrorBoundary.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import Button from '../ui/Button.svelte';

	interface Props {
		fallback?: any;
		onError?: (error: Error, errorInfo: ErrorInfo) => void;
		resetKeys?: any[];
		resetOnPropsChange?: boolean;
		isolate?: boolean;
		children?: any;
	}

	interface ErrorInfo {
		componentStack: string;
		digest?: string;
	}

	let { fallback, onError, resetKeys = [], resetOnPropsChange = true, isolate = true, children }: Props = $props();

	let hasError = $state(false);
	let error = $state<Error | null>(null);
	let errorInfo = $state<ErrorInfo | null>(null);
	let errorBoundaryKey = $state(0);

	// Reset error boundary
	function resetErrorBoundary() {
		hasError = false;
		error = null;
		errorInfo = null;
		errorBoundaryKey++;
	}

	// Handle errors
	function handleError(err: Error, info?: ErrorInfo) {
		console.error('ErrorBoundary caught:', err);

		error = err;
		errorInfo = info || {
			componentStack: err.stack || 'No stack trace available',
		};
		hasError = true;

		// Call onError callback if provided
		onError?.(err, errorInfo);

		// Send error to analytics/monitoring service
		if (!dev && typeof window !== 'undefined') {
			sendErrorToService(err, errorInfo);
		}
	}

	// Send error to monitoring service
	async function sendErrorToService(err: Error, info: ErrorInfo) {
		try {
			await fetch('/api/errors', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: err.message,
					stack: err.stack,
					componentStack: info.componentStack,
					url: window.location.href,
					userAgent: navigator.userAgent,
					timestamp: new Date().toISOString(),
				}),
			});
		} catch (e) {
			console.error('Failed to send error to service:', e);
		}
	}

	// Watch for reset key changes
	$effect(() => {
		if (resetOnPropsChange && resetKeys.length > 0) {
			// Reset when resetKeys change
			resetKeys; // Access to trigger reactivity
			if (hasError) {
				resetErrorBoundary();
			}
		}
	});

	// Catch unhandled errors in child components
	onMount(() => {
		if (!isolate) return;

		const handleUnhandledError = (event: ErrorEvent) => {
			event.preventDefault();
			handleError(new Error(event.message));
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			event.preventDefault();
			handleError(new Error(event.reason));
		};

		window.addEventListener('error', handleUnhandledError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		return () => {
			window.removeEventListener('error', handleUnhandledError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	});
</script>

{#key errorBoundaryKey}
	{#if hasError}
		{#if fallback}
			{@render fallback({ error, resetErrorBoundary })}
		{:else}
			<div class="min-h-[400px] flex items-center justify-center p-6">
				<div class="max-w-md w-full">
					<div class="text-center">
						<svg
							class="mx-auto h-12 w-12 text-red-500 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>

						<h2 class="text-xl font-semibold text-gray-900 mb-2">Oops! Une erreur est survenue</h2>

						<p class="text-gray-600 mb-6">
							Nous nous excusons pour ce désagrément. L'erreur a été signalée et nous travaillons à la
							résoudre.
						</p>

						{#if dev && error}
							<details class="text-left mb-6 p-4 bg-gray-50 rounded-lg">
								<summary class="cursor-pointer text-sm font-medium text-gray-700">
									Détails de l'erreur (dev mode)
								</summary>
								<div class="mt-2 space-y-2">
									<div>
										<p class="text-xs font-semibold text-gray-700">Message:</p>
										<pre
											class="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">{error.message}</pre>
									</div>
									{#if error.stack}
										<div>
											<p class="text-xs font-semibold text-gray-700">Stack trace:</p>
											<pre
												class="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>
										</div>
									{/if}
									{#if errorInfo?.componentStack}
										<div>
											<p class="text-xs font-semibold text-gray-700">Component stack:</p>
											<pre
												class="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">{errorInfo.componentStack}</pre>
										</div>
									{/if}
								</div>
							</details>
						{/if}

						<div class="flex gap-3 justify-center">
							<Button variant="outline" onclick={() => window.location.reload()}>
								Rafraîchir la page
							</Button>
							<Button variant="primary" onclick={resetErrorBoundary}>Réessayer</Button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{:else}
		{@render children?.()}
	{/if}
{/key}
