// src/common/logger/winston-logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
        ),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/application.log',
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
