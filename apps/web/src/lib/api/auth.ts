// src/lib/api/auth.ts
import { api, setAccessToken } from './client';

import type { User } from '$lib/types';

interface LoginResponse {
	access_token: string;
	user: User;
}

interface SignupResponse {
	message: string;
	user: User;
}

export const auth = {
	// Login (ajout de l'option remember)
	async login(email: string, password: string, opts?: { remember?: boolean }): Promise<LoginResponse> {
		const response = await api<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});

		// ✅ Pose le cookie `access_token` (lu par +layout.server.ts)
		setAccessToken(response.access_token, { remember: !!opts?.remember });
		return response;
	},

	// Signup (public, status PENDING)
	async signup(email: string, password: string): Promise<SignupResponse> {
		return api<SignupResponse>('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
	},

	// Register (admin only, status APPROVED)
	async register(email: string, password: string, role: 'ADMIN' | 'EDITOR' = 'EDITOR'): Promise<User> {
		return api<User>('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ email, password, role }),
			auth: true,
		});
	},

	// Get current user
	async me(): Promise<User> {
		return api<User>('/auth/me', { auth: true });
	},

	// Logout
	logout(): void {
		setAccessToken(null);
	},
};
