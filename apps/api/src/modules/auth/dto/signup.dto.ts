import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
	@ApiProperty({ example: 'exposant@example.com' })
	@IsEmail({}, { message: 'Email invalide' })
	email!: string;

	@ApiProperty({
		example: 'Password123!',
		minLength: 8,
		description: 'Au moins 8 caractères',
	})
	@IsString()
	@MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
	password!: string;
}

export class SignupResponseDto {
	@ApiProperty()
	message!: string;

	@ApiProperty()
	user!: {
		id: string;
		email: string;
		role: string;
		isApproved: boolean;
		createdAt: Date;
	};
}
