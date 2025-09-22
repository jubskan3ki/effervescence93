// src/common/env.ts
import { z } from 'zod';

const schema = z.object({
	// Core
	PORT: z.coerce.number().default(8080),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

	// Database
	DATABASE_URL: z.string(),

	// Uploads
	UPLOAD_DIR: z.string().default('/app/uploads'),
	STATIC_BASE_URL: z.string().default('/uploads'),
	ALLOWED_MIME: z.string().default('image/png,image/jpeg,image/webp,image/svg+xml,application/pdf'),
	MAX_UPLOAD_MB: z.coerce.number().default(10),

	// Auth
	JWT_SECRET: z.string().min(32),
	JWT_EXPIRES: z.string().default('7d'),
	BCRYPT_ROUNDS: z.coerce.number().default(10),

	// CORS
	CORS_ORIGIN: z.string().default('http://localhost:5173'),

	// Rate limiting
	RATE_LIMIT_TTL: z.coerce.number().default(60),
	RATE_LIMIT_MAX: z.coerce.number().default(500),

	// Cache
	CACHE_TTL: z.coerce.number().default(300),

	// Analytics
	ANALYTICS_RETENTION_DAYS: z.coerce.number().default(90),

	// Seed
	SEED_ADMIN_EMAIL: z.string().email().optional(),
	SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
