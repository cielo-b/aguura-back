import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { RateLimitMiddleware } from './common/middlewares/rate-limiter.middleware';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const bootstrap = async () => {
  /**
   * DOTENV
   */
  config();

  const app = await NestFactory.create(AppModule);

  /**
   * Rate limiter
   */
  // app.use(RateLimitMiddleware);

  /**
   * CORS
   */
  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  app.enableCors(corsOptions);

  /**
   * Exception filter
   */
  app.useGlobalFilters(new AllExceptionsFilter());

  /**
   * Prefix
   */
  const gp: string = 'api/v2';
  app.setGlobalPrefix(gp);

  /**
   * SWAGGER
   */
  const options = new DocumentBuilder()
    .setTitle('Aguura Backend APIs')
    .setDescription('Backend APIs documentation for Aguura')
    .setVersion('1.0.0')
    .addTag('Users', "User's related operations.")
    .addTag("Super admin", "Operations related to super admin")
    .addTag("App", "Welcome")
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  document.tags = (document.tags || []).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  document.paths = Object.keys(document.paths)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = document.paths[key];
      return acc;
    }, {});

  SwaggerModule.setup('api/v2/swagger-ui.html', app, document);

  /**
   * VALIDATION
   */
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();
