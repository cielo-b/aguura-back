import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './models/stock.entity';
import { User } from './models/user.entity';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { Role } from './models/role.entity';
import { Permission } from './models/permission.entity';
import { WinstonLoggerService } from './common/log/winston-logger.service';
import { RedisModule } from './redis/redis.module';
import { RateLimitMiddleware } from './common/middlewares/rate-limiter.middleware';
import { UserModule } from './user/user.module';
import { UtilsModule } from './utils/utils.module';
import { HelperService } from './helpers/impls/helper.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Stock, Role, Permission],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    RedisModule,
    UserModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService, WinstonLoggerService, HelperService],
})
export class AppModule {}
// implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//       consumer.apply(RateLimitMiddleware).forRoutes("*")
//   }
// }
