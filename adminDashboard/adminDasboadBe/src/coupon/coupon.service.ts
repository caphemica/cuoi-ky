import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async getCoupons(getCouponsDto: GetCouponsDto) {
    const { name, type, current = 1, pageSize = 10 } = getCouponsDto;

    const skip = (current - 1) * pageSize;

    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (type) {
      where.type = type as any;
    }

    const total = await this.prisma.coupontemplate.count({ where });
    const data = await this.prisma.coupontemplate.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const page = Math.ceil(total / pageSize);

    return {
      message: 'Coupons fetched successfully',
      meta: { current, pageSize, total, page },
      data,
    };
  }

  async createCoupon(createCouponDto: CreateCouponDto) {
    const coupon = await this.prisma.coupontemplate.create({
      data: {
        ...createCouponDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { message: 'Coupon created successfully', data: coupon };
  }

  async getCouponById(id: number) {
    const coupon = await this.prisma.coupontemplate.findFirst({ where: { id } });
    if (!coupon) throw new BadRequestException('Coupon not found');
    return coupon;
  }

  async updateCoupon(id: number, updateCouponDto: UpdateCouponDto) {
    await this.getCouponById(id);
    const coupon = await this.prisma.coupontemplate.update({
      where: { id },
      data: { ...updateCouponDto, updatedAt: new Date() },
    });
    return { message: 'Coupon updated successfully', data: coupon };
  }

  async deleteCoupon(id: number) {
    await this.getCouponById(id);
    await this.prisma.coupontemplate.delete({ where: { id } });
    return { message: 'Coupon deleted successfully' };
  }
}
