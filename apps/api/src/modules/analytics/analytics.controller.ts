// ===== src/modules/analytics/analytics.controller.ts =====
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Roles } from '@common/auth/roles.decorator';
import { Role } from '@common/auth/roles.enum';
import { RolesGuard } from '@common/auth/roles.guard';

import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
	constructor(private readonly svc: AnalyticsService) {}

	@Post('track')
	@ApiOperation({ summary: 'Enregistrer un événement' })
	track(@Body() dto: TrackEventDto) {
		return this.svc.track(dto);
	}

	@Get('stats')
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Statistiques globales (admin)' })
	getStats(@Query('from') from?: string, @Query('to') to?: string) {
		return this.svc.getStats(from, to);
	}

	@Get('top-exhibitors')
	@ApiOperation({ summary: 'Exposants les plus visités' })
	getTopExhibitors(@Query('limit') limit = 10) {
		return this.svc.getTopExhibitors(limit);
	}
}
