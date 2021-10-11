import { IsNumber, IsPositive, IsString } from 'class-validator';

export class StockDto {
  @IsString()
  readonly variantId: string;

  @IsString()
  readonly warehouseId: string;

  @IsNumber()
  @IsPositive()
  readonly quantity: number;
}
