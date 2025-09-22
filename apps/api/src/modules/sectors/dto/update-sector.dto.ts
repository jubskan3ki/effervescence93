// ===== src/modules/sectors/dto/update-sector.dto.ts =====
import { PartialType } from '@nestjs/swagger';

import { CreateSectorDto } from './create-sector.dto';

export class UpdateSectorDto extends PartialType(CreateSectorDto) {}
