import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthTokenInterceptor } from './interceptors/auth-token.interceptor';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  providers: [AuthTokenInterceptor],
  exports: [AuthTokenInterceptor],
})
export class CommonModule /* implements NestModule */ {
  /* configure(consummer: MiddlewareConsumer) {
    consummer.apply(AuthMiddleware).forRoutes('products');
  } */
}
