
# API: Upload Photo

This document provides a detailed specification for the `Upload Photo` API endpoint.

---

## Endpoint

**`POST /upload/photo`**

## Description

Uploads a single image to the server. The image should be provided as a base64-encoded string in the request body. The API processes the image, saves it, and returns two crucial pieces of information: a relative `path` for database storage and a full `url` for immediate client-side preview.

## Authentication

- **Required:** Yes (Implicitly, as this is typically a user-driven action)
- **Type:** Bearer Token (JWT)

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field   | Type     | Required | Description                                      |
|---------|----------|----------|--------------------------------------------------|
| `image` | `string` | Yes      | The base64-encoded string of the image.          |

### Example Request

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

## Responses

### 200: OK

Returned when the image is uploaded and saved successfully.

**Example:**
```json
{
  "status": 200,
  "message": "Image uploaded successfully",
  "data": {
    "path": "/uploads/images/a1b2c3d4-e5f6-7890-1234-567890abcdef.jpg",
    "url": "http://localhost:3000/uploads/images/a1b2c3d4-e5f6-7890-1234-567890abcdef.jpg"
  }
}
```

### 500: Internal Server Error

Returned if there is an issue saving the file or if the file exceeds the size limit (2MB).

**Example:**
```json
{
  "status": 500,
  "message": "File size exceeds the 2MB limit."
}
```
