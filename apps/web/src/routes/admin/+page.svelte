<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { analytics } from '$lib/api/analytics';
	import { exhibitors } from '$lib/api/exhibitors';
	import { booths } from '$lib/api/booths';
	import { sectors } from '$lib/api/sectors';
	import type { AnalyticsStats, TopExhibitor, Sector, Exhibitor } from '$lib/types';

	// Extension du type TopExhibitor pour inclure currentFavorites
	interface ExtendedTopExhibitor extends TopExhibitor {
		currentFavorites?: number;
	}

	// Register Chart.js components
	Chart.register(...registerables);

	// State
	let loading = true;
	let error: string | null = null;

	// Data
	let stats: AnalyticsStats | null = null;
	let topExhibitors: ExtendedTopExhibitor[] = [];
	let boothStats: any = null;
	let exhibitorsList: Exhibitor[] = [];
	let sectorsList: Sector[] = [];

	// Charts
	let interactionsChart: Chart | null = null;
	let sectorsChart: Chart | null = null;
	let topExhibitorsChart: Chart | null = null;

	// Computed stats
	$: totalExhibitors = exhibitorsList.length;
	$: occupancyRate =
		boothStats && boothStats.total > 0 ? Math.round((boothStats.occupied / boothStats.total) * 100) : 0;
	$: avgViewsPerExhibitor = stats && totalExhibitors > 0 ? Math.round(stats.totalViews / totalExhibitors) : 0;

	// Group exhibitors by sector
	function getExhibitorsBySector() {
		const bySector: Map<string, { count: number; sector: Sector }> = new Map();

		exhibitorsList.forEach((exhibitor) => {
			if (exhibitor.sectorId) {
				const sector = sectorsList.find((s) => s.id === exhibitor.sectorId);
				if (sector) {
					const existing = bySector.get(exhibitor.sectorId);
					if (existing) {
						existing.count++;
					} else {
						bySector.set(exhibitor.sectorId, { count: 1, sector });
					}
				}
			}
		});

		return Array.from(bySector.values()).sort((a, b) => b.count - a.count);
	}

	// Load all data
	async function loadDashboardData() {
		try {
			loading = true;
			error = null;

			const [analyticsData, topExhibitorsData, boothStatsData, exhibitorsData, sectorsData] = await Promise.all([
				analytics.getStats().catch(() => ({
					totalViews: 0,
					uniqueSessions: 0,
					totalSearches: 0,
					totalFavorites: 0,
					topSearchTerms: [],
				})),
				analytics.getTopExhibitors(15).catch(() => []),
				booths.stats().catch(() => ({ total: 0, occupied: 0, available: 0 })),
				exhibitors.listAll().catch(() => []),
				sectors.list().catch(() => []),
			]);

			stats = analyticsData;
			topExhibitors = topExhibitorsData;
			boothStats = boothStatsData;
			exhibitorsList = exhibitorsData;
			sectorsList = sectorsData;

			await initCharts();
		} catch (err) {
			console.error('Erreur chargement dashboard:', err);
			error = 'Erreur lors du chargement des données';
		} finally {
			loading = false;
		}
	}

	async function initCharts() {
		// Destroy existing charts
		if (interactionsChart) interactionsChart.destroy();
		if (sectorsChart) sectorsChart.destroy();
		if (topExhibitorsChart) topExhibitorsChart.destroy();

		// Wait for DOM
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Interactions Chart
		const interactionsCtx = document.getElementById('interactionsChart') as HTMLCanvasElement;
		if (interactionsCtx && stats) {
			const hasData = stats.totalViews > 0 || stats.totalSearches > 0 || stats.totalFavorites > 0;

			if (hasData) {
				const data = [];
				const labels = [];
				const colors = [];

				// Only add non-zero values
				if (stats.totalViews > 0) {
					data.push(stats.totalViews);
					labels.push('Vues');
					colors.push('#E20A16');
				}
				if (stats.totalSearches > 0) {
					data.push(stats.totalSearches);
					labels.push('Recherches');
					colors.push('#004B87');
				}
				if (stats.totalFavorites > 0) {
					data.push(stats.totalFavorites);
					labels.push('Favoris ajoutés');
					colors.push('#10B981');
				}

				const totalInteractions = data.reduce((a, b) => a + b, 0);

				interactionsChart = new Chart(interactionsCtx, {
					type: 'doughnut',
					data: {
						labels: labels,
						datasets: [
							{
								data: data,
								backgroundColor: colors,
								borderWidth: 0,
								hoverOffset: 10,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						cutout: '65%',
						plugins: {
							legend: {
								position: 'bottom',
								labels: {
									padding: 20,
									usePointStyle: true,
									font: { size: 13, weight: 500 },
								},
							},
							tooltip: {
								backgroundColor: 'rgba(0,0,0,0.8)',
								padding: 12,
								cornerRadius: 8,
								callbacks: {
									label: function (context) {
										const value = context.parsed;
										const percentage = ((value / totalInteractions) * 100).toFixed(1);
										return `${context.label}: ${formatNumber(value)} (${percentage}%)`;
									},
								},
							},
						},
					},
				});
			}
		}

		// Sectors Chart
		const sectorsCtx = document.getElementById('sectorsChart') as HTMLCanvasElement;
		if (sectorsCtx && sectorsList.length > 0 && exhibitorsList.length > 0) {
			const sectorData = getExhibitorsBySector().slice(0, 8);

			if (sectorData.length > 0) {
				sectorsChart = new Chart(sectorsCtx, {
					type: 'bar',
					data: {
						labels: sectorData.map((s) => s.sector.name),
						datasets: [
							{
								data: sectorData.map((s) => s.count),
								backgroundColor: sectorData.map((s) => s.sector.colorHex + 'DD'),
								borderColor: sectorData.map((s) => s.sector.colorHex),
								borderWidth: 2,
								borderRadius: 8,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						indexAxis: 'y',
						plugins: {
							legend: { display: false },
							tooltip: {
								backgroundColor: 'rgba(0,0,0,0.8)',
								padding: 12,
								cornerRadius: 8,
								callbacks: {
									label: function (context) {
										const total = exhibitorsList.length;
										const value = context.parsed.x;
										const percentage = ((value / total) * 100).toFixed(1);
										return `${value} exposants (${percentage}% du total)`;
									},
								},
							},
						},
						scales: {
							x: {
								beginAtZero: true,
								grid: {
									color: 'rgba(0,0,0,0.05)',
								},
							},
							y: {
								grid: {
									display: false,
								},
								ticks: {
									font: { size: 12, weight: 500 },
								},
							},
						},
					},
				});
			}
		}

		// Top Exhibitors Chart
		const topCtx = document.getElementById('topExhibitorsChart') as HTMLCanvasElement;
		if (topCtx && topExhibitors.length > 0) {
			const topData = topExhibitors.slice(0, 10);

			const ctx = topCtx.getContext('2d');
			const gradientRed = ctx!.createLinearGradient(0, 0, 0, 300);
			gradientRed.addColorStop(0, '#E20A16');
			gradientRed.addColorStop(1, '#E20A1660');

			const gradientBlue = ctx!.createLinearGradient(0, 0, 0, 300);
			gradientBlue.addColorStop(0, '#004B87');
			gradientBlue.addColorStop(1, '#004B8760');

			topExhibitorsChart = new Chart(topCtx, {
				type: 'bar',
				data: {
					labels: topData.map((e) => (e.name.length > 20 ? e.name.substring(0, 18) + '...' : e.name)),
					datasets: [
						{
							label: 'Vues',
							data: topData.map((e) => e.views),
							backgroundColor: gradientRed,
							borderRadius: 6,
							borderSkipped: false,
						},
						{
							label: 'Favoris',
							data: topData.map((e) => e.favorites),
							backgroundColor: gradientBlue,
							borderRadius: 6,
							borderSkipped: false,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: true,
							position: 'top',
							labels: {
								usePointStyle: true,
								padding: 20,
								font: { size: 12, weight: 500 },
							},
						},
						tooltip: {
							backgroundColor: 'rgba(0,0,0,0.8)',
							padding: 12,
							cornerRadius: 8,
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								color: 'rgba(0,0,0,0.05)',
							},
						},
						x: {
							grid: {
								display: false,
							},
							ticks: {
								maxRotation: 45,
								minRotation: 45,
								font: { size: 11 },
							},
						},
					},
				},
			});
		}
	}

	onMount(() => {
		loadDashboardData();
	});

	onDestroy(() => {
		if (interactionsChart) interactionsChart.destroy();
		if (sectorsChart) sectorsChart.destroy();
		if (topExhibitorsChart) topExhibitorsChart.destroy();
	});

	function formatNumber(n: number): string {
		if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
		return new Intl.NumberFormat('fr-FR').format(n);
	}

	async function refreshData() {
		await loadDashboardData();
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<div class="container-fluid py-8">
		<!-- Header moderne -->
		<div class="mb-10">
			<h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
				Tableau de bord
			</h1>
			<div class="flex items-center justify-between mt-4">
				<p class="text-gray-600">Vue d'ensemble de votre salon professionnel</p>
				<button
					on:click={refreshData}
					disabled={loading}
					class="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200
					       flex items-center gap-2 text-gray-700 font-medium disabled:opacity-50"
				>
					<i class="fa-solid fa-rotate {loading ? 'animate-spin' : ''}"></i>
					Actualiser
				</button>
			</div>
		</div>

		{#if loading && !stats}
			<!-- Loading avec animation moderne -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
				{#each Array(5) as _}
					<div class="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
						<div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
						<div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
						<div class="h-3 bg-gray-200 rounded w-2/3"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
				<div class="flex items-center">
					<i class="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
					<p class="text-red-700">{error}</p>
				</div>
			</div>
		{:else}
			<!-- KPI Cards avec nouveau design -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
				<!-- Vues totales -->
				<div
					class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
				>
					<div class="flex items-center justify-between mb-4">
						<div
							class="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg"
						>
							<i class="fa-solid fa-eye text-white text-xl"></i>
						</div>
					</div>
					<p class="text-3xl font-bold text-gray-800">{formatNumber(stats?.totalViews || 0)}</p>
					<p class="text-sm text-gray-600 mt-2 font-medium">Vues totales</p>
					{#if avgViewsPerExhibitor > 0}
						<div class="mt-3 pt-3 border-t border-gray-100">
							<p class="text-xs text-gray-500">Moy. {formatNumber(avgViewsPerExhibitor)}/exposant</p>
						</div>
					{/if}
				</div>

				<!-- Visiteurs uniques -->
				<div
					class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
				>
					<div class="flex items-center justify-between mb-4">
						<div
							class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
						>
							<i class="fa-solid fa-users text-white text-xl"></i>
						</div>
					</div>
					<p class="text-3xl font-bold text-gray-800">{formatNumber(stats?.uniqueSessions || 0)}</p>
					<p class="text-sm text-gray-600 mt-2 font-medium">Visiteurs uniques</p>
				</div>

				<!-- Exposants actifs -->
				<div
					class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
				>
					<div class="flex items-center justify-between mb-4">
						<div
							class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
						>
							<i class="fa-solid fa-building text-white text-xl"></i>
						</div>
					</div>
					<p class="text-3xl font-bold text-gray-800">{formatNumber(totalExhibitors)}</p>
					<p class="text-sm text-gray-600 mt-2 font-medium">Exposants actifs</p>
					<div class="mt-3 pt-3 border-t border-gray-100">
						<p class="text-xs text-gray-500">{sectorsList.length} secteurs d'activité</p>
					</div>
				</div>

				<!-- Stands occupés -->
				<div
					class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
				>
					<div class="flex items-center justify-between mb-4">
						<div
							class="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg"
						>
							<i class="fa-solid fa-location-dot text-white text-xl"></i>
						</div>
					</div>
					<p class="text-3xl font-bold text-gray-800">
						{boothStats ? boothStats.occupied : '0'}<span class="text-lg text-gray-500"
							>/{boothStats ? boothStats.total : '0'}</span
						>
					</p>
					<p class="text-sm text-gray-600 mt-2 font-medium">Stands occupés</p>
					<div class="mt-3 pt-3 border-t border-gray-100">
						<div class="flex items-center justify-between">
							<span class="text-xs text-gray-500">Occupation</span>
							<span
								class="text-xs font-semibold {occupancyRate > 80
									? 'text-green-600'
									: occupancyRate > 50
										? 'text-amber-600'
										: 'text-red-600'}"
							>
								{occupancyRate}%
							</span>
						</div>
					</div>
				</div>

				<!-- Favoris ajoutés (historique) -->
				<div
					class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
				>
					<div class="flex items-center justify-between mb-4">
						<div
							class="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
						>
							<i class="fa-solid fa-heart text-white text-xl"></i>
						</div>
					</div>
					<p class="text-3xl font-bold text-gray-800">{formatNumber(stats?.totalFavorites || 0)}</p>
					<p class="text-sm text-gray-600 mt-2 font-medium">Favoris ajoutés</p>
					<div class="mt-3 pt-3 border-t border-gray-100">
						<p class="text-xs text-gray-500">Total historique</p>
					</div>
				</div>
			</div>

			<!-- Graphiques -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
				<!-- Répartition des interactions -->
				<div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
					<h3 class="text-lg font-bold text-gray-800 mb-6">Répartition des interactions</h3>
					<div class="h-72">
						{#if stats && (stats.totalViews > 0 || stats.totalSearches > 0 || stats.totalFavorites > 0)}
							<canvas id="interactionsChart"></canvas>
						{:else}
							<div class="h-full flex items-center justify-center">
								<p class="text-gray-400">Aucune interaction enregistrée</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Exposants par secteur -->
				<div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
					<h3 class="text-lg font-bold text-gray-800 mb-6">Exposants par secteur</h3>
					<div class="h-72">
						{#if exhibitorsList.length > 0 && sectorsList.length > 0}
							<canvas id="sectorsChart"></canvas>
						{:else}
							<div class="h-full flex items-center justify-center">
								<p class="text-gray-400">Aucune donnée disponible</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Top exposants -->
				<div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
					<h3 class="text-lg font-bold text-gray-800 mb-6">Top 10 exposants</h3>
					<div class="h-72">
						{#if topExhibitors.length > 0}
							<canvas id="topExhibitorsChart"></canvas>
						{:else}
							<div class="h-full flex items-center justify-center">
								<p class="text-gray-400">Aucune donnée disponible</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Table des performances -->
			<div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
					<h3 class="text-lg font-bold text-gray-800">Performances détaillées</h3>
					<p class="text-sm text-gray-500 mt-1">Classement par nombre de vues • Top 15 exposants</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="bg-gray-50">
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>
									#
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>
									Exposant
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>
									Secteur
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>
									Vues
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>
									Favoris
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>
									Taux conversion
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100">
							{#if topExhibitors.length > 0}
								{#each topExhibitors.slice(0, 15) as exhibitor, i}
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="px-6 py-4">
											{#if i < 3}
												<span
													class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br
													{i === 0 ? 'from-yellow-400 to-yellow-600' : i === 1 ? 'from-gray-300 to-gray-500' : 'from-orange-400 to-orange-600'}
													text-white font-bold text-sm shadow"
												>
													{i + 1}
												</span>
											{:else}
												<span class="text-gray-500 font-medium pl-2">{i + 1}</span>
											{/if}
										</td>
										<td class="px-6 py-4">
											<span class="text-sm font-semibold text-gray-800">{exhibitor.name}</span>
										</td>
										<td class="px-6 py-4">
											{#if exhibitor.sector}
												<span
													class="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
													style="background-color: {exhibitor.sector
														.colorHex}15; color: {exhibitor.sector.colorHex}"
												>
													{exhibitor.sector.name}
												</span>
											{:else}
												<span class="text-sm text-gray-400">Non défini</span>
											{/if}
										</td>
										<td class="px-6 py-4 text-center">
											<span class="text-sm font-bold text-gray-700">
												{formatNumber(exhibitor.views)}
											</span>
										</td>
										<td class="px-6 py-4 text-center">
											<span class="inline-flex items-center gap-2">
												<span class="text-sm font-bold text-gray-700">
													{formatNumber(exhibitor.favorites)}
												</span>
												{#if exhibitor.favorites > 0}
													<span class="text-green-500">
														<i class="fa-solid fa-heart text-xs"></i>
													</span>
												{/if}
											</span>
										</td>
										<td class="px-6 py-4 text-center">
											{#if exhibitor.views > 0}
												<span
													class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
													{(exhibitor.favorites / exhibitor.views) * 100 > 10
														? 'bg-green-100 text-green-700'
														: (exhibitor.favorites / exhibitor.views) * 100 > 5
															? 'bg-yellow-100 text-yellow-700'
															: 'bg-gray-100 text-gray-700'}"
												>
													{((exhibitor.favorites / exhibitor.views) * 100).toFixed(1)}%
												</span>
											{:else}
												<span class="text-sm text-gray-400">-</span>
											{/if}
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="6" class="px-6 py-12 text-center text-gray-400">
										Aucune donnée de performance disponible
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	canvas {
		max-width: 100%;
		height: 100% !important;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	.container-fluid {
		@apply w-full px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto;
	}
</style>
