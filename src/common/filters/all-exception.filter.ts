import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.error('Exception caught:', exception); // Log full exception for debugging

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

    // Ensure message is always a string
    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;

    response.status(status).json({
      statusCode: status,
      message: formattedMessage || 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
