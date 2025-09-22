// src/lib/constants/api.ts

/**
 * API endpoints and HTTP constants
 */

// Base API path (will be proxied by Vite in development)
const API_BASE = '/api';

// API Endpoints
export const API_ENDPOINTS = {
	// Auth
	AUTH: {
		LOGIN: `${API_BASE}/auth/login`,
		SIGNUP: `${API_BASE}/auth/signup`,
		REGISTER: `${API_BASE}/auth/register`,
		LOGOUT: `${API_BASE}/auth/logout`,
		ME: `${API_BASE}/auth/me`,
	},

	// Exhibitors
	EXHIBITORS: {
		LIST: `${API_BASE}/exhibitors`,
		GET: (id: string) => `${API_BASE}/exhibitors/${id}`,
		GET_BY_SLUG: (slug: string) => `${API_BASE}/exhibitors/by-slug/${slug}`,
		CREATE: `${API_BASE}/exhibitors`,
		UPDATE: (id: string) => `${API_BASE}/exhibitors/${id}`,
		DELETE: (id: string) => `${API_BASE}/exhibitors/${id}`,
	},

	// Booths
	BOOTHS: {
		LIST: `${API_BASE}/booths`,
		GET: (id: string) => `${API_BASE}/booths/${id}`,
		GET_BY_NUMBER: (number: string) => `${API_BASE}/booths/by-number/${number}`,
		GET_BY_POLYGON: (polygonId: string) => `${API_BASE}/booths/by-polygon/${polygonId}`,
		CREATE: `${API_BASE}/booths`,
		UPDATE: (id: string) => `${API_BASE}/booths/${id}`,
		DELETE: (id: string) => `${API_BASE}/booths/${id}`,
		STATS: `${API_BASE}/booths/stats/summary`,
	},

	// Sectors
	SECTORS: {
		LIST: `${API_BASE}/sectors`,
		GET: (id: string) => `${API_BASE}/sectors/${id}`,
		CREATE: `${API_BASE}/sectors`,
		UPDATE: (id: string) => `${API_BASE}/sectors/${id}`,
		DELETE: (id: string) => `${API_BASE}/sectors/${id}`,
		STATS: (id: string) => `${API_BASE}/sectors/${id}/stats`,
	},

	// Themes
	THEMES: {
		LIST: `${API_BASE}/themes`,
		GET: (id: string) => `${API_BASE}/themes/${id}`,
		GET_BY_SLUG: (slug: string) => `${API_BASE}/themes/by-slug/${slug}`,
		CREATE: `${API_BASE}/themes`,
		UPDATE: (id: string) => `${API_BASE}/themes/${id}`,
		DELETE: (id: string) => `${API_BASE}/themes/${id}`,
		SET_EXHIBITORS: (id: string) => `${API_BASE}/themes/${id}/exhibitors`,
	},

	// Favorites
	FAVORITES: {
		LIST: `${API_BASE}/favorites`,
		ADD: `${API_BASE}/favorites`,
		REMOVE: (exhibitorId: string) => `${API_BASE}/favorites/${exhibitorId}`,
		CLEAR: `${API_BASE}/favorites`,
	},

	// Analytics
	ANALYTICS: {
		TRACK: `${API_BASE}/analytics/track`,
		STATS: `${API_BASE}/analytics/stats`,
		TOP_EXHIBITORS: `${API_BASE}/analytics/top-exhibitors`,
	},

	// Users
	USERS: {
		LIST: `${API_BASE}/users`,
		GET: (id: string) => `${API_BASE}/users/${id}`,
		UPDATE: (id: string) => `${API_BASE}/users/${id}`,
		DELETE: (id: string) => `${API_BASE}/users/${id}`,
		APPROVE: (id: string) => `${API_BASE}/users/${id}/approve`,
		REJECT: (id: string) => `${API_BASE}/users/${id}/reject`,
		UPDATE_ROLE: (id: string) => `${API_BASE}/users/${id}/role`,
		STATS: `${API_BASE}/users/stats/summary`,
	},

	// Health check
	HEALTH: `${API_BASE}/health`,
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
} as const;

// Error messages
export const API_ERRORS = {
	NETWORK: 'Erreur réseau. Vérifiez votre connexion.',
	UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
	FORBIDDEN: 'Accès non autorisé.',
	NOT_FOUND: 'Ressource introuvable.',
	SERVER: 'Erreur serveur. Veuillez réessayer.',
	VALIDATION: 'Données invalides.',
} as const;
