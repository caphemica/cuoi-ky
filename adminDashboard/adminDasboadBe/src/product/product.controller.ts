import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetProductDto } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('productImage', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() productImage?: Express.Multer.File){
    return this.productService.createProduct(createProductDto, productImage);
  }

  @Get('')
  getProducts(@Query() getProductsDto: GetProductDto){
    return this.productService.getProducts(getProductsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':productId/product')
  @UseInterceptors(FileInterceptor('productImage', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() productImage?: Express.Multer.File){
    return this.productService.updateProduct(updateProductDto, productId, productImage);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId/product')
  deleteProduct(@Param('productId', ParseIntPipe) productId: number){
    return this.productService.deleteProduct(productId);
  }
}
