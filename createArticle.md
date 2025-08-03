
# Create Article Validation Errors

This document outlines the validation error codes for the `POST /articles` endpoint. These codes can be used by the frontend to display appropriate, translatable error messages to the user.

When a validation error occurs, the API will respond with a `400 Bad Request` status and a JSON body in the following format:

```json
{
  "status": "error",
  "message": "Validation failed",
  "statusCode": "400",
  "errors": [
    {
      "field": "<field_name>",
      "code": "<error_code>"
    }
  ]
}
```

## Error Codes

Below is a list of possible `error_code` values and the fields they apply to.

| Field        | Error Code                  | Validation Rule                                  |
|--------------|-----------------------------|--------------------------------------------------|
| `title`      | `article.title.length`      | Must be between 3 and 100 characters.            |
| `content`    | `article.content.minLength` | Must be at least 3 characters long.              |
| `statusId`   | `article.statusId.required` | This field is required.                          |
| `langId`     | `article.langId.required`   | This field is required.                          |
| `slug`       | `article.slug.length`       | (Optional) If provided, must be between 3 and 100 characters. |
| `excerpt`    | `article.excerpt.length`    | (Optional) If provided, must be between 3 and 255 characters. |

