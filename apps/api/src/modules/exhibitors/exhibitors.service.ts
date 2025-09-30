// ===== src/modules/exhibitors/exhibitors.service.ts =====
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';

import { CacheService } from '@common/cache/cache.service';
import { PaginatedResponseDto } from '@common/dto';
import { PrismaService } from '@common/prisma/prisma.service';

import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { ExhibitorSearchDto } from './dto/exhibitor-search.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';

@Injectable()
export class ExhibitorsService {
	private readonly CACHE_PREFIX = 'exhibitor:';
	private readonly CACHE_TTL = 300; // 5 minutes

	constructor(
		private readonly prisma: PrismaService,
		private readonly cache: CacheService
	) {}

	private normalize(s?: string): string | undefined {
		return s?.trim() || undefined;
	}

	private makeSlug(name: string): string {
		return slugify(name, {
			lower: true,
			strict: true,
			locale: 'fr',
		});
	}

	async search(params: ExhibitorSearchDto) {
		const cacheKey = `${this.CACHE_PREFIX}search:${JSON.stringify(params)}`;

		return this.cache.getOrSet(
			cacheKey,
			async () => {
				const where: Prisma.ExhibitorWhereInput = {};
				const conditions: Prisma.ExhibitorWhereInput[] = [];

				// Recherche textuelle
				if (params.q) {
					conditions.push({
						OR: [
							{ name: { contains: params.q, mode: 'insensitive' } },
							{ description: { contains: params.q, mode: 'insensitive' } },
							{ slug: { contains: params.q, mode: 'insensitive' } },
							{ booth: { number: { contains: params.q, mode: 'insensitive' } } },
							{
								contacts: {
									some: {
										OR: [
											{ firstName: { contains: params.q, mode: 'insensitive' } },
											{ lastName: { contains: params.q, mode: 'insensitive' } },
										],
									},
								},
							},
						],
					});
				}

				// Filtre par secteur
				if (params.sectorId) {
					conditions.push({ sectorId: params.sectorId });
				}

				// Filtre par numéro de stand
				if (params.boothNumber) {
					conditions.push({
						booth: {
							number: {
								equals: params.boothNumber.toUpperCase(),
								mode: 'insensitive',
							},
						},
					});
				}

				if (conditions.length > 0) {
					where.AND = conditions;
				}

				const [items, total] = await this.prisma.$transaction([
					this.prisma.exhibitor.findMany({
						where,
						include: {
							sector: true,
							booth: true,
							contacts: true,
						},
						orderBy: { name: 'asc' },
						take: params.limit,
						skip: params.skip,
					}),
					this.prisma.exhibitor.count({ where }),
				]);

				return new PaginatedResponseDto(items, total, params.page, params.limit);
			},
			this.CACHE_TTL
		);
	}

	async findBySlug(slug: string) {
		const cacheKey = `${this.CACHE_PREFIX}slug:${slug}`;

		const exhibitor = await this.cache.getOrSet(
			cacheKey,
			async () => {
				return this.prisma.exhibitor.findUnique({
					where: { slug },
					include: {
						sector: true,
						booth: true,
						contacts: true,
					},
				});
			},
			this.CACHE_TTL
		);

		if (!exhibitor) {
			throw new NotFoundException(`Exposant '${slug}' non trouvé`);
		}

		return exhibitor;
	}

	async findOne(id: string) {
		const cacheKey = `${this.CACHE_PREFIX}id:${id}`;

		const exhibitor = await this.cache.getOrSet(
			cacheKey,
			async () => {
				return this.prisma.exhibitor.findUnique({
					where: { id },
					include: {
						sector: true,
						booth: true,
						contacts: true,
					},
				});
			},
			this.CACHE_TTL
		);

		if (!exhibitor) {
			throw new NotFoundException('Exposant non trouvé');
		}

		return exhibitor;
	}

	private async uniqueSlug(base: string, tx: Prisma.TransactionClient, excludeId?: string): Promise<string> {
		const where: Prisma.ExhibitorWhereInput = excludeId
			? { AND: [{ id: { not: excludeId } }, { slug: { startsWith: base } }] }
			: { slug: { startsWith: base } };

		const existing = await tx.exhibitor.findMany({
			where,
			select: { slug: true },
		});

		const slugs = new Set(existing.map((e) => e.slug));

		if (!slugs.has(base)) return base;

		let counter = 2;
		while (slugs.has(`${base}-${counter}`)) {
			counter++;
		}

		return `${base}-${counter}`;
	}

	async create(dto: CreateExhibitorDto) {
		const name = dto.name.trim();
		const slugBase = this.makeSlug(name);

		const exhibitor = await this.prisma.$transaction(async (tx) => {
			// Vérification du secteur
			const sector = await tx.sector.findUnique({
				where: { id: dto.sectorId },
				select: { id: true },
			});
			if (!sector) {
				throw new BadRequestException('Secteur non trouvé');
			}

			// Vérification du stand si fourni
			if (dto.boothId) {
				const booth = await tx.booth.findUnique({
					where: { id: dto.boothId },
					include: { exhibitor: true },
				});
				if (!booth) {
					throw new BadRequestException('Stand non trouvé');
				}
				if (booth.exhibitor) {
					throw new ConflictException('Ce stand est déjà occupé');
				}
			}

			const slug = await this.uniqueSlug(slugBase, tx);

			try {
				// Créer l'exposant avec le booth connecté
				const newExhibitor = await tx.exhibitor.create({
					data: {
						name,
						slug,
						logoUrl: this.normalize(dto.logoUrl),
						description: this.normalize(dto.description),
						websiteUrl: this.normalize(dto.websiteUrl),
						linkedinUrl: this.normalize(dto.linkedinUrl),
						pdfUrl: this.normalize(dto.pdfUrl),
						sector: { connect: { id: dto.sectorId } },
						booth: dto.boothId ? { connect: { id: dto.boothId } } : undefined,
						contacts: dto.contacts?.length
							? {
									create: dto.contacts.map((c) => ({
										firstName: c.firstName.trim(),
										lastName: c.lastName.trim(),
										role: c.role.trim(),
										email: c.email.trim().toLowerCase(),
										phone: this.normalize(c.phone),
									})),
								}
							: undefined,
					},
					include: {
						sector: true,
						booth: true,
						contacts: true,
					},
				});

				return newExhibitor;
			} catch (e: any) {
				if (e instanceof Prisma.PrismaClientKnownRequestError) {
					if (e.code === 'P2002') {
						throw new ConflictException('Un exposant avec ce nom ou slug existe déjà');
					}
				}
				throw e;
			}
		});

		// Invalide le cache
		this.cache.deletePattern(`${this.CACHE_PREFIX}search:*`);
		this.cache.deletePattern('booth:*');

		return exhibitor;
	}

