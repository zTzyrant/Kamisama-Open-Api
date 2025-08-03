# API: Get All Tags

This document provides a detailed specification for the `Get All Tags` API endpoint.

---

## Endpoint

**`GET /tags`**

## Description

Retrieves a list of all tags.

## Authentication

- **Required:** No

## Responses

### 200: OK

Returned with the list of tags.

**Example:**
```json
{
  "status": "success",
  "message": "Tags retrieved successfully",
  "data": [
    {
      "id": "clx123abc456def789",
      "name": "JavaScript",
      "slug": "javascript"
    },
    {
      "id": "clx123def456ghi789",
      "name": "TypeScript",
      "slug": "typescript"
    }
  ]
}
```
