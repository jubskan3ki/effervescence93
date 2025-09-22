<!-- src/lib/components/shared/QRCode.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import QRCodeLib from 'qrcode';

	interface Props {
		value: string;
		size?: number;
		level?: 'L' | 'M' | 'Q' | 'H';
		margin?: number;
		darkColor?: string;
		lightColor?: string;
		logo?: string;
		logoSize?: number;
		downloadable?: boolean;
		downloadFilename?: string;
	}

	let {
		value,
		size = 200,
		level = 'M',
		margin = 2,
		darkColor = '#000000',
		lightColor = '#FFFFFF',
		logo = '',
		logoSize = 40,
		downloadable = false,
		downloadFilename = 'qrcode',
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let imageUrl = $state('');
	let isGenerating = $state(false);
	let error = $state('');

	async function generateQRCode() {
		if (!canvas || !value) return;

		isGenerating = true;
		error = '';

		try {
			// Generate QR code
			await QRCodeLib.toCanvas(canvas, value, {
				width: size,
				margin: margin,
				errorCorrectionLevel: level,
				color: {
					dark: darkColor,
					light: lightColor,
				},
			});

			// Add logo if provided
			if (logo && canvas) {
				const ctx = canvas.getContext('2d');
				if (ctx) {
					const img = new Image();
					img.crossOrigin = 'anonymous';

					await new Promise((resolve, reject) => {
						img.onload = () => {
							// Calculate logo position (center)
							const logoX = (size - logoSize) / 2;
							const logoY = (size - logoSize) / 2;

							// Create white background for logo
							ctx.fillStyle = lightColor;
							ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

							// Draw logo
							ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
							resolve(true);
						};
						img.onerror = reject;
						img.src = logo;
					});
				}
			}

			// Convert to data URL for download
			imageUrl = canvas.toDataURL('image/png');
		} catch (err) {
			console.error('Erreur lors de la génération du QR code:', err);
			error = 'Impossible de générer le QR code';
		} finally {
			isGenerating = false;
		}
	}

	function downloadQRCode() {
		if (!imageUrl) return;

		const link = document.createElement('a');
		link.download = `${downloadFilename}.png`;
		link.href = imageUrl;
		link.click();
	}

	// Regenerate when props change
	$effect(() => {
		if (canvas) {
			generateQRCode();
		}
	});

	onMount(() => {
		generateQRCode();
	});
</script>

<div class="inline-flex flex-col items-center gap-4">
	<div class="relative">
		{#if isGenerating}
			<div
				class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg"
				style="width: {size}px; height: {size}px;"
			>
				<div class="flex items-center gap-2">
					<svg class="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span class="text-sm text-gray-600">Génération...</span>
				</div>
			</div>
		{/if}

		<canvas bind:this={canvas} width={size} height={size} class="block rounded-lg shadow-sm border border-gray-200"
		></canvas>

		{#if error}
			<div class="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
				<div class="text-center p-4">
					<svg class="mx-auto h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p class="mt-2 text-sm text-red-600">{error}</p>
				</div>
			</div>
		{/if}
	</div>

	{#if downloadable && !isGenerating && !error}
		<button
			type="button"
			onclick={downloadQRCode}
			class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
		>
			<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			Télécharger
		</button>
	{/if}
</div>

<style>
	canvas {
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
	}
</style>
