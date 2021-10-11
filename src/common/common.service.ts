import { Injectable } from '@nestjs/common';
import request from 'graphql-request';

@Injectable()
export class CommonService {
  async authToSaleorAPI(): Promise<any> {
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

    return await request(url.toString(), query, variables);
  }
}
