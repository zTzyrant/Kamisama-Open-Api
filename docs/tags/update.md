# API: Update Tag

This document provides a detailed specification for the `Update Tag` API endpoint.

---

## Endpoint

**`PUT /tags/:id`**

## Description

Updates an existing tag. The `slug` is regenerated automatically if the `name` is changed.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                   |
|-----------|----------|-------------------------------|
| `id`      | `string` | The ID of the tag to update. |

## Request Body

- **Content-Type:** `application/json`

### Schema

| Field  | Type     | Required | Description                           |
|--------|----------|----------|---------------------------------------|
| `name` | `string` | Yes      | The new name for the tag (3-50 characters). |

### Example Request

```json
{
  "name": "JS"
}
```

## Responses

### 200: OK

Returned when the tag is updated successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Tag updated successfully",
  "data": {
    "id": "clx123abc456def789",
    "name": "JS",
    "slug": "js"
  }
}
```

### 400: Bad Request

Returned when the request body fails validation.

### 404: Not Found

Returned when no tag with the specified `id` exists.
