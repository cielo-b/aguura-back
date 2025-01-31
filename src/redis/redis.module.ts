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
      host: 'localhost',
      port: 6379,
    }),
  ],
  providers: [RedisService],
})
export class RedisModule {}
