// ===== src/modules/analytics/dto/track-event.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

enum EventType {
	VIEW = 'view',
	SEARCH = 'search',
	FILTER = 'filter',
	FAVORITE = 'favorite',
	SHARE = 'share',
	CLICK = 'click',
}

export class TrackEventDto {
	@ApiProperty({ enum: EventType, example: 'view' })
	@IsEnum(EventType)
	type!: EventType;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	sessionId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	exhibitorId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	searchQuery?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsObject()
	payload?: Record<string, any>;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	userAgent?: string;
}
