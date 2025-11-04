import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['FIXED', 'PERCENT'])
  type?: 'FIXED' | 'PERCENT';

  @IsOptional()
  @IsInt()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  costPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  expiresInDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usesPerCoupon?: number;
}


