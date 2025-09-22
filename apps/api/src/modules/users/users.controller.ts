// ===== src/modules/users/users.controller.ts =====
import { Controller, Delete, Get, Param, Patch, Query, UseGuards, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Roles } from '@common/auth/roles.decorator';
import { Role } from '@common/auth/roles.enum';
import { RolesGuard } from '@common/auth/roles.guard';

import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly svc: UsersService) {}

	@Get()
	@ApiOperation({ summary: 'Liste des utilisateurs (admin uniquement)' })
	@ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'all'] })
	@ApiQuery({ name: 'q', required: false, description: 'Recherche par email' })
	list(@Query('status') status?: 'pending' | 'approved' | 'all', @Query('q') q?: string) {
		return this.svc.list(status || 'all', q);
	}

	@Get(':id')
	@ApiOperation({ summary: "Détails d'un utilisateur" })
	findOne(@Param('id') id: string) {
		return this.svc.findOne(id);
	}

	@Patch(':id/approve')
	@ApiOperation({ summary: 'Approuver un utilisateur' })
	approve(@Param('id') id: string) {
		return this.svc.approve(id);
	}

	@Patch(':id/reject')
	@ApiOperation({ summary: 'Rejeter/Désapprouver un utilisateur' })
	reject(@Param('id') id: string) {
		return this.svc.reject(id);
	}

	@Patch(':id/role')
	@ApiOperation({ summary: "Changer le rôle d'un utilisateur" })
	updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
		return this.svc.updateRole(id, dto.role);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Supprimer un utilisateur' })
	remove(@Param('id') id: string) {
		return this.svc.remove(id);
	}

	@Get('stats/summary')
	@ApiOperation({ summary: 'Statistiques des utilisateurs' })
	getStats() {
		return this.svc.getStats();
	}
}
