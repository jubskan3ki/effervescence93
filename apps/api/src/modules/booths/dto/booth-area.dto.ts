// ===== src/modules/booths/dto/booth-area.dto.ts =====
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class BoothAreaQueryDto {
	@ApiProperty({
		description: 'Coordonnée X minimum',
		example: 0,
	})
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minX!: number;

	@ApiProperty({
		description: 'Coordonnée Y minimum',
		example: 0,
	})
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minY!: number;

	@ApiProperty({
		description: 'Coordonnée X maximum',
		example: 1000,
	})
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	maxX!: number;

	@ApiProperty({
		description: 'Coordonnée Y maximum',
		example: 800,
	})
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	maxY!: number;
}
