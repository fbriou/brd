import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import sharp from 'sharp';
import { createPool } from 'slonik';
import { commonMiddleware } from '../../lib/middleware';
import { Permissions } from '../../lib/constants';
import { AuthorizedEvent } from '../../types';
import { parse } from 'lambda-multipart-parser';

const s3 = new S3();
const pool = createPool(process.env.DATABASE_URL!);

const uploadPhoto: APIGatewayProxyHandler = async (event: AuthorizedEvent) => {
  try {
    const { files, fields } = await parse(event);
    const file = files[0];
    const { user } = event;

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No file provided' })
      };
    }

    // Process image and create thumbnail
    const image = sharp(file.content);
    const metadata = await image.metadata();
    const thumbnail = await image
      .resize(200, 200, { fit: 'cover' })
      .toBuffer();

    // Upload to S3
    const [originalUpload, thumbnailUpload] = await Promise.all([
      s3.upload({
        Bucket: process.env.UPLOAD_BUCKET!,
        Key: `users/${user.id}/original/${Date.now()}-${file.filename}`,
        Body: file.content,
        ContentType: file.contentType,
      }).promise(),
      s3.upload({
        Bucket: process.env.UPLOAD_BUCKET!,
        Key: `users/${user.id}/thumbnails/${Date.now()}-${file.filename}`,
        Body: thumbnail,
        ContentType: 'image/jpeg',
      }).promise(),
    ]);

    // Save to database
    const photo = await pool.one<{ id: string }>`
      INSERT INTO photos (
        user_id, 
        original_url, 
        thumbnail_url, 
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${originalUpload.Location},
        ${thumbnailUpload.Location},
        ${JSON.stringify({
          originalName: file.filename,
          size: file.content.length,
          type: file.contentType,
          width: metadata.width,
          height: metadata.height
        })},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: photo.id,
        originalUrl: originalUpload.Location,
        thumbnailUrl: thumbnailUpload.Location
      })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upload failed' })
    };
  }
};

// Protect the endpoint, requiring photo creation permission
export const handler = commonMiddleware(uploadPhoto)
  .use(requirePermission(Permissions.PHOTOS.CREATE)); 