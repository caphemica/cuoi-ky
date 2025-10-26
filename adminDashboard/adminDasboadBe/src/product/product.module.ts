import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadServiceService } from 'src/upload-service/upload-service.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, UploadServiceService],
})
export class ProductModule {}
