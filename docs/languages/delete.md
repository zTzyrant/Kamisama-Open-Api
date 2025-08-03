# API: Delete Language

This document provides a detailed specification for the `Delete Language` API endpoint.

---

## Endpoint

**`DELETE /languages/:id`**

## Description

Deletes a language by its ID.

## Authentication

- **Required:** Yes
- **Type:** Bearer Token (JWT)

## URL Parameters

| Parameter | Type     | Description                        |
|-----------|----------|------------------------------------|
| `id`      | `string` | The ID of the language to delete. |

## Responses

### 200: OK

Returned when the language is deleted successfully.

**Example:**
```json
{
  "status": "success",
  "message": "Language deleted successfully"
}
```

### 404: Not Found

Returned when no language with the specified `id` exists.
