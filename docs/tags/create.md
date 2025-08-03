# API: Create Tag

This document provides a detailed specification for the `Create Tag` API endpoint.

---

## Endpoint

**`POST /tags`**

## Description

Creates a new tag. The `slug` is generated automatically from the `name`.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field  | Type     | Required | Description                           |
|--------|----------|----------|---------------------------------------|
| `name` | `string` | Yes      | The name of the tag (3-50 characters). |

### Example Request

```json
{
  "name": "JavaScript"
}
```

## Responses

### 201: Created

Returned when the tag is created successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Tag created successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "JavaScript",
    "slug": "javascript"
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.
