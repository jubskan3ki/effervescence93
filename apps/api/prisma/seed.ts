// ===== prisma/seed.ts =====
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seed...');

	// Admin par défaut (utilise process.env directement)
	const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@effervescence93.fr';
	const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@2024';

	const adminExists = await prisma.user.findUnique({
		where: { email: adminEmail },
	});

	if (!adminExists) {
		const hash = await bcrypt.hash(adminPassword, 10);
		await prisma.user.create({
			data: {
				email: adminEmail,
				password: hash,
				role: 'ADMIN',
				isApproved: true,
				approvedAt: new Date(),
			},
		});
		console.log('✅ Admin créé:', adminEmail);
	}

	// Secteurs de base
	const sectors = [
		{ name: 'Innovation', colorHex: '#4F46E5' },
		{ name: 'Commerce', colorHex: '#10B981' },
		{ name: 'Services', colorHex: '#F59E0B' },
	];

	for (const s of sectors) {
		await prisma.sector.upsert({
			where: { name: s.name },
			update: {},
			create: s,
		});
	}

	// Quelques stands
	for (let i = 1; i <= 4; i++) {
		await prisma.booth.upsert({
			where: { number: `A0${i}` },
			update: {},
			create: {
				number: `A0${i}`,
				polygonId: `poly-a0${i}`,
			},
		});
	}

	console.log('✅ Données de base créées');
}

main()
	.catch((e) => {
		console.error('❌ Erreur:', e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
