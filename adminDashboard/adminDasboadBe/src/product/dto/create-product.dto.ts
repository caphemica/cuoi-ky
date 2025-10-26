import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    productName: string;

    @IsNotEmpty()
    @IsString()
    productDescription: string;

    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    productPrice: number;

    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    productQuantity: number;
}