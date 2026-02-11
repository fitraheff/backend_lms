# Module API spec

## Get Module By Class ID

Endpoint : GET /api/v1/classes/:classId/modules

Headers :
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)
- STUDENT (must be enrolled)

Query params :
- type?: 'VIDEO' | 'PDF' | 'QUIZ' | 'ARTICLE' | 'ASSIGNMENT',  // Filter by type
- status?: 'draft' | 'published',  // Filter by status
- sortBy?: 'order' | 'title' | 'createdAt',  // Sort field
- sortOrder?: 'asc' | 'desc'  // Sort order

Response Body Success :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to Node.js",
      "description": "Learn the basics of Node.js",
      "type": "VIDEO",
      "order": 1,
      "duration": 1200,
      "fileUrl": "https://storage.example.com/video.mp4",
      "thumbnailUrl": "https://storage.example.com/thumbnail.jpg",
      "isFree": false,
      "isPublished": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    },
    {
      "id": "uuid",
      "title": "Node.js Installation Guide",
      "description": "Step-by-step installation guide",
      "type": "ARTICLE",
      "order": 2,
      "content": "<p>Installation steps...</p>",
      "isFree": true,
      "isPublished": true,
      "createdAt": "2024-01-20T11:00:00Z",
      "updatedAt": "2024-01-20T11:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "published": 8,
    "draft": 2
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "You must be enrolled in this class to view modules",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Get Module Detail

Endpoint : GET /api/v1/module/{id}

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)
- STUDENT (must be enrolled)

Response Body Success :

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Introduction to Node.js",
    "description": "Learn the basics of Node.js runtime environment",
    "type": "VIDEO",
    "order": 1,
    "duration": 1200,
    "fileUrl": "https://storage.example.com/video.mp4",
    "thumbnailUrl": "https://storage.example.com/thumbnail.jpg",
    // "fileSize": 104857600,
    // "fileFormat": "mp4",
    // "resolution": "1080p",
    // "subtitles": [
    //   {
    //     "language": "en",
    //     "url": "https://storage.example.com/subtitles/en.vtt"
    //   },
    //   {
    //     "language": "id",
    //     "url": "https://storage.example.com/subtitles/id.vtt"
    //   }
    // ],
    "isFree": false,
    "isPublished": true,
    "class": {
      "id": "uuid",
      "title": "Node.js Fundamental Course",
      "instructorId": "uuid"
    },
    "completionCriteria": {
      "minWatchPercentage": 90,
      "requireQuizPass": true,
      "quizId": "uuid"
    },
    "stats": {
      "totalViews": 150,
      "averageWatchTime": 850,
      "completionRate": 75
    },
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

## Create Module Content

Endpoint : POST /api/v1/module

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)

Request Body :

```
{
  classId: string, required (UUID)           // ID of the class
  title: string, required, min: 3, max: 200
  description?: string, optional, max: 1000
  type: string, required, enum: ['VIDEO', 'PDF', 'ARTICLE', 'QUIZ', 'ASSIGNMENT', 'LIVE_SESSION']
  order?: number, optional, min: 1
  duration?: number, optional (seconds)
  isFree?: boolean, optional, default: false
  isPublished?: boolean, optional, default: false
  file?: File, optional (depending on type)
  <!-- content?: string, optional (for ARTICLE type) -->
  <!-- quizId?: string, optional (for QUIZ type) -->
  <!-- assignmentInstructions?: string, optional (for ASSIGNMENT type) -->
  <!-- scheduledAt?: string, optional (ISO datetime for LIVE_SESSION) -->
  <!-- completionCriteria?: {
    minWatchPercentage?: number (0-100)
    requireQuizPass?: boolean
    quizId?: string
    minScore?: number (0-100)
  } -->
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "id": "uuid",
    "title": "Introduction to Node.js",
    "type": "VIDEO",
    "classId": "uuid",
    "order": 3,
    "isPublished": false,
    "fileUrl": "https://storage.example.com/temp/video.mp4",
    "uploadStatus": "processing",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
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
      "field": "type",
      "message": "Type must be one of: VIDEO, PDF, ARTICLE, QUIZ, ASSIGNMENT, LIVE_SESSION"
    },
    {
      "field": "file",
      "message": "File is required for VIDEO type"
    }
  ],
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Update Module

Endpoint : PUT /api/v1/module/{id}

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)

Request Body :

```
{
  title?: string, min: 3, max: 200
  description?: string, max: 1000
  type?: string, enum: ['VIDEO', 'PDF', 'ARTICLE', 'QUIZ', 'ASSIGNMENT', 'LIVE_SESSION']
  order?: number, min: 1
  duration?: number (seconds)
  isFree?: boolean
  isPublished?: boolean
  file?: File (replaces existing file)
  <!-- content?: string (for ARTICLE type) -->
  <!-- quizId?: string (for QUIZ type) -->
  <!-- scheduledAt?: string (ISO datetime for LIVE_SESSION) -->
  <!-- completionCriteria?: {
    minWatchPercentage?: number (0-100)
    requireQuizPass?: boolean
    quizId?: string
    minScore?: number (0-100)
  } -->
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Module updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated Introduction to Node.js",
    "type": "VIDEO",
    "isPublished": true,
    "updatedAt": "2024-01-20T11:30:00Z",
    "changes": ["title", "isPublished"]
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Cannot change type from VIDEO to QUIZ. Please delete and create new module.",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Delete Module Content

Endpoint : DELETE /api/v1/module/:id

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)

Response Body Success :

```json
{
  "success": true,
  "message": "Module deleted successfully",
  "data": {
    "id": "uuid",
    "deletedAt": "2024-01-20T10:00:00Z",
    "type": "soft"  // or "hard" if force=true
  }
}
```

Response Body Error :

```json
{
  "success": false,
  "message": "Cannot delete module. There are dependent resources (e.g., student progress, quiz attempts).",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

<!-- ## Get Module Progress (for Students)

Endpoint : GET /api/v1/module/:id/progress

Headers : 
- Authorization : Bearer <access_token>
- ADMIN
- INSTRUCTOR (owner)

Response Body Success :

```json
{
  "success": true,
  "data": {
    "moduleId": "uuid",
    "userId": "uuid",
    "status": "IN_PROGRESS",  // NOT_STARTED, IN_PROGRESS, COMPLETED
    "progressPercentage": 65,
    "lastPosition": 420,  // seconds
    "timeSpent": 1800,    // seconds
    "quizScore": 85,
    "assignmentStatus": "SUBMITTED",
    "startedAt": "2024-01-20T09:00:00Z",
    "completedAt": null,
    "lastAccessedAt": "2024-01-20T10:30:00Z"
  }
}
``` -->

<!-- ## Reorder Modules in Class (Additional Recommended Endpoint)
Endpoint: PUT /api/v1/classes/:classId/modules/reorder

Headers:

Authorization: Bearer <access_token>

Content-Type: application/json

Request Body:

json
{
  "moduleOrders": [
    {
      "moduleId": "uuid",
      "order": 1
    },
    {
      "moduleId": "uuid",
      "order": 2
    }
  ]
}
Response Success (200 OK):

json
{
  "success": true,
  "message": "Modules reordered successfully",
  "data": {
    "updatedCount": 5
  }
} -->