
# API: Create Article

This document provides a detailed specification for the `Create Article` API endpoint. It is designed to be easily understood by both humans and language models.

---

## Endpoint

**`POST /articles`**

## Description

Creates a new article in the system. The article's `slug` is generated automatically based on the `title`.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

An authentication token must be provided in the `Authorization` header.

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field        | Type     | Required | Description                                      |
|--------------|----------|----------|--------------------------------------------------|
| `title`      | `string` | Yes      | The main title of the article (3-100 characters). |
| `content`    | `string` | Yes      | The body of the article (min. 3 characters).     |
| `statusId`   | `string` | Yes      | The ID of the article's status (e.g., draft, published). |
| `langId`     | `string` | Yes      | The ID of the article's language.                |
| `excerpt`    | `string` | No       | A short summary of the article (3-255 characters). Can be `null` or an empty string (`""`) to clear the excerpt. |
| `coverImage` | `string` | No       | The URL of the article's cover image.            |
| `categoryId` | `string` | No       | The ID of the article's category.                |
| `tagIds`     | `array`  | No       | An array of strings, where each string is a tag ID. |

### Example Request

```json
{
  "title": "My First Article from API",
  "content": "This is the content of my very first article. It's going to be great!",
  "statusId": "clx...status_published_id",
  "langId": "clx...lang_en_id",
  "categoryId": "clx...category_tech_id",
  "tagIds": ["clx...tag_js_id", "clx...tag_ts_id"]
}
```

## Responses

### 201: Created

Returned when the article is created successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Article created successfully",
  "data": {
    "id": "clx123abc456def789",
    "title": "My First Article from API",
    "slug": "my-first-article-from-api-2025-08-02",
    "content": "This is the content of my very first article. It's going to be great!",
    "excerpt": null,
    "coverImage": null,
    "createdAt": "2025-08-02T12:00:00.000Z",
    "updatedAt": "2025-08-02T12:00:00.000Z",
    "publishedAt": null,
    "views": 0,
    "author": { ... },
    "category": { ... },
    "tags": [ ... ],
    "status": { ... },
    "lang": { ... }
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

### 401: Unauthorized

Returned when the authentication token is missing or invalid.

**Example:**
```json
{
  "status": "error",
  "message": "Unauthorized",
  "statusCode": "401"
}
```
