// src/common/auth/current-user.decorator.ts
import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.user as { id: string; email: string; role: string } | undefined;
});
