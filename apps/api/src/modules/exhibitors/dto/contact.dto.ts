// ===== src/modules/exhibitors/dto/contact.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContactDto {
	@ApiProperty({ example: 'Jean', maxLength: 60 })
	@IsString({ message: 'Le prénom doit être une chaîne de caractères' })
	@MaxLength(60, { message: 'Le prénom ne doit pas dépasser 60 caractères' })
	firstName!: string;

	@ApiProperty({ example: 'Dupont', maxLength: 60 })
	@IsString({ message: 'Le nom doit être une chaîne de caractères' })
	@MaxLength(60, { message: 'Le nom ne doit pas dépasser 60 caractères' })
	lastName!: string;

	@ApiProperty({ example: 'Directeur Commercial', maxLength: 80 })
	@IsString({ message: 'Le rôle doit être une chaîne de caractères' })
	@MaxLength(80, { message: 'Le rôle ne doit pas dépasser 80 caractères' })
	role!: string;

	@ApiProperty({ example: 'jean.dupont@example.com' })
	@IsEmail({}, { message: 'Email invalide' })
	email!: string;

	@ApiPropertyOptional({ example: '+33 6 12 34 56 78', maxLength: 30 })
	@IsOptional()
	@IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
	@MaxLength(30, { message: 'Le téléphone ne doit pas dépasser 30 caractères' })
	phone?: string;
}
