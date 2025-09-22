// src/main.ts
import path from 'node:path';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

import { env } from '@common/env';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import 'reflect-metadata';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['log', 'debug', 'error', 'verbose', 'warn'],
	});

	// Compression pour réduire la bande passante
	app.use(compression());

	// Sécurité avec Helmet
	app.use(
		helmet({
			crossOriginResourcePolicy: { policy: 'cross-origin' },
			contentSecurityPolicy: false,
		})
	);

	// Rate limiting souple
	if (env.NODE_ENV === 'production') {
		app.use(
			rateLimit({
				windowMs: env.RATE_LIMIT_TTL * 1000,
				max: env.RATE_LIMIT_MAX,
				message: 'Trop de requêtes, veuillez patienter quelques instants',
				standardHeaders: true,
				legacyHeaders: false,
				skip: (req) => {
					return req.url.startsWith('/uploads');
				},
			})
		);
	}

	// CORS configuré proprement
	app.enableCors({
		origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : true,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	app.use(cookieParser());

	// Validation globale avec transformation automatique
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: false,
			transformOptions: {
				enableImplicitConversion: true,
			},
		})
	);

	// Filtre d'exception global
	app.useGlobalFilters(new HttpExceptionFilter());

	// Static files avec cache headers optimisés
	app.use(
		'/uploads',
		express.static(path.resolve(env.UPLOAD_DIR), {
			maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
			etag: true,
			lastModified: true,
			immutable: env.NODE_ENV === 'production',
		})
	);

	// Swagger uniquement hors production
	if (env.NODE_ENV !== 'production') {
		const config = new DocumentBuilder()
			.setTitle('Effervescence 93 API')
			.setDescription('API pour le plan interactif du salon')
			.setVersion('1.0.0')
			.addBearerAuth()
			.addTag('auth', 'Authentification')
			.addTag('exhibitors', 'Exposants')
			.addTag('sectors', "Secteurs d'activité")
			.addTag('booths', 'Stands')
			.addTag('themes', 'Parcours thématiques')
			.addTag('favorites', 'Favoris visiteurs')
			.addTag('analytics', 'Statistiques')
			.addTag('uploads', 'Gestion des fichiers')
			.build();
		const doc = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('docs', app, doc, {
			customSiteTitle: 'Effervescence 93 - API Docs',
		});
	}

	const port = env.PORT;
	await app.listen(port);

	console.log(`🚀 API démarrée sur http://localhost:${port}`);
	console.log(`🔧 Environment: ${env.NODE_ENV}`);

	if (env.NODE_ENV !== 'production') {
		console.log(`📚 Documentation: http://localhost:${port}/docs`);
	}
}

bootstrap().catch((error) => {
	console.error('❌ Erreur au démarrage:', error);
	process.exit(1);
});
