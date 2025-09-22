// src/lib/utils/qr.ts

/**
 * QR Code generation and parsing utilities
 */

import QrScanner from 'qr-scanner';
import QRCode from 'qrcode';

interface QROptions {
	width?: number;
	margin?: number;
	color?: {
		dark?: string;
		light?: string;
	};
	errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

interface QRParseResult {
	type: 'exhibitor' | 'booth' | 'theme' | 'url' | 'unknown';
	value: string;
	data?: any;
}

class QRUtil {
	private baseUrl: string;

	constructor() {
		this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://plan.effervescence93.fr';
	}

	/**
	 * Generate QR code as data URL
	 */
	async generate(text: string, options?: QROptions): Promise<string> {
		try {
			const qrOptions = {
				width: options?.width || 256,
				margin: options?.margin || 2,
				color: {
					dark: options?.color?.dark || '#000000',
					light: options?.color?.light || '#FFFFFF',
				},
				errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
			};

			return await QRCode.toDataURL(text, qrOptions);
		} catch (error) {
			console.error('QR generation failed:', error);
			throw new Error('Impossible de générer le QR code');
		}
	}

	/**
	 * Generate QR code as SVG string
	 */
	async generateSVG(text: string, options?: QROptions): Promise<string> {
		try {
			return await QRCode.toString(text, {
				type: 'svg',
				width: options?.width || 256,
				margin: options?.margin || 2,
				color: {
					dark: options?.color?.dark || '#000000',
					light: options?.color?.light || '#FFFFFF',
				},
				errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
			});
		} catch (error) {
			console.error('QR SVG generation failed:', error);
			throw new Error('Impossible de générer le QR code SVG');
		}
	}

	/**
	 * Generate QR code and download it
	 */
	async download(text: string, filename: string, options?: QROptions): Promise<void> {
		try {
			const dataUrl = await this.generate(text, options);

			const link = document.createElement('a');
			link.download = filename;
			link.href = dataUrl;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('QR download failed:', error);
			throw new Error('Impossible de télécharger le QR code');
		}
	}

	/**
	 * Scan QR code from file
	 */
	async scanFile(file: File): Promise<string> {
		try {
			if (!file.type.startsWith('image/')) {
				throw new Error('Le fichier doit être une image');
			}

			// Utilisation simple sans options
			const result = await QrScanner.scanImage(file);
			return result;
		} catch (error) {
			console.error('QR scan failed:', error);
			throw new Error('Impossible de lire le QR code');
		}
	}

	/**
	 * Parse QR code data to determine type and extract information
	 */
	parseData(data: string): QRParseResult {
		// Try to parse as URL
		try {
			const url = new URL(data);

			// Check if it's our domain
			if (url.origin === this.baseUrl) {
				const pathname = url.pathname;
				const params = url.searchParams;

				// Check for exhibitor URL
				if (pathname.startsWith('/exposant/')) {
					const slug = pathname.split('/exposant/')[1];
					return {
						type: 'exhibitor',
						value: slug,
						data: { slug, url: data },
					};
				}

				// Check for theme URL
				if (pathname.startsWith('/parcours/')) {
					const slug = pathname.split('/parcours/')[1];
					return {
						type: 'theme',
						value: slug,
						data: { slug, url: data },
					};
				}

				// Check for booth parameter
				if (params.has('stand')) {
					const boothNumber = params.get('stand')!;
					return {
						type: 'booth',
						value: boothNumber,
						data: { boothNumber, url: data },
					};
				}

				// Generic URL from our domain
				return {
					type: 'url',
					value: data,
					data: { url: data, internal: true },
				};
			}

			// External URL
			return {
				type: 'url',
				value: data,
				data: { url: data, internal: false },
			};
		} catch {
			// Not a valid URL, return as unknown
			return {
				type: 'unknown',
				value: data,
			};
		}
	}

	/**
	 * Generate URL for exhibitor QR code
	 */
	getExhibitorUrl(slug: string): string {
		return `${this.baseUrl}/exposant/${slug}`;
	}

	/**
	 * Generate URL for booth QR code
	 */
	getBoothUrl(boothNumber: string): string {
		return `${this.baseUrl}?stand=${encodeURIComponent(boothNumber)}`;
	}

	/**
	 * Generate URL for theme QR code
	 */
	getThemeUrl(slug: string): string {
		return `${this.baseUrl}/parcours/${slug}`;
	}

	/**
	 * Generate QR code for exhibitor
	 */
	async generateExhibitorQR(slug: string, options?: QROptions): Promise<string> {
		const url = this.getExhibitorUrl(slug);
		return this.generate(url, options);
	}

	/**
	 * Generate QR code for booth
	 */
	async generateBoothQR(boothNumber: string, options?: QROptions): Promise<string> {
		const url = this.getBoothUrl(boothNumber);
		return this.generate(url, options);
	}

	/**
	 * Generate QR code for theme
	 */
	async generateThemeQR(slug: string, options?: QROptions): Promise<string> {
		const url = this.getThemeUrl(slug);
		return this.generate(url, options);
	}

	/**
	 * Start camera scan (requires user permission)
	 * Version simplifiée sans options avancées
	 */
	async startCameraScan(
		videoElement: HTMLVideoElement,
		onResult: (result: string) => void,
		onError?: (error: Error) => void
	): Promise<QrScanner> {
		// Création du scanner avec callback simple
		const scanner = new QrScanner(videoElement, (result) => {
			// Traitement du résultat selon son type
			// La plupart des versions récentes retournent un objet
			if (result && typeof result === 'object' && 'data' in result) {
				onResult((result as any).data);
			} else if (typeof result === 'string') {
				onResult(result);
			} else {
				console.warn('Format de résultat QR inconnu:', result);
				onResult(String(result));
			}
		});

		// Configuration des options après création si nécessaire
		if (onError) {
			// Certaines versions permettent de définir le handler d'erreur ainsi
			(scanner as any).onDecodeError = onError;
		}

		await scanner.start();
		return scanner;
	}

	/**
	 * Check if camera is available
	 */
	async hasCamera(): Promise<boolean> {
		try {
			return await QrScanner.hasCamera();
		} catch {
			return false;
		}
	}
}

// Export singleton instance
export const qr = new QRUtil();

// Export types
export type { QROptions, QRParseResult };
