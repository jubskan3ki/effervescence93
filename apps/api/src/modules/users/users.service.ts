// ===== src/modules/users/users.service.ts =====
import { ForbiddenException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { PrismaService } from '@common/prisma/prisma.service';

const USER_SELECT = {
	id: true,
	email: true,
	role: true,
	isApproved: true,
	approvedAt: true,
	createdAt: true,
} as const;

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	// Liste des utilisateurs avec recherche
	async list(status: 'pending' | 'approved' | 'all', searchQuery?: string) {
		const where: Prisma.UserWhereInput = {};

		// Filtre par statut
		if (status === 'pending') {
			where.isApproved = false;
		} else if (status === 'approved') {
			where.isApproved = true;
		}

		// Recherche par email
		if (searchQuery) {
			where.email = {
				contains: searchQuery,
				mode: 'insensitive',
			};
		}

		const users = await this.prisma.user.findMany({
			where,
			select: USER_SELECT,
			orderBy: [
				{ isApproved: 'asc' }, // Non approuvés en premier
				{ createdAt: 'desc' },
			],
		});

		return users;
	}

	// Récupération d'un utilisateur
	async findOne(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: USER_SELECT,
		});

		if (!user) {
			throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
		}

		return user;
	}

	// Approuver un utilisateur
	async approve(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true, isApproved: true },
		});

		if (!user) {
			throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
		}

		if (user.isApproved) {
			throw new ConflictException('Cet utilisateur est déjà approuvé');
		}

		return this.prisma.user.update({
			where: { id },
			data: {
				isApproved: true,
				approvedAt: new Date(),
			},
			select: USER_SELECT,
		});
	}

	// Rejeter/Désapprouver un utilisateur
	async reject(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true, isApproved: true, role: true },
		});

		if (!user) {
			throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
		}

		// Empêcher de désapprouver un admin
		if (user.role === Role.ADMIN) {
			throw new ForbiddenException('Impossible de désapprouver un administrateur');
		}

		return this.prisma.user.update({
			where: { id },
			data: {
				isApproved: false,
				approvedAt: null,
			},
			select: USER_SELECT,
		});
	}

	// Changer le rôle d'un utilisateur
	async updateRole(id: string, newRole: Role) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true, role: true, email: true },
		});

		if (!user) {
			throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
		}

		// Si on retire le rôle ADMIN, vérifier qu'il reste au moins un admin
		if (user.role === Role.ADMIN && newRole !== Role.ADMIN) {
			const adminCount = await this.prisma.user.count({
				where: {
					role: Role.ADMIN,
					id: { not: id },
				},
			});

			if (adminCount === 0) {
				throw new ForbiddenException('Impossible de retirer le dernier administrateur');
			}
		}

		return this.prisma.user.update({
			where: { id },
			data: { role: newRole },
			select: USER_SELECT,
		});
	}

	// Supprimer un utilisateur
	async remove(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true, role: true, email: true },
		});

		if (!user) {
			throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
		}

		// Empêcher de supprimer le dernier admin
		if (user.role === Role.ADMIN) {
			const adminCount = await this.prisma.user.count({
				where: {
					role: Role.ADMIN,
					id: { not: id },
				},
			});

			if (adminCount === 0) {
				throw new ForbiddenException(
					"Impossible de supprimer le dernier administrateur. Promouvez d'abord un autre utilisateur."
				);
			}
		}

		await this.prisma.user.delete({ where: { id } });
	}

	// Statistiques des utilisateurs
	async getStats() {
		const [total, admins, editors, approved, pending] = await Promise.all([
			this.prisma.user.count(),
			this.prisma.user.count({ where: { role: Role.ADMIN } }),
			this.prisma.user.count({ where: { role: Role.EDITOR } }),
			this.prisma.user.count({ where: { isApproved: true } }),
			this.prisma.user.count({ where: { isApproved: false } }),
		]);

		const recentUsers = await this.prisma.user.findMany({
			select: USER_SELECT,
			orderBy: { createdAt: 'desc' },
			take: 5,
		});

		return {
			total,
			byRole: {
				admins,
				editors,
			},
			byStatus: {
				approved,
				pending,
			},
			recentUsers,
		};
	}
}
