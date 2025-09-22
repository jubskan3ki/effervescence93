// ===== src/modules/sectors/dto/create-sector.dto.ts =====
import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSectorDto {
	@ApiProperty({
		example: 'Innovation',
		description: 'Nom du secteur',
		maxLength: 80,
	})
	@IsString({ message: 'Le nom doit être une chaîne de caractères' })
	@IsNotEmpty({ message: 'Le nom est requis' })
	@MaxLength(80, { message: 'Le nom ne doit pas dépasser 80 caractères' })
	name!: string;

	@ApiProperty({
		example: '#4F46E5',
		description: 'Couleur en hexadécimal',
	})
	@IsString({ message: 'La couleur doit être une chaîne de caractères' })
	@IsHexColor({ message: 'La couleur doit être au format hexadécimal (#RRGGBB)' })
	colorHex!: string;
}
