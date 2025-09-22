// ===== src/modules/themes/themes.controller.ts =====
import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { WriteAccess } from '@common/auth/write-access.decorator';

import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemesService } from './themes.service';

@ApiTags('themes')
@Controller('themes')
export class ThemesController {
	constructor(private readonly svc: ThemesService) {}

	@Get()
	@ApiOperation({ summary: 'Liste des parcours thématiques' })
	list() {
		return this.svc.list();
	}

	@Get(':id')
	@ApiOperation({ summary: "Détails d'un parcours" })
	findOne(@Param('id') id: string) {
		return this.svc.findOne(id);
	}

	@Get('by-slug/:slug')
	@ApiOperation({ summary: 'Parcours par slug' })
	findBySlug(@Param('slug') slug: string) {
		return this.svc.findBySlug(slug);
	}

	@Post()
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Créer un parcours' })
	create(@Body() dto: CreateThemeDto) {
		return this.svc.create(dto);
	}

	@Patch(':id')
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Modifier un parcours' })
	update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
		return this.svc.update(id, dto);
	}

	@Delete(':id')
	@WriteAccess()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Supprimer un parcours' })
	remove(@Param('id') id: string) {
		return this.svc.remove(id);
	}

	@Post(':id/exhibitors')
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: "Définir les exposants d'un parcours" })
	setExhibitors(@Param('id') id: string, @Body('exhibitorIds') exhibitorIds: string[]) {
		return this.svc.setExhibitors(id, exhibitorIds);
	}
}
