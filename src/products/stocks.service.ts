import { Injectable } from '@nestjs/common';
import { request } from 'graphql-request';
import { StockDto } from '../products/dto/stock.dto';
import { Stock } from './entities/stock.entity';

type ProductVariant = {
  stocks: Array<{
    warehouse: {
      id: string;
      name: string;
    };
    quantity: number;
  }>;
};

type QueryVariables = {
  productId?: string;
  warehouse?: string;
  stocks?: Array<{
    warehouse: string;
    quantity: number;
  }>;
  quantity?: number;
};

@Injectable()
export class StocksService {
  /**
   * Retrieve/read through Saleor API stock amount of a product variant in a specific wharehouse.
   */
  async retrieveAmount(productId: string, token: string): Promise<Stock> {
    const query = `query RETRIEVE_STOCK_AMOUNT($productId: ID!) {
      product(id: $productId) {
        variants {
          id
          stocks {
            warehouse {id name}
            quantity
          }
        }
      }
    }`;

    const variables = {
      productId,
    };

    const response = await this.performQuery(query, variables, token);

    console.log('response', response);

    return this.parseAsStock(productId, response.product.variants[0]);
  }

  /**
   * Update through Saleor API the stock amount of a product variant in a specific wharehouse.
   */
  async modifyAmount(
    productId: string,
    updateStockDto: StockDto,
    token: string,
  ): Promise<Stock> {
    const query = `mutation UPDATE_STOCK_AMOUNT($stocks: [StockInput!]!, $variantId: ID!) {
      productVariantStocksUpdate(stocks: $stocks, variantId: $variantId) {
        productVariant {
          id
          stocks {
            warehouse {
              id
              name
            }
            quantity
          }
        }
      }
    }`;

    const { variantId, warehouseId, quantity } = updateStockDto;
    const variables = {
      variantId,
      stocks: [
        {
          warehouse: warehouseId,
          quantity,
        },
      ],
    };

    const response = await this.performQuery(query, variables, token);

    console.log('response', response);

    return this.parseAsStock(
      productId,
      response.productVariantStocksUpdate.productVariant,
    );
  }

  /**
   * Setup through Saleor API the stock amount of a product variant in a specific wharehouse.
   */
  async initAmount(
    productId: string,
    initStockDto: StockDto,
    token: string,
  ): Promise<Stock> {
    const variantsQuery = `query ($productId: ID!){
                product(id: $productId) {
                  variants {
                        id
                  }
                }
          }`;

    const variantsVariables = {
      productId,
    };

    const variantsResponse = await this.performQuery(
      variantsQuery,
      variantsVariables,
      token,
    );

    const variantId = variantsResponse?.product.variants[0].id;
    console.log(variantId);

    const stockQuery = `mutation SET_UP_STOCK_AMOUNT($stocks: [StockInput!]!, $variantId: ID!) {
      productVariantStocksCreate(stocks: $stocks, variantId: $variantId) {
          productVariant {
            id
            stocks {
              warehouse {
                id
                name
              }
              quantity
            }
          }
        }
    }`;
    const { warehouseId, quantity } = initStockDto;
    const stockVariables = {
      variantId,
      stocks: [
        {
          warehouse: warehouseId,
          quantity,
        },
      ],
    };

    const response = await this.performQuery(stockQuery, stockVariables, token);

    console.log('response', response);

    return this.parseAsStock(
      productId,
      response.productVariantStocksCreate.productVariant,
    );
  }

  private async performQuery(
    query: string,
    variables: QueryVariables,
    token: string,
  ): Promise<any> {
    const requestHeaders = {
      Authorization: token,
    };
    const url = new URL(process.env.SALEOR_API_URL);

    return await request<any, QueryVariables>(
      url.toString(),
      query,
      variables,
      requestHeaders,
    );
  }

  private parseAsStock(productId, productVariant: ProductVariant): Stock {
    const stock: Stock = new Stock(productId);
    if (productVariant.stocks && productVariant.stocks.length > 0) {
      stock.quantity = productVariant.stocks[0].quantity;
      stock.warehouseName = productVariant.stocks[0].warehouse.name;
    }
    return stock;
  }
}
