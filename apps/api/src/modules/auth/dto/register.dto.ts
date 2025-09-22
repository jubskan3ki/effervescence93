// ===== src/modules/auth/dto/register.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { Role } from '@common/auth/roles.enum';

export class RegisterDto {
	@ApiProperty({ example: 'editor@effervescence93.fr' })
	@IsEmail({}, { message: 'Email invalide' })
	email!: string;

	@ApiProperty({ example: 'Password123!', minLength: 8 })
	@IsString()
	@MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
	password!: string;

	@ApiPropertyOptional({ enum: Role, default: Role.EDITOR })
	@IsOptional()
	@IsEnum(Role)
	role?: Role;
}
