import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { AllExceptionFilter } from './shared/filters/exception.filter';
import * as cookieParser from 'cookie-parser';
import { ENV_VARS } from './shared/env-variables';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: ENV_VARS.clientUrl(),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(4040);
}
bootstrap();
