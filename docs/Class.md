# Class API Spec

## Create Module API

Endpoint : POST /api/V1/modules

Headers : 
- Authorization : accessToken

Request Body :

```json
{
  "title": "string, required, min: 3, max: 200",
  "description": "string, optional, max: 1000",
  "price": "number, required, min: 0",
  "cover": "string, optional, URL format",
  "categoryId": "string, required, UUID format",
  "isPublished": "boolean, optional, default: false",
  "difficultyLevel": "string, optional, enum: ['beginner', 'intermediate', 'advanced']"
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "id": "uuid",
    "title": "NodeJS Fundamental",
    "description": "Learn backend from scratch",
    "price": 150000,
    "cover": "https://example.com/image.jpg",
    "categoryId": "uuid",
    "isPublished": false,
    "difficultyLevel": "beginner",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "instructor": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ],
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Update Module API

Endpoint : PUT /api/v1/modules/:id

Headers :
- Authorization : token

Request Body :

```json
{
  "success": true,
  "message": "Module updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated NodeJS Course",
    "description": "Updated description",
    "price": 200000,
    "cover": "https://example.com/new-image.jpg",
    "categoryId": "uuid",
    "isPublished": true,
    "difficultyLevel": "intermediate",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T11:00:00Z"
  }
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Module updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated NodeJS Course",
    "description": "Updated description",
    "price": 200000,
    "cover": "https://example.com/new-image.jpg",
    "categoryId": "uuid",
    "isPublished": true,
    "difficultyLevel": "intermediate",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T11:00:00Z"
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Module not found",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Get Module API

Endpoint : GET /api/v1/modules/:id

Headers :
- Authorization : token

Response Body Success :

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "NodeJS Fundamental",
    "description": "Learn backend from scratch",
    "price": 150000,
    "cover": "https://example.com/image.jpg",
    "category": {
      "id": "uuid",
      "name": "Backend Development",
      "slug": "backend-development"
    },
    "instructor": {
      "id": "uuid",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Experienced backend developer"
    },
    "isPublished": true,
    "difficultyLevel": "beginner",
    "totalLessons": 15,
    "totalDuration": 5400,
    "averageRating": 4.5,
    "totalStudents": 120,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Module not found",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Search Module API

Endpoint : GET /api/v1/modules

Headers :
- Authorization : token

Query params :
- search?: string,        // Search by title/description (optional)
- categoryId?: string,    // Filter by category (optional, UUID)
- instructorId?: string,  // Filter by instructor (optional, UUID)
- difficultyLevel?: string, // Filter by difficulty (optional)
- minPrice?: number,      // Minimum price (optional)
- maxPrice?: number,      // Maximum price (optional)
- isPublished?: boolean,  // Filter by published status (optional)
- sortBy?: string,        // Sort field: 'title', 'price', 'createdAt', 'rating' (optional)
- sortOrder?: string,     // Sort order: 'asc' or 'desc' (optional, default: 'desc')
- page?: number,          // Page number (optional, default: 1)
- limit?: number          // Items per page (optional, default: 10, max: 100)

Response Body Success :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "NodeJS Fundamental",
      "description": "Learn backend from scratch",
      "price": 150000,
      "cover": "https://example.com/image.jpg",
      "category": {
        "id": "uuid",
        "name": "Backend Development"
      },
      "instructor": {
        "id": "uuid",
        "name": "John Doe"
      },
      "isPublished": true,
      "difficultyLevel": "beginner",
      "averageRating": 4.5,
      "totalStudents": 120,
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

Response Body Error :

## Remove Module API

Endpoint : DELETE /api/v1/modules/:id

Headers :
- Authorization : token

Response Body Success :

```json
{
  "success": true,
  "message": "Module deleted successfully",
  "data": {
    "id": "uuid",
    "deletedAt": "2024-01-20T10:00:00Z"
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Module not found",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

```json
{
  "success": false,
  "message": "You are not authorized to delete this module",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Get my module

Endpoint : GET /api/v1/modules/me

Headers :
- Authorization : token

Response Body Success :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "NodeJS Fundamental",
      "description": "Learn backend from scratch",
      "price": 150000,
      "cover": "https://example.com/image.jpg",
      "category": {
        "id": "uuid",
        "name": "Backend Development"
      },
      "isPublished": true,
      "difficultyLevel": "beginner",
      "totalLessons": 15,
      "totalStudents": 120,
      "revenue": 18000000,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2024-01-20T10:00:00Z"
}
```