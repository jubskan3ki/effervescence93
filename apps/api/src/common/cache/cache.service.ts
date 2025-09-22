// src/common/cache/cache.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { env } from '@common/env';

interface CacheEntry<T> {
	data: T;
	expiry: number;
}

@Injectable()
export class CacheService implements OnModuleInit {
	private cache = new Map<string, CacheEntry<any>>();
	private readonly defaultTTL = env.CACHE_TTL;

	onModuleInit() {
		console.log('📦 Cache service initialized with default TTL:', this.defaultTTL, 'seconds');
	}

	/**
	 * Store data in cache
	 * @param key Cache key
	 * @param data Data to cache
	 * @param ttl Time to live in seconds (optional)
	 */
	set<T>(key: string, data: T, ttl?: number): void {
		const expiry = Date.now() + (ttl || this.defaultTTL) * 1000;
		this.cache.set(key, { data, expiry });
	}

	/**
	 * Get data from cache
	 * @param key Cache key
	 * @returns Cached data or null if expired/not found
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() > entry.expiry) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	/**
	 * Get data from cache or fetch it if not present
	 * @param key Cache key
	 * @param fetchFn Function to fetch data if not in cache
	 * @param ttl Custom TTL in seconds
	 */
	async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
		const cached = this.get<T>(key);
		if (cached !== null) {
			return cached;
		}

		const data = await fetchFn();
		this.set(key, data, ttl);
		return data;
	}

	/**
	 * Check if key exists in cache
	 */
	has(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) return false;

		if (Date.now() > entry.expiry) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}

	/**
	 * Delete specific key from cache
	 */
	delete(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Delete all keys matching a pattern
	 * @param pattern Pattern to match (e.g., 'exhibitor:*')
	 */
	deletePattern(pattern: string): void {
		const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Clear entire cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats(): { size: number; keys: string[] } {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
		};
	}

	/**
	 * Clean expired entries (runs every 5 minutes)
	 */
	@Cron(CronExpression.EVERY_5_MINUTES)
	cleanExpired(): void {
		const now = Date.now();
		let cleaned = 0;

		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiry) {
				this.cache.delete(key);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			console.log(`🧹 Cache: cleaned ${cleaned} expired entries`);
		}
	}
}
