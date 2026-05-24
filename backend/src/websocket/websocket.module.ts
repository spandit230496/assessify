import { Module } from '@nestjs/common';
import { AssessmentGateway } from './assessment.gateway';

@Module({
  providers: [AssessmentGateway],
  exports: [AssessmentGateway],
})
export class WebsocketModule {}
