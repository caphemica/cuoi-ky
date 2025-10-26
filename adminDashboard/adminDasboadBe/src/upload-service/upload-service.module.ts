import { Module } from '@nestjs/common';
import { UploadServiceService } from './upload-service.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule],
  providers: [UploadServiceService],
  exports: [UploadServiceService],
})
export class UploadServiceModule {}
