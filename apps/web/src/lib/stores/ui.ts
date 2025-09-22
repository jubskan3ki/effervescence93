// src/lib/stores/ui.ts

import type { ComponentType } from 'svelte';
import { writable, derived, get } from 'svelte/store';

// Types
interface Modal {
	id: string;
	component: ComponentType | null;
	props?: Record<string, any>;
	closable?: boolean;
}

interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

interface UIState {
	// Modals
	modals: Modal[];

	// Toasts
	toasts: Toast[];

	// Drawers
	isMobileMenuOpen: boolean;
	isSearchDrawerOpen: boolean;
	isFilterDrawerOpen: boolean;

	// Loading
	isPageLoading: boolean;
	loadingMessage: string | null;

	// Theme
	theme: 'light' | 'dark' | 'auto';
}

function createUIStore() {
	const initialState: UIState = {
		modals: [],
		toasts: [],
		isMobileMenuOpen: false,
		isSearchDrawerOpen: false,
		isFilterDrawerOpen: false,
		isPageLoading: false,
		loadingMessage: null,
		theme: 'light',
	};

	const { subscribe, set, update } = writable<UIState>(initialState);

	// Toast auto-dismiss
	const dismissToast = (id: string) => {
		update((state) => ({
			...state,
			toasts: state.toasts.filter((t) => t.id !== id),
		}));
	};

	const addToast = (toast: Omit<Toast, 'id'>) => {
		const id = Math.random().toString(36).slice(2);
		const newToast: Toast = { ...toast, id };

		update((state) => ({
			...state,
			toasts: [...state.toasts, newToast],
		}));

		// Auto dismiss after duration
		if (toast.duration !== 0) {
			setTimeout(() => {
				dismissToast(id);
			}, toast.duration || 5000);
		}

		return id;
	};

	return {
		subscribe,

		// Modals
		openModal(component: ComponentType, props?: Record<string, any>, closable = true) {
			const id = Math.random().toString(36).slice(2);
			update((state) => ({
				...state,
				modals: [...state.modals, { id, component, props, closable }],
			}));
			return id;
		},

		closeModal(id?: string) {
			if (id) {
				update((state) => ({
					...state,
					modals: state.modals.filter((m) => m.id !== id),
				}));
			} else {
				// Close the last modal
				update((state) => ({
					...state,
					modals: state.modals.slice(0, -1),
				}));
			}
		},

		closeAllModals() {
			update((state) => ({ ...state, modals: [] }));
		},

		// Toasts
		toast: {
			success(message: string, options?: Partial<Toast>) {
				return addToast({ ...options, type: 'success', message });
			},

			error(message: string, options?: Partial<Toast>) {
				return addToast({ ...options, type: 'error', message });
			},

			info(message: string, options?: Partial<Toast>) {
				return addToast({ ...options, type: 'info', message });
			},

			warning(message: string, options?: Partial<Toast>) {
				return addToast({ ...options, type: 'warning', message });
			},

			dismiss(id?: string) {
				if (id) {
					dismissToast(id);
				} else {
					update((state) => ({ ...state, toasts: [] }));
				}
			},

			dismissAll() {
				update((state) => ({ ...state, toasts: [] }));
			},
		},

		// Mobile menu
		toggleMobileMenu(open?: boolean) {
			update((state) => ({
				...state,
				isMobileMenuOpen: open ?? !state.isMobileMenuOpen,
			}));
		},

		// Search drawer
		toggleSearchDrawer(open?: boolean) {
			update((state) => ({
				...state,
				isSearchDrawerOpen: open ?? !state.isSearchDrawerOpen,
			}));
		},

		// Filter drawer
		toggleFilterDrawer(open?: boolean) {
			update((state) => ({
				...state,
				isFilterDrawerOpen: open ?? !state.isFilterDrawerOpen,
			}));
		},

		// Loading
		setPageLoading(isLoading: boolean, message?: string) {
			update((state) => ({
				...state,
				isPageLoading: isLoading,
				loadingMessage: message || null,
			}));
		},

		showLoading(message = 'Chargement...') {
			this.setPageLoading(true, message);
		},

		hideLoading() {
			this.setPageLoading(false);
		},

		// Theme
		setTheme(theme: 'light' | 'dark' | 'auto') {
			update((state) => ({ ...state, theme }));

			// Apply theme to document
			if (typeof document !== 'undefined') {
				if (
					theme === 'dark' ||
					(theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
				) {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			}
		},

		toggleTheme() {
			const state = get({ subscribe });
			this.setTheme(state.theme === 'light' ? 'dark' : 'light');
		},

		// Reset
		reset() {
			set(initialState);
		},
	};
}

export const uiStore = createUIStore();

// Derived stores
export const modals = derived(uiStore, ($ui) => $ui.modals);

export const toasts = derived(uiStore, ($ui) => $ui.toasts);

export const hasModals = derived(uiStore, ($ui) => $ui.modals.length > 0);

export const isMobileMenuOpen = derived(uiStore, ($ui) => $ui.isMobileMenuOpen);

export const isSearchDrawerOpen = derived(uiStore, ($ui) => $ui.isSearchDrawerOpen);

export const isFilterDrawerOpen = derived(uiStore, ($ui) => $ui.isFilterDrawerOpen);

export const isPageLoading = derived(uiStore, ($ui) => $ui.isPageLoading);

export const theme = derived(uiStore, ($ui) => $ui.theme);
