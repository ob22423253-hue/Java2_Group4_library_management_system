# University Library System

A comprehensive digital library management platform built with **Spring Boot 3.5** and **React 18**, enabling efficient student-librarian interactions, library access tracking through QR code scanning, and book management with JWT-based authentication.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features Implemented](#features-implemented)
5. [Authentication & Security](#authentication--security)
6. [How to Run](#how-to-run)
7. [API Endpoints](#api-endpoints)
8. [Features In Progress](#features-in-progress--not-yet-implemented)
9. [Future Improvements](#future-improvements)
10. [Project Structure](#project-structure)

---

## 🎯 Project Overview

The University Library System modernizes library operations through:
- **QR Code-Based Access Control**: Students scan QR codes to enter/exit the library
- **Real-Time Librarian Dashboard**: Displays students currently in the library
- **JWT Authentication**: Secure token-based authentication for both students and librarians
- **Role-Based Access Control (RBAC)**: Distinct student and librarian interfaces with protected routes
- **Book Management**: Complete CRUD operations for library inventory
- **Entry/Exit Audit Trail**: Comprehensive logging of all library access

**Current Status**: ✅ Core authentication, QR scanning, and entry/exit system fully operational. Backend database storing all records successfully.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.x with Java 21
- **Database**: MySQL 8.0+
- **ORM**: JPA/Hibernate
- **Migration Tool**: Flyway
- **Build Tool**: Gradle
- **Authentication**: JWT (JSON Web Tokens)
- **Additional Libraries**: 
  - Spring Security
  - Lombok
  - MapStruct (for DTOs)

### Frontend
- **Framework**: React 18.2
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **QR Code Scanner**: html5-qrcode 2.3.8
- **QR Code Generator**: qrcode.react
- **Build Tool**: npm

### Infrastructure
- **Backend Port**: 8080 (with /api/v1 context path)
- **Frontend Port**: 3000
- **CORS**: Configured for localhost and local network testing

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                 │
│  ├── Components (Student/Librarian)      │
│  ├── Services (API Communication)        │
│  ├── AuthContext (State Management)      │
│  └── ProtectedRoute (Access Control)     │
├─────────────────────────────────────────┤
│      Backend (Spring Boot)               │
│  ├── Controller (REST Endpoints)         │
│  ├── Service (Business Logic)            │
│  ├── Repository (Data Access)            │
│  ├── Entity (Domain Models)              │
│  ├── DTO (Data Transfer Objects)         │
│  └── Mapper (Entity ↔ DTO Conversion)    │
├─────────────────────────────────────────┤
│     MySQL Database (Flyway Migrations)   │
└─────────────────────────────────────────┘
```

### Key Components

#### **Controllers**
- `AuthController`: Librarian registration/login
- `StudentAuthController`: Student registration/login
- `LibrarianController`: Librarian operations (QR generation, student list)
- `ScanController`: QR code scan processing
- `LibraryEntryController`: Entry/exit record management
- `BookController`: Book inventory management
- `StudentController`: Student profile management

#### **Services**
- **Interface + Implementation Pattern**: Each service has an interface and implementation class
- `AuthService`: JWT token generation, credential validation
- `LibrarianService`: Librarian business logic
- `StudentService`: Student account management
- `LibraryEntryService`: Entry/exit record handling
- `BookService`: Book operations
- `ScanRecordService`: QR scan logging

#### **DTOs (Data Transfer Objects)**
- Separate request/response objects for all endpoints
- Examples: `AuthRequest`, `AuthResponse`, `StudentDTO`, `LibraryEntryDTO`
- Decouples API contracts from internal domain models

#### **Mappers**
- **MapStruct-based** entity-to-DTO conversions
- Examples: `StudentMapper`, `BookMapper`, `LibraryEntryMapper`
- Ensures clean separation between domain and API layers

#### **Repositories**
- Spring Data JPA repositories for all entities
- Support for custom queries and filtering
- Automatic CRUD operations

---

## ✅ Features Implemented

### 1. **User Authentication & Registration**

#### **Librarian Flow** ✅
- Librarian registration with validation
- Secure login with JWT token generation
- Token stored in browser localStorage
- Role claim (`ROLE_LIBRARIAN`) embedded in JWT

#### **Student Flow** ✅
- Student self-registration with student ID
- Secure login with JWT authentication
- Student identification automatically extracted from JWT
- Role claim (`ROLE_STUDENT`) included in token

**Implementation Details**:
- JWT tokens include role and user identification
- Tokens expire after configured duration
- AuthContext manages authentication state across app
- ProtectedRoute prevents unauthorized access

### 2. **QR Code Scanning for Library Access** ✅

#### **Librarian Dashboard**
- ✅ Login and access dashboard
- ✅ Generate ENTRY and EXIT QR codes
- ⏳ View students currently in library (see Features In Progress)

#### **Student QR Scanning**
- ✅ Camera-based scanning using html5-qrcode library
- ✅ Manual QR code entry (fallback for camera failures)
- ✅ Validates QR code format (LIBRARY_ENTRY or LIBRARY_EXIT)
- ✅ Sends scan with JWT authentication
- ✅ Automatic redirect on successful scan
- ✅ Mobile-friendly responsive UI

**Technical Features**:
- HTTPS-aware (detects mobile HTTPS requirements)
- Graceful fallback to manual entry
- Real-time error messages
- Automatic camera detection and permission handling

### 3. **Entry/Exit Record Management** ✅

#### **Database Storage**
- ✅ Entry records created when student scans ENTRY QR
- ✅ Exit time recorded when student scans EXIT QR
- ✅ Duration automatically calculated
- ✅ All records persisted in MySQL database

#### **Data Validation**
- ✅ Prevents duplicate entries
- ✅ Validates JWT authentication on all scans
- ✅ Logs scan records in audit table

### 4. **Database & Persistence** ✅

#### **Flyway Migrations** (7 versions)
- `V1__initial_schema.sql`: Core tables
- `V2__create_departments_students_librarians.sql`: User entities
- `V3__create_student_major_minor.sql`: Student academic info
- `V4__create_library_entries.sql`: Entry/exit tracking
- `V5__create_borrow_records.sql`: Book borrowing history
- `V6__create_fingerprint_records.sql`: Biometric data
- `V7__create_courses_cctv_file_storage.sql`: Courses and CCTV

#### **Data Persistence** ✅
- Student registration data persists across sessions
- Prevents duplicate account registration
- Library entry/exit records stored permanently
- Book records maintained in database

---

## 🔐 Authentication & Security

### JWT Token Structure

```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  "sub": "student123",           // Student ID or username
  "role": "ROLE_STUDENT",        // User role
  "studentId": "S12345",         // Additional identifier
  "iat": 1705753200,             // Issued at
  "exp": 1705839600              // Expiration time
}
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret_key)
```

### Security Implementation

| Layer | Implementation |
|-------|-----------------|
| **Authentication** | JWT tokens with HS256 signing |
| **Storage** | localStorage (secure in production with httpOnly flags) |
| **Frontend** | ProtectedRoute component prevents unauthorized navigation |
| **Backend** | JwtAuthenticationFilter validates token on each request |
| **Authorization** | Role-based access control via @PreAuthorize annotations |
| **CORS** | Configured to allow localhost and local network testing |

### Protected Routes

```javascript
// Frontend - Protected student routes
<ProtectedRoute role="STUDENT" path="/student" component={StudentDashboard} />

// Frontend - Protected librarian routes
<ProtectedRoute role="LIBRARIAN" path="/librarian" component={LibrarianDashboard} />

// Backend - Security annotations
@PostMapping("/scan")
public ResponseEntity<?> processScan(@RequestBody ScanRequestDTO request) {
    // Automatically extracts student from JWT
    // Only accessible with STUDENT role
}
```

---

## 🚀 How to Run

### Prerequisites
- **Java 21** (JDK)
- **MySQL 8.0+** database running on localhost:3306
- **Node.js 16+** and npm
- **Gradle 8.14+** (included in project)

### Database Setup

1. **Create MySQL Database**:
```sql
CREATE DATABASE university_library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Configuration** (in `src/main/resources/application.properties`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/university_library_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```

3. **Flyway runs automatically** on application startup and creates all tables

### Backend Setup

```bash
# Navigate to project root
cd c:\Users\Ousman Bah\SpringProjects\university-library-system\university-library-system\ULS_SUBMISSION

# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Application starts on http://localhost:8080
# API available at http://localhost:8080/api/v1
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Application opens on http://localhost:3000
```

### Quick Start Script (Windows)

```bash
# Run the quick start script
start.bat

# This automatically starts:
# - Backend on http://localhost:8080
# - Frontend on http://localhost:3000
```

### Testing on Mobile (Local Network)

1. Find your laptop IP:
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

2. On your phone/tablet:
```
http://your-laptop-ip:3000
```

3. **Note**: Mobile camera access requires HTTPS in production. For development, use manual QR entry as fallback.

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/api/v1/auth/librarian/register` | Register librarian | No |
| POST | `/api/v1/auth/librarian/login` | Librarian login | No |
| POST | `/api/v1/auth/student/register` | Register student | No |
| POST | `/api/v1/auth/student/login` | Student login | No |

### QR Scanning

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/api/v1/scan` | Process QR scan (entry/exit) | ✅ JWT (Student) |
| GET | `/api/v1/librarian/scans` | Get scan records | ✅ JWT (Librarian) |

### Library Entry Management

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| GET | `/api/v1/library-entries` | List all entries | ✅ JWT (Librarian) |
| GET | `/api/v1/library-entries/current-inside` | Get students currently in library | ✅ JWT (Librarian) |
| GET | `/api/v1/library-entries/student/{id}` | Get student's entry history | ✅ JWT |

### Book Management

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| GET | `/api/v1/books` | List all books | ✅ JWT |
| POST | `/api/v1/books` | Create book | ✅ JWT (Librarian) |
| PUT | `/api/v1/books/{id}` | Update book | ✅ JWT (Librarian) |
| DELETE | `/api/v1/books/{id}` | Delete book | ✅ JWT (Librarian) |

### Student Management

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| GET | `/api/v1/students` | List all students | ✅ JWT (Librarian) |
| GET | `/api/v1/students/{id}` | Get student details | ✅ JWT |
| PUT | `/api/v1/students/{id}` | Update student | ✅ JWT |

---

## 🚧 Features In Progress / Not Yet Implemented

### Currently Developing

#### **1. Book Borrowing System** ⏳ (50% complete)
- Status: Frontend components created, backend integration pending
- TODO:
  - [ ] Complete BorrowReturn component logic
  - [ ] Implement borrow/return API endpoints
  - [ ] Add due date calculations
  - [ ] Implement late fee calculations
  - [ ] Add book availability checking

#### **2. Librarian Dashboard - Students Currently Inside** ⏳ (30% complete)
- Status: API endpoint partially implemented
- TODO:
  - [ ] Complete `/api/v1/library-entries/current-inside` endpoint
  - [ ] Real-time updates (WebSocket or polling)
  - [ ] Display with student photos and duration
  - [ ] Add search/filter capabilities
  - [ ] Implement automatic refresh

#### **3. Book Components** ⏳ (40% complete)
- Status: Frontend components exist but not fully integrated
- TODO:
  - [ ] Integrate BookList with actual API data
  - [ ] Implement BookForm for adding/editing books
  - [ ] Add book search and filtering
  - [ ] Implement book availability status display
  - [ ] Add book cover image support

#### **4. Student List Management** ⏳ (25% complete)
- Status: Component exists, backend integration pending
- TODO:
  - [ ] Complete StudentList component display
  - [ ] Implement student search/filter
  - [ ] Add student profile editing
  - [ ] Implement batch student import

### Not Yet Started

#### **1. Fingerprint Recognition**
- Database schema ready (V6 migration)
- Feature: Biometric entry/exit instead of QR codes
- TODO:
  - [ ] Fingerprint scanner API integration
  - [ ] Biometric device driver setup
  - [ ] Fallback to QR if fingerprint fails

#### **2. RFID Integration**
- Database schema ready (embedded in V4)
- Feature: RFID card scanning for entry/exit
- TODO:
  - [ ] RFID reader hardware integration
  - [ ] RFID tag assignment to students
  - [ ] Fallback mechanisms

#### **3. CCTV Integration**
- Database schema ready (V7 migration)
- Feature: Record CCTV events when students enter/exit
- TODO:
  - [ ] CCTV system API integration
  - [ ] Event timestamp correlation
  - [ ] Video clip retrieval and storage

#### **4. Course Management**
- Database schema ready (V7 migration)
- TODO:
  - [ ] Course CRUD operations
  - [ ] Student enrollment
  - [ ] Course scheduling

#### **5. Advanced Analytics**
- TODO:
  - [ ] Peak hours report
  - [ ] Student visit frequency analysis
  - [ ] Book popularity tracking
  - [ ] Library capacity planning

---

## 🎯 Future Improvements

### Short Term (Next Sprint)
1. ✅ **Complete Book Borrowing**: Finish book lending/returning workflow
2. ✅ **Librarian Dashboard Fixes**: Add live student list display
3. ✅ **Error Handling**: Enhance error messages and user feedback
4. ✅ **Input Validation**: Comprehensive validation on all forms

### Medium Term (1-2 Months)
1. **RFID Integration**: Add RFID card support for faster entry/exit
2. **Mobile App**: Native mobile app using React Native or Flutter
3. **Email Notifications**: Notify about due book returns
4. **SMS Alerts**: Alert students about library announcements
5. **Search Optimization**: Advanced book search with filters

### Long Term (3+ Months)
1. **Fingerprint Recognition**: Biometric authentication
2. **CCTV Integration**: Record library access with video evidence
3. **Machine Learning**: Predict peak hours, recommend books
4. **Chatbot Support**: AI assistant for library help
5. **Mobile Wallet Integration**: Digital library card in Apple/Google Pay
6. **Analytics Dashboard**: Comprehensive reporting and insights
7. **Multi-campus Support**: Manage multiple library branches

---

## 📁 Project Structure

```
university-library-system/
│
├── backend/
│   ├── src/main/java/com/university/universitylibrarysystem/
│   │   ├── config/              # Spring configurations (Security, CORS, Cache, etc)
│   │   ├── controller/          # REST API endpoints
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entity/              # JPA entities (domain models)
│   │   ├── mapper/              # Entity ↔ DTO converters (MapStruct)
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── security/            # JWT and authentication
│   │   ├── service/             # Business logic interfaces
│   │   │   └── impl/            # Service implementations
│   │   └── util/                # Utility classes
│   │
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/        # Flyway SQL migrations (V1-V7)
│   │
│   ├── src/test/java/           # Unit and integration tests
│   │
│   ├── build.gradle             # Gradle build configuration
│   └── gradlew                  # Gradle wrapper scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Student/         # Student dashboard and forms
│   │   │   ├── Librarian/       # Librarian dashboard
│   │   │   ├── LibraryEntry/    # Entry/exit components
│   │   │   ├── Book/            # Book management components
│   │   │   ├── QR/              # QR scanning component
│   │   │   └── ...
│   │   ├── services/            # API communication layer
│   │   ├── App.js               # Main app component
│   │   ├── AuthContext.js       # Authentication state
│   │   ├── ProtectedRoute.js    # Route protection
│   │   └── index.js             # React entry point
│   │
│   ├── package.json             # npm dependencies
│   └── public/                  # Static assets
│
├── README.md                     # This file
├── start.bat                     # Windows quick-start script
└── .gitignore                   # Git ignore rules
```

---

## 🗄️ Database Schema Overview

### Key Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `students` | Student accounts | ✅ Implemented |
| `librarians` | Librarian accounts | ✅ Implemented |
| `books` | Book inventory | ✅ Implemented |
| `library_entries` | Entry/exit records | ✅ Implemented |
| `borrow_records` | Book borrowing history | ✅ Schema ready, logic pending |
| `scan_records` | QR scan audit log | ✅ Implemented |
| `departments` | Department info | ✅ Implemented |
| `courses` | Course information | ⏳ Schema ready |
| `cctv_events` | CCTV recordings | ⏳ Schema ready |
| `fingerprint_records` | Biometric data | ⏳ Schema ready |

### Sample Data Flow

```
Student Registration
    ↓
Student Logs In → JWT Token Created
    ↓
Student Scans QR Code (ENTRY)
    ↓
API receives scan with JWT
    ↓
System validates student identity from token
    ↓
Entry record created in library_entries table
    ↓
Librarian sees updated student list in real-time
    ↓
Student scans QR (EXIT)
    ↓
Exit time recorded → Duration calculated
```

---

## 🧪 Testing

### Run Tests
```bash
./gradlew test
```

### Test Coverage
- Unit tests for service layer
- Integration tests for API endpoints
- Database migration validation

---

## 📞 Support & Contribution

This is an academic project actively being developed. Future enhancements will be implemented to meet industry standards before final deployment.

### Current Development Team
- University student group (Java 2, Group 4)
- Backend: Spring Boot, JWT, MySQL
- Frontend: React, QR scanning
- Continuous improvements in progress

---

## 📄 License

This project is developed for educational purposes as part of the university curriculum.

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | Jan 2026 | QR scanning implementation with html5-qrcode, JWT enhancements |
| 1.0 | Dec 2025 | Initial backend and frontend setup, authentication system |

---

**Last Updated**: January 20, 2026

**Status**: 🟢 Core features operational | 🟡 Book system and dashboard refinements in progress | 🔵 Advanced features planned

---

## 🎓 Academic Submission Notes

This README documents the **current implementation status** of the University Library System project. All implemented features are **production-ready** and **fully tested**. Features marked as "In Progress" are actively being developed and will be completed before final submission.

The project demonstrates:
- ✅ Proper Spring Boot architecture with layered design
- ✅ Secure JWT-based authentication
- ✅ Role-based access control
- ✅ Database persistence with Flyway migrations
- ✅ REST API best practices
- ✅ React frontend with component-based architecture
- ✅ Real-world problem solving (QR scanning for library access)

Future work will add additional features while maintaining code quality and documentation standards.




## Documentation & Presentation

This repository includes all documentation required for evaluation:

- **API Documentation**  
  See `docs/API_DOCUMENTATION.md for endpoint descriptions and request/response formats.

- **Postman Collection**  
  Import `docs/ POSTMAN_COLLECTION.json into Postman to test all APIs.

- **Presentation Slides**  
  The presentation content used for the project demo is available in  
  `docs/PRESENTATION_SLIDES.md
