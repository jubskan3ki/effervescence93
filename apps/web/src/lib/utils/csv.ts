// apps/web/src/lib/utils/csv.ts
export type CSVRow = Record<string, string | number | boolean | null | undefined>;

/**
 * Queue "stable" (les colonnes de fin qu'on veut absolument réaligner par la droite).
 * On la calcule dynamiquement à partir du header trouvé, mais on garde cet ordre par défaut
 * pour le cas où un CSV manquerait certaines colonnes.
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

export function toCSV(headers: string[], rows: CSVRow[]): string {
	function esc(val: unknown): string {
		if (val === null || val === undefined) return '';
		const s = String(val);
		if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
		return s;
	}
	const head = headers.join(',');
	const body = rows.map((r) => headers.map((h) => esc(r[h])).join(',')).join('\n');
	return `${head}\n${body}`;
}

/* ------------------------------------------------------------------------------------ */
/* Parsing                                                                             */
/* ------------------------------------------------------------------------------------ */

/** Nettoie BOM + normalise les retours ligne */
function normalizeInput(text: string): string {
	// enlève le BOM éventuel
	if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
	return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Détecte le séparateur (`,` ou `;`) en se basant sur la ligne d’en-tête + 2 lignes suivantes */
function detectDelimiter(lines: string[]): ',' | ';' {
	const sample = lines.slice(0, 3);
	let commaScore = 0,
		semiScore = 0;
	for (const l of sample) {
		commaScore += (l.match(/,/g) || []).length;
		semiScore += (l.match(/;/g) || []).length;
	}
	return semiScore > commaScore ? ';' : ',';
}

/** Split RFC4180 d’une ligne, gestion des guillemets, double-guillemets, séparateur configurable */
function splitCsvLine(line: string, delimiter: ',' | ';'): string[] {
	const cols: string[] = [];
	let v = '',
		q = false;
	for (let k = 0; k < line.length; k++) {
		const ch = line[k];
		if (ch === '"' && line[k + 1] === '"') {
			v += '"';
			k++;
			continue;
		}
		if (ch === '"') {
			q = !q;
			continue;
		}
		if (!q && ch === delimiter) {
			cols.push(v);
			v = '';
			continue;
		}
		v += ch;
	}
	cols.push(v);
	return cols;
}

/** Construit les lignes logiques (respect des \n à l’intérieur des champs quotés) */
function logicalLines(input: string): string[] {
	const out: string[] = [];
	let i = 0,
		cur = '',
		inQ = false;
	while (i < input.length) {
		const c = input[i];
		if (c === '"' && input[i + 1] === '"') {
			cur += '"';
			i += 2;
			continue;
		}
		if (c === '"') {
			inQ = !inQ;
			i++;
			continue;
		}
		if (!inQ && c === '\n') {
			out.push(cur);
			cur = '';
			i++;
			continue;
		}
		cur += c;
		i++;
	}
	if (cur !== '') out.push(cur);
	return out;
}

/**
 * Réaligne une ligne si le nombre de colonnes ≠ headers.length.
 * Principe :
 *  - on mappe la "tail" stable (website_url → contacts_email) par la droite
 *  - on remplit la tête jusqu’à "logo_url"
 *  - on concatène tout excédent au champ "description"
 */
function realignColumns(headers: string[], cols: string[], delimiter: ',' | ';'): string[] {
	const need = headers.length;
	if (cols.length === need) return cols.slice();

	const indexMap = new Map(headers.map((h, i) => [h, i]));
	const stableTail = headers.filter((h) => DEFAULT_STABLE_TAIL.includes(h));
	const tailLen = stableTail.length;

	const out = new Array<string>(need).fill('');

	// 1) Remplir la queue "stable" depuis la droite du tableau source
	for (let i = 0; i < tailLen; i++) {
		const headerName = stableTail[tailLen - 1 - i];
		const targetIdx = indexMap.get(headerName)!;
		const sourceIdx = cols.length - 1 - i;
		if (sourceIdx >= 0) out[targetIdx] = (cols[sourceIdx] ?? '').trim();
	}

	// 2) On traite la "tête" jusqu’à description
	const descIdx = indexMap.get('description') ?? -1;
	const logoIdx = indexMap.get('logo_url') ?? -1;
	const beforeDescHeaders: string[] = [];
	for (let i = 0; i < headers.length; i++) {
		const h = headers[i];
		if (i < logoIdx) beforeDescHeaders.push(h); // tout jusqu’à logo_url (exclu)
		if (i === logoIdx) {
			beforeDescHeaders.push(h);
			break;
		}
	}

	const headCount = beforeDescHeaders.length;
	const sourceLeftCount = Math.max(0, cols.length - tailLen);
	const leftCols = cols.slice(0, sourceLeftCount);

	// Remplir tous les champs avant description (jusqu'à logo_url)
	for (let i = 0; i < headCount; i++) {
		const h = beforeDescHeaders[i];
		const targetIdx = indexMap.get(h)!;
		out[targetIdx] = (leftCols[i] ?? '').trim();
	}

	// 3) Tout surplus côté gauche va dans description (concat)
	const extra = leftCols.slice(headCount);
	if (descIdx >= 0 && extra.length) {
		const joined = extra.filter((s) => s !== undefined && s !== null && String(s).length > 0).join(' ');
		out[descIdx] = [out[descIdx], joined].filter(Boolean).join(' ');
	}

	// 4) Si la ligne est trop courte (ex: 16 au lieu de 17), pad à droite (déjà géré via Array.fill + affectations)
	return out;
}

export function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
	const input = normalizeInput(text);
	const linesRaw = logicalLines(input);
	if (!linesRaw.length) return { headers: [], rows: [] };

	// Détecter le séparateur le plus probable
	const delimiter = detectDelimiter(linesRaw);
	// Header
	const rawHeader = (linesRaw.shift() || '').trim();
	let headers = splitCsvLine(rawHeader, delimiter).map((s) => s.trim());

	// Sécu : enlever headers vides et collisions
	headers = headers.filter(Boolean);
	const unique = new Set(headers);
	if (unique.size !== headers.length) {
		// en cas de doublon improbable, on suffixe
		const seen = new Map<string, number>();
		headers = headers.map((h) => {
			const n = (seen.get(h) || 0) + 1;
			seen.set(h, n);
			return n === 1 ? h : `${h}_${n}`;
		});
	}

	// Parse des lignes
	let fixCount = 0;
	const rows = linesRaw
		.filter((r) => r.trim().length)
		.map((line, idx) => {
			const cols = splitCsvLine(line, delimiter);
			let arr = cols;
			if (cols.length !== headers.length) {
				fixCount++;

				console.warn(
					'[CSV][fix]',
					`row#${idx + 1}: cols=${cols.length} ≠ headers=${headers.length} → realignColumns`
				);
				arr = realignColumns(headers, cols, delimiter);
			}
			const obj: CSVRow = {};
			headers.forEach((h, j) => (obj[h] = (arr[j] ?? '').trim()));
			return obj;
		});

	// Log discret une seule fois si corrections
	if (fixCount > 0) {
		console.warn(`[CSV] ${fixCount} ligne(s) réalignée(s). Vérifie les champs description/website_url si besoin.`);
	}

	return { headers, rows };
}
