import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { performQuery } from 'src/utils/common-funcs';

type QueryVariables = {
  productId?: string;
  limit?: number;
};

type CreateQueryVariables = {
  productInput: {
    name: string;
    sku: string;
    slug?: string;
    basePrice?: number;
  };
};

type UpdateQueryVariables = {
  updateValues: {
    name?: string;
    sku?: string;
    slug?: string;
    basePrice?: number;
  };
};

/**
 * Implements all product services behaviours.
 */
@Injectable()
export class ProductsService {
  /**
   * Get a specific product according to its product id.
   */
  async getOne(productId: string, token: string): Promise<Product> {
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

    const response = await performQuery<QueryVariables>(
      query,
      variables,
      token,
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
  async getSome(limit: number, token: string): Promise<Product[]> {
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
    console.log('token in service', token);
    const requestHeaders = {
      Authorization: token,
    };
    console.log('requestHeaders', requestHeaders);

    const response = await performQuery<QueryVariables>(
      query,
      variables,
      token,
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
  async addOne(
    createProductDto: CreateProductDto,
    token: string,
  ): Promise<Product> {
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

    const response = await performQuery<CreateQueryVariables>(
      query,
      variables,
      token,
    );

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
   * Update a product onto Saleor API, given its id and a payload.
   */
  async modifyOne(
    productId: string,
    updateProductDto: UpdateProductDto,
    token: string,
  ): Promise<Product | HttpException> {
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

    const response = await performQuery<UpdateQueryVariables>(
      query,
      variables,
      token,
    );

    if (
      response.productUpdate.product &&
      response.productUpdate.productErrors.length === 0
    ) {
      const { id, name, slug } = response.productUpdate.product;
      const product = new Product(id, name, slug);
      response.productUpdate.product.variants?.forEach((variant) => {
        product.variants.push({
          name: variant.name,
          price: {
            amount: variant.price.amount,
          },
        });
      });
      return product;
    } else {
      throw new HttpException(
        'Error while updating product: product was not modified',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
