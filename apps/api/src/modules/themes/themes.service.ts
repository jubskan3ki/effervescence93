// ===== src/modules/themes/themes.service.ts =====
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { PrismaService } from '@common/prisma/prisma.service';

import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
	constructor(private readonly prisma: PrismaService) {}

	// Génère un slug propre à partir d'un nom
	private makeSlug(name: string): string {
		return name
			.toLowerCase()
			.trim()
			.replace(/[àáäâ]/g, 'a')
			.replace(/[èéëê]/g, 'e')
			.replace(/[ìíïî]/g, 'i')
			.replace(/[òóöô]/g, 'o')
			.replace(/[ùúüû]/g, 'u')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Liste tous les thèmes
	async list() {
		return this.prisma.theme.findMany({
			orderBy: { order: 'asc' },
			include: {
				_count: {
					select: { exhibitors: true },
				},
			},
		});
	}

	// Récupération par ID avec exposants
	async findOne(id: string) {
		const theme = await this.prisma.theme.findUnique({
			where: { id },
			include: {
				exhibitors: {
					include: {
						sector: true,
						booth: true,
						contacts: true,
					},
					orderBy: { name: 'asc' },
				},
			},
		});

		if (!theme) {
			throw new NotFoundException(`Parcours avec l'ID ${id} non trouvé`);
		}

		return theme;
	}

	// Récupération par slug
	async findBySlug(slug: string) {
		const theme = await this.prisma.theme.findUnique({
			where: { slug },
			include: {
				exhibitors: {
					include: {
						sector: true,
						booth: true,
						contacts: true,
					},
					orderBy: { name: 'asc' },
				},
			},
		});

		if (!theme) {
			throw new NotFoundException(`Parcours '${slug}' non trouvé`);
		}

		return theme;
	}

	// Création d'un thème
	async create(dto: CreateThemeDto) {
		const name = dto.name.trim();
		const slug = this.makeSlug(name);

		try {
			return await this.prisma.theme.create({
				data: {
					name,
					slug,
					description: dto.description?.trim() || null,
					order: dto.order ?? 0,
					exhibitors: dto.exhibitorIds?.length
						? {
								connect: dto.exhibitorIds.map((id) => ({ id })),
							}
						: undefined,
				},
				include: {
					_count: {
						select: { exhibitors: true },
					},
				},
			});
		} catch (error: any) {
			if (error.code === 'P2002') {
				const target = error.meta?.target;
				if (target?.includes('name')) {
					throw new ConflictException(`Un parcours nommé "${name}" existe déjà`);
				}
				if (target?.includes('slug')) {
					throw new ConflictException(`Le slug "${slug}" est déjà utilisé`);
				}
				throw new ConflictException('Un parcours avec ces données existe déjà');
			}
			throw error;
		}
	}

	// Mise à jour d'un thème
	async update(id: string, dto: UpdateThemeDto) {
		// Vérifier l'existence
		const exists = await this.prisma.theme.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!exists) {
			throw new NotFoundException(`Parcours avec l'ID ${id} non trouvé`);
		}

		const data: any = {};

		if (dto.name !== undefined) {
			data.name = dto.name.trim();
			data.slug = this.makeSlug(data.name);
		}

		if (dto.description !== undefined) {
			data.description = dto.description?.trim() || null;
		}

		if (dto.order !== undefined) {
			data.order = dto.order;
		}

		if (dto.exhibitorIds !== undefined) {
			data.exhibitors = {
				set: dto.exhibitorIds.map((id) => ({ id })),
			};
		}

		try {
			return await this.prisma.theme.update({
				where: { id },
				data,
				include: {
					_count: {
						select: { exhibitors: true },
					},
				},
			});
		} catch (error: any) {
			if (error.code === 'P2002') {
				throw new ConflictException('Un parcours avec ce nom ou slug existe déjà');
			}
			throw error;
		}
	}

	// Suppression d'un thème
	async remove(id: string) {
		try {
			await this.prisma.theme.delete({ where: { id } });
		} catch (error: any) {
			if (error.code === 'P2025') {
				throw new NotFoundException(`Parcours avec l'ID ${id} non trouvé`);
			}
			throw error;
		}
	}

	// Définir les exposants d'un thème (remplace tous les exposants)
	async setExhibitors(themeId: string, exhibitorIds: string[]) {
		// Vérifier que le thème existe
		const theme = await this.prisma.theme.findUnique({
			where: { id: themeId },
			select: { id: true },
		});

		if (!theme) {
			throw new NotFoundException(`Parcours avec l'ID ${themeId} non trouvé`);
		}

		// Vérifier que tous les exposants existent
		const existingCount = await this.prisma.exhibitor.count({
			where: { id: { in: exhibitorIds } },
		});

		if (existingCount !== exhibitorIds.length) {
			throw new NotFoundException('Un ou plusieurs exposants non trouvés');
		}

		return this.prisma.theme.update({
			where: { id: themeId },
			data: {
				exhibitors: {
					set: exhibitorIds.map((id) => ({ id })),
				},
			},
			include: {
				exhibitors: {
					include: {
						sector: true,
						booth: true,
					},
					orderBy: { name: 'asc' },
				},
			},
		});
	}

	// Ajouter des exposants à un thème (sans remplacer les existants)
	async addExhibitors(themeId: string, exhibitorIds: string[]) {
		const theme = await this.prisma.theme.findUnique({
			where: { id: themeId },
			select: { id: true },
		});

		if (!theme) {
			throw new NotFoundException(`Parcours avec l'ID ${themeId} non trouvé`);
		}

		return this.prisma.theme.update({
			where: { id: themeId },
			data: {
				exhibitors: {
					connect: exhibitorIds.map((id) => ({ id })),
				},
			},
			include: {
				exhibitors: {
					include: {
						sector: true,
						booth: true,
					},
					orderBy: { name: 'asc' },
				},
			},
		});
	}

	// Retirer des exposants d'un thème
	async removeExhibitors(themeId: string, exhibitorIds: string[]) {
		const theme = await this.prisma.theme.findUnique({
			where: { id: themeId },
			select: { id: true },
		});

		if (!theme) {
			throw new NotFoundException(`Parcours avec l'ID ${themeId} non trouvé`);
		}

		return this.prisma.theme.update({
			where: { id: themeId },
			data: {
				exhibitors: {
					disconnect: exhibitorIds.map((id) => ({ id })),
				},
			},
			include: {
				exhibitors: {
					include: {
						sector: true,
						booth: true,
					},
					orderBy: { name: 'asc' },
				},
			},
		});
	}
}
