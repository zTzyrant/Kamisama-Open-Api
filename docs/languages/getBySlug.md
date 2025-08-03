# API: Get Language by Slug

This document provides a detailed specification for the `Get Language by Slug` API endpoint.

---

## Endpoint

**`GET /languages/slug/:slug`**

## Description

Retrieves a single language by its slug.

## Authentication

- **Required:** No

## URL Parameters

| Parameter | Type     | Description                         |
|-----------|----------|-------------------------------------|
| `slug`    | `string` | The slug of the language to retrieve. |

## Responses

### 200: OK

Returned with the full language data.

**Example:**
```json
{
  "status": "success",
  "message": "Language retrieved successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "English",
    "slug": "en"
  }
}
```

### 404: Not Found

Returned when no language with the specified `slug` exists.
