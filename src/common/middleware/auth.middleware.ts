import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { CommonService } from '../common.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly commonService: CommonService) {}

  async use(req: Request, res: Response, next: () => void) {
    const response = await this.commonService.authToSaleorAPI();

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
