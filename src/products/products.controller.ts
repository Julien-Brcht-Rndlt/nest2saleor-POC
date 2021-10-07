import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  /*  @Get()
  find() {}

  @Get(':id')
  findOne(@Query('limit') limit: string) {} */

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.addOne(createProductDto);
  }
}
