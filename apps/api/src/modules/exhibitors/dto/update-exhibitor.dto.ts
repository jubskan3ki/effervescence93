// ===== src/modules/exhibitors/dto/update-exhibitor.dto.ts =====
import { PartialType } from '@nestjs/swagger';

import { CreateExhibitorDto } from './create-exhibitor.dto';

export class UpdateExhibitorDto extends PartialType(CreateExhibitorDto) {}
