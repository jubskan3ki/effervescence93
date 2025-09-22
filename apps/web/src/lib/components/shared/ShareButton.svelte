<!-- src/lib/components/shared/ShareButton.svelte -->
<script lang="ts">
	import { uiStore } from '@stores/ui';

	interface Props {
		title?: string;
		text?: string;
		url?: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'icon' | 'button';
		showLabel?: boolean;
	}

	let {
		title = 'Effervescence 93 - Plan interactif',
		text = '',
		url = '',
		size = 'md',
		variant = 'icon',
		showLabel = false,
	}: Props = $props();

	const sizes = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	const buttonSizes = {
		sm: 'px-2 py-1 text-sm',
		md: 'px-3 py-1.5 text-base',
		lg: 'px-4 py-2 text-lg',
	};

	// Use current URL if not provided
	const shareUrl = $derived(url || (typeof window !== 'undefined' ? window.location.href : ''));

	async function handleShare() {
		// Check if Web Share API is available
		if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
			const shareData = {
				title,
				text: text || `Découvrez ${title}`,
				url: shareUrl,
			};

			// Check if the share data is valid
			if (navigator.canShare(shareData)) {
				try {
					await navigator.share(shareData);
					uiStore.toast.success('Partagé avec succès');
				} catch (err) {
					// User cancelled or error
					if ((err as Error).name !== 'AbortError') {
						console.error('Erreur lors du partage:', err);
						fallbackShare();
					}
				}
			} else {
				fallbackShare();
			}
		} else {
			fallbackShare();
		}
	}

	function fallbackShare() {
		// Fallback: copy to clipboard
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard
				.writeText(shareUrl)
				.then(() => {
					uiStore.toast.success('Lien copié dans le presse-papier');
				})
				.catch((err) => {
					console.error('Erreur lors de la copie:', err);
					uiStore.toast.error('Impossible de copier le lien');
				});
		} else {
			// Final fallback: select and copy manually
			const textArea = document.createElement('textarea');
			textArea.value = shareUrl;
			textArea.style.position = 'fixed';
			textArea.style.opacity = '0';
			document.body.appendChild(textArea);
			textArea.select();

			try {
				document.execCommand('copy');
				uiStore.toast.success('Lien copié dans le presse-papier');
			} catch (err) {
				console.error('Erreur lors de la copie:', err);
				uiStore.toast.error('Impossible de copier le lien');
			}

			document.body.removeChild(textArea);
		}
	}
</script>

{#if variant === 'icon'}
	<button
		type="button"
		onclick={handleShare}
		class="inline-flex items-center justify-center rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
		aria-label="Partager"
		title="Partager"
	>
		<svg class="{sizes[size]} text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m0 0a3 3 0 00-2.684 0m2.684 0a3 3 0 00-1.316-.684M15 9c0 .482-.114.938-.316 1.342M8.684 13.342a3 3 0 001.316.684m0 0a3 3 0 001.316-.684M15 9a3 3 0 10-6 0 3 3 0 006 0z"
			/>
			<circle cx="18" cy="5" r="3" />
			<circle cx="6" cy="12" r="3" />
			<circle cx="18" cy="19" r="3" />
			<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
			<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
		</svg>
		{#if showLabel}
			<span class="ml-2 text-gray-700">Partager</span>
		{/if}
	</button>
{:else}
	<button
		type="button"
		onclick={handleShare}
		class="inline-flex items-center rounded-lg border border-gray-300 bg-white {buttonSizes[
			size
		]} font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
	>
		<svg class="{sizes[size]} mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m0 0a3 3 0 00-2.684 0m2.684 0a3 3 0 00-1.316-.684M15 9c0 .482-.114.938-.316 1.342M8.684 13.342a3 3 0 001.316.684m0 0a3 3 0 001.316-.684M15 9a3 3 0 10-6 0 3 3 0 006 0z"
			/>
			<circle cx="18" cy="5" r="3" />
			<circle cx="6" cy="12" r="3" />
			<circle cx="18" cy="19" r="3" />
			<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
			<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
		</svg>
		Partager
	</button>
{/if}
