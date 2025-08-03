# API: Create Category

This document provides a detailed specification for the `Create Category` API endpoint.

---

## Endpoint

**`POST /categories`**

## Description

Creates a new category. The `slug` is generated automatically from the `name`.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field  | Type     | Required | Description                               |
|--------|----------|----------|-------------------------------------------|
| `name` | `string` | Yes      | The name of the category (3-50 characters). |

### Example Request

```json
{
  "name": "Technology"
}
```

## Responses

### 201: Created

Returned when the category is created successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "Technology",
    "slug": "technology"
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.

**Example:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "statusCode": "400",
  "errors": [
    {
      "field": "name",
      "code": "category.name.length"
    }
  ]
}
```
