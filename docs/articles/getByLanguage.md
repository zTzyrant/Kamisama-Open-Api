
# API: Get Articles by Language

This document provides a detailed specification for the `Get Articles by Language` API endpoint.

---

## Endpoint

**`GET /articles/lang/:langSlug`**

## Description

Retrieves a paginated list of articles filtered by their language (e.g., `en`, `id`). It supports the same query parameters for pagination, sorting, and filtering as the main `GET /articles` endpoint.

## Authentication

- **Required:** No

## URL Parameters

| Parameter  | Type     | Description                                        |
|------------|----------|----------------------------------------------------|
| `langSlug` | `string` | The slug of the language to filter articles by.    |

## Query Parameters

Supports the same query parameters as `GET /articles` (e.g., `page`, `limit`, `search`, etc.).

## Responses

### 200: OK

Returned with the list of articles and pagination details.

**Example:**
```json
{
  "status": "success",
  "message": "Articles in language English retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

### 400: Bad Request

Returned if the `langSlug` is invalid.

**Example:**
```json
{
  "status": "error",
  "message": "Invalid language slug",
  "statusCode": "400"
}
```
