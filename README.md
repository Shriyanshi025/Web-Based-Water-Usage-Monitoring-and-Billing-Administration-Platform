# 💧 Web-Based Water Usage Monitoring and Billing Administration Platform

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2+-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A comprehensive, full-stack application designed to revolutionize how communities, property managers, and residents monitor water consumption and automate billing processes. Built with a robust Spring Boot backend and a lightning-fast React + Vite frontend, this platform ensures transparency, efficiency, and role-based security.

---

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Main Admins, Community Admins, and Residents.
- **Real-Time Dashboards:** Interactive charts and analytics for tracking water usage and billing metrics.
- **Automated Billing:** Dynamic billing cycle generation and tariff plan enforcement.
- **Smart Meter Management:** End-to-end lifecycle management of water meters and household directories.
- **Secure Authentication:** Stateless, JWT-based security with encrypted passwords.
- **Responsive UI:** A modern, mobile-friendly interface leveraging clean design principles.

---

## 👥 User Roles

### 1. Main Admin (Super User)
- **Overview:** The system orchestrator.
- **Capabilities:** 
  - Manage multiple communities.
  - Approve or reject Community Admin registrations.
  - System-wide oversight and analytics.

### 2. Community Admin
- **Overview:** The local community manager.
- **Capabilities:**
  - Onboard and manage residents within their community.
  - Configure blocks, units, and assign water meters.
  - Define custom tariff plans and billing cycles.
  - Generate and manage community bills.

### 3. Resident
- **Overview:** The end user.
- **Capabilities:**
  - View personal monthly water consumption analytics.
  - Pay and track personal billing history.
  - Monitor household meter status.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Java Spring Boot (REST APIs)
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **Database ORM:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL

### Frontend
- **Library:** React.js
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **State Management:** React Context API

---

## 🏗️ System Architecture

The system utilizes a decoupled microservices-inspired monolithic architecture:
1. **Frontend Tier:** Single Page Application (SPA) communicating via asynchronous REST calls.
2. **Backend API Tier:** Stateless controllers handling business logic, secured via a centralized JWT Authentication filter.
3. **Data Tier:** Relational PostgreSQL database ensuring ACID compliance for critical billing and usage records.

---

## 📂 Folder Structure

```text
├── frontend/                               # React + Vite Application
│   ├── src/
│   │   ├── components/                     # Reusable UI widgets
│   │   ├── context/                        # Global state (Auth, Notifications)
│   │   ├── pages/                          # Role-specific dashboard views
│   │   ├── services/                       # API integration layers
│   │   └── styles/                         # Global styling tokens
├── monitoring-and-billing-platform/        # Spring Boot Application
│   ├── src/main/java/com/water/...
│   │   ├── controller/                     # REST API Endpoints
│   │   ├── dto/                            # Data Transfer Objects
│   │   ├── entity/                         # JPA Database Models
│   │   ├── repository/                     # Database Access Layer
│   │   ├── security/                       # JWT Filters & Config
│   │   └── service/                        # Business Logic Implementation
│   └── src/main/resources/
│       ├── application.properties          # Environment configurations
│       └── data.sql                        # Seed data (Tariff plans, etc.)
└── README.md
```

---

## 🗄️ Database Overview

The relational database is carefully normalized and includes the following core entities:
- `users`, `roles`, `permissions` (Authentication & RBAC)
- `communities`, `blocks`, `units` (Infrastructure Hierarchy)
- `water_meters`, `water_usage` (IoT & Consumption tracking)
- `tariff_plans`, `billing_cycles`, `bills` (Financials)

---

## 🔒 Authentication Flow

1. User authenticates via the `/api/auth/login` endpoint.
2. Backend validates credentials against encrypted hashes using BCrypt.
3. Backend generates a signed JWT and returns it alongside user roles.
4. Frontend stores the JWT securely in `localStorage`.
5. Every subsequent API request includes the JWT in the `Authorization: Bearer <token>` header.
6. Spring Security intercepts requests, verifies the JWT, and enforces method-level role security.

---

## 📸 Dashboards Overview

*(Placeholders for future UI screenshots)*
- **[Screenshot: Main Admin Dashboard]**
- **[Screenshot: Community Admin Billing Overview]**
- **[Screenshot: Resident Usage Analytics]**

---

## 🚀 Installation & Local Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 16+
- Maven

### 1. Database Setup
Create a PostgreSQL database named `water_db`.
```sql
CREATE DATABASE water_db;
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd monitoring-and-billing-platform
```

Create a `.properties` file for your local secrets to keep them out of git:
Create `src/main/resources/application-local.properties` and add:
```properties
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secure_random_base64_secret_key_at_least_256_bits
```

Run the application:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
*The backend will start on `http://localhost:8080`*

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies and start the Vite dev server:
```bash
npm install
npm run dev
```
*The frontend will start on `http://localhost:5173`*

---

## ⚙️ Environment Variables (Production)

When deploying to a cloud provider (e.g., Vercel, Render), ensure the following environment variables are configured:

**Backend:**
- `DB_PASSWORD`: Production database password.
- `JWT_SECRET`: Production cryptographic key.
- `FRONTEND_URL`: URL of the deployed frontend (for CORS).

**Frontend:**
- `VITE_API_BASE_URL`: URL of the deployed Spring Boot backend.

---

## 🌐 API Overview

| Endpoint | Method | Role Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login` | POST | Public | Authenticates user & returns JWT |
| `/api/auth/register` | POST | Public | Registers a new user |
| `/api/dashboard/main-admin` | GET | MAIN_ADMIN | Aggregated platform stats |
| `/api/communities/{id}/bills` | POST | COMM_ADMIN | Generates community bills |
| `/api/resident/usage` | GET | RESIDENT | Retrieves personal water usage |

---

## 🔮 Future Enhancements

- 📊 **PDF Bill Generation:** Allow residents to download monthly invoices.
- 💳 **Payment Gateway Integration:** Direct Stripe/PayPal bill payments.
- 📡 **IoT Integration:** Direct webhook ingestion from physical smart water meters.
- 📱 **Mobile Application:** React Native port for native mobile experiences.

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for more details.
