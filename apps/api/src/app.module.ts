// src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { CacheModule } from './common/cache/cache.module';
import { env } from './common/env';
import { PrismaModule } from './common/prisma/prisma.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { BoothsModule } from './modules/booths/booths.module';
import { ExhibitorsModule } from './modules/exhibitors/exhibitors.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { SectorsModule } from './modules/sectors/sectors.module';
import { ThemesModule } from './modules/themes/themes.module';
import { UsersModule } from './modules/users/users.module';

@Module({
	imports: [
		ThrottlerModule.forRoot([
			{
				ttl: env.RATE_LIMIT_TTL * 1000,
				limit: env.RATE_LIMIT_MAX,
			},
		]),

		ScheduleModule.forRoot(),

		// Modules communs
		PrismaModule,
		CacheModule,

		// Modules métier
		AuthModule,
		SectorsModule,
		BoothsModule,
		ExhibitorsModule,
		ThemesModule,
		FavoritesModule,
		AnalyticsModule,
		UsersModule,
	],
})
export class AppModule {}
