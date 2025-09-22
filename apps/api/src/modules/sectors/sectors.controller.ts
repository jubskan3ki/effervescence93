// ===== src/modules/sectors/sectors.controller.ts =====
import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { WriteAccess } from '@common/auth/write-access.decorator';

import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { SectorsService } from './sectors.service';

@ApiTags('sectors')
@Controller('sectors')
export class SectorsController {
	constructor(private readonly svc: SectorsService) {}

	@Get()
	@ApiOperation({ summary: 'Liste tous les secteurs' })
	list() {
		return this.svc.list();
	}

	@Get(':id')
	@ApiOperation({ summary: "Détails d'un secteur" })
	findOne(@Param('id') id: string) {
		return this.svc.findOne(id);
	}

	@Post()
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Créer un secteur' })
	create(@Body() dto: CreateSectorDto) {
		return this.svc.create(dto);
	}

	@Patch(':id')
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Modifier un secteur' })
	update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
		return this.svc.update(id, dto);
	}

	@Delete(':id')
	@WriteAccess()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Supprimer un secteur' })
	remove(@Param('id') id: string) {
		return this.svc.remove(id);
	}

	@Get(':id/stats')
	@ApiOperation({ summary: "Statistiques d'un secteur" })
	getStats(@Param('id') id: string) {
		return this.svc.getStats(id);
	}
}
