// ===== src/modules/exhibitors/dto/exhibitor-response.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ContactDto } from './contact.dto';

export class ExhibitorResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional()
	logoUrl?: string | null;

	@ApiPropertyOptional()
	description?: string | null;

	@ApiPropertyOptional()
	websiteUrl?: string | null;

	@ApiPropertyOptional()
	linkedinUrl?: string | null;

	@ApiPropertyOptional()
	pdfUrl?: string | null;

	@ApiProperty()
	sector!: {
		id: string;
		name: string;
		colorHex: string;
	};

	@ApiPropertyOptional()
	booth?: {
		id: string;
		number: string;
		polygonId: string;
	} | null;

	@ApiProperty({ type: [ContactDto] })
	contacts!: Array<{
		id: string;
		firstName: string;
		lastName: string;
		role: string;
		email: string;
		phone: string | null;
	}>;

	@ApiProperty()
	createdAt!: Date;
}
