# 🍽️ Smart KOT System

A production-ready, real-time **Kitchen Order Ticket (KOT) System** built with the MERN stack. Manages the complete restaurant order lifecycle — from customer ordering to kitchen display — with live updates via Socket.IO and a full DevOps pipeline.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Customer   │  │   Kitchen    │  │    Admin     │   │
│  │  (React)    │  │  Dashboard   │  │  Dashboard   │   │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼────────────────┼─────────────────┼────────────┘
          │ REST API        │ Socket.IO        │ REST API
          ▼                ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND (Node.js)              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth API   │  │  Orders API  │  │   Menu API   │   │
│  │  /api/auth  │  │ /api/orders  │  │  /api/menu   │   │
│  └─────────────┘  └──────────────┘  └──────┬───────┘   │
│                                             │ Cache (5m) │
│  ┌─────────────┐  ┌──────────────┐         │            │
│  │ Payment API │  │  Socket.IO   │◄────────┘            │
│  │/api/payment │  │   Server     │                      │
│  └─────────────┘  └──────┬───────┘                      │
└─────────────────────────┼────────────────────────────────┘
                           │ Real-time Events
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     new-order       order-updated    order-deleted
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│                    MongoDB Atlas                         │
│         Collections: users, menuitems, orders            │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse menu, add to cart, place order, track status, pay via Razorpay or cash |
| **Kitchen** | Real-time KOT display, status progression (Pending → Preparing → Ready), cancel orders |
| **Admin** | Full menu management (CRUD), order analytics, user management |

**DevOps:** Docker multi-stage builds · Docker Compose · Jenkins CI/CD · Kubernetes (K8s)

---

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS + Radix UI + Lucide Icons
- Zustand (state management)
- React Router DOM v7
- Socket.io-client + Axios

### Backend
- Node.js + Express 5 + TypeScript
- MongoDB + Mongoose ODM
- JWT Authentication + bcryptjs
- Razorpay Payment Integration
- Socket.IO (real-time)
- express-rate-limit (security)
- In-memory cache (menu, 5-min TTL)

### DevOps
- Docker (multi-stage builds)
- Docker Compose
- Jenkins (CI/CD pipeline)
- Kubernetes (deployments, services, secrets)

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v22.x
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/NAVENKUMAR68/restaurant-kot-system
cd restaurant-kot-system
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Razorpay keys
```

### 3. Seed the Database

```bash
npx tsx backend/src/seed.ts
```

### 4. Run in Development

```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:8001
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartkot.com | password123 |
| Kitchen | kitchen@smartkot.com | password123 |
| Customer | customer@smartkot.com | password123 |

---

## 🐳 Docker Deployment

### Build & Run (Single Command)

```bash
# Build frontend image
docker build -t navenkumar68/smart-kot-frontend .

# Build backend image
docker build -t navenkumar68/smart-kot-backend ./backend

# Run both with Docker Compose
docker compose up -d
```

Access:
- Frontend: http://localhost:80
- Backend API: http://localhost:8000/api
- Health Check: http://localhost:8000/api/health

---

## 🔧 Jenkins CI/CD Pipeline

The `Jenkinsfile` defines a complete automated pipeline:

| Stage | Action |
|-------|--------|
| **Clone** | Pull latest code from GitHub (`main` branch) |
| **Build Images** | Build frontend + backend Docker images in parallel |
| **Push to DockerHub** | Authenticate and push tagged images |
| **Deploy** | `docker-compose down` then `docker-compose up -d` |
| **Health Check** | `docker ps` + container logs verification |

**Required Jenkins Credentials:**
- `dockerhub-creds` — DockerHub username + password

---

## ☸️ Kubernetes Deployment

```bash
# 1. Apply secrets (update values in k8s/backend-secret.yaml first)
kubectl apply -f k8s/backend-secret.yaml

# 2. Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 3. Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# 4. Verify
kubectl get pods
kubectl get services
```

**K8s Features:**
- 2 replicas each (HA)
- Resource requests + limits
- Liveness + readiness probes on `/api/health`
- Secrets via `kot-backend-secret`

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + receive JWT |

### Menu
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/menu` | Get all menu items (cached 5 min) |
| POST | `/api/menu` | Create menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders` | Get all orders (kitchen/admin) |
| GET | `/api/orders/mine` | Get customer's own orders |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Cancel + delete order |
| POST | `/api/orders/pay-bill` | Mark orders as paid |

### Payment
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment signature |

### System
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check (Docker/K8s probe) |

---

## 🔌 Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `new-order` | Server → Clients | Order object | New order placed |
| `order-updated` | Server → Clients | Order object | Status changed |
| `order-deleted` | Server → Clients | Order ID (string) | Order cancelled |

---

## 🔒 Security

- **JWT** authentication with `jsonwebtoken` + `bcryptjs` password hashing
- **Rate limiting** via `express-rate-limit`:
  - Auth routes: 30 requests / 15 min
  - Order/Payment routes: 100 requests / 1 min
- **CORS** restricted to configured frontend origin

---

## 📋 Project Structure

```
smart-kot-system/
├── src/                    # React frontend
│   ├── pages/              # Customer, Kitchen, Admin, Login pages
│   ├── components/         # Navbar, shared UI components
│   ├── store/              # Zustand stores (auth, cart)
│   └── utils/              # Axios instance, socket client
├── backend/
│   └── src/
│       ├── controllers/    # Business logic
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routes
│       ├── middleware/      # Auth middleware
│       └── lib/            # Logger, Cache utilities
├── k8s/                    # Kubernetes manifests
├── Dockerfile              # Frontend multi-stage build
├── backend/Dockerfile      # Backend multi-stage build
├── docker-compose.yml      # Orchestration
├── Jenkinsfile             # CI/CD pipeline
└── .env.example            # Environment variable template
```

---

*Built with ❤️ — Smart KOT System | Production-Grade Restaurant Management*
