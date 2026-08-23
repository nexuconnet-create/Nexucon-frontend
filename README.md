# Nexucon - Construction Supervision & Project Management

Nexucon is a centralized construction supervision environment used to monitor, regulate, verify, and manage construction projects. 

## Project Structure

This repository is organized into a modular monolith architecture with independent frontend and backend components.

```
Nexucon/
├── frontend/                   # Next.js 16 App Router application
│   ├── app/                    # Next.js routes
│   │   ├── (government)/       # Government Agency inspection & monitoring dashboard
│   │   ├── (client)/           # Property owner & developer portal
│   │   └── (professional)/     # Licensed Architect/Engineer workspace
│   ├── components/             # Reusable UI components, modals, and side drawers
│   └── services/               # Frontend API clients and data transformers
│
├── backend/                    # Django 5.1 & Django REST Framework application
│   ├── apps/
│   │   ├── monitoring/         # Site monitoring, daily logs, milestones, verifications
│   │   ├── inspections/        # Site inspection scheduling, checklists, and stop-work orders
│   │   ├── projects/           # Capital projects, metadata, geospatial boundaries
│   │   ├── accounts/           # Multi-role authentication & JWT handling
│   │   ├── bim/                # BIM 3D models and clash detection
│   │   └── audit/              # Immutable audit logging & compliance trail
│   └── config/                 # Django settings and routing
```

## Key Features
- **Centralized Project Monitoring:** Track construction projects in real-time with comprehensive details including progress, compliance scores, and key personnel.
- **Document Management:** Securely review, manage, and approve architectural designs, structural calculations, and environmental impact assessments.
- **BIM Integration:** Built-in interactive 3D WebGL viewer placeholder for structural and architectural models.
- **Site Activity Tracking:** Real-time timeline of site inspections, field reports, and document approvals.


## Technology Stack

### Frontend
- Next.js (React)
- Tailwind CSS
- TypeScript

### Backend
- Python 3.11+
- Django & Django REST Framework (DRF)
- PostgreSQL with PostGIS (GeoDjango) for spatial data
- Celery & Redis for asynchronous background tasks
- JWT Authentication (djangorestframework-simplejwt)
- OpenAPI Documentation (drf-spectacular)

## Prerequisites
- Docker and Docker Compose
- Node.js (v20+)
- Python 3.11+ (for local, non-Docker development)

## Local Setup

### 1. Environment Setup
Copy the example environment file for the backend:
```bash
cd backend
cp .env.example .env
```
Update the `.env` file with any required local keys (e.g., AWS S3, Tersus APIs, Autodesk APIs).

### 2. Running the Backend (Docker)
The backend is fully dockerized for development:
```bash
cd backend
docker compose up --build
```
This command spins up:
- PostgreSQL + PostGIS (Port 5432)
- Redis (Port 6379)
- Django API (Port 8000)
- Celery Worker

Once running, you can access:
- API Root: `http://localhost:8000/api/v1/`
- Swagger UI Documentation: `http://localhost:8000/api/v1/schema/swagger-ui/`
- Django Admin: `http://localhost:8000/admin/`
- Health Check: `http://localhost:8000/api/v1/health/`

### 3. Migrations
To run database migrations inside the Docker container:
```bash
cd backend
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

### 4. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## Testing
Run the backend tests using Pytest:
```bash
cd backend
docker compose exec web pytest
```

## Development Conventions
- **Apps**: All Django apps should reside in `backend/apps/`.
- **API Versioning**: All new routes must be prefixed with `/api/v1/`.
- **Business Logic**: Keep views thin. Shift complex domain logic to service layers or model methods.
- **Geospatial Data**: Use GeoDjango's `PointField`, `PolygonField` for anything coordinate-related. Avoid simple float Latitude/Longitude fields.

For detailed architecture information, please refer to the [Government Backend PRD](./docs/GOVERNMENT_BACKEND_PRD.md).
>>>>>>> feature/inspections-and-reviewer-flow
