// src/lib/constants/routes.ts

/**
 * Application routes definitions
 */

// Public routes
export const PUBLIC_ROUTES = {
	HOME: '/',
	EXHIBITOR: (slug: string) => `/exposant/${slug}`,
	THEME: (slug: string) => `/parcours/${slug}`,
	FAVORITES: '/favoris',
	SEARCH: '/recherche',
	ABOUT: '/a-propos',
	CONTACT: '/contact',
	LEGAL: '/mentions-legales',
} as const;

// Admin routes
export const ADMIN_ROUTES = {
	LOGIN: '/login',
	DASHBOARD: '/admin',

	// Exhibitors
	EXHIBITORS: '/admin/exposants',
	EXHIBITOR_NEW: '/admin/exposants/nouveau',
	EXHIBITOR_EDIT: (id: string) => `/admin/exposants/${id}/modifier`,

	// Booths
	BOOTHS: '/admin/stands',
	BOOTH_NEW: '/admin/stands/nouveau',
	BOOTH_EDIT: (id: string) => `/admin/stands/${id}/modifier`,

	// Sectors
	SECTORS: '/admin/secteurs',
	SECTOR_NEW: '/admin/secteurs/nouveau',
	SECTOR_EDIT: (id: string) => `/admin/secteurs/${id}/modifier`,

	// Themes
	THEMES: '/admin/parcours',
	THEME_NEW: '/admin/parcours/nouveau',
	THEME_EDIT: (id: string) => `/admin/parcours/${id}/modifier`,

	// Analytics & Users
	ANALYTICS: '/admin/analytics',
	USERS: '/admin/utilisateurs',
	USER_EDIT: (id: string) => `/admin/utilisateurs/${id}/modifier`,

	// Settings
	SETTINGS: '/admin/parametres',
} as const;

// Combined routes
export const ROUTES = {
	...PUBLIC_ROUTES,
	admin: ADMIN_ROUTES,
} as const;

// Route helpers
export const isAdminRoute = (path: string): boolean => {
	return path.startsWith('/admin');
};

export const isPublicRoute = (path: string): boolean => {
	return !isAdminRoute(path);
};

export const requiresAuth = (path: string): boolean => {
	return isAdminRoute(path) && path !== ADMIN_ROUTES.LOGIN;
};

// Navigation items
export interface NavItem {
	label: string;
	href: string;
	icon?: string;
}

export const PUBLIC_NAV: NavItem[] = [
	{ label: 'Plan', href: PUBLIC_ROUTES.HOME },
	{ label: 'Recherche', href: PUBLIC_ROUTES.SEARCH },
	{ label: 'Favoris', href: PUBLIC_ROUTES.FAVORITES },
];

export const ADMIN_NAV: NavItem[] = [
	{ label: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD },
	{ label: 'Exposants', href: ADMIN_ROUTES.EXHIBITORS },
	{ label: 'Stands', href: ADMIN_ROUTES.BOOTHS },
	{ label: 'Secteurs', href: ADMIN_ROUTES.SECTORS },
	{ label: 'Parcours', href: ADMIN_ROUTES.THEMES },
	{ label: 'Analytics', href: ADMIN_ROUTES.ANALYTICS },
	{ label: 'Utilisateurs', href: ADMIN_ROUTES.USERS },
];
