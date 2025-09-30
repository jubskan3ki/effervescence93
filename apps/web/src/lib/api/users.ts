// src/lib/api/users.ts
import { api } from './client';

import type { User } from '$lib/types';

interface UserStats {
	total: number;
	byStatus: Record<string, number>;
	byRole: Record<string, number>;
}

export const users = {
	// Liste des utilisateurs
	async list(status: 'all' | 'pending' | 'approved' = 'all'): Promise<User[]> {
		return api<User[]>(`/users?status=${status}`, { auth: true });
	},

	// Stats
	async stats(): Promise<UserStats> {
		return api<UserStats>('/users/stats/summary', { auth: true });
	},

	// Approuver un utilisateur
	async approve(userId: string): Promise<User> {
		return api<User>(`/users/${userId}/approve`, {
			method: 'PATCH',
			auth: true,
		});
	},

	// Changer le rôle
	async changeRole(userId: string, role: 'ADMIN' | 'EDITOR'): Promise<User> {
		return api<User>(`/users/${userId}/role`, {
			method: 'PATCH',
			body: JSON.stringify({ role }),
			auth: true,
		});
	},

	// Supprimer
	async delete(userId: string): Promise<void> {
		return api(`/users/${userId}`, {
			method: 'DELETE',
			auth: true,
		});
	},
};
