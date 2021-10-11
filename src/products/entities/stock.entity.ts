export class Stock {
  productId!: string;
  warehouseId?: string;
  warehouseName?: string;
  quantity!: number;

  constructor(productId: string) {
    this.productId = productId;
    this.quantity = 0;
  }
}
