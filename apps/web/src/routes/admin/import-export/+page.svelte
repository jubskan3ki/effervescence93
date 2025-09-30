<!-- src/routes/admin/import-export/+page.svelte -->
<script lang="ts">
	import { booths } from '$lib/api/booths';
	import { sectors } from '$lib/api/sectors';
	import { themes } from '$lib/api/themes';
	import { exhibitors } from '$lib/api/exhibitors';
	import { toCSV, parseCSV, type CSVRow } from '$lib/utils/csv';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	const CSV_HEADERS = [
		'exhibitor_name',
		'sector_name',
		'sector_colorHex',
		'booth_number',
		'booth_x',
		'booth_y',
		'logo_url',
		'description',
		'website_url',
		'linkedin_url',
		'pdf_url',
		'theme',
		'contacts_phone',
		'contacts_first_name',
		'contacts_last_name',
		'contacts_role',
		'contacts_email',
	];

	// État UI
	let activeTab: 'export' | 'import' = 'export';
	let exporting = false;
	let importing = false;
	let importText = '';
	let dryRun = true;
	let resultLog: string[] = [];
	let fileInput: HTMLInputElement;
	let dragActive = false;
	let importProgress = 0;
	let totalRows = 0;

	// Stats
	let stats = {
		created: 0,
		updated: 0,
		skipped: 0,
		errors: 0,
	};

	/* -------------------------- EXPORT -------------------------- */
	async function handleExport() {
		exporting = true;
		try {
			// Récupération des données
			const [exposants, secteurs, parcours] = await Promise.all([
				exhibitors.listAll(),
				sectors.list(),
				themes.list(),
			]);

			// Reconstruction des stands via les relations
			const standsMap = new Map();
			for (const exp of exposants) {
				if (exp.boothId) {
					try {
						const stand = await booths.get(exp.boothId);
						standsMap.set(stand.id, stand);
					} catch {}
				}
			}

			// Map pour accès rapide
			const secteurMap = new Map(secteurs.map((s) => [s.id, s]));
			const standMap = standsMap;

			// Thèmes par exposant
			const themesParExposant = new Map();
			parcours.forEach((t) => {
				(t.exhibitorIds || []).forEach((eid) => {
					if (!themesParExposant.has(eid)) themesParExposant.set(eid, []);
					themesParExposant.get(eid).push(t.name);
				});
			});

			// Construction du CSV
			const rows: CSVRow[] = exposants.map((e) => {
				const secteur = secteurMap.get(e.sectorId);
				const stand = e.boothId ? standMap.get(e.boothId) : null;
				const themes = themesParExposant.get(e.id) || [];
				const contact = e.contacts?.[0] || {};

				return {
					exhibitor_name: e.name,
					sector_name: secteur?.name || '',
					sector_colorHex: secteur?.colorHex || '',
					booth_number: stand?.number || '',
					booth_x: stand?.x || '',
					booth_y: stand?.y || '',
					logo_url: e.logoUrl || '',
					description: e.description || '',
					website_url: e.websiteUrl || '',
					linkedin_url: e.linkedinUrl || '',
					pdf_url: e.pdfUrl || '',
					theme: themes.join('|'),
					contacts_phone: contact.phone || '',
					contacts_first_name: contact.firstName || '',
					contacts_last_name: contact.lastName || '',
					contacts_role: contact.role || '',
					contacts_email: contact.email || '',
				};
			});

			// Génération et téléchargement
			const csv = toCSV(CSV_HEADERS, rows);
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `exposants_${new Date().toISOString().slice(0, 10)}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);

			toast.success(`Export réussi : ${rows.length} exposants`);
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de l'export");
		} finally {
			exporting = false;
		}
	}

	/* -------------------------- IMPORT -------------------------- */
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		const file = e.dataTransfer?.files?.[0];
		if (file && file.type === 'text/csv') {
			loadFile(file);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	function loadFile(file: File) {
		file.text().then((text) => {
			importText = text;
			toast.info(`Fichier chargé : ${file.name}`);
		});
	}

	async function handleImport() {
		if (!importText.trim()) {
			toast.error('Aucun contenu CSV à importer');
			return;
		}

		importing = true;
		importProgress = 0;
		resultLog = [];
		stats = { created: 0, updated: 0, skipped: 0, errors: 0 };

		try {
			// Parse CSV
			const { headers, rows } = parseCSV(importText);
			totalRows = rows.length;

			// Vérification des colonnes
			const missing = CSV_HEADERS.filter((h) => !headers.includes(h));
			if (missing.length) {
				toast.error(`Colonnes manquantes : ${missing.join(', ')}`);
				importing = false;
				return;
			}

			// Préchargement des données existantes
			const [secteursList, themesList, exposantsList] = await Promise.all([
				sectors.list(),
				themes.list(),
				exhibitors.listAll(),
			]);

			// Caches
			const secteurCache = new Map(secteursList.map((s) => [s.name.toLowerCase(), s]));
			const themeCache = new Map(themesList.map((t) => [t.name.toLowerCase(), t]));
			const exposantCache = new Map(exposantsList.map((e) => [e.name.toLowerCase(), e]));

			// Traitement ligne par ligne
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				importProgress = ((i + 1) / totalRows) * 100;

				const name = String(row.exhibitor_name || '').trim();
				if (!name) {
					stats.skipped++;
					resultLog.push(`⚠️ Ligne ${i + 1} : Pas de nom d'exposant`);
					continue;
				}

				try {
					// Création/récupération du secteur
					let secteur = secteurCache.get(String(row.sector_name || '').toLowerCase());
					if (!secteur && row.sector_name) {
						if (!dryRun) {
							secteur = await sectors.create({
								name: String(row.sector_name),
								colorHex: String(row.sector_colorHex || '#6B7280'),
							});
							secteurCache.set(secteur.name.toLowerCase(), secteur);
						}
					}

					// Création/récupération du stand
					let stand = null;
					const boothNumber = String(row.booth_number || '').trim();
					if (boothNumber) {
						try {
							stand = await booths.getByNumber(boothNumber);
						} catch {
							if (row.booth_x && row.booth_y && !dryRun) {
								stand = await booths.create({
									number: boothNumber,
									polygonId: `import-${boothNumber}`,
									x: Number(row.booth_x),
									y: Number(row.booth_y),
									width: 50,
									height: 50,
								});
							}
						}
					}

					// Données exposant
					const payload = {
						name,
						logoUrl: String(row.logo_url || '').trim() || undefined,
						description: String(row.description || '').trim() || undefined,
						websiteUrl: String(row.website_url || '').trim() || undefined,
						linkedinUrl: String(row.linkedin_url || '').trim() || undefined,
						pdfUrl: String(row.pdf_url || '').trim() || undefined,
						sectorId: secteur?.id || secteursList[0]?.id,
						boothId: stand?.id,
						contacts: row.contacts_email
							? [
									{
										firstName: String(row.contacts_first_name || '').trim(),
										lastName: String(row.contacts_last_name || '').trim(),
										role: String(row.contacts_role || '').trim(),
										email: String(row.contacts_email || '').trim(),
										phone: String(row.contacts_phone || '').trim(),
									},
								]
							: [],
					};

					// Création ou mise à jour
					const existing = exposantCache.get(name.toLowerCase());
					if (existing) {
						if (!dryRun) {
							await exhibitors.update(existing.id, payload);
						}
						stats.updated++;
						resultLog.push(`✅ Mis à jour : ${name}`);
					} else {
						if (!dryRun) {
							const created = await exhibitors.create(payload);
							exposantCache.set(created.name.toLowerCase(), created);
						}
						stats.created++;
						resultLog.push(`✅ Créé : ${name}`);
					}

					// Gestion des thèmes
					if (row.theme) {
						const themeNames = String(row.theme)
							.split('|')
							.map((t) => t.trim())
							.filter(Boolean);
						for (const themeName of themeNames) {
							let theme = themeCache.get(themeName.toLowerCase());
							if (!theme && !dryRun) {
								theme = await themes.create({ name: themeName });
								themeCache.set(theme.name.toLowerCase(), theme);
							}
						}
					}
				} catch (error) {
					stats.errors++;
					const errorMessage = error instanceof Error ? error.message : String(error);
					resultLog.push(`❌ Erreur ligne ${i + 1} : ${errorMessage}`);
				}
			}

			// Résumé
			const message = dryRun
				? `Simulation terminée : ${stats.created} à créer, ${stats.updated} à mettre à jour`
				: `Import terminé : ${stats.created} créés, ${stats.updated} mis à jour`;
			toast.success(message);
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de l'import");
		} finally {
			importing = false;
			importProgress = 0;
		}
	}

	// Raccourcis clavier
	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
			e.preventDefault();
			handleExport();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<svelte:head>
	<title>Import/Export - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-6xl mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Import / Export</h1>
			<p class="mt-2 text-gray-600">Gérez vos données d'exposants via fichiers CSV</p>
		</div>

		<!-- Tabs -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
			<div class="flex border-b border-gray-200">
				<button
					on:click={() => (activeTab = 'export')}
					class="flex-1 px-6 py-4 text-sm font-medium transition-colors
						{activeTab === 'export'
						? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
						: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
				>
					<i class="fas fa-download mr-2"></i>
					Export
				</button>
				<button
					on:click={() => (activeTab = 'import')}
					class="flex-1 px-6 py-4 text-sm font-medium transition-colors
						{activeTab === 'import'
						? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
						: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
				>
					<i class="fas fa-upload mr-2"></i>
					Import
				</button>
			</div>

			<div class="p-6">
				{#if activeTab === 'export'}
					<!-- Export Section -->
					<div class="space-y-6">
						<div>
							<h2 class="text-lg font-semibold text-gray-900 mb-2">Exporter les données</h2>
							<p class="text-sm text-gray-600 mb-4">
								Téléchargez l'ensemble des exposants, secteurs et stands au format CSV
							</p>
						</div>

						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 class="text-sm font-medium text-blue-900 mb-2">
								<i class="fas fa-info-circle mr-2"></i>
								Colonnes exportées
							</h3>
							<div class="flex flex-wrap gap-2 mt-2">
								{#each CSV_HEADERS as header}
									<span
										class="px-2 py-1 bg-white text-xs text-blue-700 rounded border border-blue-200"
									>
										{header}
									</span>
								{/each}
							</div>
						</div>

						<button
							on:click={handleExport}
							disabled={exporting}
							class="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-lg
								hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
								transition-all duration-200 flex items-center justify-center gap-2"
						>
							{#if exporting}
								<i class="fas fa-spinner fa-spin"></i>
								Export en cours...
							{:else}
								<i class="fas fa-download"></i>
								Exporter maintenant
							{/if}
						</button>

						<div class="text-xs text-gray-500 flex items-center gap-2">
							<i class="fas fa-keyboard"></i>
							Raccourci : <kbd class="px-2 py-1 bg-gray-100 rounded">Cmd/Ctrl + E</kbd>
						</div>
					</div>
				{:else}
					<!-- Import Section -->
					<div class="space-y-6">
						<div>
							<h2 class="text-lg font-semibold text-gray-900 mb-2">Importer des données</h2>
							<p class="text-sm text-gray-600">
								Chargez un fichier CSV pour créer ou mettre à jour les exposants
							</p>
						</div>

						<!-- Mode -->
						<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
							<label class="flex items-center gap-3 cursor-pointer">
								<input
									type="checkbox"
									bind:checked={dryRun}
									class="w-5 h-5 text-amber-600 rounded border-amber-300
										focus:ring-amber-500 focus:ring-2"
								/>
								<div>
									<span class="font-medium text-amber-900">Mode simulation (dry-run)</span>
									<p class="text-xs text-amber-700 mt-0.5">
										{dryRun
											? 'Aucune donnée ne sera modifiée - test uniquement'
											: '⚠️ Les données seront réellement importées'}
									</p>
								</div>
							</label>
						</div>

						<!-- Drop Zone -->
						<div
							on:drop={handleDrop}
							on:dragover={handleDragOver}
							on:dragleave={handleDragLeave}
							class="relative border-2 border-dashed rounded-lg p-8 text-center transition-all
								{dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}"
						>
							<input
								type="file"
								accept=".csv"
								on:change={(e) => loadFile(e.target.files[0])}
								bind:this={fileInput}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>

							<i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
							<p class="text-gray-600 font-medium mb-1">Glissez votre fichier CSV ici</p>
							<p class="text-sm text-gray-500">
								ou <button class="text-primary-600 hover:text-primary-700 font-medium">
									parcourir
								</button>
							</p>
						</div>

						<!-- Textarea alternative -->
						<details class="group">
							<summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
								<i class="fas fa-paste mr-2"></i>
								Coller directement le contenu CSV
							</summary>
							<textarea
								bind:value={importText}
								placeholder="Collez votre CSV ici..."
								class="mt-3 w-full h-40 px-3 py-2 text-sm border border-gray-300 rounded-lg
									focus:ring-2 focus:ring-primary-500 focus:border-primary-500
									font-mono text-xs"
							></textarea>
						</details>

						<!-- Progress -->
						{#if importing && importProgress > 0}
							<div class="space-y-2">
								<div class="flex justify-between text-sm text-gray-600">
									<span>Progression</span>
									<span>{Math.round(importProgress)}%</span>
								</div>
								<div class="h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-primary-600 transition-all duration-300"
										style="width: {importProgress}%"
									></div>
								</div>
							</div>
						{/if}

						<!-- Stats -->
						{#if stats.created + stats.updated + stats.skipped + stats.errors > 0}
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
								<div class="bg-green-50 rounded-lg p-3 text-center">
									<div class="text-2xl font-bold text-green-700">{stats.created}</div>
									<div class="text-xs text-green-600">Créés</div>
								</div>
								<div class="bg-blue-50 rounded-lg p-3 text-center">
									<div class="text-2xl font-bold text-blue-700">{stats.updated}</div>
									<div class="text-xs text-blue-600">Mis à jour</div>
								</div>
								<div class="bg-amber-50 rounded-lg p-3 text-center">
									<div class="text-2xl font-bold text-amber-700">{stats.skipped}</div>
									<div class="text-xs text-amber-600">Ignorés</div>
								</div>
								<div class="bg-red-50 rounded-lg p-3 text-center">
									<div class="text-2xl font-bold text-red-700">{stats.errors}</div>
									<div class="text-xs text-red-600">Erreurs</div>
								</div>
							</div>
						{/if}

						<!-- Logs -->
						{#if resultLog.length > 0}
							<div class="bg-gray-50 rounded-lg p-4">
								<div class="flex justify-between items-center mb-2">
									<h3 class="text-sm font-medium text-gray-700">Journal d'import</h3>
									<button
										on:click={() => (resultLog = [])}
										class="text-xs text-gray-500 hover:text-gray-700"
									>
										<i class="fas fa-times mr-1"></i>
										Effacer
									</button>
								</div>
								<div class="max-h-60 overflow-y-auto text-xs space-y-1 font-mono">
									{#each resultLog as log}
										<div class="py-0.5">{log}</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Action Button -->
						<button
							on:click={handleImport}
							disabled={importing || !importText.trim()}
							class="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-lg
								hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
								transition-all duration-200 flex items-center justify-center gap-2"
						>
							{#if importing}
								<i class="fas fa-spinner fa-spin"></i>
								Import en cours...
							{:else}
								<i class="fas fa-upload"></i>
								Lancer l'import
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	kbd {
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}
</style>
