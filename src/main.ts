import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthTokenInterceptor } from './common/interceptors/auth-token.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* app.useGlobalInterceptors(new AuthTokenInterceptor()); */
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
