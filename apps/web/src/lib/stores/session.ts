// src/lib/stores/session.ts

import { nanoid } from 'nanoid';
import { writable, derived } from 'svelte/store';

import { APP_CONFIG } from '@lib/constants/config';

interface SessionState {
	id: string;
	createdAt: Date;
	lastActivity: Date;
}

function createSessionStore() {
	let sessionId = '';
	let createdAt = new Date();

	// Initialize session ID from localStorage or create new one
	if (typeof window !== 'undefined') {
		const storedId = localStorage.getItem(APP_CONFIG.storage.sessionId);

		if (storedId) {
			sessionId = storedId;
			// Try to get creation date from storage
			const storedDate = localStorage.getItem(`${APP_CONFIG.storage.sessionId}_created`);
			if (storedDate) {
				createdAt = new Date(storedDate);
			}
		} else {
			sessionId = nanoid();
			localStorage.setItem(APP_CONFIG.storage.sessionId, sessionId);
			localStorage.setItem(`${APP_CONFIG.storage.sessionId}_created`, createdAt.toISOString());
		}
	}

	const { subscribe, set, update } = writable<SessionState>({
		id: sessionId,
		createdAt,
		lastActivity: new Date(),
	});

	return {
		subscribe,

		getId(): string {
			if (typeof window === 'undefined') return '';
			return localStorage.getItem(APP_CONFIG.storage.sessionId) || '';
		},

		regenerate() {
			if (typeof window === 'undefined') return;

			const newId = nanoid();
			const now = new Date();

			localStorage.setItem(APP_CONFIG.storage.sessionId, newId);
			localStorage.setItem(`${APP_CONFIG.storage.sessionId}_created`, now.toISOString());

			set({
				id: newId,
				createdAt: now,
				lastActivity: now,
			});
		},

		updateActivity() {
			update((state) => ({
				...state,
				lastActivity: new Date(),
			}));
		},

		clear() {
			if (typeof window === 'undefined') return;

			localStorage.removeItem(APP_CONFIG.storage.sessionId);
			localStorage.removeItem(`${APP_CONFIG.storage.sessionId}_created`);

			// Create new session
			this.regenerate();
		},

		getAge(): number {
			const state = this.getState();
			if (!state) return 0;
			return Date.now() - state.createdAt.getTime();
		},

		isExpired(): boolean {
			return this.getAge() > APP_CONFIG.limits.sessionDuration;
		},

		getState(): SessionState | null {
			let state: SessionState | null = null;
			subscribe((s) => {
				state = s;
			})();
			return state;
		},
	};
}

export const sessionStore = createSessionStore();

// Derived stores
export const sessionId = derived(sessionStore, ($session) => $session.id);

export const sessionAge = derived(sessionStore, ($session) => Date.now() - $session.createdAt.getTime());
