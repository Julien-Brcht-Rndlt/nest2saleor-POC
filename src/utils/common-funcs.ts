import request from 'graphql-request';

/**
 * Allows to process a graphql query against Saleor API, handling auth Saleor API token.
 * @param query a graphql query or mutation to be performed
 * @param variables object of T declaring passed values
 * @param token auth x-access-token
 * @returns Promise<any>
 */
export const performQuery = async <T = any>(
  query: string,
  variables: T,
  token: string,
): Promise<any> => {
  const requestHeaders = {
    Authorization: token,
  };
  const url = new URL(process.env.SALEOR_API_URL);

  return await request<any, T>(
    url.toString(),
    query,
    variables,
    requestHeaders,
  );
};
