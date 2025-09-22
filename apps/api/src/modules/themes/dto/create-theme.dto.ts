// ===== src/modules/themes/dto/create-theme.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min, IsArray } from 'class-validator';

export class CreateThemeDto {
	@ApiProperty({
		example: 'Innovation & Technologie',
		description: 'Nom du parcours thématique',
		maxLength: 100,
	})
	@IsString({ message: 'Le nom doit être une chaîne de caractères' })
	@MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères' })
	name!: string;

	@ApiPropertyOptional({
		example: 'Découvrez les entreprises innovantes du salon',
		description: 'Description du parcours',
		maxLength: 500,
	})
	@IsOptional()
	@IsString({ message: 'La description doit être une chaîne de caractères' })
	@MaxLength(500, { message: 'La description ne doit pas dépasser 500 caractères' })
	description?: string;

	@ApiPropertyOptional({
		example: 1,
		description: "Ordre d'affichage (plus petit = affiché en premier)",
		default: 0,
	})
	@IsOptional()
	@IsInt({ message: "L'ordre doit être un nombre entier" })
	@Min(0, { message: "L'ordre doit être positif ou nul" })
	order?: number;

	@ApiPropertyOptional({
		description: 'IDs des exposants à associer au parcours',
		type: [String],
	})
	@IsOptional()
	@IsArray({ message: 'Les IDs des exposants doivent être un tableau' })
	@IsString({ each: true, message: 'Chaque ID doit être une chaîne' })
	exhibitorIds?: string[];
}
