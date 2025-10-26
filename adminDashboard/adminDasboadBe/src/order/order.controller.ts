import { Body, Controller, Get, Param, Patch, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetOrderDto } from './dto/get-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { order_status } from '@prisma/client';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  getOrders(@Query() getOrderDto: GetOrderDto){
    return this.orderService.getOrders(getOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orderId/order')
  getOrderById(@Param('orderId', ParseIntPipe) orderId: number){
    return this.orderService.getOrderById(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':orderId/order')
  updateOrderStatus(@Param('orderId', ParseIntPipe) orderId: number, @Body('status') orderStatus: order_status){
    return this.orderService.updateOrderStatus(orderId, orderStatus);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getOrderStats(){
    return this.orderService.getOrderStats();
  }
}
