import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { UploadServiceModule } from './upload-service/upload-service.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule, 
    ProductModule, 
    AuthModule, 
    EmailModule, UploadServiceModule, OrderModule, CouponModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
