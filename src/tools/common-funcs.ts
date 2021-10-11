import { Request } from '@nestjs/common';

export const applyXAccessToken = <T = any>(
  request: Request,
  callback: (t: string) => T,
) => {
  const token = request.headers['x-access-token'];
  return callback(token);
};
