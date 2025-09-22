import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BoothCoordinatesDto {
	@ApiProperty({ description: 'Position X en pixels' })
	x!: number;

	@ApiProperty({ description: 'Position Y en pixels' })
	y!: number;

	@ApiPropertyOptional({ description: 'Largeur en pixels' })
	width?: number | null;

	@ApiPropertyOptional({ description: 'Hauteur en pixels' })
	height?: number | null;

	@ApiPropertyOptional({ description: 'Rotation en degrés', default: 0 })
	rotation?: number | null;

	@ApiPropertyOptional({
		description: 'Points du polygone au format "x1,y1 x2,y2 x3,y3..."',
		example: '100,100 200,100 200,200 100,200',
	})
	polygonPoints?: string | null;
}

export class BoothResponseDto extends BoothCoordinatesDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	number!: string;

	@ApiProperty()
	polygonId!: string;
}

export class ExhibitorSummaryDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional()
	logoUrl?: string | null;

	@ApiProperty()
	sector!: {
		id: string;
		name: string;
		colorHex: string;
	};
}

export class BoothWithExhibitorDto extends BoothResponseDto {
	@ApiPropertyOptional({ type: ExhibitorSummaryDto, nullable: true })
	exhibitor?: ExhibitorSummaryDto | null;
}
