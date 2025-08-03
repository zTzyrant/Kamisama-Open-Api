# API: Get Language by ID

This document provides a detailed specification for the `Get Language by ID` API endpoint.

---

## Endpoint

**`GET /languages/:id`**

## Description

Retrieves a single language by its unique ID.

## Authentication

- **Required:** No

## URL Parameters

| Parameter | Type     | Description                         |
|-----------|----------|-------------------------------------|
| `id`      | `string` | The ID of the language to retrieve. |

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

Returned when no language with the specified `id` exists.
