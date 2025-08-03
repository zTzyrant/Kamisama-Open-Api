# API: Update Category

This document provides a detailed specification for the `Update Category` API endpoint.

---

## Endpoint

**`PUT /categories/:id`**

## Description

Updates an existing category. The `slug` is regenerated automatically if the `name` is changed.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                        |
|-----------|----------|------------------------------------|
| `id`      | `string` | The ID of the category to update. |

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field  | Type     | Required | Description                               |
|--------|----------|----------|-------------------------------------------|
| `name` | `string` | Yes      | The new name for the category (3-50 characters). |

### Example Request

```json
{
  "name": "Web Development"
}
```

## Responses

### 200: OK

Returned when the category is updated successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Category updated successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "Web Development",
    "slug": "web-development"
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.

### 404: Not Found

Returned when no category with the specified `id` exists.
