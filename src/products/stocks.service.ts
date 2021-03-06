import { Injectable } from '@nestjs/common';
import { performQuery } from 'src/utils/common-funcs';
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

/**
 * Implements all stock services behaviours.
 */
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

    const response = await performQuery<QueryVariables>(
      query,
      variables,
      token,
    );

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

    const response = await performQuery<QueryVariables>(
      query,
      variables,
      token,
    );

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

    const variantsResponse = await performQuery<QueryVariables>(
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

    const response = await performQuery<QueryVariables>(
      stockQuery,
      stockVariables,
      token,
    );

    console.log('response', response);

    return this.parseAsStock(
      productId,
      response.productVariantStocksCreate.productVariant,
    );
  }

  /**
   * Permits to extract a Stock representation from a product variant response data.
   * @param productId id of the product
   * @param productVariant product variant of the product
   * @returns a Stock object
   */
  private parseAsStock(productId, productVariant: ProductVariant): Stock {
    const stock: Stock = new Stock(productId);
    if (productVariant.stocks && productVariant.stocks.length > 0) {
      stock.quantity = productVariant.stocks[0].quantity;
      stock.warehouseName = productVariant.stocks[0].warehouse.name;
    }
    return stock;
  }
}
