// apps/web/src/lib/utils/csv.ts
export type CSVRow = Record<string, string | number | boolean | null | undefined>;

/**
 * Colonnes "stables" à réaligner par la droite en cas de décalage
 */
const DEFAULT_STABLE_TAIL = [
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

/* ------------------------------------------------------------------------------------ */
/* Export CSV                                                                          */
/* ------------------------------------------------------------------------------------ */

export function toCSV(headers: string[], rows: CSVRow[]): string {
	function esc(val: unknown): string {
		if (val === null || val === undefined) return '';
		const s = String(val).trim(); // Trim automatique

		// Quote si contient: virgule, guillemet, retour ligne, ou commence/finit par espace
		if (/[",\n\r]/.test(s) || s !== s.trim()) {
			return `"${s.replace(/"/g, '""')}"`;
		}
		return s;
	}

	const head = headers.join(',');
	const body = rows.map((r) => headers.map((h) => esc(r[h])).join(',')).join('\n');
	return `${head}\n${body}`;
}

/* ------------------------------------------------------------------------------------ */
/* Import CSV - Parsing robuste                                                        */
/* ------------------------------------------------------------------------------------ */

/**
 * Nettoie le CSV : BOM, normalise les retours ligne, trim les espaces parasites
 */
function normalizeInput(text: string): string {
	// Enlève le BOM UTF-8 si présent
	if (text.charCodeAt(0) === 0xfeff) {
		text = text.slice(1);
	}

	// Normalise tous les types de retours ligne en \n
	text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	// Enlève les espaces/tabs en fin de lignes (courant dans les exports)
	text = text
		.split('\n')
		.map((line) => line.trimEnd())
		.join('\n');

	return text;
}

/**
 * Détecte le séparateur (, ou ;) sur les 3 premières lignes
 */
function detectDelimiter(lines: string[]): ',' | ';' {
	const sample = lines.slice(0, 3);
	let commaScore = 0;
	let semiScore = 0;

	for (const line of sample) {
		// On compte en excluant les caractères dans les guillemets
		let inQuote = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"' && line[i + 1] === '"') {
				i++; // Skip escaped quote
				continue;
			}
			if (ch === '"') {
				inQuote = !inQuote;
				continue;
			}
			if (!inQuote) {
				if (ch === ',') commaScore++;
				if (ch === ';') semiScore++;
			}
		}
	}

	return semiScore > commaScore ? ';' : ',';
}

/**
 * Parse une ligne CSV selon RFC 4180
 * Gère les guillemets, double-guillemets, et séparateur configurable
 */
function splitCsvLine(line: string, delimiter: ',' | ';'): string[] {
	const cols: string[] = [];
	let value = '';
	let inQuote = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i];

		// Guillemet échappé ""
		if (ch === '"' && line[i + 1] === '"') {
			value += '"';
			i++;
			continue;
		}

		// Guillemet ouvrant/fermant
		if (ch === '"') {
			inQuote = !inQuote;
			continue;
		}

		// Séparateur (seulement hors guillemets)
		if (!inQuote && ch === delimiter) {
			cols.push(value.trim()); // Trim chaque valeur
			value = '';
			continue;
		}

		value += ch;
	}

	// Dernière colonne
	cols.push(value.trim());
	return cols;
}

/**
 * Construit les lignes logiques (gère les retours ligne dans les champs quotés)
 */
function logicalLines(input: string): string[] {
	const lines: string[] = [];
	let currentLine = '';
	let inQuote = false;

	for (let i = 0; i < input.length; i++) {
		const ch = input[i];

		// Guillemet échappé
		if (ch === '"' && input[i + 1] === '"') {
			currentLine += '""';
			i++;
			continue;
		}

		// Guillemet
		if (ch === '"') {
			inQuote = !inQuote;
			currentLine += ch;
			continue;
		}

		// Retour ligne (seulement hors guillemets = nouvelle ligne logique)
		if (!inQuote && ch === '\n') {
			if (currentLine.trim()) {
				lines.push(currentLine);
			}
			currentLine = '';
			continue;
		}

		currentLine += ch;
	}

	// Dernière ligne
	if (currentLine.trim()) {
		lines.push(currentLine);
	}

	return lines;
}

/**
 * Réaligne une ligne si le nombre de colonnes ne correspond pas
 * Principe:
 *  - Mappe les colonnes "stable" de la fin par la droite
 *  - Remplit la tête jusqu'à logo_url
 *  - Concatène l'excédent dans description
 */
