import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities/product.entities';
import { request } from 'graphql-request';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  /*  getOne() {} */

  /**
   * Get some products based on pagination parameters
   */
  /* getSome(offset: number, limit: number) {} */

  /**
   * Add a product through Saleor API
   */
  async addOne(createProductDto: CreateProductDto): Promise<Product> {
    const query = `mutation 
        ADD_PRODUCT($productInput: ProductCreateInput !) {
          productCreate(input: $productInput) 
          {
            product {
                id
                name
                slug
            }
            productErrors {
                code 
                message 
                attributes 
                field
            }
          }
        }`;

    /* 
        Sample of data:
        const variablesProd = {
            productInput: {
                name: "Asus_De_Luxe",
                productType: "UHJvZHVjdFR5cGU6MTY=",
    		    sku: "99",
    		    basePrice: 499.00,
            },
        } 
    */

    const variables = {
      productInput: {
        ...createProductDto,
      },
    };

    const requestHeaders = {
      authorization:
        'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MzM1NDA4NDAsImV4cCI6MTYzMzU0MTE0MCwidG9rZW4iOiJzSzdrdEZpcWJHUW8iLCJlbWFpbCI6ImpuLmJyYWNoZXQucmFuZGx0QGdtYWlsLmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2lkIjoiVlhObGNqb3lOQT09IiwiaXNfc3RhZmYiOnRydWV9.Oh9GYis7bgcMy8hT0koXWfTx1fKBea4wr9p3fEMahWk',
    };

    const response = await request(
      'http://localhost:8000/graphql/',
      query,
      variables,
      requestHeaders,
    );

    console.log('response:', response);
    const productDto: Omit<CreateProductDto, 'sku'> =
      response.productCreate.product;
    if (productDto || response.productCreate.productErrors) {
      const { id, name, slug } = productDto;
      const product: Product = new Product(id, name, slug);
      console.log('product: ', product);
      return product;
    } else {
      throw new HttpException(
        'Error while creating product..',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a product
   */
  /* modifyOne() {

  } */
}
