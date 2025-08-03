
# API: Update Article

This document provides a detailed specification for the `Update Article` API endpoint. It is designed to be easily understood by both humans and language models.

---

## Endpoint

**`PUT /articles/:id`**

## Description

Updates an existing article identified by its `id`. All fields in the request body are optional. Only the provided fields will be updated. The article's `slug` will be automatically regenerated if the `title` is changed.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

An authentication token must be provided in the `Authorization` header.

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

## URL Parameters

| Parameter | Type     | Description                      |
|-----------|----------|----------------------------------|
| `id`      | `string` | The ID of the article to update. |

## Request Body

- **Content-Type:** `application/json`

### Schema

All fields are optional.

| Field        | Type     | Description                                      |
|--------------|----------|--------------------------------------------------|
| `title`      | `string` | The new title for the article (3-100 characters). |
| `content`    | `string` | The new body for the article (min. 3 characters). |
| `statusId`   | `string` | The new ID for the article's status.             |
| `langId`     | `string` | The new ID for the article's language.           |
| `excerpt`    | `string` | A new short summary (3-255 characters). Can be `null` or an empty string (`""`) to clear the excerpt.          |
| `coverImage` | `string` | The new URL for the cover image.                 |
| `categoryId` | `string` | The new ID for the category.                     |
| `tagIds`     | `array`  | A new array of tag IDs.                          |

### Example Request

```json
{
  "title": "My Updated Article Title",
  "statusId": "clx...status_published_id"
}
```

## Responses

### 200: OK

Returned when the article is updated successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Article updated successfully",
  "data": {
    "id": "clx123abc456def789",
    "title": "My Updated Article Title",
    "slug": "my-updated-article-title-2025-08-02",
    // ... other fields
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.

**Example:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "statusCode": "400",
  "errors": [
    {
      "field": "title",
      "code": "article.title.length"
    }
  ]
}
```

### 403: Forbidden

Returned when the authenticated user is not the author of the article and is not an admin.

**Example:**
```json
{
  "status": "error",
  "message": "Forbidden: You do not have permission to edit this article.",
  "statusCode": "403"
}
```

### 404: Not Found

Returned when no article with the specified `id` exists.

**Example:**
```json
{
  "status": "error",
  "message": "Article not found",
  "statusCode": "404"
}
```
