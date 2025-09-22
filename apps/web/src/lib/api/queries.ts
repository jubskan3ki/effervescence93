// src/lib/api/queries.ts

import { createQuery } from '@tanstack/svelte-query';

import type {
	Exhibitor,
	Sector,
	Theme,
	Booth,
	User,
	PaginatedResponse,
	SearchParams,
	AnalyticsStats,
} from '@lib/types';

import { apiClient } from './client';
import { endpoints } from './endpoints';

// Exhibitors queries
export const useExhibitors = (params?: SearchParams) => {
	return createQuery({
		queryKey: ['exhibitors', params],
		queryFn: () => apiClient.get<PaginatedResponse<Exhibitor>>(endpoints.exhibitors.list(), params),
	});
};

export const useExhibitor = (id: string, enabled = true) => {
	return createQuery({
		queryKey: ['exhibitor', id],
		queryFn: () => apiClient.get<Exhibitor>(endpoints.exhibitors.get(id)),
		enabled: enabled && !!id,
	});
};

export const useExhibitorBySlug = (slug: string, enabled = true) => {
	return createQuery({
		queryKey: ['exhibitor', 'slug', slug],
		queryFn: () => apiClient.get<Exhibitor>(endpoints.exhibitors.getBySlug(slug)),
		enabled: enabled && !!slug,
	});
};

// Booths queries
export const useBooths = (params?: SearchParams) => {
	return createQuery({
		queryKey: ['booths', params],
		queryFn: () => apiClient.get<PaginatedResponse<Booth>>(endpoints.booths.list(), params),
	});
};

export const useBooth = (id: string, enabled = true) => {
	return createQuery({
		queryKey: ['booth', id],
		queryFn: () => apiClient.get<Booth>(endpoints.booths.get(id)),
		enabled: enabled && !!id,
	});
};

export const useBoothByNumber = (number: string, enabled = true) => {
	return createQuery({
		queryKey: ['booth', 'number', number],
		queryFn: () => apiClient.get<Booth>(endpoints.booths.getByNumber(number)),
		enabled: enabled && !!number,
	});
};

export const useAvailableBooths = () => {
	return createQuery({
		queryKey: ['booths', 'available'],
		queryFn: () => apiClient.get<Booth[]>(endpoints.booths.available()),
	});
};

export const useBoothStats = () => {
	return createQuery({
		queryKey: ['booths', 'stats'],
		queryFn: () => apiClient.get<any>(endpoints.booths.stats()),
	});
};

// Sectors queries
export const useSectors = () => {
	return createQuery({
		queryKey: ['sectors'],
		queryFn: () => apiClient.get<Sector[]>(endpoints.sectors.list()),
	});
};

export const useSector = (id: string, enabled = true) => {
	return createQuery({
		queryKey: ['sector', id],
		queryFn: () => apiClient.get<Sector>(endpoints.sectors.get(id)),
		enabled: enabled && !!id,
	});
};

export const useSectorStats = (id: string, enabled = true) => {
	return createQuery({
		queryKey: ['sector', id, 'stats'],
		queryFn: () => apiClient.get<any>(endpoints.sectors.stats(id)),
		enabled: enabled && !!id,
	});
};

// Themes queries
export const useThemes = () => {
	return createQuery({
		queryKey: ['themes'],
		queryFn: () => apiClient.get<Theme[]>(endpoints.themes.list()),
	});
};

export const useTheme = (id: string, enabled = true) => {
	return createQuery({
		queryKey: ['theme', id],
		queryFn: () => apiClient.get<Theme>(endpoints.themes.get(id)),
		enabled: enabled && !!id,
	});
};

export const useThemeBySlug = (slug: string, enabled = true) => {
	return createQuery({
		queryKey: ['theme', 'slug', slug],
		queryFn: () => apiClient.get<Theme>(endpoints.themes.getBySlug(slug)),
		enabled: enabled && !!slug,
	});
};

// Favorites queries
export const useFavorites = () => {
	return createQuery({
		queryKey: ['favorites'],
		queryFn: () => apiClient.get<Exhibitor[]>(endpoints.favorites.list()),
	});
};

// Users queries (admin only)
export const useUsers = (params?: SearchParams) => {
	return createQuery({
		queryKey: ['users', params],
		queryFn: () => apiClient.get<PaginatedResponse<User>>(endpoints.users.list(), params),
	});
};

export const useUser = (id: string, enabled = true) => {
	return createQuery({
		queryKey: ['user', id],
		queryFn: () => apiClient.get<User>(endpoints.users.get(id)),
		enabled: enabled && !!id,
	});
};

export const useUserStats = () => {
	return createQuery({
		queryKey: ['users', 'stats'],
		queryFn: () => apiClient.get<any>(endpoints.users.stats()),
	});
};

// Analytics queries
export const useAnalyticsStats = (params?: { from?: string; to?: string }) => {
	return createQuery({
		queryKey: ['analytics', 'stats', params],
		queryFn: () => apiClient.get<AnalyticsStats>(endpoints.analytics.stats(), params),
	});
};

export const useTopExhibitors = (limit = 10) => {
	return createQuery({
		queryKey: ['analytics', 'top-exhibitors', limit],
		queryFn: () => apiClient.get<any[]>(endpoints.analytics.topExhibitors(), { limit }),
	});
};

export const useSearchQueries = (limit = 20) => {
	return createQuery({
		queryKey: ['analytics', 'search-queries', limit],
		queryFn: () => apiClient.get<any[]>(endpoints.analytics.searchQueries(), { limit }),
	});
};

// System queries
export const useHealth = () => {
	return createQuery({
		queryKey: ['health'],
		queryFn: () => apiClient.get<{ status: string }>(endpoints.system.health()),
		refetchInterval: 30000, // Check every 30 seconds
	});
};

// Custom hooks with additional logic
export const useCurrentUser = () => {
	return createQuery({
		queryKey: ['auth', 'me'],
		queryFn: () => apiClient.get<User>(endpoints.auth.me()),
		retry: false,
	});
};

// Search hook with debouncing built-in
export const useSearch = (query: string, filters?: Partial<SearchParams>) => {
	return createQuery({
		queryKey: ['search', query, filters],
		queryFn: () =>
			apiClient.get<PaginatedResponse<Exhibitor>>(endpoints.exhibitors.list(), { q: query, ...filters }),
		enabled: query.length >= 2 || !!filters?.sectorId || !!filters?.themeId,
	});
};
