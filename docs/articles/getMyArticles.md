
# API: Get My Articles

This document provides a detailed specification for the `Get My Articles` API endpoint.

---

## Endpoint

**`GET /articles/my-articles`**

## Description

Retrieves a paginated list of articles authored by the currently authenticated user. This can include both published and non-published articles. It supports the same filtering, sorting, and searching capabilities as the public `GET /articles` endpoint.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## Query Parameters

All parameters are optional.

| Parameter  | Type     | Default       | Description                                                              |
|------------|----------|---------------|--------------------------------------------------------------------------|
| `page`     | `number` | `1`           | The page number to retrieve.                                             |
| `limit`    | `number` | `10`          | The number of articles per page (max 100).                               |
| `search`   | `string` | `undefined`   | A search term to filter articles by title, content, or excerpt.          |
| `tags`     | `string` | `undefined`   | A comma-separated list of tag IDs to filter by.                          |
| `category` | `string` | `undefined`   | A category ID to filter by.                                              |
| `statusId` | `string` | `undefined`   | A status ID to filter by (e.g., draft, published, archived).             |
| `langId`   | `string` | `undefined`   | A language ID to filter by.                                              |
| `sortBy`   | `string` | `createdAt`   | The field to sort by. Can be `createdAt` or `views`.                     |
| `orderBy`  | `string` | `desc`        | The sort order. Can be `asc` or `desc`.                                  |

## Responses

### 200: OK

Returned with the list of the user's articles and pagination details.

**Example:**
```json
{
  "status": "success",
  "message": "Your articles retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

### 401: Unauthorized

Returned when the authentication token is missing or invalid.
