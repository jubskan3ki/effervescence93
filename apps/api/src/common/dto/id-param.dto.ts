// src/common/dto/id-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class IdParamDto {
	@ApiProperty({ description: 'ID unique (CUID format)' })
	@IsString()
	@Matches(/^c[a-z0-9]{24}$/, { message: 'Invalid CUID format' })
	id!: string;
}

export class UuidParamDto {
	@ApiProperty({ description: 'UUID v4' })
	@IsUUID('4')
	id!: string;
}

export class SlugParamDto {
	@ApiProperty({ description: 'Slug unique' })
	@IsString()
	@Matches(/^[a-z0-9-]+$/, { message: 'Invalid slug format' })
	slug!: string;
}
