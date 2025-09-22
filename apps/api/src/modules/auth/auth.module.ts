import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { env } from '@common/env';
import { PrismaModule } from '@common/prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({
			global: true,
			secret: env.JWT_SECRET,
			signOptions: { expiresIn: env.JWT_EXPIRES },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
