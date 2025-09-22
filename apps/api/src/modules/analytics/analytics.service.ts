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

		// Sessions uniques
		const uniqueSessions = await this.prisma.analyticsEvent.findMany({
			where,
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

		return {
			totalEvents: await this.prisma.analyticsEvent.count({ where }),
			uniqueSessions: uniqueSessions.filter((s) => s.sessionId).length,
			eventsByType: eventCounts.reduce(
				(acc, item) => {
					acc[item.type] = item._count;
					return acc;
				},
				{} as Record<string, number>
			),
			topSearches: topSearches.map((s) => ({
				query: s.searchQuery,
				count: s._count,
			})),
		};
	}

	// Top exposants visités
	async getTopExhibitors(limit: number) {
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

		// Récupérer les infos des exposants
		const exhibitorIds = topViews.map((v) => v.exhibitorId).filter(Boolean) as string[];
		const exhibitors = await this.prisma.exhibitor.findMany({
			where: { id: { in: exhibitorIds } },
			select: {
				id: true,
				name: true,
				slug: true,
				sector: { select: { name: true } },
			},
		});

		const exhibitorMap = new Map(exhibitors.map((e) => [e.id, e]));

		return topViews
			.map((view) => ({
				exhibitor: exhibitorMap.get(view.exhibitorId!),
				views: view._count,
			}))
			.filter((item) => item.exhibitor);
	}
}
