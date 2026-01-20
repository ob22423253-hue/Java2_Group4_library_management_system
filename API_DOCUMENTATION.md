# University Library System - API Documentation

## 📡 API Overview

**Base URL**: `http://localhost:8080/api/v1`

**Authentication**: JWT Bearer Token in Authorization header

**Content-Type**: `application/json`

**Server Status**: Running on port 8080



## 🔐 Authentication

### JWT Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Claims

```json
{
  "sub": "student123",           // Username or Student ID
  "role": "ROLE_STUDENT",        // User role (ROLE_STUDENT or ROLE_LIBRARIAN)
  "studentId": "S12345",         // Additional identifier
  "iat": 1705753200,             // Issued at (timestamp)
  "exp": 1705839600              // Expiration (timestamp)
}
```

### Token Storage

- Tokens are stored in browser `localStorage`
- Key: `token`
- Duration: 24 hours
- Automatically included in all API requests

---

## 📋 Endpoints Reference

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 Librarian Registration

```
POST /auth/librarian/register
```

**Request Body**:
```json
{
  "username": "librarian1",
  "password": "securePassword123",
  "email": "librarian@university.edu",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Librarian registered successfully",
  "data": {
    "id": 1,
    "username": "librarian1",
    "email": "librarian@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "LIBRARIAN"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or username already exists
- `409 Conflict`: Librarian already registered

---

#### 1.2 Librarian Login

```
POST /auth/librarian/login
```

**Request Body**:
```json
{
  "username": "librarian1",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "librarian1",
    "email": "librarian@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "LIBRARIAN"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found

---

#### 1.3 Student Registration

```
POST /auth/student/register
```

**Request Body**:
```json
{
  "studentId": "S12345",
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@university.edu",
  "password": "securePassword123",
  "department": "Computer Science",
  "cardId": "CARD12345"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "id": 1,
    "studentId": "S12345",
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@university.edu",
    "department": "Computer Science",
    "cardId": "CARD12345"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
- `409 Conflict`: Student ID already registered

---

#### 1.4 Student Login

```
POST /auth/student/login
```

**Request Body**:
```json
{
  "studentId": "S12345",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "studentId": "S12345",
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@university.edu",
    "department": "Computer Science",
    "cardId": "CARD12345"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: Student not found

---

### 2. QR SCANNING ENDPOINTS

#### 2.1 Process QR Code Scan

```
POST /scan
Authorization: Bearer {JWT_TOKEN}
```

**Required**: STUDENT role JWT token

**Request Body**:
```json
{
  "qrValue": "LIBRARY_ENTRY",
  "scanType": "ENTRY"
}
```

**Valid QR Values**:
- `LIBRARY_ENTRY` - Enter the library
- `LIBRARY_EXIT` - Exit the library

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Entry recorded successfully",
  "data": {
    "id": 123,
    "studentId": "S12345",
    "scanType": "ENTRY",
    "timestamp": "2026-01-20T10:30:45",
    "status": "INSIDE"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid QR code format
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not a student

---

#### 2.2 Get Scan Records

```
GET /librarian/scans
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": "S12345",
      "studentName": "Alice Smith",
      "scanType": "ENTRY",
      "qrValue": "LIBRARY_ENTRY",
      "timestamp": "2026-01-20T10:30:45"
    },
    {
      "id": 2,
      "studentId": "S12345",
      "studentName": "Alice Smith",
      "scanType": "EXIT",
      "qrValue": "LIBRARY_EXIT",
      "timestamp": "2026-01-20T14:45:30"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not a librarian

---

### 3. LIBRARY ENTRY ENDPOINTS

#### 3.1 Get All Library Entries

```
GET /library-entries
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "studentId": "S12345",
        "firstName": "Alice",
        "lastName": "Smith",
        "department": "Computer Science"
      },
      "entryTime": "2026-01-20T10:30:45",
      "exitTime": null,
      "status": "INSIDE",
      "durationMinutes": 245
    },
    {
      "id": 2,
      "student": {
        "id": 2,
        "studentId": "S12346",
        "firstName": "Bob",
        "lastName": "Johnson",
        "department": "Engineering"
      },
      "entryTime": "2026-01-20T09:15:00",
      "exitTime": "2026-01-20T12:30:00",
      "status": "LEFT",
      "durationMinutes": 195
    }
  ]
}
```

---

#### 3.2 Get Students Currently Inside Library

```
GET /library-entries/current-inside
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Response** (200 OK):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "studentId": "S12345",
        "firstName": "Alice",
        "lastName": "Smith",
        "department": "Computer Science"
      },
      "entryTime": "2026-01-20T10:30:45",
      "durationMinutes": 120,
      "location": "Reading Room"
    },
    {
      "id": 3,
      "student": {
        "id": 3,
        "studentId": "S12347",
        "firstName": "Charlie",
        "lastName": "Brown",
        "department": "Mathematics"
      },
      "entryTime": "2026-01-20T11:15:30",
      "durationMinutes": 75,
      "location": "Study Hall"
    }
  ]
}
```

---

#### 3.3 Get Student Entry History

```
GET /library-entries/student/{studentId}
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:
- `studentId` (required): Student database ID or Student ID

