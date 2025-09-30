// src/app.d.ts (ou src/routes/+layout.ts pour les types)
import type { User } from '$lib/types';

declare global {
	namespace App {
		interface Error {
			code?: string;
			message: string;
		}
		interface Locals {
			user?: User | null;
		}

		interface PageData {
			sessionId?: string;
			user?: User | null;
			initialFavorites?: string[];
		}

		interface Error {
			message?: string;
			status?: number;
		}
	}
	const __APP_VERSION__: string;
	const __APP_MODE__: 'public' | 'admin';
}

// Pour le layout.server.ts
export interface LayoutServerData {
	sessionId: string;
	user?: User | null;
	initialFavorites: string[];
}

export {};
