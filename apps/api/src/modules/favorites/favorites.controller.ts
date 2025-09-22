// ===== src/modules/favorites/favorites.controller.ts =====
import { Body, Controller, Delete, Get, Param, Post, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
	constructor(private readonly svc: FavoritesService) {}

	@Get()
	@ApiHeader({ name: 'x-session-id', required: true })
	@ApiOperation({ summary: "Liste des favoris d'une session" })
	list(@Headers('x-session-id') sessionId: string) {
		return this.svc.list(sessionId);
	}

	@Post()
	@ApiHeader({ name: 'x-session-id', required: true })
	@ApiOperation({ summary: 'Ajouter un favori' })
	add(@Headers('x-session-id') sessionId: string, @Body() dto: AddFavoriteDto) {
		return this.svc.add(sessionId, dto.exhibitorId);
	}

	@Delete(':exhibitorId')
	@ApiHeader({ name: 'x-session-id', required: true })
	@ApiOperation({ summary: 'Retirer un favori' })
	remove(@Headers('x-session-id') sessionId: string, @Param('exhibitorId') exhibitorId: string) {
		return this.svc.remove(sessionId, exhibitorId);
	}

	@Delete()
	@ApiHeader({ name: 'x-session-id', required: true })
	@ApiOperation({ summary: 'Vider tous les favoris' })
	clear(@Headers('x-session-id') sessionId: string) {
		return this.svc.clear(sessionId);
	}
}
