// ===== src/modules/sectors/sectors.module.ts =====
import { Module } from '@nestjs/common';

import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';

@Module({
	controllers: [SectorsController],
	providers: [SectorsService],
	exports: [SectorsService],
})
export class SectorsModule {}
