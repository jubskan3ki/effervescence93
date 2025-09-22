// ===== src/modules/favorites/dto/add-favorite.dto.ts =====
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddFavoriteDto {
	@ApiProperty({ description: "ID de l'exposant à ajouter" })
	@IsString()
	@IsNotEmpty()
	exhibitorId!: string;
}
