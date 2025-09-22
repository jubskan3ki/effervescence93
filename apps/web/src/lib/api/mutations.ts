// src/lib/api/mutations.ts

import { createMutation, useQueryClient } from '@tanstack/svelte-query';

import { uiStore } from '@lib/stores/ui';
import type {
	ExhibitorFormData,
	SectorFormData,
	ThemeFormData,
	BoothFormData,
	LoginFormData,
	SignupFormData,
} from '@lib/types/forms';

import { apiClient } from './client';
import { endpoints } from './endpoints';

// Generic mutation factory
function createApiMutation<TData, TVariables = TData>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options?: {
		invalidateKeys?: string[][];
		successMessage?: string;
		errorMessage?: string;
	}
) {
	const queryClient = useQueryClient();

	return createMutation({
		mutationFn,
		onSuccess: () => {
			if (options?.invalidateKeys) {
				options.invalidateKeys.forEach((key) => {
					queryClient.invalidateQueries({ queryKey: key });
				});
			}
			if (options?.successMessage) {
				uiStore.toast.success(options.successMessage);
			}
		},
		onError: (error: any) => {
			uiStore.toast.error(error.message || options?.errorMessage || 'Une erreur est survenue');
		},
	});
}

// Auth mutations
export const useLogin = () =>
	createApiMutation((data: LoginFormData) => apiClient.post(endpoints.auth.login(), data), {
		successMessage: 'Connexion réussie',
	});

export const useSignup = () =>
	createApiMutation((data: SignupFormData) => apiClient.post(endpoints.auth.signup(), data), {
		successMessage: 'Inscription réussie. En attente de validation.',
	});

// Exhibitor mutations
export const useCreateExhibitor = () =>
	createApiMutation((data: ExhibitorFormData) => apiClient.post(endpoints.exhibitors.create(), data), {
		invalidateKeys: [['exhibitors']],
		successMessage: 'Exposant créé avec succès',
	});

export const useUpdateExhibitor = () =>
	createApiMutation(
		({ id, data }: { id: string; data: Partial<ExhibitorFormData> }) =>
			apiClient.patch(endpoints.exhibitors.update(id), data),
		{
			invalidateKeys: [['exhibitors']],
			successMessage: 'Exposant mis à jour',
		}
	);

export const useDeleteExhibitor = () =>
	createApiMutation((id: string) => apiClient.delete(endpoints.exhibitors.delete(id)), {
		invalidateKeys: [['exhibitors']],
		successMessage: 'Exposant supprimé',
	});

// Booth mutations
export const useCreateBooth = () =>
	createApiMutation((data: BoothFormData) => apiClient.post(endpoints.booths.create(), data), {
		invalidateKeys: [['booths']],
		successMessage: 'Stand créé avec succès',
	});

export const useUpdateBooth = () =>
	createApiMutation(
		({ id, data }: { id: string; data: Partial<BoothFormData> }) =>
			apiClient.patch(endpoints.booths.update(id), data),
		{
			invalidateKeys: [['booths']],
			successMessage: 'Stand mis à jour',
		}
	);

export const useDeleteBooth = () =>
	createApiMutation((id: string) => apiClient.delete(endpoints.booths.delete(id)), {
		invalidateKeys: [['booths']],
		successMessage: 'Stand supprimé',
	});

// Sector mutations
export const useCreateSector = () =>
	createApiMutation((data: SectorFormData) => apiClient.post(endpoints.sectors.create(), data), {
		invalidateKeys: [['sectors']],
		successMessage: 'Secteur créé avec succès',
	});

export const useUpdateSector = () =>
	createApiMutation(
		({ id, data }: { id: string; data: Partial<SectorFormData> }) =>
			apiClient.patch(endpoints.sectors.update(id), data),
		{
			invalidateKeys: [['sectors']],
			successMessage: 'Secteur mis à jour',
		}
	);

export const useDeleteSector = () =>
	createApiMutation((id: string) => apiClient.delete(endpoints.sectors.delete(id)), {
		invalidateKeys: [['sectors']],
		successMessage: 'Secteur supprimé',
	});

// Theme mutations
export const useCreateTheme = () =>
	createApiMutation((data: ThemeFormData) => apiClient.post(endpoints.themes.create(), data), {
		invalidateKeys: [['themes']],
		successMessage: 'Parcours créé avec succès',
	});

export const useUpdateTheme = () =>
	createApiMutation(
		({ id, data }: { id: string; data: Partial<ThemeFormData> }) =>
			apiClient.patch(endpoints.themes.update(id), data),
		{
			invalidateKeys: [['themes']],
			successMessage: 'Parcours mis à jour',
		}
	);

export const useDeleteTheme = () =>
	createApiMutation((id: string) => apiClient.delete(endpoints.themes.delete(id)), {
		invalidateKeys: [['themes']],
		successMessage: 'Parcours supprimé',
	});

// Favorite mutations
export const useToggleFavorite = () => {
	const queryClient = useQueryClient();

	return createMutation({
		mutationFn: async ({ exhibitorId, isFavorite }: { exhibitorId: string; isFavorite: boolean }) => {
			if (isFavorite) {
				return apiClient.delete(endpoints.favorites.remove(exhibitorId));
			} else {
				return apiClient.post(endpoints.favorites.add(), { exhibitorId });
			}
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['favorites'] });
			if (variables.isFavorite) {
				uiStore.toast.info('Retiré des favoris');
			} else {
				uiStore.toast.success('Ajouté aux favoris');
			}
		},
		onError: () => {
			uiStore.toast.error('Erreur lors de la mise à jour des favoris');
		},
	});
};

// User mutations
export const useApproveUser = () =>
	createApiMutation((id: string) => apiClient.patch(endpoints.users.approve(id), {}), {
		invalidateKeys: [['users']],
		successMessage: 'Utilisateur approuvé',
	});

export const useRejectUser = () =>
	createApiMutation((id: string) => apiClient.patch(endpoints.users.reject(id), {}), {
		invalidateKeys: [['users']],
		successMessage: 'Utilisateur rejeté',
	});

export const useUpdateUserRole = () =>
	createApiMutation(
		({ id, role }: { id: string; role: 'ADMIN' | 'EDITOR' | 'USER' }) =>
			apiClient.patch(endpoints.users.updateRole(id), { role }),
		{
			invalidateKeys: [['users']],
			successMessage: 'Rôle mis à jour',
		}
	);

export const useDeleteUser = () =>
	createApiMutation((id: string) => apiClient.delete(endpoints.users.delete(id)), {
		invalidateKeys: [['users']],
		successMessage: 'Utilisateur supprimé',
	});

// Analytics mutation (silent, no toast)
export const useTrackEvent = () =>
	createMutation({
		mutationFn: (data: any) => apiClient.post(endpoints.analytics.track(), data),
		onError: (error) => console.error('Analytics error:', error),
	});
