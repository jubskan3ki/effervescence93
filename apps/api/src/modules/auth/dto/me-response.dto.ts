import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty({ enum: ['ADMIN', 'EDITOR'] })
	role!: string;
}
