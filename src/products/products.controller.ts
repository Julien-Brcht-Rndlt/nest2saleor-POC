import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { StockDto } from './dto/stock.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { StocksService } from './stocks.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stocksService: StocksService,
  ) {}
  @Get()
  find(@Query('limit') limit: number, @Request() req: Request) {
    const token = req.headers['x-access-token'];
    const pLimit: number = limit && limit > 0 ? limit : 5;
    return this.productsService.getSome(pLimit, token);
  }

  @Get(':id')
  findOne(@Param('id') productId: string, @Request() req: Request) {
    const token = req.headers['x-access-token'];
    return this.productsService.getOne(productId, token);
  }

  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: Request,
  ) {
    const token = req.headers['x-access-token'];
    return await this.productsService.addOne(createProductDto, token);
  }

  /* @UsePipes(ValidationPipe) */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: Request,
  ) {
    const token = req.headers['x-access-token'];
    return this.productsService.modifyOne(id, updateProductDto, token);
  }

  /**
   * Retrieve stock amount of a given product variant in a given wharehouse
   */
  @Get(':id/stocks')
  readStock(@Param() params: { id: string }, @Request() req: Request) {
    const token = req.headers['x-access-token'];
    return this.stocksService.retrieveAmount(params.id, token);
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
    const token = req.headers['x-access-token'];
    return this.stocksService.initAmount(productId, stockDto, token);
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
    const token = req.headers['x-access-token'];
    return this.stocksService.modifyAmount(productId, stockDto, token);
  }
}
