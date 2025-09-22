import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, Matches, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateBoothDto {
	@ApiProperty({
		example: 'A12',
		description: 'Numéro du stand',
		maxLength: 20,
	})
	@IsString()
	@IsNotEmpty({ message: 'Le numéro du stand est requis' })
	@MaxLength(20, { message: 'Le numéro ne doit pas dépasser 20 caractères' })
	@Matches(/^[A-Za-z0-9-]+$/, { message: 'Le numéro ne peut contenir que des lettres, chiffres et tirets' })
	number!: string;

	@ApiProperty({
		example: 'polygon_123',
		description: 'ID du polygone sur le plan SVG',
		maxLength: 64,
	})
	@IsString()
	@IsNotEmpty({ message: 'Le polygonId est requis' })
	@MaxLength(64, { message: 'Le polygonId ne doit pas dépasser 64 caractères' })
	polygonId!: string;

	@ApiProperty({
		example: 100,
		description: 'Position X en pixels',
		minimum: 0,
	})
	@Type(() => Number)
	@IsNumber()
	@Min(0, { message: 'La position X doit être positive' })
	x!: number;

	@ApiProperty({
		example: 200,
		description: 'Position Y en pixels',
		minimum: 0,
	})
	@Type(() => Number)
	@IsNumber()
	@Min(0, { message: 'La position Y doit être positive' })
	y!: number;

	@ApiPropertyOptional({
		example: 120,
		description: 'Largeur du stand en pixels',
		minimum: 1,
	})
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@Min(1, { message: 'La largeur doit être supérieure à 0' })
	width?: number;

	@ApiPropertyOptional({
		example: 80,
		description: 'Hauteur du stand en pixels',
		minimum: 1,
	})
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@Min(1, { message: 'La hauteur doit être supérieure à 0' })
	height?: number;

	@ApiPropertyOptional({
		example: 45,
		description: 'Rotation du stand en degrés',
		minimum: -360,
		maximum: 360,
	})
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@Min(-360, { message: 'La rotation doit être entre -360 et 360 degrés' })
	@Max(360, { message: 'La rotation doit être entre -360 et 360 degrés' })
	rotation?: number;

	@ApiPropertyOptional({
		example: '100,100 200,100 200,200 100,200',
		description: 'Points du polygone pour forme personnalisée',
	})
	@IsString()
	@IsOptional()
	@Matches(/^(\d+\.?\d*,\d+\.?\d*\s*)+$/, {
		message: 'Le format des points doit être "x1,y1 x2,y2 x3,y3..."',
	})
	polygonPoints?: string;
}
