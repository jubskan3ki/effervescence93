// src/lib/constants/config.ts

/**
 * Application configuration
 */

export const APP_CONFIG = {
	// Basic info
	name: 'Effervescence 93',
	shortName: 'E93',
	description: 'Plan interactif du salon Effervescence 93',

	// Organization
	organization: {
		name: 'CCI Seine-Saint-Denis',
		email: 'contact@effervescence93.fr',
		phone: '+33 1 48 95 10 00',
	},

	// Event
	event: {
		name: 'Effervescence 93',
		date: '2025-03-27',
		startTime: '09:00',
		endTime: '18:00',
		location: 'Parc des Expositions - Paris Nord Villepinte',
	},

	// API configuration
	api: {
		baseUrl:
			typeof window !== 'undefined'
				? window.location.hostname === 'localhost'
					? 'http://localhost:8080'
					: '/api'
				: 'http://localhost:8080',
		timeout: 30000,
		retryAttempts: 3,
	},

	// Feature flags
	features: {
		favorites: true,
		sharing: true,
		qrCode: true,
		themes: true,
		analytics: true,
		search: true,
	},

	// Limits
	limits: {
		maxFavorites: 50,
		maxContacts: 3,
		maxDescriptionLength: 800,
		searchDebounceMs: 300,
		minSearchLength: 2,
		sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
	},

	// Storage keys
	storage: {
		authToken: 'auth_token',
		sessionId: 'session_id',
		favorites: 'favorites',
		lastSync: 'last_sync',
		userPreferences: 'user_preferences',
	},

	// Pagination
	pagination: {
		defaultLimit: 20,
		maxLimit: 100,
	},
} as const;
