// ===== src/modules/booths/booths.service.ts =====
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CacheService } from '@common/cache/cache.service';
import { SearchDto } from '@common/dto';
import { PrismaService } from '@common/prisma/prisma.service';

import { BoothAreaQueryDto } from './dto/booth-area.dto';
import { CreateBoothDto } from './dto/create-booth.dto';
import { UpdateBoothDto } from './dto/update-booth.dto';

@Injectable()
export class BoothsService {
	private readonly CACHE_PREFIX = 'booth:';
	private readonly CACHE_TTL = 600; // 10 minutes

	constructor(
		private readonly prisma: PrismaService,
		private readonly cache: CacheService
	) {}

	async list(query: SearchDto) {
		const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(query)}`;

		return this.cache.getOrSet(
			cacheKey,
			async () => {
				const where: Prisma.BoothWhereInput = {};

				// Recherche par numéro si query.q est fourni
				if (query.q) {
					where.number = {
						contains: query.q,
						mode: 'insensitive',
					};
				}

				const booths = await this.prisma.booth.findMany({
					where,
					include: {
						exhibitor: {
							include: {
								sector: true,
							},
						},
					},
					orderBy: { number: 'asc' },
					skip: query.skip,
					take: query.limit,
				});

				// Transformation pour correspondre au DTO
				return booths.map((booth) => ({
					id: booth.id,
					number: booth.number,
					polygonId: booth.polygonId,
					x: booth.x,
					y: booth.y,
					width: booth.width,
					height: booth.height,
					rotation: booth.rotation,
					polygonPoints: booth.polygonPoints,
					exhibitor: booth.exhibitor
						? {
								id: booth.exhibitor.id,
								name: booth.exhibitor.name,
								slug: booth.exhibitor.slug,
								logoUrl: booth.exhibitor.logoUrl,
								sector: booth.exhibitor.sector,
							}
						: null,
				}));
			},
			this.CACHE_TTL
		);
	}

	async findByArea(area: BoothAreaQueryDto) {
		const cacheKey = `${this.CACHE_PREFIX}area:${JSON.stringify(area)}`;

		return this.cache.getOrSet(
			cacheKey,
			async () => {
				const booths = await this.prisma.booth.findMany({
					where: {
						AND: [
							{ x: { gte: area.minX } },
							{ x: { lte: area.maxX } },
							{ y: { gte: area.minY } },
							{ y: { lte: area.maxY } },
						],
					},
					include: {
						exhibitor: {
							include: {
								sector: true,
							},
						},
					},
					orderBy: [{ y: 'asc' }, { x: 'asc' }],
				});

				// Transformation pour correspondre au DTO
				return booths.map((booth) => ({
					id: booth.id,
					number: booth.number,
					polygonId: booth.polygonId,
					x: booth.x,
					y: booth.y,
					width: booth.width,
					height: booth.height,
					rotation: booth.rotation,
					polygonPoints: booth.polygonPoints,
					exhibitor: booth.exhibitor
						? {
								id: booth.exhibitor.id,
								name: booth.exhibitor.name,
								slug: booth.exhibitor.slug,
								logoUrl: booth.exhibitor.logoUrl,
								sector: booth.exhibitor.sector,
							}
						: null,
				}));
			},
			this.CACHE_TTL
		);
	}

	async findOne(id: string) {
		const cacheKey = `${this.CACHE_PREFIX}${id}`;

		const booth = await this.cache.getOrSet(
			cacheKey,
			async () => {
				const result = await this.prisma.booth.findUnique({
					where: { id },
					include: {
						exhibitor: {
							include: {
								sector: true,
								contacts: true,
							},
						},
					},
				});

				if (!result) return null;

				// Transformation pour correspondre au DTO
				return {
					id: result.id,
					number: result.number,
					polygonId: result.polygonId,
					x: result.x,
					y: result.y,
					width: result.width,
					height: result.height,
					rotation: result.rotation,
					polygonPoints: result.polygonPoints,
					exhibitor: result.exhibitor
						? {
								id: result.exhibitor.id,
								name: result.exhibitor.name,
								slug: result.exhibitor.slug,
								logoUrl: result.exhibitor.logoUrl,
								sector: result.exhibitor.sector,
								contacts: result.exhibitor.contacts,
							}
						: null,
				};
			},
			this.CACHE_TTL
		);

		if (!booth) {
			throw new NotFoundException('Stand non trouvé');
		}

		return booth;
	}

	async findByNumber(number: string) {
		const cacheKey = `${this.CACHE_PREFIX}number:${number}`;

		const booth = await this.cache.getOrSet(
			cacheKey,
			async () => {
				const result = await this.prisma.booth.findUnique({
					where: { number: number.trim() },
					include: {
						exhibitor: {
							include: {
								sector: true,
								contacts: true,
							},
						},
					},
				});

				if (!result) return null;

				// Transformation pour correspondre au DTO
				return {
					id: result.id,
					number: result.number,
					polygonId: result.polygonId,
					x: result.x,
					y: result.y,
					width: result.width,
					height: result.height,
					rotation: result.rotation,
					polygonPoints: result.polygonPoints,
					exhibitor: result.exhibitor
						? {
								id: result.exhibitor.id,
								name: result.exhibitor.name,
								slug: result.exhibitor.slug,
								logoUrl: result.exhibitor.logoUrl,
								sector: result.exhibitor.sector,
								contacts: result.exhibitor.contacts,
							}
						: null,
				};
			},
			this.CACHE_TTL
		);

		if (!booth) {
			throw new NotFoundException(`Stand ${number} non trouvé`);
		}

		return booth;
	}

	async findByPolygonId(polygonId: string) {
		const cacheKey = `${this.CACHE_PREFIX}polygon:${polygonId}`;

		const booth = await this.cache.getOrSet(
			cacheKey,
			async () => {
				const result = await this.prisma.booth.findUnique({
					where: { polygonId: polygonId.trim() },
					include: {
						exhibitor: {
							include: {
								sector: true,
								contacts: true,
							},
						},
					},
				});

				if (!result) return null;

				// Transformation pour correspondre au DTO
				return {
					id: result.id,
					number: result.number,
					polygonId: result.polygonId,
					x: result.x,
					y: result.y,
					width: result.width,
					height: result.height,
					rotation: result.rotation,
					polygonPoints: result.polygonPoints,
					exhibitor: result.exhibitor
						? {
								id: result.exhibitor.id,
								name: result.exhibitor.name,
								slug: result.exhibitor.slug,
								logoUrl: result.exhibitor.logoUrl,
								sector: result.exhibitor.sector,
								contacts: result.exhibitor.contacts,
							}
						: null,
				};
			},
			this.CACHE_TTL
		);

		if (!booth) {
			throw new NotFoundException(`Stand avec polygonId ${polygonId} non trouvé`);
		}

		return booth;
	}

	async create(dto: CreateBoothDto) {
		const data = {
			number: dto.number.trim().toUpperCase(), // Normalise en majuscules
			polygonId: dto.polygonId.trim(),
			x: dto.x,
			y: dto.y,
			width: dto.width || null,
			height: dto.height || null,
			rotation: dto.rotation || 0,
			polygonPoints: dto.polygonPoints || null,
		};

		try {
			const booth = await this.prisma.booth.create({
				data,
				include: {
					exhibitor: true,
				},
			});

			// Invalide le cache de liste et d'area
			this.cache.deletePattern(`${this.CACHE_PREFIX}list:*`);
			this.cache.deletePattern(`${this.CACHE_PREFIX}area:*`);

			return booth;
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				const target = (e.meta?.target as string[]) || [];
				if (target.includes('number')) {
					throw new ConflictException(`Le stand ${data.number} existe déjà`);
				}
				if (target.includes('polygonId')) {
					throw new ConflictException(`Le polygonId ${data.polygonId} est déjà utilisé`);
				}
				throw new ConflictException("Contrainte d'unicité violée");
			}
			throw e;
		}
	}

	async update(id: string, dto: UpdateBoothDto) {
		// Vérifie que le stand existe
		const existing = await this.prisma.booth.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException('Stand non trouvé');
		}

		const data: Prisma.BoothUpdateInput = {};

		if (dto.number !== undefined) {
			data.number = dto.number.trim().toUpperCase();
		}
		if (dto.polygonId !== undefined) {
			data.polygonId = dto.polygonId.trim();
		}
		if (dto.x !== undefined) {
			data.x = dto.x;
		}
		if (dto.y !== undefined) {
			data.y = dto.y;
		}
		if (dto.width !== undefined) {
			data.width = dto.width;
		}
		if (dto.height !== undefined) {
			data.height = dto.height;
		}
		if (dto.rotation !== undefined) {
			data.rotation = dto.rotation;
		}
		if (dto.polygonPoints !== undefined) {
			data.polygonPoints = dto.polygonPoints;
		}

		try {
			const booth = await this.prisma.booth.update({
				where: { id },
				data,
				include: {
					exhibitor: true,
				},
			});

			// Invalide le cache
			this.cache.delete(`${this.CACHE_PREFIX}${id}`);
			this.cache.delete(`${this.CACHE_PREFIX}number:${existing.number}`);
			this.cache.delete(`${this.CACHE_PREFIX}polygon:${existing.polygonId}`);
			this.cache.deletePattern(`${this.CACHE_PREFIX}list:*`);
			this.cache.deletePattern(`${this.CACHE_PREFIX}area:*`);

			return booth;
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				const target = (e.meta?.target as string[]) || [];
				if (target.includes('number')) {
					throw new ConflictException(`Le stand ${data.number} existe déjà`);
				}
				if (target.includes('polygonId')) {
					throw new ConflictException(`Le polygonId ${data.polygonId} est déjà utilisé`);
				}
				throw new ConflictException("Contrainte d'unicité violée");
			}
			throw e;
		}
	}

	async remove(id: string) {
		try {
			const booth = await this.prisma.booth.delete({
				where: { id },
			});

			// Invalide le cache
			this.cache.delete(`${this.CACHE_PREFIX}${id}`);
			this.cache.delete(`${this.CACHE_PREFIX}number:${booth.number}`);
			this.cache.delete(`${this.CACHE_PREFIX}polygon:${booth.polygonId}`);
			this.cache.deletePattern(`${this.CACHE_PREFIX}list:*`);
			this.cache.deletePattern(`${this.CACHE_PREFIX}area:*`);

			return booth;
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
				throw new NotFoundException('Stand non trouvé');
			}
			throw e;
		}
	}

	async getStats() {
		const cacheKey = `${this.CACHE_PREFIX}stats`;

		return this.cache.getOrSet(
			cacheKey,
			async () => {
				const [total, occupied, available, bounds] = await Promise.all([
					this.prisma.booth.count(),
					this.prisma.booth.count({
						where: { exhibitor: { isNot: null } },
					}),
					this.prisma.booth.count({
						where: { exhibitor: null },
					}),
					// Calcul des limites du canvas
					this.prisma.booth.aggregate({
						_min: { x: true, y: true },
						_max: { x: true, y: true },
					}),
				]);

				// Calcul de la zone avec une marge
				const margin = 50;
				const canvasBounds =
					bounds._max.x && bounds._max.y
						? {
								minX: Math.max(0, (bounds._min.x || 0) - margin),
								minY: Math.max(0, (bounds._min.y || 0) - margin),
								maxX: (bounds._max.x || 0) + margin,
								maxY: (bounds._max.y || 0) + margin,
								width: (bounds._max.x || 0) - (bounds._min.x || 0) + margin * 2,
								height: (bounds._max.y || 0) - (bounds._min.y || 0) + margin * 2,
							}
						: null;

				return {
					total,
					occupied,
					available,
					occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(1) + '%' : '0%',
					canvasBounds,
				};
			},
			this.CACHE_TTL * 2 // Cache plus long pour les stats
		);
	}

	// Méthode utilitaire pour vérifier si un stand est disponible
	async isAvailable(boothId: string): Promise<boolean> {
		const booth = await this.prisma.booth.findUnique({
			where: { id: boothId },
			select: { exhibitor: true },
		});

		return booth ? booth.exhibitor === null : false;
	}

	// Nouvelle méthode pour obtenir les stands proches d'un point
	async findNearby(x: number, y: number, radius = 100) {
		const cacheKey = `${this.CACHE_PREFIX}nearby:${x}:${y}:${radius}`;

		return this.cache.getOrSet(
			cacheKey,
			async () => {
				// Utilise une requête raw pour calculer la distance euclidienne
				const booths = await this.prisma.$queryRaw<any[]>`
					SELECT
						b.*,
						SQRT(POW(b.x - ${x}, 2) + POW(b.y - ${y}, 2)) as distance
					FROM "Booth" b
					WHERE SQRT(POW(b.x - ${x}, 2) + POW(b.y - ${y}, 2)) <= ${radius}
					ORDER BY distance ASC
				`;

				// Récupère les exhibitors associés
				const boothIds = booths.map((b) => b.id);
				const exhibitors = await this.prisma.exhibitor.findMany({
					where: { boothId: { in: boothIds } },
					include: { sector: true },
				});

				// Map des exhibitors par boothId
				const exhibitorMap = new Map(exhibitors.map((e) => [e.boothId, e]));

				return booths.map((booth) => ({
					id: booth.id,
					number: booth.number,
					polygonId: booth.polygonId,
					x: booth.x,
					y: booth.y,
					width: booth.width,
					height: booth.height,
					rotation: booth.rotation,
					polygonPoints: booth.polygonPoints,
					distance: booth.distance,
					exhibitor: exhibitorMap.get(booth.id) || null,
				}));
			},
			this.CACHE_TTL
		);
	}

	// Méthode pour bulk import de stands avec coordonnées
	async bulkCreate(booths: CreateBoothDto[]) {
		const data = booths.map((dto) => ({
			number: dto.number.trim().toUpperCase(),
			polygonId: dto.polygonId.trim(),
			x: dto.x,
			y: dto.y,
			width: dto.width || null,
			height: dto.height || null,
			rotation: dto.rotation || 0,
			polygonPoints: dto.polygonPoints || null,
		}));

		try {
			const result = await this.prisma.booth.createMany({
				data,
				skipDuplicates: true,
			});

			// Invalide tout le cache
			this.cache.deletePattern(`${this.CACHE_PREFIX}*`);

			return {
				created: result.count,
				message: `${result.count} stands créés avec succès`,
			};
		} catch {
			throw new ConflictException('Erreur lors de la création en masse des stands');
		}
	}
}
