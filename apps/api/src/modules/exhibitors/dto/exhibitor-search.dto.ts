// ===== src/modules/exhibitors/dto/exhibitor-search.dto.ts =====
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '@common/dto';

export class ExhibitorSearchDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Recherche textuelle' })
	@IsOptional()
	@IsString()
	q?: string;

	@ApiPropertyOptional({ description: 'Filtrer par secteur' })
	@IsOptional()
	@IsString()
	sectorId?: string;

	@ApiPropertyOptional({ description: 'Filtrer par numéro de stand' })
	@IsOptional()
	@IsString()
	boothNumber?: string;
}
