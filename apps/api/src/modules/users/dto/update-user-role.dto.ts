// ===== src/modules/users/dto/update-user-role.dto.ts =====
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
	@ApiProperty({
		enum: Role,
		example: Role.EDITOR,
		description: "Nouveau rôle de l'utilisateur",
	})
	@IsEnum(Role, { message: 'Le rôle doit être ADMIN ou EDITOR' })
	role!: Role;
}
