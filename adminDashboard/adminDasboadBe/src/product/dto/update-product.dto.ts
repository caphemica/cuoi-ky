import { IsNumber, IsString } from "class-validator";

export class UpdateProductDto {

    @IsString()
    productName?: string;

    @IsString()
    productDescription?: string;

    @IsNumber()
    productPrice?: number;
    
    @IsNumber()
    productQuantity?: number;
}