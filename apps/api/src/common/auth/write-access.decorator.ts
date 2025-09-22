// src/common/auth/write-access.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { Role } from './roles.enum';
import { RolesGuard } from './roles.guard';

// Par défaut : EDITOR ou ADMIN
export const WriteAccess = (...roles: Role[]) =>
	applyDecorators(Roles(...(roles.length ? roles : [Role.EDITOR, Role.ADMIN])), UseGuards(JwtAuthGuard, RolesGuard));
