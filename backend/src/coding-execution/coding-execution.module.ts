import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CodingExecutionService } from './coding-execution.service';
import { CodingExecutionController } from './coding-execution.controller';
import { CodeExecutionProcessor } from './code-execution.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'code-execution' }),
  ],
  controllers: [CodingExecutionController],
  providers: [CodingExecutionService, CodeExecutionProcessor],
  exports: [CodingExecutionService],
})
export class CodingExecutionModule {}
