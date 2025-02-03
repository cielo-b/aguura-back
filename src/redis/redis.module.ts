import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      ttl: 0,
      isGlobal: true,
      store: redisStore,
      host:
        process.env.NODE_ENV == 'development'
          ? process.env.REDIS_HOST
          : process.env.REDIS_HOST_PROD,
      port:
        process.env.NODE_ENV == 'development'
          ? Number(process.env.REDIS_POR)
          : Number(process.env.REDIS_PORT_PROD),
    }),
  ],
  providers: [RedisService],
})
export class RedisModule {}
