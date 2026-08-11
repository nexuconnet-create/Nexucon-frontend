# Nexucon Government Agency Dashboard Backend PRD

## 1. Product Overview
Nexucon is a centralized construction supervision and project management system. The Government Agency Dashboard serves as a centralized environment used by regulatory and government bodies to monitor, regulate, verify, and manage construction projects efficiently. It digitizes permit workflows, manages inspection schedules, supports survey/BIM data aggregation, and ensures overall compliance.

## 2. Current Sprint Scope
> **Scope Limit:** This backend sprint is strictly limited to the Government Agency Dashboard. Other Nexucon dashboards (e.g., Professionals, Client, Junior Engineer, Payments, etc.) are outside the current implementation scope, although the architecture is modular enough to accommodate them in the future.

## 3. Business Objectives
- Centralize government project oversight.
- Digitize permit and regulatory workflows.
- Manage inspection activities.
- Monitor construction sites via reality capture (Digital Eye).
- Manage project documentation.
- Track compliance and issue approvals.
- Support survey and positioning workflows via Tersus.
- Support BIM integrations (Autodesk/Trimble/IFC).
- Provide robust auditability.
- Provide structured, versioned REST APIs to the completed Next.js frontend.

## 4. Government Dashboard Modules
*Note: These correspond directly to the frontend routes observed.*

### Government Command Center / Analytics
Aggregated visibility into projects, applications, permits, inspections, site issues, and performance indicators.

### Projects
Tracks All, Active, Completed, Pending, and Flagged projects. Includes project monitoring capabilities.

### Applications & Permits
Tracks the lifecycle of permit applications (Submitted, Under Review, Approved, Rejected, Expired/Renewals).

### Inspections
Manages inspection requests, schedules, active inspections, findings, re-inspections, and comprehensive reports.

### Site Monitoring & Digital Eye (Reality Capture)
- Live Site View and Construction Milestones.
- Scan library, Scan Sessions, Scan-to-BIM.
- Multi-sensor fusion (LiDAR, RGB, Thermal) & 3D Gaussian Splatting (3DGS).
- AI Analysis and QA/QC insights (Thermal Anomaly Detection, Multi-modal Verification, Deviation heatmaps).
- Edge processing integration and pipeline management for field devices.

### Issues (Centralized Management)
Unified ticketing module for assigning AI-detected defects, BIM geometric clashes, and general site observations to responsible stakeholders.

### Stakeholders
Manage consultants, contractors, developers, inspectors, professionals, and teams involved in projects.

### Settings
System-level and agency-level configuration including standard operating procedures (SOPs), templates, workflows, roles, and users.

### Project Documents
File handling abstraction. Database stores metadata/approvals while Object Storage stores actual files (PDF, DWG, RVT, etc.).

### BIM & Design
Vendor-agnostic integration layer for Autodesk Construction Cloud, Trimble Connect, and IFC models.
- Features Model Comparison and Scan-to-BIM alignment.
- Geometric Clash Detection matrix and Coordination Issues.
- 4D Progress Validation against construction schedules.

### Compliance & Approvals
Tracking requirements, non-conformance, corrective actions, and a centralized workflow for government decisions.

### Notifications & Audit
In-app and email notification dispatchers. Full traceability of critical actions (user, action, timestamp, metadata).


## 5. Microservices Architecture Mapping
To support enterprise scalability and adhere to the architectural review, the backend is designed as modular Django apps that map directly to the required Microservices. In a future iteration, these can be decoupled into separate physical services.

### 5.1 Digital Eye Services
- **Scan Session Service:** Manages planning and execution of field captures.
- **Upload Service:** Handles ingestion of LiDAR, RGB, Thermal, GPS, and 3DGS data.
- **Processing Pipeline Service:** Orchestrates cloud and edge device pipelines.
- **BIM Alignment Service:** Aligns scan point clouds to design coordinates.
- **Deviation Analysis Service:** Generates heatmaps of spatial deviations.
- **Clash Detection Service:** Detects hard/soft geometric clashes.
- **Progress Validation Service:** Validates 4D schedule against 3D as-built data.
- **Thermal Anomaly Detection Service:** AI-driven thermal defect identification.
- **Defect Detection Service:** AI model integration for physical defect detection.
- **Report Generation Service:** Aggregates findings into automated PDFs.

### 5.2 BIM Services
- **BIM Model Storage Service:** Manages IFC/RVT file metadata.
- **Model Version Control Service:** Tracks iterative design changes.
- **Model Comparison Service:** Computes diffs between model versions.
- **Digital Stamp/Approval Service:** Cryptographically seals and certifies approved BIMs.
- **Regulatory Compliance Service:** Validates designs against building codes.
- **Conditional Approval Service:** Manages "Approved Subject To..." workflow gates.

### 5.3 Government-Specific Services
- **Stop-Work Order Service:** Critical enforcement mechanism for site suspension.
- **Regulatory Escalation Service:** Automated escalation paths for non-compliance.
- **Government System Integration Service:** Bridges CAC, LASRRA, e-GIS, and FMW APIs.
- **Tamper-Proof Audit Service:** Blockchain-style hashing for evidentiary logs.
- **Delegation of Authority Service:** Manages dynamic approval limits (e.g., ₦50M+ thresholds).
- **Risk Assessment Service:** Calculates Structural Risk Index for building collapse prevention.
- **License Validation Service:** Real-time credential tracking for professionals and companies.

