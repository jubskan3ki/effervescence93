<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createQuery } from '@tanstack/svelte-query';

	import MapCanvas from '$lib/components/map/MapCanvas.svelte';
	import MapControls from '$lib/components/map/MapControls.svelte';
	import MapSearch from '$lib/components/map/MapSearch.svelte';
	import Legend from '$lib/components/map/Legend.svelte';
	import BoothPopup from '$lib/components/map/BoothPopup.svelte';
	import Loading from '$lib/components/common/Loading.svelte';

	import { ui } from '$lib/stores/ui';
	import { favoriteIds, favorites } from '$lib/stores/favorites';
	import { analytics } from '$lib/api/analytics';
	import * as api from '$lib/api';

	import type { Booth, Exhibitor } from '$lib/types';

	let mapCanvas: MapCanvas;
	let selectedBooth: Booth | null = null;
	let selectedExhibitor: Exhibitor | null = null;
	let windowWidth = 0;

	let visibleBoothIds = new Set<string>();
	let filteredExhibitors: Exhibitor[] = [];

	const boothsQuery = createQuery({
		queryKey: ['booths'],
		queryFn: async () => {
			const booths = await api.booths.list();
			console.log('📍 Booths loaded:', booths.length);
			return booths;
		},
		staleTime: 5 * 60 * 1000,
	});

	const allExhibitorsQuery = createQuery({
		queryKey: ['all-exhibitors'],
		queryFn: async () => {
			console.log('👥 Loading ALL exhibitors...');
			const exhibitorsList = await api.exhibitors.listAll();
			console.log('✅ All exhibitors loaded:', exhibitorsList.length);

			if (exhibitorsList.length > 0) {
				await favorites.loadFavoritesData(exhibitorsList);
			}

			return exhibitorsList;
		},
		staleTime: 5 * 60 * 1000,
	});

	const sectorsQuery = createQuery({
		queryKey: ['sectors'],
		queryFn: async () => {
			const sectors = await api.sectors.list();
			console.log('🏢 Sectors loaded:', sectors.length);
			return sectors;
		},
		staleTime: 10 * 60 * 1000,
	});

	$: exhibitorsByBoothId = (() => {
		const map = new Map<string, Exhibitor>();
		const allExhibitors = $allExhibitorsQuery.data || [];

		allExhibitors.forEach((exhibitor: Exhibitor) => {
			if (exhibitor.booth?.id) {
				map.set(exhibitor.booth.id, exhibitor);
			} else if (exhibitor.boothId) {
				map.set(exhibitor.boothId, exhibitor);
			}
		});

		return map;
	})();

	$: enrichedBooths = (() => {
		const booths = $boothsQuery.data || [];
		const allExhibitors = $allExhibitorsQuery.data || [];

		const enriched = booths.map((booth) => {
			let exhibitor = exhibitorsByBoothId.get(booth.id);

			if (!exhibitor) {
				exhibitor = allExhibitors.find(
					(e) => e.boothId === booth.id || e.booth?.id === booth.id || booth.exhibitorId === e.id
				);
			}

			if (!exhibitor && booth.exhibitor) {
				exhibitor = booth.exhibitor;
			}

			return { ...booth, exhibitor };
		});

		return enriched;
	})();

	$: favoritedBoothIds = (() => {
		const set = new Set<string>();
		const allExhibitors = $allExhibitorsQuery.data || [];

		Array.from($favoriteIds).forEach((favId) => {
			const exhibitor = allExhibitors.find((e: Exhibitor) => e.id === favId);
			if (exhibitor?.booth?.id) {
				set.add(exhibitor.booth.id);
			} else if (exhibitor?.boothId) {
				set.add(exhibitor.boothId);
			}
		});

		return set;
	})();

	function handleFilterChange(event: CustomEvent) {
		const { results, visibleBoothIds: newVisibleIds } = event.detail;
		filteredExhibitors = results;
		visibleBoothIds = newVisibleIds;
	}

	$: isMobile = windowWidth < 768;
	$: isTablet = windowWidth >= 768 && windowWidth < 1024;
	$: currentScale = mapCanvas?.scale || 1;

	onMount(async () => {
		console.log('🚀 Map page mounted');
		await favorites.init();

		const params = $page.url.searchParams;
		const boothNumber = params.get('stand');

		if (boothNumber && $boothsQuery.data) {
			setTimeout(() => {
				const booth = enrichedBooths.find((b) => b.number === boothNumber);
				if (booth) {
					handleBoothClick({ detail: booth } as CustomEvent<Booth>);
					mapCanvas?.centerOnBooth(booth.id);
				}
			}, 500);
		}
	});

	function handleBoothClick(event: CustomEvent<Booth>) {
		const booth = event.detail;
		const exhibitor = exhibitorsByBoothId.get(booth.id) || booth.exhibitor;

		selectedBooth = booth;
		selectedExhibitor = exhibitor || null;

		if (exhibitor) {
			analytics.trackView(exhibitor.id, 'map');
		}
	}

	function handleClosePopup() {
		selectedBooth = null;
		selectedExhibitor = null;
	}

	function handleViewDetails(event: CustomEvent<Exhibitor>) {
		const exhibitor = event.detail;
		goto(`/exposant/${exhibitor.slug}`);
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
	<title>Plan interactif - Effervescence 93</title>
	<meta name="description" content="Découvrez le plan interactif du salon Effervescence 93" />
</svelte:head>

<div class="map-page">
	{#if $boothsQuery.isLoading || $allExhibitorsQuery.isLoading || $sectorsQuery.isLoading}
		<Loading fullscreen message="Chargement du plan..." />
	{:else if $boothsQuery.error}
		<div class="error-container">
			<div class="error-card">
				<div class="error-icon">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h2>Erreur de chargement</h2>
				<p>Impossible de charger le plan du salon</p>
				<button class="retry-btn" on:click={() => location.reload()}> Réessayer </button>
			</div>
		</div>
	{:else}
		<div class="map-canvas">
			<MapCanvas
				bind:this={mapCanvas}
				booths={enrichedBooths}
				exhibitors={exhibitorsByBoothId}
				selectedBoothId={selectedBooth?.id}
				{visibleBoothIds}
				{favoritedBoothIds}
				hasActiveFilters={visibleBoothIds.size > 0}
				on:boothClick={handleBoothClick}
			/>
		</div>

		{#if $ui.showFilters}
			<div class="search-container" class:mobile={isMobile}>
				<MapSearch
					sectors={$sectorsQuery.data || []}
					exhibitors={$allExhibitorsQuery.data || []}
					booths={$boothsQuery.data || []}
					on:filterChange={handleFilterChange}
				/>
			</div>
		{/if}

		<div class="controls-container" class:mobile={isMobile} class:tablet={isTablet}>
			<MapControls
				scale={currentScale}
				on:zoomIn={() => mapCanvas?.zoomIn()}
				on:zoomOut={() => mapCanvas?.zoomOut()}
				on:resetView={() => mapCanvas?.resetView()}
			/>
		</div>

		{#if $ui.showLegend}
			<div class="legend-container" class:mobile={isMobile} class:tablet={isTablet}>
				<Legend
					sectors={$sectorsQuery.data || []}
					exhibitors={$allExhibitorsQuery.data || []}
					booths={$boothsQuery.data || []}
				/>
			</div>
		{/if}

		{#if selectedBooth}
			<BoothPopup
				booth={selectedBooth}
				exhibitor={selectedExhibitor}
				on:close={handleClosePopup}
				on:viewExhibitor={handleViewDetails}
			/>
		{/if}
	{/if}
</div>

<style>
	.map-page {
		position: fixed;
		inset: 0;
		background: #fafafa;
		overflow: hidden;
	}

	.map-canvas {
		position: absolute;
		inset: 0;
	}

	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 24px;
	}

	.error-card {
		background: white;
		padding: 48px 32px;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		text-align: center;
		max-width: 360px;
		border: 1px solid #e5e7eb;
	}

	.error-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 24px;
		background: #fef2f2;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ef4444;
	}

	.error-card h2 {
		margin: 0 0 8px 0;
		font-size: 20px;
		font-weight: 600;
		color: #111827;
	}

	.error-card p {
		margin: 0 0 24px 0;
		color: #6b7280;
		font-size: 14px;
	}

	.retry-btn {
		padding: 10px 24px;
		background: #111827;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.retry-btn:hover {
		background: #1f2937;
		transform: translateY(-1px);
	}

	/* Search Bar */
	.search-container {
		position: absolute;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 32px);
		max-width: 640px;
		z-index: 30;
	}

	/* Desktop: Controls en haut à droite */
	.controls-container {
		position: absolute;
		right: 16px;
		top: 16px;
		z-index: 20;
	}

	/* Desktop: Legend en haut à gauche */
	.legend-container {
		position: absolute;
		left: 16px;
		top: 90px;
		z-index: 20;
		max-width: 280px;
	}

	/* Tablet: Ajustements */
	@media (min-width: 768px) and (max-width: 1023px) {
		.controls-container.tablet {
			right: 12px;
			top: 12px;
		}

		.legend-container.tablet {
			left: 12px;
			top: 80px;
			max-width: 260px;
		}
	}

	/* Mobile: Layout avec navbar flottante en bas */
	@media (max-width: 767px) {
		.search-container.mobile {
			top: 12px;
			width: calc(100% - 24px);
		}

		/* Controls juste au-dessus de la navbar */
		.controls-container.mobile {
			right: 12px;
			top: auto;
			bottom: 94px;
		}

		/* Legend à gauche des controls */
		.legend-container.mobile {
			left: 12px;
			right: 80px;
			top: auto;
			bottom: 94px;
			max-width: none;
		}
	}

	/* Très petits écrans */
	@media (max-width: 400px) {
		.controls-container.mobile {
			bottom: 82px;
		}

		.legend-container.mobile {
			right: 68px;
			bottom: 82px;
		}
	}
</style>
