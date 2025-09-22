// ===== src/modules/themes/dto/update-theme.dto.ts =====
import { PartialType } from '@nestjs/swagger';

import { CreateThemeDto } from './create-theme.dto';

export class UpdateThemeDto extends PartialType(CreateThemeDto) {}
