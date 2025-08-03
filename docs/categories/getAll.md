# API: Get All Categories

This document provides a detailed specification for the `Get All Categories` API endpoint.

---

## Endpoint

**`GET /categories`**

## Description

Retrieves a list of all categories.

## Authentication

- **Required:** No

## Responses

### 200: OK

Returned with the list of categories.

**Example:**
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "clx123abc456def789",
      "name": "Technology",
      "slug": "technology"
    },
    {
      "id": "clx123def456ghi789",
      "name": "Programming",
      "slug": "programming"
    }
  ]
}
```
