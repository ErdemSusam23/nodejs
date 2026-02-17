# 🛡️ Node.js Admin Panel

Full-stack admin panel with role-based access control, audit logging, and category management.

**Live Demo:** [nodejs-iota-lake.vercel.app](https://nodejs-iota-lake.vercel.app)  
**Backend API:** [nodejs-production-fb070.up.railway.app/api/docs](https://nodejs-production-fb070.up.railway.app/api/docs)

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Deploy](#-deploy)

---

## 🔧 Tech Stack

**Backend**
- Node.js, Express.js
- MongoDB + Mongoose
- JWT Authentication
- Helmet, CORS, Rate Limiting, HPP, Mongo Sanitize
- Swagger (API Docs)

**Frontend**
- React (Vite) + TypeScript
- Tailwind CSS + Shadcn/UI
- TanStack Query (React Query) + Axios
- React Hook Form + Zod
- React Router DOM

**Infrastructure**
- Docker + Docker Compose (local)
- MongoDB Atlas (database)
- Railway (backend)
- Vercel (frontend)

---

## ✨ Features

- 🔐 **Authentication** — JWT-based login/logout with cookie storage
- 👥 **User Management** — Create, update, delete users; assign multiple roles
- 🛡️ **Role & Permission Management** — Granular permission system via `RolePrivileges`
- 📁 **Category Management** — Full CRUD for categories
- 📜 **Audit Logs** — Track all system actions with filtering and pagination
- 🌐 **i18n Ready** — Multi-language support via `Accept-Language` header
- 📖 **Swagger Docs** — Auto-generated API documentation at `/api/docs`

---

## 📁 Project Structure

```
.
├── backend/
│   ├── bin/
│   │   └── www                 # Entry point
│   ├── config/
│   │   └── index.js            # Environment config
│   ├── db/
│   │   └── Database.js         # MongoDB connection
│   ├── lib/
│   │   ├── Response.js         # Standard response wrapper
│   │   └── I18n.js             # Internationalization
│   ├── routes/                 # API routes
│   ├── app.js                  # Express app setup
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                # API layer (axios calls)
│   │   ├── components/         # Reusable UI components
│   │   ├── config/
│   │   │   └── env.ts          # Environment variables
│   │   ├── pages/              # Route pages
│   │   ├── store/              # Auth store (Zustand)
│   │   ├── types/              # TypeScript types
│   │   └── lib/
│   │       └── api-client.ts   # Axios instance + interceptors
│   ├── nginx.conf              # Nginx config for SPA routing
│   ├── vercel.json             # Vercel SPA routing config
│   └── Dockerfile              # Multi-stage production build
│
└── docker-compose.yml
```

---

## 🗄️ Database Schema

Relational-style design using MongoDB references:

| Collection | Fields |
|---|---|
| `users` | `email`, `password` (hashed), `first_name`, `last_name`, `is_active` |
| `roles` | `role_name`, `is_active` |
| `userroles` | `user_id` ↔ `role_id` (many-to-many) |
| `roleprivileges` | `role_id` ↔ `permission` (string key) |
| `categories` | `name`, `is_active` |
| `auditlogs` | `email`, `location`, `proc_type`, `log` (mixed) |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose

### Run with Docker (Recommended)

```bash
git clone https://github.com/ErdemSusam23/nodejs.git
cd nodejs

# Start all services (backend + frontend + mongodb)
docker-compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:3000/api |
| API Docs | http://localhost:3000/api/docs |
| MongoDB | localhost:27017 |

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
CONNECTION_STRING=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE_TIME=86400
DEFAULT_LANGUAGE=EN
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📡 API Overview

All responses follow a standard wrapper:

```json
{
  "code": 200,
  "data": { },
  "error": null
}
```

> ⚠️ **Note:** All write operations (`add`, `update`, `delete`) use `POST` method. Update and delete operations require `_id` in the request body.

| Resource | Endpoint | Method |
|---|---|---|
| Login | `/api/users/login` | POST |
| List Users | `/api/users` | GET |
| Add User | `/api/users/add` | POST |
| Update User | `/api/users/update` | POST |
| Delete User | `/api/users/delete` | POST |
| List Roles | `/api/roles` | GET |
| Add Role | `/api/roles/add` | POST |
| Role Privileges | `/api/roles/role_privileges` | GET |
| System Permissions | `/api/roles/permissions` | GET |
| List Categories | `/api/categories` | GET |
| Audit Logs | `/api/auditlogs` | POST |

Full documentation available at `/api/docs` (Swagger UI).

---

## ☁️ Deploy

| Service | Platform | Notes |
|---|---|---|
| Database | MongoDB Atlas (M0 Free) | 512MB, always on |
| Backend | Railway (Free tier) | ~$0.5–1/mo from $5 free credit |
| Frontend | Vercel (Free tier) | Unlimited |

### Production Environment Variables

**Railway (Backend):**
```
CONNECTION_STRING=mongodb+srv://...
JWT_SECRET=...
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Vercel (Frontend):**
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📄 License

MIT