// ===== src/modules/booths/dto/update-booth.dto.ts =====
import { PartialType } from '@nestjs/swagger';

import { CreateBoothDto } from './create-booth.dto';

export class UpdateBoothDto extends PartialType(CreateBoothDto) {}
