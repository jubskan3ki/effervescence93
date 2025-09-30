// src/common/dto/pagination.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1;

	@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 300 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(300)
	limit = 20;

	get skip(): number {
		return (this.page - 1) * this.limit;
	}
}
