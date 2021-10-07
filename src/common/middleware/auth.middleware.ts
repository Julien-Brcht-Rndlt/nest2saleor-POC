import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { request } from 'graphql-request';
import { URL } from 'url';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void) {
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
      req.headers['x-access-token'] = `JWT ${response.tokenCreate.token}`;
      next();
    } else {
      throw new HttpException(
        'Authentication failed..',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
