# API: Create Language

This document provides a detailed specification for the `Create Language` API endpoint.

---

## Endpoint

**`POST /languages`**

## Description

Creates a new language. The `slug` is generated automatically from the `name`.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field  | Type     | Required | Description                               |
|--------|----------|----------|-------------------------------------------|
| `name` | `string` | Yes      | The name of the language (e.g., 'English'). |
| `slug` | `string` | Yes      | The slug of the language (e.g., 'en').    |

### Example Request

```json
{
  "name": "English",
  "slug": "en"
}
```

## Responses

### 201: Created

Returned when the language is created successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Language created successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "English",
    "slug": "en"
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.
