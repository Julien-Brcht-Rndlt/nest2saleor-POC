import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  find(@Query('limit') limit: number) {
    const pLimit: number = limit && limit > 0 ? limit : 5;
    return this.productsService.getSome(pLimit);
  }

  @Get(':id')
  findOne(@Param('id') productId: string) {
    return this.productsService.getOne(productId);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.addOne(createProductDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.modifyOne(id, updateProductDto);
  }
}
