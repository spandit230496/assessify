import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApiTestingController } from './api-testing.controller';
import { ApiTestingService } from './api-testing.service';
import { ApiTestingGateway } from './api-testing.gateway';
import { ApiExecutionProcessor } from './processors/api-execution.processor';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, BullModule.registerQueue({ name: 'api-execution' })],
  controllers: [ApiTestingController],
  providers: [ApiTestingService, ApiTestingGateway, ApiExecutionProcessor],
  exports: [ApiTestingService],
})
export class ApiTestingModule {}
