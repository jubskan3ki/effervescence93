// ===== src/modules/exhibitors/exhibitors.controller.ts =====
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { WriteAccess } from '@common/auth/write-access.decorator';
import { SlugParamDto, IdParamDto } from '@common/dto';

import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { ExhibitorResponseDto } from './dto/exhibitor-response.dto';
import { ExhibitorSearchDto } from './dto/exhibitor-search.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
import { ExhibitorsService } from './exhibitors.service';

@ApiTags('exhibitors')
@Controller('exhibitors')
export class ExhibitorsController {
	constructor(private readonly svc: ExhibitorsService) {}

	@Get()
	@ApiOperation({ summary: 'Recherche et liste des exposants' })
	@ApiQuery({ name: 'q', required: false, description: 'Recherche textuelle' })
	@ApiQuery({ name: 'sectorId', required: false, description: 'Filtrer par secteur' })
	@ApiQuery({ name: 'boothNumber', required: false, description: 'Filtrer par numéro de stand' })
	@ApiQuery({ name: 'themeId', required: false, description: 'Filtrer par parcours thématique' })
	@ApiQuery({ name: 'page', required: false, default: 1 })
	@ApiQuery({ name: 'limit', required: false, default: 20 })
	@ApiResponse({ status: 200, description: 'Liste paginée des exposants' })
	async list(@Query() query: ExhibitorSearchDto) {
		return this.svc.search(query);
	}

	@Get('by-slug/:slug')
	@ApiOperation({ summary: 'Récupère un exposant par son slug' })
	@ApiResponse({ status: 200, type: ExhibitorResponseDto })
	@ApiResponse({ status: 404, description: 'Exposant non trouvé' })
	async bySlug(@Param() params: SlugParamDto) {
		return this.svc.findBySlug(params.slug);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Récupère un exposant par ID' })
	@ApiResponse({ status: 200, type: ExhibitorResponseDto })
	@ApiResponse({ status: 404, description: 'Exposant non trouvé' })
	async findOne(@Param() params: IdParamDto) {
		return this.svc.findOne(params.id);
	}

	@Post()
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crée un nouvel exposant' })
	@ApiResponse({ status: 201, type: ExhibitorResponseDto })
	@ApiResponse({ status: 400, description: 'Données invalides' })
	@ApiResponse({ status: 409, description: 'Conflit (slug ou stand déjà utilisé)' })
	async create(@Body() dto: CreateExhibitorDto) {
		return this.svc.create(dto);
	}

	@Patch(':id')
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Met à jour un exposant' })
	@ApiResponse({ status: 200, type: ExhibitorResponseDto })
	@ApiResponse({ status: 404, description: 'Exposant non trouvé' })
	@ApiResponse({ status: 409, description: "Conflit d'unicité" })
	async update(@Param() params: IdParamDto, @Body() dto: UpdateExhibitorDto) {
		return this.svc.update(params.id, dto);
	}

	@Delete(':id')
	@WriteAccess()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Supprime un exposant' })
	@ApiResponse({ status: 204, description: 'Exposant supprimé' })
	@ApiResponse({ status: 404, description: 'Exposant non trouvé' })
	async remove(@Param() params: IdParamDto) {
		await this.svc.delete(params.id);
	}
}
