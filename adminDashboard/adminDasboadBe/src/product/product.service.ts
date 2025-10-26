import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UploadServiceService } from 'src/upload-service/upload-service.service';
import { GetProductDto } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadServiceService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    productImage?: Express.Multer.File,
  ) {
    const { productName, productDescription, productPrice, productQuantity } =
      createProductDto;
    let productUrl = '';
    if (productImage) {
      productUrl = await this.uploadService.uploadFile(productImage);
    }
    const product = await this.prisma.product.create({
      data: {
        productName,
        productDescription,
        productPrice,
        productQuantity,
        productImage: productUrl ? [productUrl] : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  async getProducts(getProductsDto: GetProductDto) {
    const { search, current = 1, pageSize = 10 } = getProductsDto;

    const skip = (current - 1) * pageSize;

    const whereCondition = search
      ? {
          productName: {
            contains: search,
          },
        }
      : {};


    const total = await this.prisma.product.count({
      where: whereCondition,
    });

    const result = await this.prisma.product.findMany({
      where: whereCondition,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const page = Math.ceil(total / pageSize);

    return {
      message: 'Products fetched successfully',
      meta: {
        current,
        pageSize,
        total,
        page,
      },
      data: result,
    };
  }

  async getProductById(productId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async updateProduct(
    updateProductDto: UpdateProductDto,
    productId: number,
    productImage?: Express.Multer.File,
  ) {
    const { productName, productDescription, productPrice, productQuantity } =
      updateProductDto;

    const product = await this.getProductById(productId);
    
    const updateData: any = {
      productName,
      productDescription,
      productPrice,
      productQuantity,
    };

    // If new image is uploaded, update the productImage
    if (productImage) {
      const productUrl = await this.uploadService.uploadFile(productImage);
      updateData.productImage = [productUrl];
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return {
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async deleteProduct(productId: number) {
    const product = await this.getProductById(productId);
    await this.prisma.product.delete({
      where: { id: productId },
    });
    return {
      message: 'Product deleted successfully',
    };
  }
}
