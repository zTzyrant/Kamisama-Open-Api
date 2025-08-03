
# API: Get Articles by Status

This document provides a detailed specification for the `Get Articles by Status` API endpoint.

---

## Endpoint

**`GET /articles/status/:statusSlug`**

## Description

Retrieves a paginated list of articles filtered by their status (e.g., `published`, `draft`, `archived`). It supports the same query parameters for pagination, sorting, and filtering as the main `GET /articles` endpoint.

## Authentication

- **Required:** No

## URL Parameters

| Parameter    | Type     | Description                                      |
|--------------|----------|--------------------------------------------------|
| `statusSlug` | `string` | The slug of the status to filter articles by.    |

## Query Parameters

Supports the same query parameters as `GET /articles` (e.g., `page`, `limit`, `search`, etc.).

## Responses

### 200: OK

Returned with the list of articles and pagination details.

**Example:**
```json
{
  "status": "success",
  "message": "Articles with status Published retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

### 400: Bad Request

Returned if the `statusSlug` is invalid.

**Example:**
```json
{
  "status": "error",
  "message": "Invalid article status slug",
  "statusCode": "400"
}
```
