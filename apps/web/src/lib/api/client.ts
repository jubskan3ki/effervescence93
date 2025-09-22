// src/lib/api/client.ts

import { get } from 'svelte/store';

import { HTTP_STATUS, API_ERRORS } from '@lib/constants/api';
import { authStore } from '@lib/stores/auth';
import { sessionStore } from '@lib/stores/session';

interface RequestOptions extends RequestInit {
	params?: Record<string, any>;
	noAuth?: boolean;
	noSession?: boolean;
}

interface ApiError {
	message: string;
	code?: string;
	statusCode: number;
	details?: any;
}

class ApiClient {
	private baseURL: string;

	constructor() {
		this.baseURL = '/api'; // Will be proxied by Vite in dev
	}

	private getHeaders(options?: RequestOptions): Record<string, string> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		// Add custom headers
		if (options?.headers) {
			Object.entries(options.headers).forEach(([key, value]) => {
				if (typeof value === 'string') {
					headers[key] = value;
				}
			});
		}

		// Add auth token if available
		if (!options?.noAuth && typeof window !== 'undefined') {
			const auth = get(authStore);
			if (auth.token) {
				headers['Authorization'] = `Bearer ${auth.token}`;
			}
		}

		// Add session ID if available
		if (!options?.noSession && typeof window !== 'undefined') {
			const sessionId = sessionStore.getId();
			if (sessionId) {
				headers['x-session-id'] = sessionId;
			}
		}

		return headers;
	}

	private handleError(response: Response, data: any): never {
		const error: ApiError = {
			message: data?.message || API_ERRORS.SERVER,
			code: data?.code,
			statusCode: response.status,
			details: data?.details,
		};

		// Handle specific status codes
		switch (response.status) {
			case HTTP_STATUS.UNAUTHORIZED:
				if (typeof window !== 'undefined') {
					authStore.logout();
				}
				error.message = API_ERRORS.UNAUTHORIZED;
				break;
			case HTTP_STATUS.FORBIDDEN:
				error.message = API_ERRORS.FORBIDDEN;
				break;
			case HTTP_STATUS.NOT_FOUND:
				error.message = API_ERRORS.NOT_FOUND;
				break;
			case HTTP_STATUS.UNPROCESSABLE_ENTITY:
				error.message = API_ERRORS.VALIDATION;
				break;
			case HTTP_STATUS.TOO_MANY_REQUESTS:
				error.message = 'Trop de requêtes. Veuillez patienter.';
				break;
		}

		throw error;
	}

	async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		// Build URL with params
		let url = `${this.baseURL}${endpoint}`;
		if (options?.params) {
			const params = new URLSearchParams();
			Object.entries(options.params).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					params.append(key, String(value));
				}
			});
			const queryString = params.toString();
			if (queryString) {
				url += `?${queryString}`;
			}
		}

		try {
			const response = await fetch(url, {
				...options,
				headers: this.getHeaders(options),
			});

			// Handle no content responses
			if (response.status === HTTP_STATUS.NO_CONTENT) {
				return null as any;
			}

			const data = await response.json();

			if (!response.ok) {
				this.handleError(response, data);
			}

			return data;
		} catch (error) {
			// Network error or other fetch failures
			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				throw {
					message: API_ERRORS.NETWORK,
					statusCode: 0,
				};
			}
			throw error;
		}
	}

	// HTTP Methods
	async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'GET',
			params,
		});
	}

	async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async put<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'PUT',
			body: JSON.stringify(body),
		});
	}

	async patch<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'PATCH',
			body: JSON.stringify(body),
		});
	}

	async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'DELETE',
		});
	}
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiError, RequestOptions };
