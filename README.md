# 🛒 Smart Retail System (Multi-Tenant SaaS)

<p align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen?style=for-the-badge&logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-success?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql)
![Hibernate](https://img.shields.io/badge/Hibernate-JPA-brown?style=for-the-badge)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![Maven](https://img.shields.io/badge/Maven-Build-red?style=for-the-badge&logo=apachemaven)

</p>

> **A modern Multi-Tenant Retail Management System built using Java, Spring Boot, Spring Security (JWT), React, and MySQL.**
>
> Each store has its own secure workspace to manage inventory, customers, billing, offers, analytics, and transactions independently.

---

# ✨ Features

- 🔐 JWT Authentication & Authorization
- 🏪 Multi-Tenant SaaS Architecture
- 📊 Interactive Analytics Dashboard
- 📈 Sales Trend Analytics
- 💰 Revenue Tracking
- 📦 Product & Inventory Management
- 🗂️ Category Management
- 👥 Customer Management
- 🧾 Smart Billing System
- 📜 Billing History & Transactions
- 🧮 Automatic GST Calculation
- 🎁 Offer & Promotion Management
- 📧 Email Invoice Delivery
- 🖨️ Printable Invoice with QR Code
- 📱 Modern Responsive UI
- 🔍 Advanced Search & Filtering
- 🔒 Secure REST APIs

---

# 🛠️ Tech Stack

| Category | Technology |
|-----------|------------|
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT |
| Database | MySQL |
| ORM | Spring Data JPA (Hibernate) |
| Frontend | React.js |
| Build Tool | Maven |
| API Testing | Postman |
| Version Control | Git & GitHub |

---

# 📂 Project Structure

```
SmartRetail-v2
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── security
│   ├── config
│   ├── exception
│   └── resources
│
├── frontend
│
└── README.md
```

---

# 🔗 API Endpoints

| Module | Method | Endpoint | Authentication |
|--------|--------|----------|----------------|
| Register | POST | `/api/v1/auth/register` | ❌ No |
| Login | POST | `/api/v1/auth/login` | ❌ No |
| Dashboard | GET | `/api/v1/store/dashboard` | ✅ JWT |
| Store | GET, PUT | `/api/v1/store` | ✅ JWT |
| Categories | CRUD | `/api/v1/categories` | ✅ JWT |
| Products | CRUD | `/api/v1/products` | ✅ JWT |
| Customers | CRUD | `/api/v1/customers` | ✅ JWT |
| Bills | GET, POST | `/api/v1/bills` | ✅ JWT |
| Offers | CRUD | `/api/v1/offers` | ✅ JWT |

---

# 📸 Project Screenshots

## 🔐 Login

Secure login using JWT Authentication.

![Login](Screenshots/login.png)

---

## 📊 Analytics Dashboard

Real-time dashboard displaying revenue, customers, products, sales trends, top-selling products, and low-stock alerts.

![Dashboard](Screenshots/Dashboard.png)

---

## 📦 Product Management

Manage inventory, pricing, stock levels, and product details.

![Products](Screenshots/product.png)

---

## 🗂️ Category Management

Organize products into categories with search and CRUD operations.

![Categories](Screenshots/Category.png)

---

## 👥 Customer Management

Manage customer records with search functionality.

![Customers](Screenshots/customer.png)

---

## 🧾 Smart Billing

Generate invoices with GST calculation, discounts, customer selection, and automatic stock updates.

![Billing](Screenshots/Billing.png)

---

## 📜 Transaction History

View invoice history, revenue summary, monthly filtering, and transaction search.

![Transactions](Screenshots/Transaction.png)

---

## 🧾 Printable Invoice

Professional GST invoice with QR Code and print support.

![Invoice](Screenshots/invoice.png)

---

## 🎁 Offers & Promotions

Create and manage promotional offers with discount percentages and expiry dates.

![Offers](Screenshots/Offer.png)

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Ompatil-999/SmartRetail-v2.git
```

---

## Navigate

```bash
cd SmartRetail-v2
```

---

## Configure Database

Create your own

```
application.yml
```

Configure

- MySQL URL
- Username
- Password
- JWT Secret
- Mail Configuration

> **Note:** `application.yml` is intentionally excluded from GitHub for security reasons.

---

## Run Backend

```bash
mvn spring-boot:run
```

---

## Run Frontend

```bash
npm install
npm run dev
```

---

# 🔒 Security

- JWT Authentication
- BCrypt Password Encryption
- Stateless Authentication
- Protected REST APIs
- Secure Password Storage

---

# 🚀 Future Enhancements

- 📊 Sales Reports & Charts
- ☁️ AWS Deployment
- 🐳 Docker Support
- 📱 Mobile Application
- 🔔 Low Stock Notifications
- 📈 Business Intelligence Dashboard
- 📄 PDF & Excel Reports
- 💳 Online Payment Integration

---

# 👨‍💻 Author

## Om Patil

**MCA Student | Java Backend Developer**

- Java
- Spring Boot
- Spring Security
- REST APIs
- MySQL
- Hibernate
- React
- Cloud & DevOps (Learning)

---

## ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.
