// src/common/auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { env } from '@common/env';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwt: JwtService) {}
	canActivate(ctx: ExecutionContext): boolean {
		const req = ctx.switchToHttp().getRequest();
		const header = req.headers['authorization'] as string | undefined;
		const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
		if (!token) throw new UnauthorizedException('Missing Bearer token');
		try {
			const payload = this.jwt.verify(token, { secret: env.JWT_SECRET });
			req.user = { id: payload.sub, email: payload.email, role: payload.role };
			return true;
		} catch {
			throw new UnauthorizedException('Invalid token');
		}
	}
}
