import middy from '@middy/core';
import createHttpError from 'http-errors';
import { GroupPermissions } from '../constants';
import { AuthorizedEvent } from '../../types';

export const requirePermission = (requiredPermission: string) => {
  return ({
    before: async (handler: any) => {
      const { event } = handler;
      const user = (event as AuthorizedEvent).user;

      const userPermissions = user.groups.reduce((perms: string[], group: string) => {
        return [...perms, ...(GroupPermissions[group] || [])];
      }, []);

      if (!userPermissions.includes(requiredPermission)) {
        throw new createHttpError.Forbidden(
          `Missing required permission: ${requiredPermission}`
        );
      }
    }
  });
}; 