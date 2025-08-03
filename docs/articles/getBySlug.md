
# API: Get Article by Slug

This document provides a detailed specification for the `Get Article by Slug` API endpoint.

---

## Endpoint

**`GET /articles/slug/:slug`**

## Description

Retrieves a single, published article by its URL-friendly slug. This endpoint is public and does not require authentication. It also automatically records a view for the article.

## Authentication

- **Required:** No

## URL Parameters

| Parameter | Type     | Description                         |
|-----------|----------|-------------------------------------|
| `slug`    | `string` | The slug of the article to retrieve. |

## Responses

### 200: OK

Dikembalikan dengan data artikel lengkap dan daftar artikel yang direkomendasikan.

**Contoh:**
```json
{
  "status": "success",
  "message": "Article retrieved successfully",
  "data": {
    "id": "clx123abc456def789",
    "title": "An Awesome Article",
    "slug": "an-awesome-article-2025-08-02",
    // ... bidang artikel lainnya
    "recommendations": [
      {
        "id": "clx123def789abc456",
        "title": "Another Great Article",
        "slug": "another-great-article-2025-08-01",
        // ... bidang artikel yang direkomendasikan lainnya
      }
    ]
  }
}
```

### 404: Not Found

Returned when no article with the specified `slug` exists.

**Example:**
```json
{
  "status": "error",
  "message": "Article not found",
  "statusCode": "404"
}
```
