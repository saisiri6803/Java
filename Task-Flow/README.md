# TaskFlow API 

A production-ready **RESTful Task Management API** built with **Node.js**, **Express**, and **MongoDB** (Mongoose). Features JWT-based authentication, full CRUD operations, aggregation-based stats, filtering, pagination, and rate limiting.

##  Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Runtime      | Node.js 18+                        |
| Framework    | Express.js                          |
| Database     | MongoDB + Mongoose ODM              |
| Auth         | JWT (jsonwebtoken) + bcryptjs       |
| Validation   | express-validator                   |
| Security     | helmet, cors, express-rate-limit    |
| Testing      | Jest + Supertest + MongoMemoryServer|

##  Project Structure

```
taskflow-api/
├── src/
│   ├── config/
│   │   └── database.js       # Mongoose connection
│   ├── models/
│   │   ├── User.js            # User schema + password hashing
│   │   └── Task.js            # Task schema + compound indexes
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   └── taskController.js  # CRUD + MongoDB aggregation stats
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # /api/auth routes
│   │   └── tasks.js           # /api/tasks routes
│   ├── app.js                 # Express app config
│   └── server.js              # Entry point (connects DB then starts)
├── tests/
│   └── api.test.js            # Integration tests (MongoMemoryServer)
├── .env.example
└── package.json
```

##  Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas cloud)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/taskflow-api.git
cd taskflow-api

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — set MONGODB_URI and a strong JWT_SECRET

# 4. Start the server
npm run dev       # Development (nodemon)
npm start         # Production
```

### Using MongoDB Atlas (free cloud DB)
1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string and set it in `.env`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
   ```

### Running Tests (no MongoDB install needed)

```bash
npm test
# Uses MongoMemoryServer — spins up a real in-memory MongoDB automatically
```

## 📡 API Reference

### Base URL: `http://localhost:3000/api`

---

### Auth Endpoints

| Method | Endpoint            | Description        | Auth |
|--------|--------------------|--------------------|------|
| POST   | `/auth/register`   | Create new account | No   |
| POST   | `/auth/login`      | Get JWT token      | No   |
| GET    | `/auth/profile`    | Get current user   | Yes   |

**Register**
```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass123"
}
```

---

### Task Endpoints

All require: `Authorization: Bearer <token>`

| Method | Endpoint         | Description               |
|--------|-----------------|---------------------------|
| GET    | `/tasks`         | List tasks (+ filters)   |
| GET    | `/tasks/stats`   | MongoDB aggregated stats  |
| GET    | `/tasks/:id`     | Get single task           |
| POST   | `/tasks`         | Create task               |
| PUT    | `/tasks/:id`     | Update task               |
| DELETE | `/tasks/:id`     | Delete task               |

**Create Task**
```json
POST /api/tasks
{
  "title": "Set up CI/CD pipeline",
  "description": "Configure GitHub Actions",
  "priority": "high",
  "status": "todo",
  "due_date": "2025-12-31",
  "tags": ["devops", "automation"]
}
```

**Query Filters**
```
GET /api/tasks?status=todo&priority=high&search=api&page=1&limit=10
```

**Stats Response** (uses MongoDB `$group` aggregation)
```json
{
  "data": {
    "stats": {
      "byStatus":   { "todo": 3, "in_progress": 1, "done": 5 },
      "byPriority": { "low": 2, "medium": 4, "high": 3 },
      "overdue": 1
    }
  }
}
```

##  Security Features

- **JWT Authentication** — stateless, expiring tokens
- **Password Hashing** — bcrypt via Mongoose pre-save hook (salt rounds 12)
- **Rate Limiting** — 100 req/15min globally, 10 req/15min on auth routes
- **Helmet** — sets secure HTTP headers
- **Input Validation** — all inputs validated and sanitised
- **`select: false`** — password field never returned from DB queries

##  Test Coverage

Uses `mongodb-memory-server` — no external MongoDB needed for tests.

-  User registration & duplicate prevention
-  Login with valid/invalid credentials
-  JWT-protected route enforcement
-  Full task CRUD lifecycle
-  Status filter query
-  Pagination structure
-  Aggregation stats endpoint

##  Future Improvements

- [ ] Task sharing between users
- [ ] Email notifications for due tasks (Nodemailer)
- [ ] Docker + docker-compose setup
- [ ] Swagger / OpenAPI documentation
- [ ] Redis caching for frequent reads