	async update(id: string, dto: UpdateExhibitorDto) {
		const exhibitor = await this.prisma.$transaction(async (tx) => {
			// Vérifier que l'exposant existe avec son booth actuel
			const existing = await tx.exhibitor.findUnique({
				where: { id },
				select: { id: true, slug: true, boothId: true },
			});
			if (!existing) {
				throw new NotFoundException('Exposant non trouvé');
			}

			const data: Prisma.ExhibitorUpdateInput = {
				logoUrl: dto.logoUrl !== undefined ? this.normalize(dto.logoUrl) : undefined,
				description: dto.description !== undefined ? this.normalize(dto.description) : undefined,
				websiteUrl: dto.websiteUrl !== undefined ? this.normalize(dto.websiteUrl) : undefined,
				linkedinUrl: dto.linkedinUrl !== undefined ? this.normalize(dto.linkedinUrl) : undefined,
				pdfUrl: dto.pdfUrl !== undefined ? this.normalize(dto.pdfUrl) : undefined,
			};

			// Mise à jour du nom et slug
			if (dto.name) {
				const name = dto.name.trim();
				const slugBase = this.makeSlug(name);
				const slug = await this.uniqueSlug(slugBase, tx, id);
				data.name = name;
				data.slug = slug;
			}

			// Mise à jour du secteur
			if (dto.sectorId) {
				const sector = await tx.sector.findUnique({
					where: { id: dto.sectorId },
					select: { id: true },
				});
				if (!sector) {
					throw new BadRequestException('Secteur non trouvé');
				}
				data.sector = { connect: { id: dto.sectorId } };
			}

			// Gestion du changement de stand
			if (dto.boothId !== undefined) {
				if (dto.boothId) {
					// Vérifier le nouveau stand
					const booth = await tx.booth.findUnique({
						where: { id: dto.boothId },
						include: { exhibitor: { select: { id: true } } },
					});
					if (!booth) {
						throw new BadRequestException('Stand non trouvé');
					}
					// Vérifier si le stand est déjà occupé par un autre exposant
					if (booth.exhibitor && booth.exhibitor.id !== id) {
						throw new ConflictException('Ce stand est déjà occupé par un autre exposant');
					}

					// Connecter le nouveau stand
					data.booth = { connect: { id: dto.boothId } };
				} else {
					// Déconnecter le stand (mettre boothId à null)
					data.booth = { disconnect: true };
				}
			}

			// Mise à jour des contacts
			if (dto.contacts !== undefined) {
				await tx.contact.deleteMany({ where: { exhibitorId: id } });
				if (dto.contacts.length > 0) {
					data.contacts = {
						create: dto.contacts.map((c) => ({
							firstName: c.firstName.trim(),
							lastName: c.lastName.trim(),
							role: c.role.trim(),
							email: c.email.trim().toLowerCase(),
							phone: this.normalize(c.phone),
						})),
					};
				}
			}

			const updated = await tx.exhibitor.update({
				where: { id },
				data,
				include: {
					sector: true,
					booth: true,
					contacts: true,
				},
			});

			return updated;
		});

		// Invalide le cache
		this.cache.delete(`${this.CACHE_PREFIX}id:${id}`);
		this.cache.delete(`${this.CACHE_PREFIX}slug:${exhibitor.slug}`);
		this.cache.deletePattern(`${this.CACHE_PREFIX}search:*`);
		this.cache.deletePattern('booth:*'); // Invalider aussi le cache des booths

		return exhibitor;
	}

	async delete(id: string) {
		try {
			const deleted = await this.prisma.$transaction(async (tx) => {
				// Vérifier que l'exposant existe
				const exhibitor = await tx.exhibitor.findUnique({
					where: { id },
					select: { id: true, slug: true },
				});

				if (!exhibitor) {
					throw new NotFoundException('Exposant non trouvé');
				}

				// Supprimer l'exposant (la relation avec le booth sera automatiquement déconnectée)
				const result = await tx.exhibitor.delete({
					where: { id },
					select: { id: true, slug: true },
				});

				return result;
			});

			// Invalide le cache
			this.cache.delete(`${this.CACHE_PREFIX}id:${id}`);
			this.cache.delete(`${this.CACHE_PREFIX}slug:${deleted.slug}`);
			this.cache.deletePattern(`${this.CACHE_PREFIX}search:*`);
			this.cache.deletePattern('booth:*'); // Invalider aussi le cache des booths

			return deleted;
		} catch (e: any) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
				throw new NotFoundException('Exposant non trouvé');
			}
			if (e instanceof NotFoundException) {
				throw e;
			}
			throw e;
		}
	}
}
