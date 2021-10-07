import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
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

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: Request,
  ) {
    const token = req.headers['x-access-token'];
    return await this.productsService.addOne(createProductDto, token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: Request,
  ) {
    const token = req.headers['x-access-token'];
    return this.productsService.modifyOne(id, updateProductDto, token);
  }
}
