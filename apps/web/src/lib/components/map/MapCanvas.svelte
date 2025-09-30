<!-- src/lib/components/map/MapCanvas.svelte -->
<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import type { Booth, Exhibitor } from '$lib/types';

	export let booths: Booth[] = [];
	export let exhibitors: Map<string, Exhibitor> = new Map();
	export let selectedBoothId: string | null = null;
	export let visibleBoothIds: Set<string> = new Set();
	export let favoritedBoothIds: Set<string> = new Set();
	export let hasActiveFilters: boolean = false;

	const dispatch = createEventDispatcher();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let floorplanImage: HTMLImageElement | null = null;
	let imageLoaded = false;
	let hoveredBooth: Booth | null = null;

	export let scale = 1;
	export let offsetX = 0;
	export let offsetY = 0;
	let targetScale = 1;
	let targetOffsetX = 0;
	let targetOffsetY = 0;

	let isDragging = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let animationFrame: number;

	let MAP_WIDTH = 1000;
	let MAP_HEIGHT = 800;
	const MIN_SCALE = 0.3;
	const MAX_SCALE = 4;

	onMount(() => {
		if (!browser) return;

		ctx = canvas.getContext('2d', {
			alpha: false,
			willReadFrequently: false,
		});

		loadFloorplan();
		resizeCanvas();
		startAnimation();

		window.addEventListener('resize', resizeCanvas);
		console.log('🎨 MapCanvas mounted');
	});

	onDestroy(() => {
		if (!browser) return;
		if (animationFrame) cancelAnimationFrame(animationFrame);
		window.removeEventListener('resize', resizeCanvas);
	});

	function loadFloorplan() {
		floorplanImage = new Image();
		floorplanImage.onload = () => {
			imageLoaded = true;
			MAP_WIDTH = floorplanImage!.width;
			MAP_HEIGHT = floorplanImage!.height;
			console.log('🖼️ Floorplan loaded:', MAP_WIDTH, 'x', MAP_HEIGHT);
			centerView();
		};
		floorplanImage.onerror = () => {
			console.error('❌ Failed to load floorplan');
			imageLoaded = false;
			MAP_WIDTH = 1000;
			MAP_HEIGHT = 800;
			centerView();
		};
		floorplanImage.src = '/floorplan.png';
	}

	function resizeCanvas() {
		if (!canvas || !browser) return;
		const parent = canvas.parentElement;
		if (parent) {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = parent.clientWidth * dpr;
			canvas.height = parent.clientHeight * dpr;
			canvas.style.width = parent.clientWidth + 'px';
			canvas.style.height = parent.clientHeight + 'px';

			if (ctx) {
				ctx.scale(dpr, dpr);
			}
		}
	}

	function centerView() {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = rect.width / MAP_WIDTH;
		const scaleY = rect.height / MAP_HEIGHT;
		targetScale = scale = Math.min(scaleX, scaleY) * 0.85;
		targetOffsetX = offsetX = (rect.width - MAP_WIDTH * scale) / 2;
		targetOffsetY = offsetY = (rect.height - MAP_HEIGHT * scale) / 2;
	}

	function startAnimation() {
		function animate() {
			scale += (targetScale - scale) * 0.1;
			offsetX += (targetOffsetX - offsetX) * 0.1;
			offsetY += (targetOffsetY - offsetY) * 0.1;
			render();
			animationFrame = requestAnimationFrame(animate);
		}
		animate();
	}

	function render() {
		if (!ctx || !canvas) return;

		const rect = canvas.getBoundingClientRect();

		// Background
		ctx.fillStyle = '#fafafa';
		ctx.fillRect(0, 0, rect.width, rect.height);

		ctx.save();
		ctx.translate(offsetX, offsetY);
		ctx.scale(scale, scale);

		// Draw floorplan
		if (imageLoaded && floorplanImage) {
			ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
			ctx.shadowBlur = 15;
			ctx.shadowOffsetY = 5;
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(-5, -5, MAP_WIDTH + 10, MAP_HEIGHT + 10);
			ctx.shadowBlur = 0;
			ctx.globalAlpha = 0.98;
			ctx.drawImage(floorplanImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
			ctx.globalAlpha = 1;
		} else {
			// Fallback grid
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
			ctx.strokeStyle = '#f3f4f6';
			ctx.lineWidth = 1;

			for (let x = 0; x <= MAP_WIDTH; x += 50) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, MAP_HEIGHT);
				ctx.stroke();
			}

			for (let y = 0; y <= MAP_HEIGHT; y += 50) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(MAP_WIDTH, y);
				ctx.stroke();
			}
		}

		// Draw booths
		booths.forEach((booth) => {
			const exhibitor = booth.exhibitor || exhibitors.get(booth.id);
			const isSelected = booth.id === selectedBoothId;
			const isFavorite = !!(exhibitor && favoritedBoothIds.has(booth.id));
			const isHovered = hoveredBooth?.id === booth.id;
			const isVisible = !hasActiveFilters || visibleBoothIds.has(booth.id);

			if (isVisible) {
				drawBooth(booth, exhibitor, { isSelected, isFavorite, isHovered });
			} else {
				drawFilteredBooth(booth);
			}
		});

		ctx.restore();

		if (hoveredBooth && scale > 0.6) {
			drawTooltip(hoveredBooth);
		}
	}

	function drawFilteredBooth(booth: Booth) {
		if (!ctx) return;

		ctx.save();
		ctx.translate(booth.x, booth.y);

		const width = booth.width || 50;
		const height = booth.height || 50;
		const radius = Math.min(width, height) / 2;

		// Cercle grisé
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.strokeStyle = '#e5e7eb';
		ctx.lineWidth = 1;
		ctx.stroke();

		// Numéro du stand
		if (scale > 0.8) {
			const fontSize = Math.max(9, Math.min(11, 11 / scale));
			ctx.font = `${fontSize}px system-ui`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#9ca3af';
			ctx.fillText(booth.number, 0, 0);
		}

		ctx.restore();
	}

	function drawBooth(
		booth: Booth,
		exhibitor: Exhibitor | undefined,
		state: { isSelected: boolean; isFavorite: boolean; isHovered: boolean }
	) {
		if (!ctx) return;

		ctx.save();
		ctx.translate(booth.x, booth.y);

		const width = booth.width || 50;
		const height = booth.height || 50;
		const baseRadius = Math.min(width, height) / 2;
		const radius = state.isHovered ? baseRadius * 1.08 : baseRadius;

		// Selection ring minimaliste
		if (state.isSelected) {
			ctx.strokeStyle = '#111827';
			ctx.lineWidth = 2;
			ctx.globalAlpha = 0.8;
			ctx.beginPath();
			ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = 1;
		}

		// Shadow très subtile
		if (state.isHovered || exhibitor) {
			ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
			ctx.shadowBlur = state.isHovered ? 8 : 4;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 1;
		}

		// Cercle principal
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2);

		if (exhibitor) {
			const color = exhibitor.sector?.colorHex || '#9ca3af';
			ctx.fillStyle = color;
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 1;
			ctx.stroke();
		} else {
			ctx.fillStyle = '#ffffff';
			ctx.fill();
			ctx.strokeStyle = '#e5e7eb';
			ctx.lineWidth = 1;
			ctx.stroke();
		}

		ctx.shadowBlur = 0;

		// Favorite badge épuré
		if (state.isFavorite) {
			ctx.save();
			const badgeOffset = radius * 0.7;
			ctx.translate(badgeOffset, -badgeOffset);

			ctx.fillStyle = '#fbbf24';
			ctx.beginPath();
			ctx.arc(0, 0, 7, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 9px system-ui';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('★', 0, 0);
			ctx.restore();
		}

		// Numéro du stand
		if (scale > 0.5) {
			const fontSize = Math.max(10, Math.min(13, 13 / scale));
			ctx.font = `500 ${fontSize}px system-ui`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			if (exhibitor) {
				ctx.fillStyle = '#ffffff';
				ctx.fillText(booth.number, 0, 0);
			} else {
				ctx.fillStyle = '#9ca3af';
				ctx.fillText(booth.number, 0, 0);
			}
		}

		ctx.restore();
	}

	function drawTooltip(booth: Booth) {
		if (!ctx || !canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = booth.x * scale + offsetX;
		const y = booth.y * scale + offsetY - 45;

		ctx.save();
		ctx.resetTransform();

		const exhibitor = booth.exhibitor || exhibitors.get(booth.id);
		const text = exhibitor ? exhibitor.name : `Stand ${booth.number}`;
		const subtext = exhibitor?.sector?.name;

		ctx.font = '500 13px system-ui';
		const textWidth = ctx.measureText(text).width;
		const padding = 12;
		const width = textWidth + padding * 2;
		const height = subtext ? 44 : 32;

		const tooltipX = Math.max(padding, Math.min(rect.width - width - padding, x - width / 2));
		const tooltipY = y - height / 2;

		// Shadow subtile
		ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetY = 2;

		// Background
		ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
		ctx.beginPath();
		ctx.roundRect(tooltipX, tooltipY, width, height, 6);
		ctx.fill();
		ctx.shadowBlur = 0;

		// Text
		ctx.fillStyle = '#ffffff';
		ctx.font = '500 13px system-ui';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, tooltipX + width / 2, tooltipY + (subtext ? 15 : height / 2));

		if (subtext) {
			ctx.fillStyle = '#d1d5db';
			ctx.font = '400 11px system-ui';
			ctx.fillText(subtext, tooltipX + width / 2, tooltipY + 30);
		}

		ctx.restore();
	}

	function darkenColor(color: string, percent: number): string {
		const num = parseInt(color.slice(1), 16);
		const amt = Math.round(2.55 * percent);
		const R = Math.max(0, (num >> 16) - amt);
		const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
		const B = Math.max(0, (num & 0x0000ff) - amt);
		return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
	}

	function getBoothAtPosition(clientX: number, clientY: number): Booth | null {
		if (!canvas) return null;

		const rect = canvas.getBoundingClientRect();
		const x = (clientX - rect.left - offsetX) / scale;
		const y = (clientY - rect.top - offsetY) / scale;

		for (const booth of booths) {
			if (hasActiveFilters && !visibleBoothIds.has(booth.id)) {
				continue;
			}

			const width = booth.width || 50;
			const height = booth.height || 50;
			const radius = Math.min(width, height) / 2;

			const dx = x - booth.x;
			const dy = y - booth.y;

			if (dx * dx + dy * dy <= radius * radius) {
				return booth;
			}
		}
		return null;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			targetOffsetX = e.clientX - dragStartX;
			targetOffsetY = e.clientY - dragStartY;
		} else {
			const booth = getBoothAtPosition(e.clientX, e.clientY);
			if (booth !== hoveredBooth) {
				hoveredBooth = booth;
			}
			if (canvas) {
				canvas.style.cursor = booth ? 'pointer' : 'grab';
			}
		}
	}

	function handleMouseDown(e: MouseEvent) {
		const booth = getBoothAtPosition(e.clientX, e.clientY);
		if (booth) {
			dispatch('boothClick', booth);
		} else {
			isDragging = true;
			dragStartX = e.clientX - offsetX;
			dragStartY = e.clientY - offsetY;
			if (canvas) canvas.style.cursor = 'grabbing';
		}
	}

	function handleMouseUp() {
		isDragging = false;
		offsetX = targetOffsetX;
		offsetY = targetOffsetY;
		if (canvas) {
			canvas.style.cursor = hoveredBooth ? 'pointer' : 'grab';
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));

		const scaleRatio = newScale / scale;
		targetOffsetX = mouseX - (mouseX - offsetX) * scaleRatio;
		targetOffsetY = mouseY - (mouseY - offsetY) * scaleRatio;
		targetScale = newScale;

		offsetX = targetOffsetX;
		offsetY = targetOffsetY;
		scale = targetScale;
	}

	let touches: TouchList | null = null;
	let lastDistance = 0;

	function handleTouchStart(e: TouchEvent) {
		touches = e.touches;
		if (touches.length === 1) {
			const booth = getBoothAtPosition(touches[0].clientX, touches[0].clientY);
			if (booth) {
				dispatch('boothClick', booth);
			} else {
				isDragging = true;
				dragStartX = touches[0].clientX - offsetX;
				dragStartY = touches[0].clientY - offsetY;
			}
		} else if (touches.length === 2) {
			isDragging = false;
			const dx = touches[0].clientX - touches[1].clientX;
			const dy = touches[0].clientY - touches[1].clientY;
			lastDistance = Math.sqrt(dx * dx + dy * dy);
		}
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		touches = e.touches;

		if (touches.length === 1 && isDragging) {
			targetOffsetX = touches[0].clientX - dragStartX;
			targetOffsetY = touches[0].clientY - dragStartY;
		} else if (touches.length === 2) {
			const dx = touches[0].clientX - touches[1].clientX;
			const dy = touches[0].clientY - touches[1].clientY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (lastDistance > 0) {
				const delta = distance / lastDistance;
				targetScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));
			}
			lastDistance = distance;
		}
	}

	function handleTouchEnd() {
		isDragging = false;
		touches = null;
		lastDistance = 0;
		offsetX = targetOffsetX;
		offsetY = targetOffsetY;
		scale = targetScale;
	}

	export function zoomIn() {
		targetScale = Math.min(MAX_SCALE, scale * 1.3);
	}

	export function zoomOut() {
		targetScale = Math.max(MIN_SCALE, scale * 0.7);
	}

	export function resetView() {
		centerView();
	}

	export function centerOnBooth(boothId: string) {
		const booth = booths.find((b) => b.id === boothId);
		if (!booth || !canvas) return;

		const rect = canvas.getBoundingClientRect();
		targetScale = 1.8;
		targetOffsetX = rect.width / 2 - booth.x * targetScale;
		targetOffsetY = rect.height / 2 - booth.y * targetScale;
	}
</script>

{#if browser}
	<canvas
		bind:this={canvas}
		on:wheel={handleWheel}
		on:mousedown={handleMouseDown}
		on:mousemove={handleMouseMove}
		on:mouseup={handleMouseUp}
		on:mouseleave={() => {
			isDragging = false;
			hoveredBooth = null;
		}}
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
	/>
{:else}
	<div class="loading">
		<div class="spinner"></div>
		<p>Chargement de la carte...</p>
	</div>
{/if}

<style>
	canvas {
		width: 100%;
		height: 100%;
		cursor: grab;
		touch-action: none;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		gap: 20px;
		background: #fafafa;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #f3f4f6;
		border-top: 3px solid #111827;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	p {
		color: #6b7280;
		font-size: 14px;
		font-weight: 500;
	}
</style>
