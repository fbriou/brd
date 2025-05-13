import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import { requireAuth } from './auth';
import { requirePermission } from './permissions';

export const commonMiddleware = (handler: any, requiredGroups?: string[]) => {
  return middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler())
    .use(cors())
    .use(requireAuth(requiredGroups));
};

export { requirePermission }; 