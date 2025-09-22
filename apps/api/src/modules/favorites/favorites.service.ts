// ===== src/modules/favorites/favorites.service.ts =====
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
	constructor(private readonly prisma: PrismaService) {}

	// Liste des favoris d'une session
	async list(sessionId: string) {
		const favorites = await this.prisma.favorite.findMany({
			where: { sessionId },
			include: {
				exhibitor: {
					include: {
						sector: true,
						booth: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return favorites.map((f) => ({
			id: f.id,
			exhibitor: f.exhibitor,
			createdAt: f.createdAt,
		}));
	}

	// Ajouter un favori
	async add(sessionId: string, exhibitorId: string) {
		// Vérifier que l'exposant existe
		const exhibitor = await this.prisma.exhibitor.findUnique({
			where: { id: exhibitorId },
		});

		if (!exhibitor) {
			throw new NotFoundException('Exposant non trouvé');
		}

		// Vérifier si pas déjà en favori
		const existing = await this.prisma.favorite.findUnique({
			where: {
				sessionId_exhibitorId: { sessionId, exhibitorId },
			},
		});

		if (existing) {
			throw new ConflictException('Cet exposant est déjà dans vos favoris');
		}

		return this.prisma.favorite.create({
			data: { sessionId, exhibitorId },
			include: {
				exhibitor: {
					include: {
						sector: true,
						booth: true,
					},
				},
			},
		});
	}

	// Retirer un favori
	async remove(sessionId: string, exhibitorId: string) {
		try {
			await this.prisma.favorite.delete({
				where: {
					sessionId_exhibitorId: { sessionId, exhibitorId },
				},
			});
		} catch (error: any) {
			if (error.code === 'P2025') {
				throw new NotFoundException('Favori non trouvé');
			}
			throw error;
		}
	}

	// Vider tous les favoris d'une session
	async clear(sessionId: string) {
		await this.prisma.favorite.deleteMany({
			where: { sessionId },
		});
	}
}