**Response** (200 OK):
```json
{
  "success": true,
  "studentId": "S12345",
  "data": [
    {
      "id": 1,
      "entryTime": "2026-01-20T10:30:45",
      "exitTime": "2026-01-20T14:45:30",
      "durationMinutes": 255,
      "status": "LEFT"
    },
    {
      "id": 2,
      "entryTime": "2026-01-19T09:00:00",
      "exitTime": "2026-01-19T16:30:00",
      "durationMinutes": 450,
      "status": "LEFT"
    }
  ]
}
```

---

### 4. BOOK ENDPOINTS

#### 4.1 Get All Books

```
GET /books
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `search` (optional): Search by title or author
- `page` (optional): Page number
- `size` (optional): Page size

**Response** (200 OK):
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id": 1,
      "title": "Introduction to Java",
      "author": "John Doe",
      "isbn": "978-0-13-110199-8",
      "quantity": 5,
      "availableQuantity": 3,
      "location": "Shelf A-1",
      "addedDate": "2025-12-15T10:00:00"
    },
    {
      "id": 2,
      "title": "Advanced Spring Boot",
      "author": "Jane Smith",
      "isbn": "978-0-13-110200-1",
      "quantity": 3,
      "availableQuantity": 1,
      "location": "Shelf B-3",
      "addedDate": "2025-12-20T14:00:00"
    }
  ]
}
```

---

#### 4.2 Create Book

```
POST /books
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Request Body**:
```json
{
  "title": "Data Structures and Algorithms",
  "author": "Mark Allen Weiss",
  "isbn": "978-0-13-464599-4",
  "quantity": 10,
  "location": "Shelf C-5"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": 3,
    "title": "Data Structures and Algorithms",
    "author": "Mark Allen Weiss",
    "isbn": "978-0-13-464599-4",
    "quantity": 10,
    "availableQuantity": 10,
    "location": "Shelf C-5",
    "addedDate": "2026-01-20T10:00:00"
  }
}
```

---

#### 4.3 Update Book

```
PUT /books/{bookId}
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Path Parameters**:
- `bookId` (required): Book ID

**Request Body**:
```json
{
  "title": "Data Structures and Algorithms (3rd Ed)",
  "author": "Mark Allen Weiss",
  "isbn": "978-0-13-464599-4",
  "quantity": 15,
  "location": "Shelf C-6"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "id": 3,
    "title": "Data Structures and Algorithms (3rd Ed)",
    "author": "Mark Allen Weiss",
    "isbn": "978-0-13-464599-4",
    "quantity": 15,
    "availableQuantity": 15,
    "location": "Shelf C-6",
    "updatedDate": "2026-01-20T11:30:00"
  }
}
```

---

#### 4.4 Delete Book

```
DELETE /books/{bookId}
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Response** (204 No Content):
```
No body returned
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Book not found"
}
```

---

### 5. STUDENT ENDPOINTS

#### 5.1 Get All Students

```
GET /students
Authorization: Bearer {JWT_TOKEN}
```

**Required**: LIBRARIAN role JWT token

**Query Parameters**:
- `department` (optional): Filter by department
- `page` (optional): Page number
- `size` (optional): Page size

**Response** (200 OK):
```json
{
  "success": true,
  "count": 500,
  "data": [
    {
      "id": 1,
      "studentId": "S12345",
      "firstName": "Alice",
      "lastName": "Smith",
      "email": "alice@university.edu",
      "department": "Computer Science",
      "cardId": "CARD12345",
      "registrationDate": "2026-01-15T10:00:00"
    },
    {
      "id": 2,
      "studentId": "S12346",
      "firstName": "Bob",
      "lastName": "Johnson",
      "email": "bob@university.edu",
      "department": "Engineering",
      "cardId": "CARD12346",
      "registrationDate": "2026-01-16T09:30:00"
    }
  ]
}
```

---

#### 5.2 Get Student by ID

```
GET /students/{studentId}
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:
- `studentId` (required): Student database ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "studentId": "S12345",
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@university.edu",
    "department": "Computer Science",
    "cardId": "CARD12345",
    "registrationDate": "2026-01-15T10:00:00"
  }
}
```

---

#### 5.3 Update Student

```
PUT /students/{studentId}
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:
- `studentId` (required): Student database ID

