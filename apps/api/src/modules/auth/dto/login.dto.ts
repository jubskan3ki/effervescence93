import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({ example: 'admin@effervescence93.fr' })
	@IsEmail({}, { message: 'Email invalide' })
	email!: string;

	@ApiProperty({ example: 'Password123!', minLength: 8 })
	@IsString()
	@MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
	password!: string;
}

export class LoginResponseDto {
	@ApiProperty()
	access_token!: string;

	@ApiProperty()
	user!: {
		id: string;
		email: string;
		role: string;
	};
}
