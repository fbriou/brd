import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'API is healthy!',
      timestamp: new Date().toISOString(),
      stage: process.env.STAGE || 'dev'
    })
  };
};

export const health = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(cors()); 