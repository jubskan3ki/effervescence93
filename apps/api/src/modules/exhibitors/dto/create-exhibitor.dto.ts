// ===== src/modules/exhibitors/dto/create-exhibitor.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUrl, MaxLength, ValidateNested, ArrayMaxSize } from 'class-validator';

import { ContactDto } from './contact.dto';

export class CreateExhibitorDto {
	@ApiProperty({ example: 'Syngertic Solutions', maxLength: 120 })
	@IsString({ message: 'Le nom doit être une chaîne de caractères' })
	@MaxLength(120, { message: 'Le nom ne doit pas dépasser 120 caractères' })
	name!: string;

	@ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
	@IsOptional()
	@IsUrl({}, { message: "L'URL du logo doit être valide" })
	logoUrl?: string;

	@ApiPropertyOptional({
		example: 'Leader dans les solutions digitales innovantes',
		maxLength: 800,
	})
	@IsOptional()
	@IsString({ message: 'La description doit être une chaîne de caractères' })
	@MaxLength(800, { message: 'La description ne doit pas dépasser 800 caractères' })
	description?: string;

	@ApiPropertyOptional({ example: 'https://www.example.com' })
	@IsOptional()
	@IsUrl({}, { message: "L'URL du site web doit être valide" })
	websiteUrl?: string;

	@ApiPropertyOptional({ example: 'https://www.linkedin.com/company/example' })
	@IsOptional()
	@IsUrl({}, { message: "L'URL LinkedIn doit être valide" })
	linkedinUrl?: string;

	@ApiPropertyOptional({ example: 'https://cdn.example.com/brochure.pdf' })
	@IsOptional()
	@IsUrl({}, { message: "L'URL du PDF doit être valide" })
	pdfUrl?: string;

	@ApiProperty({ description: "ID du secteur d'activité" })
	@IsString({ message: "L'ID du secteur doit être une chaîne de caractères" })
	sectorId!: string;

	@ApiPropertyOptional({ description: 'ID du stand' })
	@IsOptional()
	@IsString({ message: "L'ID du stand doit être une chaîne de caractères" })
	boothId?: string;

	@ApiPropertyOptional({ type: [ContactDto], description: 'Contacts sur le stand' })
	@IsOptional()
	@IsArray({ message: 'Les contacts doivent être un tableau' })
	@ValidateNested({ each: true })
	@Type(() => ContactDto)
	@ArrayMaxSize(5, { message: 'Maximum 5 contacts par exposant' })
	contacts?: ContactDto[];
}
