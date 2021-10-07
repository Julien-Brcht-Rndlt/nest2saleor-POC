import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({})
export class CommonModule implements NestModule {
  configure(consummer: MiddlewareConsumer) {
    consummer.apply(AuthMiddleware).forRoutes('products');
  }
}
