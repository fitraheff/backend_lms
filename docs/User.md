# User API Spec

Base URL : /api/v1

## Register User

Endpoint : POST /users/register

Request Body : 
```json
{
  "name": "string, required, min: 2, max: 100",
  "email": "string, required, email format",
  "password": "string, required, min: 8, must contain uppercase, lowercase, number, and special character",
  "phone": "string, optional, phone number format",
  "avatar": "string, optional, URL format"
}
```

Respon Body Success :
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "Budi Santoso",
    "email": "budi@mail.com",
    "phone": "+628123456789",
    "avatar": "https://example.com/avatar.jpg",
    "role": "STUDENT",
    "emailVerified": false,
    "createdAt": "2024-01-27T10:00:00Z",
    "updatedAt": "2024-01-27T10:00:00Z"
  }
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email already registered"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Login User

Endpoint : POST /users/login

Request Body :
```json
{
  "email": "budi@mail.com",
  "password": "Password123!"
}
```

Respon Body Success :
```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-access-token",
    // "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "uuid",
      "name": "Budi Santoso",
      "email": "budi@mail.com",
      "role": "STUDENT"
    }
  }
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Invalid email or password",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Account is disabled. Please contact administrator",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Refresh Token User

Endpoint : POST /users/refresh-token

Headers :
- Cookie: refreshToken=xxxxx

<!-- Request Body :
```json
{
  "refreshToken": "jwt-refresh-token"
}
``` -->

Respon Body Success :
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token"
  }
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Logout User

Endpoint : POST /users/logout

Headers :
- Authorization: Bearer <access_token>
- Cookie: refreshToken=xxx

Respon Body Success :
```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Unauthorized",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Get My Profile (Current User)

Endpoint : GET /users/me

Headers :
- Authorization: Bearer <access_token>

Respon Body Success :
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Budi Santoso",
    "email": "budi@mail.com",
    "phone": "+628123456789",
    "avatar": "https://example.com/avatar.jpg",
    "role": "STUDENT",
    "emailVerified": true,
    "isActive": true,
    "lastLoginAt": "2024-01-27T09:30:00Z",
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-27T09:30:00Z",
    "stats": {
      "totalCourses": 5,
      "completedCourses": 2,
      "totalProgress": 65
    }
  }
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Update Profile

Endpoint : PUT /users/me

Headers :
- Authorization: Bearer <access_token>

Request Body : 
```json
{
  "name": "string, optional, min: 2, max: 100",
  "email": "string, optional, email format (triggers re-verification)",
  "phone": "string, optional, phone number format",
  "avatar": "string, optional, URL format",
  "currentPassword": "string, required when updating password",
  "newPassword": "string, optional, min: 8"
}
```

Respon Body Success :
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "Budi Santoso Updated",
    "email": "budi.updated@mail.com",
    "phone": "+628123456780",
    "avatar": "https://example.com/new-avatar.jpg",
    "role": "STUDENT",
    "emailVerified": false,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-27T11:00:00Z"
  }
}
```

Respon Body Error :
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "currentPassword",
      "message": "Current password is required to change password"
    }
  ],
  "timestamp": "2024-01-27T10:00:00Z"
}
``` 

<!-- 7.2 Password Reset
Endpoint: POST /api/v1/users/forgot-password
Endpoint: POST /api/v1/users/reset-password

7.3 Admin Endpoints (jika perlu)
Endpoint: GET /api/v1/users (admin only)
Endpoint: PUT /api/v1/users/:id (admin only)
Endpoint: DELETE /api/v1/users/:id (admin only) -->