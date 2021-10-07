import { AuthTokenInterceptor } from './auth-token.interceptor';

describe('AuthTokenInterceptor', () => {
  it('should be defined', () => {
    expect(new AuthTokenInterceptor()).toBeDefined();
  });
});
