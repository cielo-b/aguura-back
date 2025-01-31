// src/common/middleware/rate-limit.middleware.ts
import { Injectable } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message:
        'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    });

    limiter(req, res, next);
  }
}
