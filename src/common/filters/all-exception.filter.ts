import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionService } from 'src/transaction/transaction.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly transactionService: TransactionService) {}

  async catch(exception: any, host: ArgumentsHost) {
    console.error('Exception caught:', exception);

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    // Determine the HTTP status code
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    // Extract message safely
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
          ? (exception.getResponse() as any).message || exception.message
          : exception.message
        : 'Oops! Something went wrong on the server.';

    const formattedMessage = Array.isArray(message)
      ? message.join(', ')
      : message;

    // 🔴 Rollback Transaction If Any is Active
    try {
      await this.transactionService.rollbackTransaction();
    } catch (err) {
      console.error('Transaction rollback failed:', err);
    } finally {
      await this.transactionService.releaseTransaction();
    }

    response.status(status).json({
      statusCode: status,
      message: formattedMessage || 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
