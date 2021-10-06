import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { request } from 'graphql-request';
import * as SALEOR_APP_MANIFEST from '../manifest/saleor-app-manifest.json';

@Controller('commons')
export class CommonController {
  @Get('manifest.json')
  readManifest() {
    console.log('request manifest');
    return SALEOR_APP_MANIFEST;
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  registerToken(@Body('auth_token') token: string) {
    //TODO: handle token
    console.log('here your token', token);
    return;
  }

  /**
   * Authenticate against Saleor API
   */
  @Get('auth')
  async authToSaleorAPI() {
    console.log('auth from Nest2Saleor-API-POC');
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
      email: 'jn.brachet.randlt@gmail.com',
      password: '!ZenDev83@ubuntu',
    };

    const response = await request(
      'http://localhost:8000/graphql/',
      query,
      variables,
    );
    console.log('response:', response);

    console.log('response.tokenCreate:', response.tokenCreate);
    if (response?.tokenCreate && response?.tokenCreate?.token) {
      return response.tokenCreate;
    } else {
      throw new HttpException(
        'Authentication failed..',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
