# API: Update Language

This document provides a detailed specification for the `Update Language` API endpoint.

---

## Endpoint

**`PUT /languages/:id`**

## Description

Updates an existing language.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                        |
|-----------|----------|------------------------------------|
| `id`      | `string` | The ID of the language to update. |

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field  | Type     | Required | Description                               |
|--------|----------|----------|-------------------------------------------|
| `name` | `string` | No       | The new name for the language.            |
| `slug` | `string` | No       | The new slug for the language.            |

### Example Request

```json
{
  "name": "British English"
}
```

## Responses

### 200: OK

Returned when the language is updated successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Language updated successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "British English",
    "slug": "en"
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.

### 404: Not Found

Returned when no language with the specified `id` exists.
