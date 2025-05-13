import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { createPool } from 'slonik';
import { commonMiddleware } from '../../lib/middleware';
import { Permissions } from '../../lib/constants';
import { AuthorizedEvent } from '../../types';
import { requirePermission } from '../../lib/middleware/permissions';

const s3 = new S3();
const pool = createPool(process.env.DATABASE_URL!);

/**
 * Deletes a photo and its associated files (original and thumbnail).
 * 
 * Path Parameters:
 * - id: string (required) - The ID of the photo to delete
 * 
 * Example request:
 * DELETE /photos/123e4567-e89b-12d3-a456-426614174000
 * 
 * Response format:
 * Success (200):
 * {
 *   message: "Photo deleted successfully"
 * }
 * 
 * Error responses:
 * - 400: Bad Request (missing photo ID)
 * - 401: Unauthorized (no valid authentication)
 * - 403: Forbidden (missing required permission)
 * - 404: Not Found (photo doesn't exist or doesn't belong to user)
 * - 500: Internal Server Error
 * 
 * Required permissions:
 * - photos:delete
 * 
 * Notes:
 * - Deletes both the original and thumbnail versions from S3
 * - Removes the photo record from the database
 * - Only allows deletion of photos owned by the authenticated user
 */
const deletePhoto = async (event: AuthorizedEvent) => {
  try {
    const { user } = event;
    const photoId = event.pathParameters?.id;

    if (!photoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Photo ID is required' })
      };
    }

    // Get photo details and verify ownership
    const photo = await pool.one<{
      id: string;
      original_url: string;
      thumbnail_url: string;
    }>`
      SELECT id, original_url, thumbnail_url
      FROM photos
      WHERE id = ${photoId}
      AND user_id = ${user.id}
    `;

    if (!photo) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Photo not found' })
      };
    }

    // Extract S3 keys from URLs
    const originalKey = photo.original_url.split('/').slice(-2).join('/');
    const thumbnailKey = photo.thumbnail_url.split('/').slice(-2).join('/');

    // Delete from S3
    await Promise.all([
      s3.deleteObject({
        Bucket: process.env.UPLOAD_BUCKET!,
        Key: originalKey
      }).promise(),
      s3.deleteObject({
        Bucket: process.env.UPLOAD_BUCKET!,
        Key: thumbnailKey
      }).promise()
    ]);

    // Delete from database
    await pool.query`
      DELETE FROM photos
      WHERE id = ${photoId}
      AND user_id = ${user.id}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Photo deleted successfully' })
    };
  } catch (error) {
    console.error('Delete photo error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete photo' })
    };
  }
};

// Protect the endpoint, requiring photo delete permission
export const handler = commonMiddleware(deletePhoto)
  .use(requirePermission(Permissions.PHOTOS.DELETE)); 