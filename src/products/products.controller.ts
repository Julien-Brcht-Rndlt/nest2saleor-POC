import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { applyXAccessToken } from 'src/tools/common-funcs';
import { CreateProductDto } from './dto/create-product.dto';
import { StockDto } from './dto/stock.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Stock } from './entities/stock.entity';
import { ProductsService } from './products.service';
import { StocksService } from './stocks.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stocksService: StocksService,
  ) {}
  /**
   * Retrieve the first n products (n is lower or equal to limit value).
   */
  @Get()
  find(@Query('limit') limit: number, @Request() req: Request) {
    const pLimit: number = limit && limit > 0 ? limit : 5;
    return applyXAccessToken<Product[]>(
      req,
      (token: string): Promise<Product[]> => {
        return this.productsService.getSome(pLimit, token);
      },
    );
  }

  /**
   * Retrieve a specific product given its unique id.
   */
  @Get(':id')
  findOne(@Param('id') productId: string, @Request() req: Request) {
    return applyXAccessToken<Product>(
      req,
      (token: string): Promise<Product> => {
        return this.productsService.getOne(productId, token);
      },
    );
  }

  /**
   * Create a new product based on a payload containing the required values.
   */
  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: Request,
  ) {
    return applyXAccessToken<Product>(
      req,
      async (token: string): Promise<Product> => {
        return await this.productsService.addOne(createProductDto, token);
      },
    );
  }

  /**
   * Update partially a product based on its given id and a payload of the values that have to be modified.
   */
  @UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: Request,
  ) {
    return applyXAccessToken<Product>(
      req,
      async (token: string): Promise<Product | HttpException> => {
        return this.productsService.modifyOne(id, updateProductDto, token);
      },
    );
  }

  /**
   * Retrieve stock amount of a given product variant in a given wharehouse
   */
  @Get(':id/stocks')
  readStock(@Param() params: { id: string }, @Request() req: Request) {
    return applyXAccessToken<Stock>(
      req,
      async (token: string): Promise<Stock> => {
        return this.stocksService.retrieveAmount(params.id, token);
      },
    );
  }

  /**
   * Create/add stock amount of a given product variant in a given wharehouse
   */
  @UsePipes(ValidationPipe)
  @Post(':id/stocks')
  createStock(
    @Param('id') productId,
    @Body() stockDto: StockDto,
    @Request() req: Request,
  ) {
    return applyXAccessToken<Stock>(
      req,
      async (token: string): Promise<Stock> => {
        return this.stocksService.initAmount(productId, stockDto, token);
      },
    );
  }

  /**
   * Update stock amount of a given product variant in a given wharehouse
   */
  @UsePipes(ValidationPipe)
  @Put(':id/stocks')
  updateStock(
    @Param('id') productId: string,
    @Body() stockDto: StockDto,
    @Request() req: Request,
  ) {
    return applyXAccessToken<Stock>(
      req,
      async (token: string): Promise<Stock> => {
        return this.stocksService.modifyAmount(productId, stockDto, token);
      },
    );
  }
}
