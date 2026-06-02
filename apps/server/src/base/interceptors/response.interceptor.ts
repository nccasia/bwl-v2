import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{ headers: { accept?: string } }>();
    const acceptHeader = request.headers.accept ?? '';
    if (acceptHeader.includes('text/event-stream')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        isSuccess: true,
        data: data?.data ?? data,
        pagination: data?.pagination,
        errorCode: null,
      })),
    );
  }
}
