import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CommonController } from './common/common.controller';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, CommonController, ProductsController],
  providers: [AppService, ProductsService],
})
export class AppModule {}