function realignColumns(headers: string[], cols: string[], delimiter: ',' | ';'): string[] {
	const expectedCount = headers.length;

	// Si déjà bon, on retourne direct
	if (cols.length === expectedCount) {
		return cols.map((c) => c.trim());
	}

	const indexMap = new Map(headers.map((h, i) => [h, i]));
	const stableTail = headers.filter((h) => DEFAULT_STABLE_TAIL.includes(h));
	const tailLen = stableTail.length;

	const result = new Array<string>(expectedCount).fill('');

	// 1) Remplir la queue stable depuis la droite
	for (let i = 0; i < tailLen; i++) {
		const headerName = stableTail[tailLen - 1 - i];
		const targetIdx = indexMap.get(headerName);
		const sourceIdx = cols.length - 1 - i;

		if (targetIdx !== undefined && sourceIdx >= 0) {
			result[targetIdx] = (cols[sourceIdx] ?? '').trim();
		}
	}

	// 2) Remplir la tête (avant description)
	const descIdx = indexMap.get('description') ?? -1;
	const logoIdx = indexMap.get('logo_url') ?? -1;

	const headHeaders: string[] = [];
	for (let i = 0; i <= logoIdx && i < headers.length; i++) {
		headHeaders.push(headers[i]);
	}

	const headCount = headHeaders.length;
	const sourceLeftCount = Math.max(0, cols.length - tailLen);
	const leftCols = cols.slice(0, sourceLeftCount);

	for (let i = 0; i < headCount; i++) {
		const h = headHeaders[i];
		const targetIdx = indexMap.get(h);
		if (targetIdx !== undefined) {
			result[targetIdx] = (leftCols[i] ?? '').trim();
		}
	}

	// 3) Excédent → description
	const extra = leftCols.slice(headCount);
	if (descIdx >= 0 && extra.length > 0) {
		const joined = extra
			.filter((s) => s && String(s).trim())
			.join(' ')
			.trim();

		if (joined) {
			const existing = result[descIdx].trim();
			result[descIdx] = existing ? `${existing} ${joined}` : joined;
		}
	}

	return result;
}

/**
 * Validation et sécurité: détecte les injections CSV
 */
function sanitizeValue(value: string): string {
	// Trim
	value = value.trim();

	// Détection d'injection CSV (formules Excel/Sheets)
	const dangerousStarts = ['=', '+', '-', '@', '\t', '\r'];
	if (dangerousStarts.some((prefix) => value.startsWith(prefix))) {
		console.warn(`[CSV Security] Potential formula injection detected: "${value.slice(0, 50)}"`);
		// Préfixe avec ' pour neutraliser
		return `'${value}`;
	}

	// Limite de longueur par sécurité (éviter les valeurs gigantesques)
	const MAX_CELL_LENGTH = 50000;
	if (value.length > MAX_CELL_LENGTH) {
		console.warn(`[CSV Security] Value truncated (length: ${value.length})`);
		return value.slice(0, MAX_CELL_LENGTH) + '... [truncated]';
	}

	return value;
}

/**
 * Parse un CSV complet avec gestion robuste des erreurs
 */
export function parseCSV(text: string): {
	headers: string[];
	rows: CSVRow[];
	warnings: string[];
} {
	const warnings: string[] = [];

	// Validation initiale
	if (!text?.trim()) {
		warnings.push('Le fichier CSV est vide');
		return { headers: [], rows: [], warnings };
	}

	// Normalisation
	const normalized = normalizeInput(text);
	const lines = logicalLines(normalized);

	if (lines.length === 0) {
		warnings.push('Aucune ligne trouvée après normalisation');
		return { headers: [], rows: [], warnings };
	}

	// Détection du séparateur
	const delimiter = detectDelimiter(lines);

	// Header
	const headerLine = lines.shift() || '';
	if (!headerLine.trim()) {
		warnings.push("La ligne d'en-tête est vide");
		return { headers: [], rows: [], warnings };
	}

	let headers = splitCsvLine(headerLine, delimiter)
		.map((h) => h.trim())
		.filter(Boolean);

	if (headers.length === 0) {
		warnings.push("Aucune colonne trouvée dans l'en-tête");
		return { headers: [], rows: [], warnings };
	}

	// Dédoublonnage des headers
	const seen = new Map<string, number>();
	headers = headers.map((h) => {
		const count = (seen.get(h) || 0) + 1;
		seen.set(h, count);
		return count === 1 ? h : `${h}_${count}`;
	});

	// Parse des lignes
	let fixCount = 0;
	let errorCount = 0;

	const rows: CSVRow[] = [];

	for (let idx = 0; idx < lines.length; idx++) {
		const line = lines[idx];

		// Skip lignes vides
		if (!line.trim()) continue;

		try {
			const cols = splitCsvLine(line, delimiter);
			let aligned = cols;

			// Réalignement si besoin
			if (cols.length !== headers.length) {
				fixCount++;

				if (Math.abs(cols.length - headers.length) > 10) {
					warnings.push(
						`Ligne ${idx + 1}: écart important de colonnes (${cols.length} vs ${headers.length} attendues)`
					);
				}

				aligned = realignColumns(headers, cols, delimiter);
			}

			// Construction de l'objet avec sécurité
			const row: CSVRow = {};
			headers.forEach((h, j) => {
				const rawValue = aligned[j] ?? '';
				const sanitized = sanitizeValue(rawValue);
				row[h] = sanitized;
			});

			rows.push(row);
		} catch (error) {
			errorCount++;
			const message = error instanceof Error ? error.message : String(error);
			warnings.push(`Ligne ${idx + 1}: Erreur de parsing - ${message}`);
		}
	}

	// Rapport final
	if (fixCount > 0) {
		warnings.push(`${fixCount} ligne(s) réalignée(s) automatiquement`);
	}

	if (errorCount > 0) {
		warnings.push(`${errorCount} ligne(s) ignorée(s) suite à des erreurs`);
	}

	console.info(`[CSV] Parsed ${rows.length} rows with ${headers.length} columns`);

	return { headers, rows, warnings };
}
