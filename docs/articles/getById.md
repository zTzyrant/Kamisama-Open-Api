
# API: Get Article by ID

This document provides a detailed specification for the `Get Article by ID` API endpoint.

---

## Endpoint

**`GET /articles/:id`**

## Description

Retrieves a single article by its unique ID. It also returns a `permissions` object indicating what actions the current user can perform on the article.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                      |
|-----------|----------|----------------------------------|
| `id`      | `string` | The ID of the article to retrieve. |

## Responses

### 200: OK

Returned with the full article data.

**Example:**
```json
{
  "status": "success",
  "message": "Article retrieved successfully",
  "data": {
    "id": "clx123abc456def789",
    "title": "An Awesome Article",
    // ... other article fields
    "permissions": {
      "canEdit": true,
      "canArchive": false,
      "canDelete": true
    }
  }
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

### 401: Unauthorized

Returned when the authentication token is missing or invalid.
