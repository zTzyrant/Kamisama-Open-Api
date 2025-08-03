# API: Get All Languages

This document provides a detailed specification for the `Get All Languages` API endpoint.

---

## Endpoint

**`GET /languages`**

## Description

Retrieves a paginated list of all languages. The list can be filtered and sorted.

## Authentication

- **Required:** No

## Query Parameters

All parameters are optional.

| Parameter | Type     | Default   | Description                                                        |
|-----------|----------|-----------|--------------------------------------------------------------------|
| `page`    | `number` | `1`       | The page number to retrieve.                                       |
| `limit`   | `number` | `10`      | The number of languages per page (max 100).                        |
| `search`  | `string` | `undefined` | A search term to filter languages by name or slug.                 |
| `sortBy`  | `string` | `name`    | The field to sort by. Can be `createdAt` or `name`.                |
| `orderBy` | `string` | `asc`     | The sort order. Can be `asc` or `desc`.                            |

## Responses

### 200: OK

Returned with the list of languages and pagination details.

**Example:**
```json
{
  "status": "success",
  "message": "Languages retrieved successfully",
  "data": [
    {
      "id": "clx123abc456def789",
      "name": "English",
      "slug": "en"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "perPage": 10,
    "nextPageUrl": null,
    "prevPageUrl": null
  }
}
```
