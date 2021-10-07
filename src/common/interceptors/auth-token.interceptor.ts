import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { request } from 'graphql-request';
import { URL } from 'url';

@Injectable()
export class AuthTokenInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const query = `mutation 
        GET_TOKEN($email: String! , $password: String!) {
          tokenCreate(email: $email, password: $password) {
            token
            user {
                email
            }
          }    
        }`;

    const variables = {
      email: process.env.SALEOR_API_USER,
      password: process.env.SALEOR_API_PASSWORD,
    };

    const url = new URL(process.env.SALEOR_API_URL);

    const response = await request(url.toString(), query, variables);

    if (response?.tokenCreate && response.tokenCreate.token) {
      const request = context.switchToHttp().getRequest();
      request.headers['x-access-token'] = `JWT ${response.tokenCreate.token}`;
      console.log('interceptor: ', request.headers['x-access-token']);
      return next.handle();
    } else {
      throw new HttpException(
        'Authentication failed..',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
