// src/lib/api/endpoints.ts

/**
 * Centralized API endpoint definitions
 * These match the backend API routes
 */

// Auth endpoints
export const authEndpoints = {
	login: () => '/auth/login',
	signup: () => '/auth/signup',
	register: () => '/auth/register',
	logout: () => '/auth/logout',
	me: () => '/auth/me',
	refresh: () => '/auth/refresh',
} as const;

// Exhibitor endpoints
export const exhibitorEndpoints = {
	list: () => '/exhibitors',
	get: (id: string) => `/exhibitors/${id}`,
	getBySlug: (slug: string) => `/exhibitors/by-slug/${slug}`,
	create: () => '/exhibitors',
	update: (id: string) => `/exhibitors/${id}`,
	delete: (id: string) => `/exhibitors/${id}`,
	search: () => '/exhibitors/search',
} as const;

// Booth endpoints
export const boothEndpoints = {
	list: () => '/booths',
	get: (id: string) => `/booths/${id}`,
	getByNumber: (number: string) => `/booths/by-number/${number}`,
	getByPolygon: (polygonId: string) => `/booths/by-polygon/${polygonId}`,
	create: () => '/booths',
	update: (id: string) => `/booths/${id}`,
	delete: (id: string) => `/booths/${id}`,
	stats: () => '/booths/stats/summary',
	available: () => '/booths/available',
} as const;

// Sector endpoints
export const sectorEndpoints = {
	list: () => '/sectors',
	get: (id: string) => `/sectors/${id}`,
	create: () => '/sectors',
	update: (id: string) => `/sectors/${id}`,
	delete: (id: string) => `/sectors/${id}`,
	stats: (id: string) => `/sectors/${id}/stats`,
} as const;

// Theme endpoints
export const themeEndpoints = {
	list: () => '/themes',
	get: (id: string) => `/themes/${id}`,
	getBySlug: (slug: string) => `/themes/by-slug/${slug}`,
	create: () => '/themes',
	update: (id: string) => `/themes/${id}`,
	delete: (id: string) => `/themes/${id}`,
	setExhibitors: (id: string) => `/themes/${id}/exhibitors`,
	reorder: () => '/themes/reorder',
} as const;

// Favorite endpoints
export const favoriteEndpoints = {
	list: () => '/favorites',
	add: () => '/favorites',
	remove: (exhibitorId: string) => `/favorites/${exhibitorId}`,
	clear: () => '/favorites',
	sync: () => '/favorites/sync',
} as const;

// Analytics endpoints
export const analyticsEndpoints = {
	track: () => '/analytics/track',
	stats: () => '/analytics/stats',
	topExhibitors: () => '/analytics/top-exhibitors',
	searchQueries: () => '/analytics/search-queries',
	deviceStats: () => '/analytics/devices',
	export: () => '/analytics/export',
} as const;

// User endpoints
export const userEndpoints = {
	list: () => '/users',
	get: (id: string) => `/users/${id}`,
	create: () => '/users',
	update: (id: string) => `/users/${id}`,
	delete: (id: string) => `/users/${id}`,
	approve: (id: string) => `/users/${id}/approve`,
	reject: (id: string) => `/users/${id}/reject`,
	updateRole: (id: string) => `/users/${id}/role`,
	stats: () => '/users/stats/summary',
} as const;

// System endpoints
export const systemEndpoints = {
	health: () => '/health',
	version: () => '/version',
	config: () => '/config',
} as const;

// Export all endpoints
export const endpoints = {
	auth: authEndpoints,
	exhibitors: exhibitorEndpoints,
	booths: boothEndpoints,
	sectors: sectorEndpoints,
	themes: themeEndpoints,
	favorites: favoriteEndpoints,
	analytics: analyticsEndpoints,
	users: userEndpoints,
	system: systemEndpoints,
} as const;
