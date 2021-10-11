import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  readonly productType!: string;

  @IsString()
  readonly name!: string;

  @IsString()
  @IsOptional()
  readonly slug?: string;

  @IsString()
  readonly sku!: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly basePrice?: number;
}
