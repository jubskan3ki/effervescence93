// src/lib/utils/storage.ts

/**
 * LocalStorage and SessionStorage utilities with JSON support
 */

interface StorageOptions {
	expires?: number; // milliseconds
	encrypt?: boolean; // for future implementation
}

class StorageUtil {
	private prefix: string;

	constructor(
		private storage: Storage,
		prefix = 'eff93_'
	) {
		this.prefix = prefix;
	}

	private getKey(key: string): string {
		return `${this.prefix}${key}`;
	}

	get<T>(key: string, defaultValue?: T): T | null {
		try {
			const fullKey = this.getKey(key);
			const item = this.storage.getItem(fullKey);

			if (!item) {
				return defaultValue ?? null;
			}

			const data = JSON.parse(item);

			// Check expiration if set
			if (data.expires && Date.now() > data.expires) {
				this.remove(key);
				return defaultValue ?? null;
			}

			return data.value ?? defaultValue ?? null;
		} catch (error) {
			console.error(`Storage get error for ${key}:`, error);
			return defaultValue ?? null;
		}
	}

	set<T>(key: string, value: T, options?: StorageOptions): boolean {
		try {
			const fullKey = this.getKey(key);
			const data: any = { value };

			if (options?.expires) {
				data.expires = Date.now() + options.expires;
			}

			this.storage.setItem(fullKey, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error(`Storage set error for ${key}:`, error);
			return false;
		}
	}

	remove(key: string): void {
		try {
			const fullKey = this.getKey(key);
			this.storage.removeItem(fullKey);
		} catch (error) {
			console.error(`Storage remove error for ${key}:`, error);
		}
	}

	clear(): void {
		try {
			// Only clear keys with our prefix
			const keys = this.getAllKeys();
			keys.forEach((key) => {
				if (key.startsWith(this.prefix)) {
					this.storage.removeItem(key);
				}
			});
		} catch (error) {
			console.error('Storage clear error:', error);
		}
	}

	has(key: string): boolean {
		const fullKey = this.getKey(key);
		return this.storage.getItem(fullKey) !== null;
	}

	getAllKeys(): string[] {
		const keys: string[] = [];
		for (let i = 0; i < this.storage.length; i++) {
			const key = this.storage.key(i);
			if (key) keys.push(key);
		}
		return keys;
	}

	getSize(): number {
		let size = 0;
		for (let i = 0; i < this.storage.length; i++) {
			const key = this.storage.key(i);
			if (key?.startsWith(this.prefix)) {
				const item = this.storage.getItem(key);
				if (item) {
					size += key.length + item.length;
				}
			}
		}
		return size;
	}
}

// Export instances
export const storage = new StorageUtil(typeof window !== 'undefined' ? localStorage : ({} as Storage));

export const session = new StorageUtil(typeof window !== 'undefined' ? sessionStorage : ({} as Storage));

// Specific storage helpers
export const authStorage = {
	getToken(): string | null {
		return storage.get<string>('auth_token');
	},

	setToken(token: string, rememberMe = false): void {
		const expires = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined; // 30 days
		storage.set('auth_token', token, { expires });
	},

	removeToken(): void {
		storage.remove('auth_token');
	},

	isAuthenticated(): boolean {
		return !!this.getToken();
	},
};

export const favoritesStorage = {
	get(): string[] {
		return storage.get<string[]>('favorites', []) || [];
	},

	add(exhibitorId: string): void {
		const favorites = this.get();
		if (!favorites.includes(exhibitorId)) {
			favorites.push(exhibitorId);
			storage.set('favorites', favorites);
		}
	},

	remove(exhibitorId: string): void {
		const favorites = this.get().filter((id) => id !== exhibitorId);
		storage.set('favorites', favorites);
	},

	has(exhibitorId: string): boolean {
		return this.get().includes(exhibitorId);
	},

	clear(): void {
		storage.remove('favorites');
	},
};
