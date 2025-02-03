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
import { SuperadminModule } from './superadmin/superadmin.module';
import { JwtModule } from './jwt/jwt.module';
import { Otp } from './models/otp.entity';
import { TransactionModule } from './transaction/transaction.module';
import { TwilioModule } from './twilio/twilio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:
        process.env.NODE_ENV == 'development'
          ? process.env.DB_HOST || 'localhost'
          : process.env.DB_HOST_PROD,
      port:
        process.env.NODE_ENV == 'development'
          ? Number(process.env.DB_PORT)
          : Number(process.env.DB_PORT_PROD),
      username:
        process.env.NODE_ENV == 'development'
          ? process.env.DB_USER
          : process.env.DB_USER_PROD,
      password:
        process.env.NODE_ENV == 'development'
          ? process.env.DB_PASSWORD
          : process.env.DB_PASSWORD_PROD,
      database:
        process.env.NODE_ENV == 'development'
          ? process.env.DB_NAME
          : process.env.DB_NAME_PROD,
      entities: [User, Stock, Role, Permission, Otp],
      synchronize: process.env.NODE_ENV == 'development' ? true : false,
      ssl: {
        rejectUnauthorized: false,
      },
      // logging: true,
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    RedisModule,
    UserModule,
    UtilsModule,
    SuperadminModule,
    JwtModule,
    TransactionModule,
    TwilioModule,
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
