# Assessify — Enterprise Online Assessment Platform

A production-grade full-stack online assessment platform for company hiring, similar to HackerRank / DoSelect / Mettl.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, ShadCN UI |
| Backend | Node.js, NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache & Queue | Redis, BullMQ |
| Auth | JWT + Refresh Token + RBAC |
| Realtime | WebSocket (Socket.IO) |
| File Storage | AWS S3 Compatible (MinIO) |
| Monitoring | Winston, Prometheus, Grafana |
| Deployment | Docker, Docker Compose, Kubernetes, GitHub Actions |

## Features

- **Authentication & Authorization**: JWT, refresh tokens, RBAC (Super Admin, Recruiter, Interviewer, Candidate, Proctor)
- **System Check Module**: Browser, webcam, mic, internet speed, fullscreen, tab-switch detection
- **Assessment Engine**: MCQ, MSQ, True/False, Coding, SQL, Drag & Drop, Fill-in-the-blank, Video responses
- **Coding Playground**: Monaco Editor, multi-language (Java, Python, JS, C++, Go), Docker sandbox execution
- **Proctoring System**: Webcam capture, face detection, tab-switch, copy/paste restriction, screenshot capture
- **Admin Dashboard**: User management, analytics, reports, violation monitoring, leaderboards
- **Security**: CSRF, XSS prevention, rate limiting, helmet, anti-cheat measures
- **API Testing Module**: Integrated REST API testing workspace (Postman/Hoppscotch-like) with collections, environments, request execution, history, team collaboration, SSRF protection, WebSocket real-time updates, and BullMQ-based execution queue

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Development

```bash
# Clone the repository
git clone <repo-url>
cd assessify

# Start infrastructure
docker compose up -d postgres redis minio

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Docker Compose (Full Stack)

```bash
docker compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs (Swagger): http://localhost:4000/api/docs
- MinIO Console: http://localhost:9001
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

## Project Structure

```
assessify/
├── frontend/          # Next.js 15 application
├── backend/           # NestJS application
├── docker/            # Nginx, Prometheus, Grafana configs
├── k8s/               # Kubernetes manifests
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml
```

## API Testing Module

The platform includes an integrated API Testing workspace at `/api-testing`:

**Features:**
- REST API testing (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Request builder with headers, query params, path params, auth (Bearer, Basic, API Key, OAuth2), body (JSON, XML, Form Data, Raw, GraphQL)
- Response viewer with syntax highlighting, pretty JSON, raw/preview modes
- API Collections with nested folders (drag & drop)
- Environment variables and secrets management
- Request history with status codes and response times
- Team collaboration with workspace-level RBAC (Owner, Admin, Editor, Viewer)
- Queue-based request execution via BullMQ
- SSRF protection (blocks internal/private addresses)
- Real-time execution updates via WebSocket
- gRPC-ready architecture

**Backend API endpoints:** `/api/api-testing/*`
**Swagger docs:** `/api/docs` (tag: api-testing)

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required configuration.

## API Documentation

Swagger UI available at `/api/docs` when the backend is running.

## License

MIT
