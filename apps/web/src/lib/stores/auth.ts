// src/lib/stores/auth.ts

import { writable, derived, get } from 'svelte/store';

import { API_ENDPOINTS } from '@lib/constants/api';
import { APP_CONFIG } from '@lib/constants/config';
import { ROUTES } from '@lib/constants/routes';
import type { User } from '@lib/types/models';

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		token: null,
		isAuthenticated: false,
		isLoading: true,
	});

	// Initialize from localStorage
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem(APP_CONFIG.storage.authToken);
		if (token) {
			update((state) => ({
				...state,
				token,
				isLoading: true,
			}));
		} else {
			update((state) => ({ ...state, isLoading: false }));
		}
	}

	return {
		subscribe,

		async login(email: string, password: string) {
			update((state) => ({ ...state, isLoading: true }));

			try {
				const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Échec de connexion');
				}

				const data = await response.json();

				if (typeof window !== 'undefined') {
					localStorage.setItem(APP_CONFIG.storage.authToken, data.access_token);
				}

				set({
					user: data.user,
					token: data.access_token,
					isAuthenticated: true,
					isLoading: false,
				});

				// Navigate to dashboard
				if (typeof window !== 'undefined') {
					window.location.href = ROUTES.admin.DASHBOARD;
				}

				return data;
			} catch (error) {
				update((state) => ({ ...state, isLoading: false }));
				throw error;
			}
		},

		async signup(email: string, password: string) {
			update((state) => ({ ...state, isLoading: true }));

			try {
				const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || "Échec de l'inscription");
				}

				const data = await response.json();
				update((state) => ({ ...state, isLoading: false }));
				return data;
			} catch (error) {
				update((state) => ({ ...state, isLoading: false }));
				throw error;
			}
		},

		async checkAuth() {
			const state = get({ subscribe });
			if (!state.token || typeof window === 'undefined') {
				set({ user: null, token: null, isAuthenticated: false, isLoading: false });
				return;
			}

			try {
				const response = await fetch(API_ENDPOINTS.AUTH.ME, {
					headers: {
						Authorization: `Bearer ${state.token}`,
					},
				});

				if (!response.ok) {
					throw new Error('Invalid token');
				}

				const user = await response.json();
				update((s) => ({
					...s,
					user,
					isAuthenticated: true,
					isLoading: false,
				}));
			} catch (error) {
				console.error('Auth check failed:', error);
				this.logout();
			}
		},

		logout() {
			if (typeof window !== 'undefined') {
				localStorage.removeItem(APP_CONFIG.storage.authToken);
			}
			set({
				user: null,
				token: null,
				isAuthenticated: false,
				isLoading: false,
			});

			// Navigate to login
			if (typeof window !== 'undefined') {
				window.location.href = ROUTES.admin.LOGIN;
			}
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const authStore = createAuthStore();

// Derived stores
export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);

export const currentUser = derived(authStore, ($auth) => $auth.user);

export const isAdmin = derived(authStore, ($auth) => $auth.user?.role === 'ADMIN');

export const isEditor = derived(authStore, ($auth) => $auth.user?.role === 'EDITOR' || $auth.user?.role === 'ADMIN');

export const authToken = derived(authStore, ($auth) => $auth.token);
