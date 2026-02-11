# Enroll API Spec

## Enroll Module (Student)

Endpoint : POST /api/v1/enrollments

Headers : 
- Authorization : Bearer <access_token>

Request Body :

```json
{
  "classId": "string, required (UUID)",
  "paymentMethodId": "string, optional (UUID, untuk paid classes)",
  "promoCode": "string, optional",
  "billingAddress": {
    "name": "string, optional",
    "email": "string, optional",
    "phone": "string, optional"
  }
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Successfully enrolled in class",
  "data": {
    "id": "uuid",
    "classId": "uuid",
    "userId": "uuid",
    "status": "ACTIVE", // ACTIVE, COMPLETED, CANCELLED, EXPIRED
    "enrolledAt": "2024-01-28T10:00:00Z",
    "accessExpiresAt": "2025-01-28T10:00:00Z", // untuk classes dengan durasi akses
    "payment": {
      "status": "PAID", // PENDING, PAID, FAILED, REFUNDED
      "amount": 150000,
      "currency": "IDR",
      "paymentMethod": "CREDIT_CARD",
      "paidAt": "2024-01-28T10:05:00Z"
    }
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Already enrolled in this class",
  "code": "ENROLLMENT_ALREADY_EXISTS",
  "data": {
    "enrollmentId": "uuid",
    "enrolledAt": "2024-01-27T09:00:00Z"
  },
  "timestamp": "2024-01-28T10:00:00Z"
}
```

## Get My Enrolled Modules (Student)

Endpoint : GET /api/v1/enrollments/me

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- STUDENT

Query params :
-  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED',
- sortBy?: 'enrolledAt' | 'progress' | 'title',
- sortOrder?: 'asc' | 'desc',
- page?: number,
- limit?: number

Response Body Success :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "enrolledAt": "2024-01-28T10:00:00Z",
      "accessExpiresAt": "2025-01-28T10:00:00Z",
      "progress": {
        "percentage": 45,
        "completedModules": 5,
        "totalModules": 12,
        "lastAccessedAt": "2024-01-29T15:30:00Z"
      },
      "class": {
        "id": "uuid",
        "title": "NodeJS Fundamental",
        "description": "Learn backend from scratch",
        "cover": "https://storage.example.com/cover.jpg",
        "instructor": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://storage.example.com/avatar.jpg"
        },
        "category": {
          "id": "uuid",
          "name": "Backend Development"
        },
        "difficultyLevel": "beginner",
        "totalDuration": 7200
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "stats": {
      "active": 8,
      "completed": 12,
      "cancelled": 5
    }
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2024-01-28T10:00:00Z"
}
```

## Check Enrollment Status

Endpoint : GET /api/v1/enrollments/check/:classId

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- STUDENT

Response Body Success :

```json
{
  "success": true,
  "data": {
    "enrolled": true,
    "enrollmentId": "uuid",
    "status": "ACTIVE",
    "enrolledAt": "2024-01-28T10:00:00Z",
    "accessExpiresAt": "2025-01-28T10:00:00Z",
    "accessType": "FULL", // FULL, TRIAL, PREVIEW
    // "permissions": {
    //   "canAccessContent": true,
    //   "canDownloadMaterials": true,
    //   "canSubmitAssignments": true,
    //   "canAccessLiveSessions": true,
    //   "canReceiveCertificate": true
    // }
  }
}
```

## Get Enrollments By Module (Instructor)

Endpoint : GET /api/v1/classes/:classId/enrollments

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)

Query params :
- status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED',
- search?: string, // Search by student name/email
- sortBy?: 'enrolledAt' | 'progress' | 'title',
- sortOrder?: 'asc' | 'desc',
- page?: number,
- limit?: number
- startDate?: string, // ISO date
- endDate?: string   // ISO date

Response Body Success :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "enrolledAt": "2024-01-28T10:00:00Z",
      "progress": {
        "percentage": 65,
        "completedModules": 8,
        "totalModules": 12,
        "timeSpent": 5400, // seconds
        "lastActivityAt": "2024-01-29T14:20:00Z",
        "averageQuizScore": 78
      },
      "student": {
        "id": "uuid",
        "name": "Budi Santoso",
        "email": "budi@mail.com",
        "avatar": "https://storage.example.com/avatar.jpg",
        "country": "Indonesia",
        "joinedAt": "2024-01-01T09:00:00Z"
      },
      "payment": {
        "amount": 150000,
        "currency": "IDR",
        "status": "PAID",
        "paidAt": "2024-01-28T10:05:00Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "stats": {
      "totalEnrollments": 150,
      "active": 120,
      "completed": 25,
      "cancelled": 5,
      "completionRate": 83.33,
      "averageProgress": 68.5,
      "revenue": 22500000
    }
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "You are not authorized to view enrollments for this class",
  "timestamp": "2024-01-28T10:00:00Z"
}
```

## Cancel Enrollment (Student)

Endpoint : DELETE /api/v1/enrollments/:enrollmentId

Headers : 
- Authorization : Bearer <access_token>

Request Body (optional) :

```json
{
  "reason": "string, optional",
  "feedback": "string, optional"
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Enrollment cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-28T10:00:00Z",
    "refundStatus": "PENDING", // jika ada refund
    "refundAmount": 120000
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Already enrolled in this class",
  "code": "ENROLLMENT_ALREADY_EXISTS",
  "data": {
    "enrollmentId": "uuid",
    "enrolledAt": "2024-01-27T09:00:00Z"
  },
  "timestamp": "2024-01-28T10:00:00Z"
}
```

<!-- 7. Get Enrollment Analytics (Instructor/Admin)
Endpoint: GET /api/v1/classes/:classId/enrollments/analytics

Headers:

Authorization: Bearer <access_token>

Content-Type: application/json

Query Parameters:

typescript
{
  period?: 'day' | 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
}
Response Success (200 OK):

json
{
  "success": true,
  "data": {
    "totalEnrollments": 150,
    "activeEnrollments": 120,
    "completionRate": 16.67,
    "averageProgress": 68.5,
    "revenue": {
      "total": 22500000,
      "currency": "IDR",
      "averagePrice": 150000
    },
    "enrollmentTrend": [
      {
        "date": "2024-01-01",
        "count": 5,
        "revenue": 750000
      },
      {
        "date": "2024-01-02",
        "count": 8,
        "revenue": 1200000
      }
    ],
    "studentDemographics": {
      "byCountry": [
        {
          "country": "Indonesia",
          "count": 100,
          "percentage": 66.67
        },
        {
          "country": "Malaysia",
          "count": 30,
          "percentage": 20
        }
      ],
      "byDevice": [
        {
          "device": "Mobile",
          "percentage": 65
        },
        {
          "device": "Desktop",
          "percentage": 35
        }
      ]
    }
  }
} -->