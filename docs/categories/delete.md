# API: Delete Category

This document provides a detailed specification for the `Delete Category` API endpoint.

---

## Endpoint

**`DELETE /categories/:id`**

## Description

Deletes a category by its ID.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                        |
|-----------|----------|------------------------------------|
| `id`      | `string` | The ID of the category to delete. |

## Responses

### 200: OK

Returned when the category is deleted successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Category deleted successfully"
}
```

### 404: Not Found

Returned when no category with the specified `id` exists.
