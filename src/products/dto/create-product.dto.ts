export class CreateProductDto {
  readonly id?: string;
  readonly productType: string;
  readonly name: string;
  readonly slug?: string;
  readonly sku: string;
  readonly basePrice: number;
}
