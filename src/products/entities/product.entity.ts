interface Price {
  amount: number;
}

interface ProductVariant {
  name: string;
  price: Price;
}

export class Product {
  id: string;
  name: string;
  slug: string;
  variants: ProductVariant[];

  constructor(id: string, name: string, slug: string) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.variants = [];
  }
}
