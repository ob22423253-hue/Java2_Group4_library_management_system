# University Library System

A comprehensive full-stack library management system for universities, built with **Spring Boot 3.2.1** backend and **React 18.2** frontend. Enables students and librarians to manage book borrowing, library entry tracking, and student major/minor assignments.

## 🚀 Quick Start

### Prerequisites
- **Java 21 LTS** or higher
- **Node.js 16+** and npm
- **MySQL 8.0+** running locally on port 3306
- **Git**

### Running the Application

#### Backend (Spring Boot)
```bash
cd university-library-system
./gradlew bootRun
# or on Windows
gradlew.bat bootRun
```
Backend runs on: **http://localhost:8080/api/v1**

#### Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend runs on: **http://localhost:3000**

---

## 📋 Project Structure

```
university-library-system/
├── src/
│   ├── main/
│   │   ├── java/com/university/universitylibrarysystem/
│   │   │   ├── config/              # Spring configuration (Security, CORS, Cache, Async)
│   │   │   ├── controller/          # REST API endpoints (14 controllers)
│   │   │   ├── service/             # Business logic layer
│   │   │   ├── repository/          # JPA repositories
│   │   │   ├── entity/              # JPA entities (Student, Librarian, Book, etc.)
│   │   │   ├── security/            # JWT authentication & authorization
│   │   │   ├── dto/                 # Data transfer objects
│   │   │   ├── mapper/              # MapStruct mappers
│   │   │   └── util/                # Utility classes
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/        # Flyway SQL migrations (V1-V7)
│   └── test/java/
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Book/                # BookForm, BookList, BorrowReturn
│   │   │   ├── Student/             # StudentForm, StudentLogin, StudentList
│   │   │   ├── Librarian/           # LibrarianDashboard
│   │   │   ├── LibraryEntry/        # EntryForm, EntryList, ExitForm
│   │   │   └── Manager/             # ManagerDashboard
│   │   ├── services/                # API client services
│   │   │   ├── studentService.js
│   │   │   ├── librarianService.js
│   │   │   ├── bookService.js
│   │   │   └── ...
│   │   ├── App.js                   # Main React component
│   │   └── index.js
│   ├── public/                      # Static assets
│   ├── package.json
│   └── .gitignore
├── build.gradle                     # Gradle build configuration
├── settings.gradle
├── gradlew & gradlew.bat            # Gradle wrapper
└── README.md
```

---

## 🛠️ Technologies Used

### Backend
- **Spring Boot 3.2.1** - Web framework
- **Java 21 LTS** - Programming language
- **Gradle 8.14.3** - Build tool
- **Spring Data JPA** - ORM with Hibernate
- **Spring Security** - Authentication & authorization
- **JWT (JJWT 0.12.3)** - Token-based authentication
- **MySQL 8.0.33** - Database
- **Flyway 9.22.3** - Database migrations
- **MapStruct 1.5.5** - DTO mapping
- **Lombok** - Boilerplate reduction
- **Caffeine** - Caching library

### Frontend
- **React 18.2.0** - UI library
- **React Router DOM 6.30.2** - Routing
- **Axios 1.3.2** - HTTP client
- **Node.js** - Runtime environment

---

## 🔑 Features

### Student Features
✅ **Registration & Login** - Secure JWT-based authentication
✅ **Profile Management** - View/update student information
✅ **Library Entry** - Check-in/check-out from library
✅ **Book Management** - Browse, borrow, and return books
✅ **Borrowing History** - Track borrowed books and due dates
✅ **Major/Minor Selection** - Assign academic programs

### Librarian Features
✅ **Dashboard** - Overview of library operations
✅ **Student Management** - View and manage student records
✅ **Book Inventory** - Add, edit, delete books
✅ **Entry/Exit Tracking** - Monitor library access
✅ **QR Code Scanning** - Quick student identification
✅ **Borrow Record Management** - Track all book borrowing

### System Features
✅ **Role-Based Access Control** - RBAC with Student/Librarian roles
✅ **JWT Authentication** - Stateless API security
✅ **Database Migrations** - Automated schema versioning with Flyway
✅ **Caching** - Performance optimization with Caffeine cache
✅ **CORS Support** - Cross-origin requests enabled
✅ **Exception Handling** - Comprehensive error management

---

## 📊 Database Schema

### Core Entities
- **Student** - Student information and credentials
- **Librarian** - Librarian staff management
- **Book** - Library book inventory
- **BorrowRecord** - Book borrowing transactions
- **LibraryEntry** - Entry/exit logs
- **Department** - Academic departments
- **Course** - Course information
- **StudentMajorMinor** - Student program assignments
- **FingerprintRecord** - Biometric tracking (optional)
- **CCTVEvent** - Security event logs (optional)

---

## 🔐 Security

- **JWT Tokens** - Secure API authentication
- **Password Encryption** - Bcrypt hashing
- **CORS Configuration** - Controlled cross-origin access
- **Role-Based Access** - Endpoint authorization by role
- **Security Config** - Spring Security best practices

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/login-student` - Student login

### Students
- `GET /api/v1/students` - List all students
- `POST /api/v1/students` - Create student
- `GET /api/v1/students/{id}` - Get student details
- `PUT /api/v1/students/{id}` - Update student

### Books
- `GET /api/v1/books` - List books
- `POST /api/v1/books` - Add book
- `PUT /api/v1/books/{id}` - Update book
- `DELETE /api/v1/books/{id}` - Remove book

### Library Entry
- `GET /api/v1/library-entry` - Entry logs
- `POST /api/v1/library-entry/entry` - Record entry
- `POST /api/v1/library-entry/exit` - Record exit

### Borrow Records
- `GET /api/v1/borrow-records` - View borrows
- `POST /api/v1/borrow-records` - Create borrow
- `PUT /api/v1/borrow-records/{id}/return` - Return book

---

## 🧪 Testing

Run tests with:
```bash
./gradlew test
```

Test file location:
```
src/test/java/com/university/universitylibrarysystem/
```

---

## 📝 Configuration

### application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/university_library_db
spring.datasource.username=root
spring.datasource.password=your_password

jwt.secret=your_base64_encoded_secret_key
jwt.expiration=86400000

spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

### Database Setup
1. Create MySQL database: `university_library_db`
2. Flyway migrations run automatically on startup
3. Or manually run SQL files in `src/main/resources/db/migration/`

---

## 🚢 Deployment

### Build Production JAR
```bash
./gradlew clean build
java -jar build/libs/university-library-system-0.0.1-SNAPSHOT.jar
```

### Build Frontend
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your web server
```

---

## 🐛 Troubleshooting

### Backend Issues
- **Port 8080 already in use:** Change `server.port` in application.properties
- **Database connection error:** Verify MySQL is running and credentials are correct
- **JWT token invalid:** Ensure `jwt.secret` is properly configured

### Frontend Issues
- **Port 3000 in use:** Kill process or use `PORT=3001 npm start`
- **API connection error:** Verify backend is running on port 8080
- **npm install fails:** Delete `node_modules` and `package-lock.json`, then reinstall

---

## 👥 Contributors
- University Library System Development Team

## 📄 License
This project is licensed under the MIT License

---

## 📞 Support & Questions
For issues or questions, please contact the development team or open an issue in the repository.
