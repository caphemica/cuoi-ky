import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('')
  getCoupons(@Query() query: GetCouponsDto) {
    return this.couponService.getCoupons(query);
  }

  @Get(':id')
  getCouponById(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.getCouponById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  createCoupon(@Body() body: CreateCouponDto) {
    return this.couponService.createCoupon(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCouponDto,
  ) {
    return this.couponService.updateCoupon(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.deleteCoupon(id);
  }
}
