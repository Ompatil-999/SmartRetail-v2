# SmartRetail — Multi-Store Retail SaaS

A production-grade multi-store retail management SaaS platform built with **Spring Boot** and **React**.

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18, Tailwind CSS v4, Axios      |
| Backend   | Java 17, Spring Boot 3.2, Spring Security, JPA |
| Database  | MySQL 8+                              |
| Auth      | JWT (stateless)                       |
| Email     | Spring Boot Mail (SMTP)               |

## Prerequisites

- **Java 17+** (JDK)
- **Maven 3.8+**
- **Node.js 18+** & **npm**
- **MySQL 8+** running locally

## Setup Instructions

### 1. Database

```bash
mysql -u root -p < schema.sql
```

### 2. Backend Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_retail_db
    username: root        # ← your MySQL username
    password: root        # ← your MySQL password

  mail:
    username: your-email@gmail.com   # ← your Gmail
    password: your-app-password       # ← Gmail App Password
```

### 3. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 5. Use the App

1. Open `http://localhost:5173/register`
2. Register a new store owner
3. You'll be redirected to the dashboard
4. Start managing categories, products, customers, billing, and offers

## API Endpoints

| Module     | Method | Endpoint                    | Auth |
|------------|--------|-----------------------------|------|
| Register   | POST   | `/api/v1/auth/register`     | ✗    |
| Login      | POST   | `/api/v1/auth/login`        | ✗    |
| Dashboard  | GET    | `/api/v1/store/dashboard`   | ✓    |
| Store      | GET/PUT| `/api/v1/store`             | ✓    |
| Categories | CRUD   | `/api/v1/categories`        | ✓    |
| Products   | CRUD   | `/api/v1/products`          | ✓    |
| Customers  | CRUD   | `/api/v1/customers`         | ✓    |
| Bills      | GET/POST| `/api/v1/bills`            | ✓    |
| Offers     | CRUD   | `/api/v1/offers`            | ✓    |

## Architecture

```
Controller → Service → Repository → Entity
     ↑           ↑          ↑
    DTO       Mapper     JPA/MySQL
```

Every business table includes `store_id` for multi-tenant isolation.
