import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product } from './entities/product.entities';
import { request } from 'graphql-request';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  async getOne(productId: string): Promise<Product> {
    const query = `query GET_PRODUCT_BYID($productId : ID !) {
      product(id: $productId) {
        id
        productType {
          name
        }
        name
        slug
        variants {
          name
          price {
            amount 
          }
        }
      }
    }`;
    const variables = {
      productId,
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
    console.log(response.product.variants[0].price);
    const { id, name, slug } = response.product;
    const product = new Product(id, name, slug);
    response.product.variants?.forEach((variant) => {
      product.variants.push({
        name: variant.name,
        price: {
          amount: variant.price.amount,
        },
      });
    });
    return product;
  }

  /**
   * Get some products based on pagination parameters
   */
  async getSome(limit: number): Promise<Product[]> {
    const query = `query GET_PRODUCTS($limit: Int !){
      products(first: $limit){
        edges {
          node 
          {
            id 
            productType {
              name
            } 
            name
            slug
            variants {
              name
              price {
                amount 
              }
            }
          }
        }
      }
    }`;
    const variables = {
      limit,
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

    const products: Product[] = response?.products.edges.map((edge) => {
      const { id, name, slug } = edge.node;
      console.log('id', id);
      return new Product(id, name, slug);
    });

    return products;
  }

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
                productType {
                  name
                }
                name
                slug
                variants {
                  name
                  price {
                    amount 
                  }
                }
              }
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
    const productDto: Omit<CreateProductDto, 'sku'> & { id: string } =
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
  async modifyOne(
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> | null {
    let product: Product | null = null;
    const query = `mutation UPDATE_PARTIALLY_PRODUCT($productId: ID !, $updateValues: ProductInput !) {
        productUpdate(id: $productId, input: $updateValues)
        {
          product {
            id
            productType {
              name
            }
            name
            slug
            variants {
              name
              price {
                amount 
              }
            }
          }
          productErrors {
              code 
              message 
              attributes 
              field
          }
        }
    }`;
    const variables = {
      productId,
      updateValues: {
        ...updateProductDto,
      },
    };

    const requestHeaders = {
      authorization:
        'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MzM2MTEwODgsImV4cCI6MTYzMzYxMTM4OCwidG9rZW4iOiJzSzdrdEZpcWJHUW8iLCJlbWFpbCI6ImpuLmJyYWNoZXQucmFuZGx0QGdtYWlsLmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2lkIjoiVlhObGNqb3lOQT09IiwiaXNfc3RhZmYiOnRydWV9.eH_Ic8Qy2okjeLgKyODcjhypUGGLVArNEHzYN2vLuXo',
    };
    const response = await request(
      'http://localhost:8000/graphql/',
      query,
      variables,
      requestHeaders,
    );
    console.log(response);
    if (
      response.productUpdate.product &&
      response.productUpdate.productErrors.length === 0
    ) {
      const { id, name, slug } = response.productUpdate.product;
      product = new Product(id, name, slug);
      response.productUpdate.product.variants?.forEach((variant) => {
        product.variants.push({
          name: variant.name,
          price: {
            amount: variant.price.amount,
          },
        });
      });
      return product;
    } else if (response.productUpdate.productErrors.length > 0) {
      throw new HttpException(
        'Error while updating product: product was not modified',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
