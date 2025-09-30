// src/common/dto/search.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

import { PaginationDto } from './pagination.dto';

export class SearchDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Recherche textuelle', minLength: 2, maxLength: 300 })
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(300)
	q?: string;
}
