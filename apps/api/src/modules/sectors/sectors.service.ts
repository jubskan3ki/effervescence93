// ===== src/modules/sectors/sectors.service.ts =====
import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@common/prisma/prisma.service';

import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
	constructor(private readonly prisma: PrismaService) {}

	// Liste tous les secteurs avec compteur d'exposants
	async list() {
		return this.prisma.sector.findMany({
			orderBy: { name: 'asc' },
			include: {
				_count: {
					select: { exhibitors: true },
				},
			},
		});
	}

	// Récupération d'un secteur avec ses exposants
	async findOne(id: string) {
		const sector = await this.prisma.sector.findUnique({
			where: { id },
			include: {
				exhibitors: {
					include: {
						booth: true,
					},
					orderBy: { name: 'asc' },
				},
			},
		});

		if (!sector) {
			throw new NotFoundException(`Secteur avec l'ID ${id} non trouvé`);
		}

		return sector;
	}

	// Création d'un secteur
	async create(dto: CreateSectorDto) {
		const name = dto.name.trim();
		const colorHex = this.normalizeColor(dto.colorHex);

		// Vérifier le format de la couleur
		if (!this.isValidHexColor(colorHex)) {
			throw new BadRequestException('Format de couleur invalide. Utilisez le format #RRGGBB');
		}

		try {
			return await this.prisma.sector.create({
				data: { name, colorHex },
				include: {
					_count: {
						select: { exhibitors: true },
					},
				},
			});
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				throw new ConflictException(`Un secteur nommé "${name}" existe déjà`);
			}
			throw e;
		}
	}

	// Mise à jour d'un secteur
	async update(id: string, dto: UpdateSectorDto) {
		// Vérifier l'existence
		const exists = await this.prisma.sector.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!exists) {
			throw new NotFoundException(`Secteur avec l'ID ${id} non trouvé`);
		}

		const data: any = {};

		if (dto.name !== undefined) {
			data.name = dto.name.trim();
		}

		if (dto.colorHex !== undefined) {
			data.colorHex = this.normalizeColor(dto.colorHex);
			if (!this.isValidHexColor(data.colorHex)) {
				throw new BadRequestException('Format de couleur invalide. Utilisez le format #RRGGBB');
			}
		}

		try {
			return await this.prisma.sector.update({
				where: { id },
				data,
				include: {
					_count: {
						select: { exhibitors: true },
					},
				},
			});
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				throw new ConflictException('Un secteur avec ce nom existe déjà');
			}
			throw e;
		}
	}

	// Suppression d'un secteur
	async remove(id: string) {
		// Vérifier s'il y a des exposants associés
		const sector = await this.prisma.sector.findUnique({
			where: { id },
			include: {
				_count: {
					select: { exhibitors: true },
				},
			},
		});

		if (!sector) {
			throw new NotFoundException(`Secteur avec l'ID ${id} non trouvé`);
		}

		if (sector._count.exhibitors > 0) {
			throw new ConflictException(
				`Impossible de supprimer ce secteur car ${sector._count.exhibitors} exposant(s) y sont associés`
			);
		}

		try {
			await this.prisma.sector.delete({ where: { id } });
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
				throw new NotFoundException('Secteur non trouvé');
			}
			throw e;
		}
	}

	// Statistiques d'un secteur
	async getStats(id: string) {
		const sector = await this.prisma.sector.findUnique({
			where: { id },
			include: {
				exhibitors: {
					include: {
						booth: true,
						contacts: true,
					},
				},
			},
		});

		if (!sector) {
			throw new NotFoundException(`Secteur avec l'ID ${id} non trouvé`);
		}

		const totalExhibitors = sector.exhibitors.length;
		const withBooth = sector.exhibitors.filter((e) => e.boothId).length;
		const withoutBooth = totalExhibitors - withBooth;
		const totalContacts = sector.exhibitors.reduce((sum, e) => sum + e.contacts.length, 0);

		return {
			id: sector.id,
			name: sector.name,
			colorHex: sector.colorHex,
			stats: {
				totalExhibitors,
				withBooth,
				withoutBooth,
				totalContacts,
				avgContactsPerExhibitor: totalExhibitors > 0 ? (totalContacts / totalExhibitors).toFixed(1) : 0,
			},
		};
	}

	// Méthodes utilitaires
	private normalizeColor(color: string): string {
		const normalized = color.trim().toUpperCase();
		// Ajouter # si manquant
		return normalized.startsWith('#') ? normalized : `#${normalized}`;
	}

	private isValidHexColor(color: string): boolean {
		return /^#[0-9A-F]{6}$/i.test(color);
	}
}
