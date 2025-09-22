// ===== src/modules/booths/booths.controller.ts =====
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	HttpCode,
	HttpStatus,
	ParseFloatPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { WriteAccess } from '@common/auth/write-access.decorator';
import { IdParamDto, SearchDto } from '@common/dto';

import { BoothsService } from './booths.service';
import { BoothAreaQueryDto } from './dto/booth-area.dto';
import { BoothResponseDto, BoothWithExhibitorDto } from './dto/booth-response.dto';
import { CreateBoothDto } from './dto/create-booth.dto';
import { UpdateBoothDto } from './dto/update-booth.dto';

@ApiTags('booths')
@Controller('booths')
export class BoothsController {
	constructor(private readonly svc: BoothsService) {}

	@Get()
	@ApiOperation({ summary: 'Liste tous les stands' })
	@ApiResponse({ status: 200, type: [BoothWithExhibitorDto] })
	async list(@Query() query: SearchDto): Promise<BoothWithExhibitorDto[]> {
		return this.svc.list(query);
	}

	@Get('area')
	@ApiOperation({ summary: 'Récupère les stands dans une zone définie' })
	@ApiResponse({ status: 200, type: [BoothWithExhibitorDto] })
	async findByArea(@Query() area: BoothAreaQueryDto): Promise<BoothWithExhibitorDto[]> {
		return this.svc.findByArea(area);
	}

	@Get('nearby')
	@ApiOperation({ summary: "Récupère les stands proches d'un point" })
	@ApiQuery({ name: 'x', type: Number, description: 'Coordonnée X' })
	@ApiQuery({ name: 'y', type: Number, description: 'Coordonnée Y' })
	@ApiQuery({
		name: 'radius',
		type: Number,
		required: false,
		description: 'Rayon de recherche en pixels (défaut: 100)',
	})
	@ApiResponse({ status: 200, type: [BoothWithExhibitorDto] })
	async findNearby(
		@Query('x', ParseFloatPipe) x: number,
		@Query('y', ParseFloatPipe) y: number,
		@Query('radius') radius?: string
	): Promise<BoothWithExhibitorDto[]> {
		const radiusNum = radius ? parseFloat(radius) : 100;
		return this.svc.findNearby(x, y, radiusNum);
	}

	@Get('stats/summary')
	@ApiOperation({ summary: 'Statistiques des stands avec limites du canvas' })
	@ApiResponse({
		status: 200,
		schema: {
			type: 'object',
			properties: {
				total: { type: 'number' },
				occupied: { type: 'number' },
				available: { type: 'number' },
				occupancyRate: { type: 'string' },
				canvasBounds: {
					type: 'object',
					nullable: true,
					properties: {
						minX: { type: 'number' },
						minY: { type: 'number' },
						maxX: { type: 'number' },
						maxY: { type: 'number' },
						width: { type: 'number' },
						height: { type: 'number' },
					},
				},
			},
		},
	})
	async getStats() {
		return this.svc.getStats();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Récupère un stand par ID' })
	@ApiResponse({ status: 200, type: BoothWithExhibitorDto })
	@ApiResponse({ status: 404, description: 'Stand non trouvé' })
	async findOne(@Param() params: IdParamDto): Promise<BoothWithExhibitorDto> {
		return this.svc.findOne(params.id);
	}

	@Get('by-number/:number')
	@ApiOperation({ summary: 'Récupère un stand par son numéro' })
	@ApiResponse({ status: 200, type: BoothWithExhibitorDto })
	@ApiResponse({ status: 404, description: 'Stand non trouvé' })
	async findByNumber(@Param('number') number: string): Promise<BoothWithExhibitorDto> {
		return this.svc.findByNumber(number);
	}

	@Get('by-polygon/:polygonId')
	@ApiOperation({ summary: 'Récupère un stand par son polygonId' })
	@ApiResponse({ status: 200, type: BoothWithExhibitorDto })
	@ApiResponse({ status: 404, description: 'Stand non trouvé' })
	async findByPolygonId(@Param('polygonId') polygonId: string): Promise<BoothWithExhibitorDto> {
		return this.svc.findByPolygonId(polygonId);
	}

	@Post()
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crée un nouveau stand avec coordonnées' })
	@ApiResponse({ status: 201, type: BoothResponseDto })
	@ApiResponse({ status: 409, description: 'Numéro ou polygonId déjà utilisé' })
	async create(@Body() dto: CreateBoothDto): Promise<BoothResponseDto> {
		return this.svc.create(dto);
	}

	@Post('bulk')
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crée plusieurs stands en une fois' })
	@ApiResponse({
		status: 201,
		schema: {
			type: 'object',
			properties: {
				created: { type: 'number' },
				message: { type: 'string' },
			},
		},
	})
	@ApiResponse({ status: 409, description: 'Erreur lors de la création en masse' })
	async bulkCreate(@Body() dto: CreateBoothDto[]) {
		return this.svc.bulkCreate(dto);
	}

	@Patch(':id')
	@WriteAccess()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Met à jour un stand (incluant ses coordonnées)' })
	@ApiResponse({ status: 200, type: BoothResponseDto })
	@ApiResponse({ status: 404, description: 'Stand non trouvé' })
	@ApiResponse({ status: 409, description: "Conflit d'unicité" })
	async update(@Param() params: IdParamDto, @Body() dto: UpdateBoothDto): Promise<BoothResponseDto> {
		return this.svc.update(params.id, dto);
	}

	@Delete(':id')
	@WriteAccess()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Supprime un stand' })
	@ApiResponse({ status: 204, description: 'Stand supprimé' })
	@ApiResponse({ status: 404, description: 'Stand non trouvé' })
	async remove(@Param() params: IdParamDto): Promise<void> {
		await this.svc.remove(params.id);
	}
}
