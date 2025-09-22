// ===== src/modules/themes/dto/theme-response.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ThemeResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional()
	description?: string | null;

	@ApiProperty()
	order!: number;

	@ApiProperty()
	createdAt!: Date;
}

export class ThemeWithExhibitorsDto extends ThemeResponseDto {
	@ApiProperty({
		type: 'array',
		items: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				slug: { type: 'string' },
				logoUrl: { type: 'string', nullable: true },
				sector: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						name: { type: 'string' },
						colorHex: { type: 'string' },
					},
				},
				booth: {
					type: 'object',
					nullable: true,
					properties: {
						id: { type: 'string' },
						number: { type: 'string' },
						polygonId: { type: 'string' },
					},
				},
			},
		},
	})
	exhibitors!: Array<{
		id: string;
		name: string;
		slug: string;
		logoUrl: string | null;
		sector: {
			id: string;
			name: string;
			colorHex: string;
		};
		booth: {
			id: string;
			number: string;
			polygonId: string;
		} | null;
	}>;
}
