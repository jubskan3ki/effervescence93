// ===== src/modules/booths/booths.module.ts =====
import { Module } from '@nestjs/common';

import { BoothsController } from './booths.controller';
import { BoothsService } from './booths.service';

@Module({
	controllers: [BoothsController],
	providers: [BoothsService],
	exports: [BoothsService],
})
export class BoothsModule {}
