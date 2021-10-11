import { Request } from '@nestjs/common';

/**
 * Helper tool function that allows to apply auth x-access-token onto another final performed action
 * @param request Request object
 * @param callback callback that calls the final performed action
 * @returns
 */
export const applyXAccessToken = <T = any>(
  request: Request,
  callback: (t: string) => T,
) => {
  const token = request.headers['x-access-token'];
  return callback(token);
};
