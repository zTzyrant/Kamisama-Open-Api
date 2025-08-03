# API: Delete Tag

This document provides a detailed specification for the `Delete Tag` API endpoint.

---

## Endpoint

**`DELETE /tags/:id`**

## Description

Deletes a tag by its ID.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                   |
|-----------|----------|-------------------------------|
| `id`      | `string` | The ID of the tag to delete. |

## Responses

### 200: OK

Returned when the tag is deleted successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Tag deleted successfully"
}
```

### 404: Not Found

Returned when no tag with the specified `id` exists.
