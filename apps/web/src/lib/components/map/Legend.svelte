<!-- src/lib/components/map/Legend.svelte -->
<script lang="ts">
	import type { Sector, Exhibitor, Booth } from '$lib/types';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let sectors: Sector[] = [];
	export let exhibitors: Exhibitor[] = [];
	export let booths: Booth[] = [];

	let collapsed = false;

	// Tous les secteurs avec compteur
	$: allSectors = sectors
		.map((sector) => ({
			...sector,
			count: exhibitors.filter((e) => e.sectorId === sector.id).length,
		}))
		.filter((s) => s.count > 0)
		.sort((a, b) => b.count - a.count);

	// Pictogrammes de navigation
	const facilities = [
		{ icon: '🚻', label: 'Toilettes' },
		{ icon: '🏛️', label: 'Accueil' },
		{ icon: '🚪', label: 'Sortie' },
		{ icon: '🚨', label: 'Secours' },
	];
</script>

<div class="legend-panel" class:collapsed>
	<button
		class="legend-header"
		on:click={() => (collapsed = !collapsed)}
		aria-label={collapsed ? 'Afficher' : 'Masquer'}
	>
		<span class="header-title">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path
					d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
				/>
			</svg>
			<span class="title-text">Informations</span>
		</span>
		<svg
			class="chevron"
			class:rotate={!collapsed}
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if !collapsed}
		<div class="legend-content" transition:slide={{ duration: 200, easing: quintOut }}>
			<!-- Secteurs -->
			<div class="section">
				<h4 class="section-title">Secteurs d'activité</h4>
				<div class="sectors-list">
					{#each allSectors as sector}
						<div class="sector-item">
							<span class="sector-indicator" style="background: {sector.colorHex}"></span>
							<span class="sector-name">{sector.name}</span>
							<span class="sector-count">{sector.count}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Pictogrammes -->
			<div class="section">
				<h4 class="section-title">Services & accès</h4>
				<div class="facilities-grid">
					{#each facilities as facility}
						<div class="facility-item">
							<span class="facility-icon">{facility.icon}</span>
							<span class="facility-label">{facility.label}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.legend-panel {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		width: 280px;
		border: 1px solid #e5e7eb;
		max-height: calc(100vh - 200px);
		display: flex;
		flex-direction: column;
	}

	.legend-panel.collapsed {
		width: auto;
	}

	.legend-header {
		width: 100%;
		padding: 12px 16px;
		background: white;
		border: none;
		border-bottom: 1px solid #f3f4f6;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: background 0.15s;
		flex-shrink: 0;
		border-radius: 8px;
	}

	.legend-header:hover {
		background: #fafafa;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 500;
		font-size: 13px;
		color: #111827;
		letter-spacing: -0.01em;
	}

	.header-title svg {
		color: #6b7280;
		flex-shrink: 0;
	}

	.title-text {
		white-space: nowrap;
	}

	.chevron {
		color: #9ca3af;
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.chevron.rotate {
		transform: rotate(180deg);
	}

	.legend-content {
		padding: 16px;
		overflow-y: auto;
		flex: 1;
	}

	.section {
		margin-bottom: 16px;
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: #6b7280;
		margin: 0 0 10px 0;
		letter-spacing: 0.05em;
	}

	.sectors-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.sector-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		background: #fafafa;
		border-radius: 6px;
		font-size: 13px;
		transition: background 0.15s;
	}

	.sector-item:hover {
		background: #f3f4f6;
	}

	.sector-indicator {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.sector-name {
		flex: 1;
		color: #374151;
		font-weight: 400;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sector-count {
		font-weight: 600;
		color: #111827;
		font-size: 12px;
		padding: 2px 6px;
		background: white;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.facilities-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.facility-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 8px;
		background: #fafafa;
		border-radius: 6px;
		transition: background 0.15s;
	}

	.facility-item:hover {
		background: #f3f4f6;
	}

	.facility-icon {
		font-size: 24px;
		line-height: 1;
	}

	.facility-label {
		font-size: 11px;
		color: #6b7280;
		font-weight: 500;
		text-align: center;
	}

	/* Tablet */
	@media (min-width: 768px) and (max-width: 1023px) {
		.legend-panel {
			width: 260px;
			max-height: calc(100vh - 180px);
		}

		.legend-header {
			padding: 10px 14px;
		}

		.header-title {
			font-size: 12px;
		}

		.legend-content {
			padding: 14px;
		}

		.sector-item {
			padding: 6px;
			font-size: 12px;
		}

		.facility-item {
			padding: 10px 6px;
		}

		.facility-icon {
			font-size: 20px;
		}
	}

	/* Mobile */
	@media (max-width: 767px) {
		.legend-panel {
			width: 100%;
			max-width: 100%;
			border-radius: 8px;
			max-height: 40vh;
		}

		.legend-panel.collapsed {
			width: auto;
			max-width: fit-content;
		}

		.legend-header {
			padding: 10px 12px;
		}

		.header-title {
			font-size: 12px;
			gap: 6px;
		}

		.legend-content {
			padding: 12px;
		}

		.section {
			margin-bottom: 12px;
		}

		.section-title {
			font-size: 10px;
			margin-bottom: 8px;
		}

		.sectors-list {
			gap: 4px;
		}

		.sector-item {
			padding: 6px 8px;
			font-size: 12px;
			gap: 6px;
		}

		.sector-indicator {
			width: 8px;
			height: 8px;
		}

		.sector-count {
			font-size: 11px;
			padding: 1px 5px;
		}

		.facilities-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 6px;
		}

		.facility-item {
			padding: 8px 4px;
			gap: 4px;
		}

		.facility-icon {
			font-size: 18px;
		}

		.facility-label {
			font-size: 9px;
		}
	}

	/* Très petits écrans */
	@media (max-width: 380px) {
		.title-text {
			display: none;
		}

		.legend-panel.collapsed {
			width: auto;
		}

		.facilities-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 4px;
		}

		.facility-item {
			padding: 6px 2px;
		}

		.facility-icon {
			font-size: 16px;
		}

		.facility-label {
			font-size: 8px;
		}
	}
</style>
