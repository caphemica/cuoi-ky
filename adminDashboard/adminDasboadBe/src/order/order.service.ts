import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetOrderDto } from './dto/get-order.dto';
import { order_status } from '@prisma/client';

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService){}

    async getOrderById(orderId: number){
        const order = await this.prisma.order.findUnique({
            where: {id: orderId},
        });
        if(!order){
            throw new BadRequestException('Order not found');
        }
        return {
            message: 'Order fetched successfully',
            data: order,
        }
    }

    async getOrders(getOrderDto: GetOrderDto){
        const {search, status, current = 1, pageSize = 10} = getOrderDto;

        const skip = (current - 1) * pageSize;

        const whereConditon: any = {};

        if (search) {
            const searchNumber = parseInt(search);
            if (!isNaN(searchNumber)) {
                whereConditon.id = searchNumber;
            }
        }

        if (status) {
            whereConditon.status = status;
        }

        const total = await this.prisma.order.count({
            where: whereConditon,
        });

        const result = await this.prisma.order.findMany({
            where: whereConditon,
            skip,
            take: pageSize,
            orderBy: {
                createdAt: 'desc',
            },
        })

        const page = Math.ceil(total / pageSize);

        return{
            message: 'Orders fetched successfully',
            meta: {
                current,
                pageSize,
                total,
                page,
            },
            data: result,
        }

    }

    async updateOrderStatus(orderId: number, status: order_status){
        const order = await this.getOrderById(orderId);
        const updatedOrder = await this.prisma.order.update({
            where: {id: orderId},
            data: {status},
        });
        return {
            message: 'Order status updated successfully',
            data: updatedOrder,
        }
    }

    async getOrderStats() {
        // Get total orders count
        const totalOrders = await this.prisma.order.count();
        
        // Get total revenue
        const revenueResult = await this.prisma.order.aggregate({
            _sum: {
                totalOrderPrice: true,
            },
        });
        
        // Get orders by status
        const ordersByStatus = await this.prisma.order.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });
        
        // Get orders by month (last 12 months)
        const ordersByMonth = await this.prisma.$queryRaw`
            SELECT 
                DATE_FORMAT(createdAt, '%Y-%m') as month,
                COUNT(*) as count,
                SUM(totalOrderPrice) as revenue
            FROM \`order\`
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
            ORDER BY month ASC
        `;
        
        return {
            message: 'Order statistics fetched successfully',
            data: {
                totalOrders,
                totalRevenue: revenueResult._sum.totalOrderPrice || 0,
                ordersByStatus,
                ordersByMonth,
            },
        };
    }
}
