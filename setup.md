# MAHASETU — Setup & Installation Guide

## 1. Prerequisites
Ensure the following tools are installed on your local development machine:
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Python:** v3.11 or higher
- **PostgreSQL:** v16 or higher (or via Docker)
- **Redis:** v7 or higher (or via Docker)
- **Docker & Docker Compose:** Required for containerized execution

---

## 2. Environment Variables Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```env
# Application Mode
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO

# Backend Settings
SECRET_KEY=mahasetu_sih_2026_super_secret_jwt_key_change_in_prod
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration
POSTGRES_USER=mahasetu_user
POSTGRES_PASSWORD=mahasetu_pass
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mahasetu_db
DATABASE_URL=postgresql+asyncpg://mahasetu_user:mahasetu_pass@localhost:5432/mahasetu_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# Department Mock Adapters Latency Simulation (ms)
MOCK_ADAPTER_LATENCY_MS=200

# CORS Allowed Origins
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
```

---

## 3. Local Development Setup (Manual Mode)

### Step 1: Start Database Services via Docker (Recommended for DB/Cache)
```bash
docker run -d --name mahasetu-pg -e POSTGRES_USER=mahasetu_user -e POSTGRES_PASSWORD=mahasetu_pass -e POSTGRES_DB=mahasetu_db -p 5432:5432 postgres:16-alpine
docker run -d --name mahasetu-redis -p 6379:6379 redis:7-alpine
```

### Step 2: Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations / seed script
python -m app.scripts.seed_db

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend will be available at: `http://localhost:8000`  
OpenAPI Documentation: `http://localhost:8000/docs`

### Step 3: Frontend Setup (React + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## 4. Full Containerized Execution (Docker Compose)

To launch the entire MahaSetu infrastructure (Frontend, Backend, PostgreSQL, Redis) with a single command:

```bash
# From the project root directory
docker-compose up --build -d
```

### Services Endpoints:
- **Citizen / Admin Portal:** `http://localhost:5173`
- **Backend Gateway API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **PostgreSQL Database:** `localhost:5432`
- **Redis Cache:** `localhost:6379`

To stop all services:
```bash
docker-compose down -v
```

---

## 5. Verification Commands

Check if backend health endpoint is responding:
```bash
curl http://localhost:8000/api/v1/health
```

Expected Response:
```json
{
  "status": "HEALTHY",
  "components": {
    "database": "CONNECTED",
    "redis": "CONNECTED"
  }
}
```
