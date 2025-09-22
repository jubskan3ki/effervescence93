// src/common/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

import type { Role } from './roles.enum';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
