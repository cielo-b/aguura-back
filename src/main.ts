import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { RateLimitMiddleware } from './common/middlewares/rate-limiter.middleware';

const bootstrap = async () => {
  /**
   * DOTENV
   */
  config();

  const app = await NestFactory.create(AppModule);

  /**
   * Rate limiter
   */
  app.use(RateLimitMiddleware);

  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();
