# BRD API Documentation

This document provides detailed information about the BRD Photo Management API endpoints, including authentication, permissions, request/response formats, and error codes.

---

## Authentication

All endpoints (except `/health`) require AWS Cognito authentication. Clients must provide a valid JWT token in the `Authorization` header.

**Header Example:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### 1. Health Check

- **GET /health**
- **Description:** Returns API health status. No authentication required.
- **Response:**
  ```json
  {
    "message": "API is healthy!",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "stage": "dev"
  }
  ```

---

### 2. Upload Photo

- **POST /photos**
- **Description:** Upload a photo. Requires authentication and `photos:upload` permission.
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body: Photo file (field name: `file`)
- **Response:**
  ```json
  {
    "id": "photo-uuid",
    "originalUrl": "https://.../original.jpg",
    "thumbnailUrl": "https://.../thumbnail.jpg"
  }
  ```
- **Error Codes:**
  - 400: Invalid file or missing data
  - 401: Unauthorized
  - 403: Forbidden (missing permission)
  - 500: Upload failed

---

### 3. List Photos

- **GET /photos?limit=20&offset=0**
- **Description:** List photos for the authenticated user. Requires `photos:list` permission.
- **Query Parameters:**
  - `limit` (optional, default: 20, max: 100)
  - `offset` (optional, default: 0)
- **Response:**
  ```json
  {
    "photos": [
      {
        "id": "photo-uuid",
        "originalUrl": "https://.../original.jpg",
        "thumbnailUrl": "https://.../thumbnail.jpg",
        "metadata": {
          "originalName": "file.jpg",
          "size": 123456,
          "type": "image/jpeg",
          "width": 1920,
          "height": 1080
        },
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 20,
      "offset": 0
    }
  }
  ```
- **Error Codes:**
  - 400: Invalid pagination parameters
  - 401: Unauthorized
  - 403: Forbidden (missing permission)
  - 500: Internal server error

---

### 4. Delete Photo

- **DELETE /photos/{id}**
- **Description:** Delete a photo by ID. Requires `photos:delete` permission.
- **Path Parameter:**
  - `id`: Photo UUID
- **Response:**
  ```json
  {
    "message": "Photo deleted successfully"
  }
  ```
- **Error Codes:**
  - 400: Missing or invalid photo ID
  - 401: Unauthorized
  - 403: Forbidden (missing permission)
  - 404: Not found (photo does not exist or not owned by user)
  - 500: Internal server error

---

## Permissions

- **photos:upload** — Required to upload photos
- **photos:list** — Required to list photos
- **photos:delete** — Required to delete photos

---

## Error Response Format

All error responses follow this format:
```json
{
  "error": "Error message here"
}
```

---

## Example Usage

**Upload a photo:**
```bash
curl -X POST https://<api-url>/photos \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@/path/to/photo.jpg"
```

**List photos:**
```bash
curl -X GET "https://<api-url>/photos?limit=10&offset=0" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Delete a photo:**
```bash
curl -X DELETE https://<api-url>/photos/{id} \
  -H "Authorization: Bearer <JWT_TOKEN>"
``` 