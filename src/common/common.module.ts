import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CommonService } from './common.service';

@Module({
  providers: [CommonService],
})
export class CommonModule implements NestModule {
  configure(consummer: MiddlewareConsumer) {
    consummer.apply(AuthMiddleware).forRoutes('products');
  }
}
