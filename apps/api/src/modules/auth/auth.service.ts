import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
	OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role as PrismaRole, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { Role as ApiRole } from '@common/auth/roles.enum';
import { CacheService } from '@common/cache/cache.service';
import { env } from '@common/env';
import { PrismaService } from '@common/prisma/prisma.service';

const USER_PUBLIC_SELECT = {
	id: true,
	email: true,
	role: true,
	isApproved: true,
	approvedAt: true,
	createdAt: true,
} as const;

@Injectable()
export class AuthService implements OnModuleInit {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private cache: CacheService
	) {}

	async onModuleInit() {
		// Créer l'admin par défaut si configuré et n'existe pas
		if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
			const exists = await this.prisma.user.findUnique({
				where: { email: env.SEED_ADMIN_EMAIL },
			});

			if (!exists) {
				const hash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
				await this.prisma.user.create({
					data: {
						email: env.SEED_ADMIN_EMAIL,
						password: hash,
						role: PrismaRole.ADMIN,
						isApproved: true,
						approvedAt: new Date(),
					},
				});
				console.log('✅ Admin par défaut créé:', env.SEED_ADMIN_EMAIL);
			}
		}
	}

	private normalizeEmail(email: string): string {
		return email.trim().toLowerCase();
	}

	private toPrismaRole(r?: ApiRole): PrismaRole {
		return r === ApiRole.ADMIN ? PrismaRole.ADMIN : PrismaRole.EDITOR;
	}

	private async issueToken(user: Pick<User, 'id' | 'email' | 'role'>) {
		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};

		const access_token = await this.jwt.signAsync(payload);

		// Cache les infos user pour éviter de requêter la DB à chaque requête
		this.cache.set(
			`user:${user.id}`,
			{
				id: user.id,
				email: user.email,
				role: user.role,
			},
			3600
		); // 1h de cache

		return {
			access_token,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		};
	}

	async signup(email: string, password: string) {
		const normalizedEmail = this.normalizeEmail(email);

		// Vérification basique de l'email
		if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
			throw new BadRequestException('Email invalide');
		}

		const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

		try {
			const user = await this.prisma.user.create({
				data: {
					email: normalizedEmail,
					password: hash,
					role: PrismaRole.EDITOR,
					isApproved: false,
				},
				select: USER_PUBLIC_SELECT,
			});

			return {
				message: 'Compte créé avec succès. En attente de validation par un administrateur.',
				user,
			};
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
				throw new BadRequestException('Cet email est déjà utilisé');
			}
			throw err;
		}
	}

	async register(email: string, password: string, role?: ApiRole) {
		const normalizedEmail = this.normalizeEmail(email);
		const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

		try {
			const user = await this.prisma.user.create({
				data: {
					email: normalizedEmail,
					password: hash,
					role: this.toPrismaRole(role),
					isApproved: true,
					approvedAt: new Date(),
				},
				select: USER_PUBLIC_SELECT,
			});

			// Invalide le cache si l'utilisateur existait
			this.cache.delete(`user:${user.id}`);

			return user;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
				throw new BadRequestException('Cet email est déjà utilisé');
			}
			throw err;
		}
	}

	private async validateCredentials(email: string, password: string): Promise<User> {
		const normalizedEmail = this.normalizeEmail(email);
		const user = await this.prisma.user.findUnique({
			where: { email: normalizedEmail },
		});

		// Message générique pour ne pas révéler si l'email existe
		if (!user) {
			throw new UnauthorizedException('Email ou mot de passe incorrect');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Email ou mot de passe incorrect');
		}

		return user;
	}

	async login(email: string, password: string) {
		const user = await this.validateCredentials(email, password);

		if (!user.isApproved) {
			throw new ForbiddenException('Votre compte est en attente de validation par un administrateur');
		}

		return this.issueToken(user);
	}

	// Méthode utile pour les autres modules
	async getUserById(userId: string) {
		// Utilise le cache en premier
		const cached = this.cache.get<any>(`user:${userId}`);
		if (cached) return cached;

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: USER_PUBLIC_SELECT,
		});

		if (user) {
			this.cache.set(`user:${userId}`, user, 3600);
		}

		return user;
	}
}
