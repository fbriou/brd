import { APIGatewayProxyEvent } from 'aws-lambda';
import createHttpError from 'http-errors';
import { UserGroups } from '../constants';
import { AuthorizedEvent, UserGroup } from '../../types';

export const requireAuth = (requiredGroups?: UserGroup[]) => {
  return ({
    before: async (handler: any) => {
      const { event } = handler;
      
      try {
        // Get claims from Cognito authorizer
        const claims = event.requestContext.authorizer?.claims;
        
        if (!claims) {
          throw new createHttpError.Unauthorized('No auth token provided');
        }

        // Extract user information from claims
        const user = {
          id: claims.sub,
          email: claims.email,
          groups: (claims['cognito:groups'] || []) as UserGroup[]
        };

        // Check if user has required groups
        if (requiredGroups && requiredGroups.length > 0) {
          const hasRequiredGroup = requiredGroups.some(group => 
            user.groups.includes(group)
          );
          
          if (!hasRequiredGroup) {
            throw new createHttpError.Forbidden(
              'Insufficient permissions'
            );
          }
        }

        // Attach user to event for use in handler
        (event as AuthorizedEvent).user = user;
        
      } catch (error) {
        throw new createHttpError.Unauthorized('Invalid token');
      }
    }
  });
}; 