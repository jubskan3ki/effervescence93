// apps/web/src/routes/admin/+layout.server.ts
import { redirect, error } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('access_token');
	if (!token) {
		throw redirect(303, '/auth/login');
	}

	const res = await fetch(`${API_URL}/auth/me`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (res.status === 401) {
		throw redirect(303, '/auth/login');
	}
	if (!res.ok) {
		throw error(500, 'Impossible de vérifier la session utilisateur');
	}

	const user = (await res.json()) as { id: string; email: string; role: 'ADMIN' | 'EDITOR' };

	if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
		throw redirect(303, '/');
	}

	return { user };
};
