import { APIGatewayProxyHandler } from 'aws-lambda';
import { createPool } from 'slonik';
import { commonMiddleware } from '../../lib/middleware';
import { Permissions } from '../../lib/constants';
import { AuthorizedEvent } from '../../types';
import { requirePermission } from '../../lib/middleware/permissions';

const pool = createPool(process.env.DATABASE_URL!);

/**
 * Lists photos for the authenticated user with pagination support.
 * 
 * Query Parameters:
 * - limit: number (optional, default: 20) - Maximum number of photos to return
 * - offset: number (optional, default: 0) - Number of photos to skip
 * 
 * Example request:
 * GET /photos?limit=10&offset=20
 * 
 * Response format:
 * {
 *   photos: [{
 *     id: string,
 *     originalUrl: string,
 *     thumbnailUrl: string,
 *     metadata: {
 *       originalName: string,
 *       size: number,
 *       type: string,
 *       width?: number,
 *       height?: number
 *     },
 *     createdAt: Date
 *   }],
 *   pagination: {
 *     total: number,
 *     limit: number,
 *     offset: number
 *   }
 * }
 * 
 * Error responses:
 * - 400: Bad Request (invalid pagination parameters)
 * - 401: Unauthorized (no valid authentication)
 * - 403: Forbidden (missing required permission)
 * - 500: Internal Server Error
 * 
 * Required permissions:
 * - photos:list-all
 */
const listPhotos = async (event: AuthorizedEvent) => {
  try {
    const { user } = event;
    const { limit = '20', offset = '0' } = event.queryStringParameters || {};

    // Validate pagination parameters
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid limit parameter. Must be a number between 1 and 100.' 
        })
      };
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid offset parameter. Must be a non-negative number.' 
        })
      };
    }

    // Fetch photos with pagination
    const photos = await pool.many<{
      id: string;
      original_url: string;
      thumbnail_url: string;
      metadata: any;
      created_at: Date;
    }>`
      SELECT 
        id,
        original_url,
        thumbnail_url,
        metadata,
        created_at
      FROM photos
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT ${parsedLimit}
      OFFSET ${parsedOffset}
    `;

    // Get total count for pagination
    const { count } = await pool.one<{ count: number }>`
      SELECT COUNT(*) as count
      FROM photos
      WHERE user_id = ${user.id}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({
        photos: photos.map(photo => ({
          id: photo.id,
          originalUrl: photo.original_url,
          thumbnailUrl: photo.thumbnail_url,
          metadata: photo.metadata,
          createdAt: photo.created_at
        })),
        pagination: {
          total: count,
          limit: parsedLimit,
          offset: parsedOffset
        }
      })
    };
  } catch (error) {
    console.error('List photos error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list photos' })
    };
  }
};

// Protect the endpoint, requiring photo list permission
export const handler = commonMiddleware(listPhotos)
  .use(requirePermission(Permissions.PHOTOS.LIST_ALL)); 