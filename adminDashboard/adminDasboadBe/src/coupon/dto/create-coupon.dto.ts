import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  name: string;

  @IsEnum(['FIXED', 'PERCENT'])
  type: 'FIXED' | 'PERCENT';

  @IsInt()
  @Min(0)
  value: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  minOrder?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @IsInt()
  @Min(0)
  costPoints: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  expiresInDays?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  usesPerCoupon?: number;
}


