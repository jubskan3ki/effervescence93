// src/lib/stores/ui.ts
import { writable, derived } from 'svelte/store';

import { browser } from '$app/environment';

interface UIState {
	// Navigation
	isSidebarOpen: boolean;
	isMobileMenuOpen: boolean;
	isSearchOpen: boolean;

	// Modals
	activeModal: string | null;
	modalData: any;

	// Map
	isMapFullscreen: boolean;
	showLegend: boolean;
	showFilters: boolean;

	// Preferences
	theme: 'light' | 'dark' | 'auto';
	reducedMotion: boolean;

	// Loading states
	globalLoading: boolean;
	loadingMessage: string;

	// Device
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
}

function createUIStore() {
	const { subscribe, set, update } = writable<UIState>({
		isSidebarOpen: false,
		isMobileMenuOpen: false,
		isSearchOpen: false,
		activeModal: null,
		modalData: null,
		isMapFullscreen: false,
		showLegend: true,
		showFilters: false,
		theme: 'auto',
		reducedMotion: false,
		globalLoading: false,
		loadingMessage: '',
		isMobile: false,
		isTablet: false,
		isDesktop: true,
	});

	return {
		subscribe,

		init() {
			if (!browser) return;

			// Load preferences
			const theme = (localStorage.getItem('eff93_theme') as 'light' | 'dark' | 'auto') || 'auto';
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			// Detect device
			this.detectDevice();
			window.addEventListener('resize', () => this.detectDevice());

			// Apply theme
			this.setTheme(theme);

			update((s) => ({ ...s, theme, reducedMotion }));
		},

		detectDevice() {
			if (!browser) return;

			const width = window.innerWidth;
			const isMobile = width < 640;
			const isTablet = width >= 640 && width < 1024;
			const isDesktop = width >= 1024;

			update((s) => ({ ...s, isMobile, isTablet, isDesktop }));

			// Auto-close sidebar on mobile
			if (isMobile) {
				update((s) => ({ ...s, isSidebarOpen: false }));
			}
		},

		toggleSidebar() {
			update((s) => ({ ...s, isSidebarOpen: !s.isSidebarOpen }));
		},

		toggleMobileMenu() {
			update((s) => ({ ...s, isMobileMenuOpen: !s.isMobileMenuOpen }));
		},

		toggleSearch() {
			update((s) => ({ ...s, isSearchOpen: !s.isSearchOpen }));
		},

		toggleMapFullscreen() {
			update((s) => ({ ...s, isMapFullscreen: !s.isMapFullscreen }));
		},

		toggleLegend() {
			update((s) => ({ ...s, showLegend: !s.showLegend }));
		},

		toggleFilters() {
			update((s) => ({ ...s, showFilters: !s.showFilters }));
		},

		openModal(modalId: string, data?: any) {
			update((s) => ({ ...s, activeModal: modalId, modalData: data }));
		},

		closeModal() {
			update((s) => ({ ...s, activeModal: null, modalData: null }));
		},

		setTheme(theme: 'light' | 'dark' | 'auto') {
			if (!browser) return;

			localStorage.setItem('eff93_theme', theme);

			// Apply theme to document
			if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}

			update((s) => ({ ...s, theme }));
		},

		setGlobalLoading(loading: boolean, message = '') {
			update((s) => ({ ...s, globalLoading: loading, loadingMessage: message }));
		},

		reset() {
			set({
				isSidebarOpen: false,
				isMobileMenuOpen: false,
				isSearchOpen: false,
				activeModal: null,
				modalData: null,
				isMapFullscreen: false,
				showLegend: true,
				showFilters: false,
				theme: 'auto',
				reducedMotion: false,
				globalLoading: false,
				loadingMessage: '',
				isMobile: false,
				isTablet: false,
				isDesktop: true,
			});
		},
	};
}

export const ui = createUIStore();

// Derived stores
export const isAnyMenuOpen = derived(ui, ($ui) => $ui.isSidebarOpen || $ui.isMobileMenuOpen || $ui.isSearchOpen);

export const isMobileOrTablet = derived(ui, ($ui) => $ui.isMobile || $ui.isTablet);