**Request Body**:
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@university.edu",
  "department": "Computer Science",
  "cardId": "CARD12345-NEW"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": 1,
    "studentId": "S12345",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@university.edu",
    "department": "Computer Science",
    "cardId": "CARD12345-NEW",
    "updatedDate": "2026-01-20T11:00:00"
  }
}
```

---

### 6. BORROW RECORD ENDPOINTS

#### 6.1 Get All Borrow Records

```
GET /borrow-records
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `status` (optional): ACTIVE, RETURNED, OVERDUE
- `page` (optional): Page number
- `size` (optional): Page size

**Response** (200 OK):
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": 1,
      "student": {
        "studentId": "S12345",
        "firstName": "Alice",
        "lastName": "Smith"
      },
      "book": {
        "id": 1,
        "title": "Introduction to Java",
        "author": "John Doe"
      },
      "borrowDate": "2026-01-10T10:00:00",
      "dueDate": "2026-01-24T23:59:59",
      "returnDate": null,
      "status": "ACTIVE",
      "daysRemaining": 4
    }
  ]
}
```

---

#### 6.2 Create Borrow Record

```
POST /borrow-records
Authorization: Bearer {JWT_TOKEN}
```

**Request Body**:
```json
{
  "studentId": 1,
  "bookId": 1,
  "borrowDate": "2026-01-20T10:00:00",
  "dueDate": "2026-02-03T23:59:59"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Book borrowed successfully",
  "data": {
    "id": 1,
    "student": {
      "id": 1,
      "studentId": "S12345"
    },
    "book": {
      "id": 1,
      "title": "Introduction to Java"
    },
    "borrowDate": "2026-01-20T10:00:00",
    "dueDate": "2026-02-03T23:59:59",
    "status": "ACTIVE"
  }
}
```

---

#### 6.3 Return Book

```
PUT /borrow-records/{recordId}/return
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:
- `recordId` (required): Borrow record ID

**Request Body**:
```json
{
  "returnDate": "2026-01-25T14:30:00"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "id": 1,
    "student": {
      "studentId": "S12345"
    },
    "book": {
      "title": "Introduction to Java"
    },
    "borrowDate": "2026-01-20T10:00:00",
    "dueDate": "2026-02-03T23:59:59",
    "returnDate": "2026-01-25T14:30:00",
    "status": "RETURNED",
    "fineAmount": 0
  }
}
```

---

## 🔄 Common Response Structure

All endpoints follow this response structure:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details"
  }
}
```

---

## 🔒 Authorization

### Role-Based Access Control

| Endpoint | STUDENT | LIBRARIAN | PUBLIC |
|----------|---------|-----------|--------|
| POST /auth/student/register | ✓ | ✓ | ✓ |
| POST /auth/student/login | ✓ | ✓ | ✓ |
| POST /auth/librarian/register | ✗ | ✗ | ✓ |
| POST /auth/librarian/login | ✗ | ✗ | ✓ |
| POST /scan | ✓ | ✗ | ✗ |
| GET /library-entries | ✗ | ✓ | ✗ |
| GET /books | ✓ | ✓ | ✗ |
| POST /books | ✗ | ✓ | ✗ |
| GET /students | ✗ | ✓ | ✗ |

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful delete |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid JWT |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## 🧪 Testing with Postman

1. **Import Collection**: Import `POSTMAN_COLLECTION.json` in Postman
2. **Set JWT Token**: 
   - Login with student/librarian credentials
   - Copy the token from response
   - Set `{{JWT_TOKEN}}` variable in Postman
3. **Execute Requests**: Run any endpoint with proper authorization

---

**Last Updated**: January 20, 2026

