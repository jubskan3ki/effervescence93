// ===== src/modules/analytics/analytics.service.ts =====
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@common/prisma/prisma.service';

import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class AnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	// Enregistrer un événement
	async track(dto: TrackEventDto) {
		await this.prisma.analyticsEvent.create({
			data: {
				type: dto.type,
				sessionId: dto.sessionId,
				exhibitorId: dto.exhibitorId,
				searchQuery: dto.searchQuery,
				payload: dto.payload || {},
				userAgent: dto.userAgent,
			},
		});

		return { success: true };
	}

	// Statistiques globales
	async getStats(from?: string, to?: string) {
		const where: any = {};

		if (from || to) {
			where.createdAt = {};
			if (from) where.createdAt.gte = new Date(from);
			if (to) where.createdAt.lte = new Date(to);
		}

		// Compter par type d'événement
		const eventCounts = await this.prisma.analyticsEvent.groupBy({
			by: ['type'],
			where,
			_count: true,
		});

		// Sessions uniques - CORRECTION: filtrer les sessionId null
		const uniqueSessions = await this.prisma.analyticsEvent.findMany({
			where: {
				...where,
				sessionId: { not: null }, // IMPORTANT: exclure les null
			},
			select: { sessionId: true },
			distinct: ['sessionId'],
		});

		// Recherches populaires
		const topSearches = await this.prisma.analyticsEvent.groupBy({
			by: ['searchQuery'],
			where: {
				...where,
				type: 'search',
				searchQuery: { not: null },
			},
			_count: true,
			orderBy: { _count: { searchQuery: 'desc' } },
			take: 10,
		});

		// Calculer les totaux par type pour retour cohérent
		const eventsByType = eventCounts.reduce(
			(acc, item) => {
				acc[item.type] = item._count;
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			totalEvents: await this.prisma.analyticsEvent.count({ where }),
			uniqueSessions: uniqueSessions.length, // Simplifié - déjà filtré
			totalViews: eventsByType.view || 0,
			totalSearches: eventsByType.search || 0,
			totalFavorites: eventsByType.favorite || 0,
			eventsByType,
			topSearches: topSearches.map((s) => ({
				query: s.searchQuery,
				count: s._count,
			})),
		};
	}

	// Top exposants visités avec nombre de favoris
	async getTopExhibitors(limit: number) {
		// 1. Obtenir les top vues
		const topViews = await this.prisma.analyticsEvent.groupBy({
			by: ['exhibitorId'],
			where: {
				type: 'view',
				exhibitorId: { not: null },
			},
			_count: true,
			orderBy: { _count: { exhibitorId: 'desc' } },
			take: Math.min(limit, 50),
		});

		const exhibitorIds = topViews.map((v) => v.exhibitorId).filter(Boolean) as string[];

		if (exhibitorIds.length === 0) {
			return [];
		}

		// 2. Obtenir le nombre ACTUEL de favoris pour chaque exposant
		const currentFavorites = await this.prisma.favorite.groupBy({
			by: ['exhibitorId'],
			where: {
				exhibitorId: { in: exhibitorIds },
			},
			_count: true,
		});

		// Créer une map des favoris actuels
		const favoritesMap = new Map(currentFavorites.map((f) => [f.exhibitorId, f._count]));

		// 3. Récupérer les infos des exposants
		const exhibitors = await this.prisma.exhibitor.findMany({
			where: { id: { in: exhibitorIds } },
			select: {
				id: true,
				name: true,
				slug: true,
				sector: {
					select: {
						id: true,
						name: true,
						colorHex: true,
					},
				},
			},
		});

		const exhibitorMap = new Map(exhibitors.map((e) => [e.id, e]));

		// 4. Combiner toutes les données
		return topViews
			.map((view) => {
				const exhibitor = exhibitorMap.get(view.exhibitorId!);
				if (!exhibitor) return null;

				return {
					id: exhibitor.id,
					name: exhibitor.name,
					slug: exhibitor.slug,
					sector: exhibitor.sector,
					views: view._count,
					favorites: favoritesMap.get(view.exhibitorId!) || 0,
				};
			})
			.filter((item) => item !== null);
	}

	// Nouvelle méthode pour obtenir le compte des favoris par exposant
	async getCurrentFavoritesCount() {
		const favorites = await this.prisma.favorite.groupBy({
			by: ['exhibitorId'],
			_count: true,
		});

		return favorites.map((f) => ({
			exhibitorId: f.exhibitorId,
			count: f._count,
		}));
	}
}
