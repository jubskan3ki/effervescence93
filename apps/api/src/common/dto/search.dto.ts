// src/common/dto/search.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

import { PaginationDto } from './pagination.dto';

export class SearchDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Recherche textuelle', minLength: 2, maxLength: 100 })
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	q?: string;
}