## 6. Domain Model / Database Architecture (Implemented/Planned)
**Implemented Base Models:**
- `accounts.User`: Custom User extending AbstractUser.
**Planned Models (To be implemented in Week 1/2):**
- `government`: `Agency`, `Profile`, `Role`
- `projects`: `Project`, `ProjectMilestone`
- `applications`: `Application`, `Permit`
- `inspections`: `Inspection`, `Checklist`, `Finding`
- `stakeholders`: `Consultant`, `Contractor`, `Inspector`
- `digital_eye`: `ScanSession`, `PointCloud`, `GaussianSplatAsset`, `DeviationHeatmap`, `Anomaly`, `EdgeDeviceWebhook`
- `bim`: `BIMModel`, `BIMModelVersion`, `ClashDetection`, `ProgressValidation`
- `issues`: `Issue`, `IssueComment`, `IssueAttachment`
- `documents`: `Document`, `Version`, `Approval`
- `audit`: `AuditLog`

## 7. Geospatial Architecture
**Configured:**
- PostgreSQL with PostGIS extension.
- GeoDjango `django.contrib.gis` backend.
**Planned Implementation:**
- Survey coordinates, Point geometries, and Site boundaries (Polygons) will be stored using PostGIS geometry fields with proper spatial indexing to support distance calculations and GNSS verifications.

## 8. Integration Architecture
### Tersus Integration (Pending External Dependency)
- **Status:** Architecture stubbed in `apps.tersus` and `integrations.tersus`.
- **Planned:** Device registration, GNSS session synchronization, position logs.
- **Dependency:** Requires Tersus API credentials and SDK documentation.

### BIM Integration (Pending External Dependency)
- **Status:** Architecture stubbed in `apps.bim` and `integrations.{autodesk,trimble}`.
- **Planned:** Provider abstractions to decouple the database from specific vendors.
- **Dependency:** Requires Autodesk/Trimble OAuth credentials.

### Storage & Documents
- **Status:** Architecture stubbed in `integrations.storage`.
- **Planned:** Abstraction layer over AWS S3 (or similar) to handle large file uploads (DWG, IFC, etc.) without blooming the PostgreSQL database.

## 9. Authentication & RBAC Architecture
- **Configured:** JWT authentication using `djangorestframework-simplejwt`.
- **Planned:** Login, logout, refresh workflows. Role-Based Access Control mapped to Django permissions (e.g., `projects.view`, `permits.approve`).

## 10. API Architecture
- **Configured:** Prefix `/api/v1/`. OpenAPI/Swagger documentation enabled via `drf-spectacular` at `/api/v1/schema/swagger-ui/`.
- **Standards:** JSON responses, standard HTTP status codes, pagination (LimitOffset/PageNumber to be configured), consistent error handling.

## 11. Asynchronous Processing
- **Configured:** Celery with Redis broker (`redis://redis:6379/0`).
- **Planned:** Background tasks for sending emails, report generation, Tersus synchronization, and AI point cloud processing.

## 12. Security Requirements
- Secure password hashing (Django defaults).
- JWT token expiration (Access: 60m, Refresh: 24h).
- CORS headers configured (needs domain-specific lockdown in production).
- PostgreSQL data isolated in volume.

## 13. Infrastructure Architecture
- **Configured:** Dockerized development environment (`docker-compose.yml` and `Dockerfile`) encompassing Django, PostGIS, Redis, and Celery.
- **Configured:** `.env` secret management.

---

## 14. Two-Week Implementation Roadmap

### Week 1
- [x] Backend foundation, project initialization, Docker setup.
- [ ] Implement robust `accounts` and `government` profiles with RBAC.
- [ ] Implement `projects`, `stakeholders`, and `applications`/`permits` models.
- [ ] Implement `inspections` and `documents` models.
- [ ] Connect core API routes to the Next.js frontend services.
- [ ] Setup API response standards and common exceptions.

### Week 2
- [ ] Implement `digital_eye` models using GeoDjango (PostGIS) targeting 3DGS, Thermal anomalies, and Edge processing pipelines.
- [ ] Implement the central `issues` tracking system for BIM clashes and AI defects.
- [ ] Establish integration interfaces for Tersus and BIM (including Progress Validation workflows).
- [ ] Implement `compliance` and `approvals` logic.
- [ ] Build asynchronous processing workflows (Notifications, Audit, Reports).
- [ ] Complete robust Pytest suites for primary endpoints.
- [ ] Prepare for staging deployment.

## 15. Outstanding Dependencies & Risks
- **Tersus SDK/API Details:** Required to finalize the GNSS integration.
- **Autodesk/Trimble Client IDs:** Required for BIM OAuth flows.
- **Storage Credentials (AWS S3):** Required before document upload workflows can be tested.
- **Frontend Integration:** Ensuring the implemented Django serializers strictly match the Typescript interfaces defined implicitly in the Next.js application.
