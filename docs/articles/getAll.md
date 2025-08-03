
# API: Get All Articles

This document provides a detailed specification for the `Get All Articles` API endpoint.

---

## Endpoint

**`GET /articles`**

## Description

Retrieves a paginated list of all **published** articles. The list can be filtered, sorted, and searched.

## Authentication

- **Required:** No

## Query Parameters

All parameters are optional.

| Parameter  | Type     | Default       | Description                                                              |
|------------|----------|---------------|--------------------------------------------------------------------------|
| `page`     | `number` | `1`           | The page number to retrieve.                                             |
| `limit`    | `number` | `10`          | The number of articles per page (max 100).                               |
| `search`   | `string` | `undefined`   | A search term to filter articles by title, content, or excerpt.          |
| `tags`     | `string` | `undefined`   | A comma-separated list of tag IDs to filter by.                          |
| `category` | `string` | `undefined`   | A category ID to filter by.                                              |
| `langId`   | `string` | `undefined`   | A language ID to filter by.                                              |
| `sortBy`   | `string` | `createdAt`   | The field to sort by. Can be `createdAt` or `views`.                     |
| `orderBy`  | `string` | `desc`        | The sort order. Can be `asc` or `desc`.                                  |

### Example Request

```
/articles?page=1&limit=5&tags=tagId1,tagId2&sortBy=views
```

## Responses

### 200: OK

Returned with the list of articles and pagination details.

**Example:**
```json
{
  "status": "success",
  "message": "Articles retrieved successfully",
  "data": [
    {
      "id": "clx123abc456def789",
      "title": "An Awesome Article",
      "slug": "an-awesome-article-2025-08-02",
      // ... other article fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "perPage": 10,
    "nextPageUrl": "/articles?page=2&limit=10",
    "prevPageUrl": null
  }
}
```
