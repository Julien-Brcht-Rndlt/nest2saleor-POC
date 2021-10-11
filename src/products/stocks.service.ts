import { Injectable } from '@nestjs/common';
import { request } from 'graphql-request';
import { StockDto } from '../products/dto/stock.dto';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksService {
  /**
   * Retrieve/read through Saleor API stock amount of a product variant in a specific wharehouse.
   */
  async retrieveAmount(productId: string, token: string): Promise<Stock> {
    const requestHeaders = {
      Authorization: token,
    };
    const url = new URL(process.env.SALEOR_API_URL);

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

    const response = await request(
      url.toString(),
      query,
      variables,
      requestHeaders,
    );
    console.log('response', response);
    const productVariant = response.product.variants[0];
    const stock: Stock = new Stock(productId);
    if (productVariant.stocks && productVariant.stocks.length > 0) {
      stock.quantity = productVariant.stocks[0].quantity;
      stock.warehouseName = productVariant.stocks[0].warehouse.name;
    }

    return stock;
  }

  /**
   * Update through Saleor API the stock amount of a product variant in a specific wharehouse.
   */
  async modifyAmount(
    productId: string,
    updateStockDto: StockDto,
    token: string,
  ): Promise<Stock> {
    const requestHeaders = {
      Authorization: token,
    };
    const url = new URL(process.env.SALEOR_API_URL);

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

    const response = await request(
      url.toString(),
      query,
      variables,
      requestHeaders,
    );
    console.log('response', response);
    const productVariant = response.productVariantStocksUpdate.productVariant;
    const stock: Stock = new Stock(productId);
    if (productVariant.stocks && productVariant.stocks.length > 0) {
      stock.quantity = productVariant.stocks[0].quantity;
      stock.warehouseName = productVariant.stocks[0].warehouse.name;
    }

    return stock;
  }

  /**
   * Setup through Saleor API the stock amount of a product variant in a specific wharehouse.
   */
  async initAmount(
    productId: string,
    initStockDto: StockDto,
    token: string,
  ): Promise<Stock> {
    const requestHeaders = {
      Authorization: token,
    };

    const url = new URL(process.env.SALEOR_API_URL);

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

    const variantsResponse = await request(
      url.toString(),
      variantsQuery,
      variantsVariables,
      requestHeaders,
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

    const response = await request(
      url.toString(),
      stockQuery,
      stockVariables,
      requestHeaders,
    );
    const productVariant = response.productVariantStocksCreate.productVariant;
    const stock: Stock = new Stock(productId);
    if (productVariant.stocks && productVariant.stocks.length > 0) {
      stock.quantity = productVariant.stocks[0].quantity;
      stock.warehouseName = productVariant.stocks[0].warehouse.name;
    }

    return stock;
  }
}
