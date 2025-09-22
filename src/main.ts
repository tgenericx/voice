import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const env = configService.get<string>('NODE_ENV', 'development');
  app.enableCors({
    origin: env === 'production' ? [] : ['http://localhost:3000'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
