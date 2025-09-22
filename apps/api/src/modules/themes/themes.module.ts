// ===== src/modules/themes/themes.module.ts =====
import { Module } from '@nestjs/common';

import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';

@Module({
	controllers: [ThemesController],
	providers: [ThemesService],
	exports: [ThemesService],
})
export class ThemesModule {}
