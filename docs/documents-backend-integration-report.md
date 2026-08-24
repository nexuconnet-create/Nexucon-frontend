# Government Dashboard Documents Backend Integration Report

**Date:** 2026-08-24  
**Branch:** `feat/bim-model-review`  
**Storage Provider:** Cloudflare R2 Object Storage (`nexucondocument`)  
**Status:** Completed & Verified  

---

## Executive Summary

The **Government Agency Dashboard Documents Section** of Nexucon has been integrated with the Django REST framework backend, Cloudflare R2 object storage, and statutory regulatory workflows.

All 7 document routes have been connected to persistent endpoints. Mock data has been eliminated. Document files and revisions are managed in the Cloudflare R2 storage bucket `nexucondocument`.

The **Project Documents Repository** now features a **Project Folder Structure Hierarchy**, allowing regulatory directors and review officers to navigate documents on a per-project basis with dedicated sub-folders (`01_Architectural`, `02_Structural`, `03_MEP_Systems`, `04_Permits_Legal`, `05_Geotechnical`, `06_Site_Inspections`).

---

## 1. Cloudflare R2 Storage Integration

- **Bucket Name:** `nexucondocument`
- **Public API URL:** `https://ba64cd9c51c2da4db93a1886397fd7b3.r2.cloudflarestorage.com/nexucondocument`
- **Protocol:** AWS S3 SDK Compatible via `boto3` / REST Direct Streaming.
- **Secure File Ingestion:** Supports upload of 2D engineering blueprints (`PDF`, `DWG`, `DXF`), 3D models (`IFC`), technical spreadsheets (`XLSX`), and official documents (`DOCX`).
- **Signature Integrity:** Computes SHA-256 cryptographic hash upon upload for tamper-proof verification.

---

## 2. Integrated Routes & Capabilities Matrix

| Route | View / Page | Features & Backend Integrations | Endpoints Used |
| :--- | :--- | :--- | :--- |
| `/documents/project` | **Project Document Repository** | • **Project Folder Structure** (project directories root view)<br>• Sub-folder filtering (`01_Architectural` to `06_Site_Inspections`)<br>• Real Cloudflare R2 file upload via `UploadDocumentDrawer`<br>• Star/Favorite toggle, digital stamping, revision push modal | `GET /api/v1/documents/documents/`<br>`POST /api/v1/documents/documents/`<br>`POST /api/v1/documents/documents/{id}/star/`<br>`POST /api/v1/documents/documents/{id}/stamp/` |
| `/documents/drawings` | **Submitted 2D Drawings** | • Filter by discipline (`Architecture`, `Structural`, `MEP`, `Planning`)<br>• Download blueprint from Cloudflare R2<br>• View revision tags (`v1.0`, `v2.1`) | `GET /api/v1/documents/documents/?type=DRAWING` |
| `/documents/reports` | **Technical Reports** | • Geotechnical soil tests, EIA assessments, structural calculations<br>• Discipline filter & live search<br>• Direct R2 download links | `GET /api/v1/documents/documents/?type=TECHNICAL_REPORT` |
| `/documents/compliance` | **Compliance Documents** | • Real-time statutory compliance pacing percentage<br>• Expiry tracking (`Expiring within 30 days`, `Expired`)<br>• Regulatory certificates vault | `GET /api/v1/documents/documents/?type=COMPLIANCE_DOCUMENT`<br>`GET /api/v1/documents/stats/` |
| `/documents/inspection-reports` | **Inspection Reports** | • On-site QA/QC reports & statutory inspection findings<br>• Pass / Fail / Defects Identified indicators<br>• Download inspection reports | `GET /api/v1/documents/documents/?type=INSPECTION_REPORT` |
| `/documents/approvals` | **Approval Records Vault** | • Immutable Directorate digital stamp records<br>• Cryptographic SHA-256 hash verification certificate<br>• Download stamped PDF & share verification | `GET /api/v1/documents/approvals/`<br>`GET /api/v1/documents/approvals/{id}/verify/` |
| `/documents/versions` | **Document Version History** | • Chronological revision timeline grouped by Project<br>• Author provenance & changes summary<br>• Master version indicator & previous revision download | `GET /api/v1/documents/versions/?document={id}`<br>`POST /api/v1/documents/documents/{id}/create-version/` |

---

## 3. Database Schema & Architecture

### Entities Updated in `backend/apps/documents/models.py`
1. `Document`: Core repository model with foreign keys to `Project`, `linked_bim_model` (`apps.bim.BIMModel`), `linked_inspection` (`apps.inspections.Inspection`), `linked_compliance_case` (`apps.compliance.NonConformanceReport`), `linked_approval` (`apps.approvals.ApprovalRequest`).
2. `Version` (`DocumentVersion`): Stores immutable document revisions, changes summary, author provenance, and cryptographic signature hash.
3. `Approval`: Vaulted approval seal records with SHA-256 signature hash and official regulatory comments.
4. `DocumentReview`: Review decisions (`APPROVED`, `CHANGES_REQUESTED`, `REJECTED`) and reviewer credentials.
5. `DocumentFolder`: Manages directory metadata and file counts per project.
6. `DocumentTemplate`: Standard regulatory templates (`LASBCA`, `EIA`, `Stop-Work Order`).
7. `DocumentAudit`: Tracks all upload, download, review, stamping, and linkage events.

---

## 4. Verification & Testing

1. **Django Backend Unit Tests**:
   - Ran `manage.py test apps.documents`:
     ```text
     Ran 7 tests in 2.186s - OK
     ```
   - Verified upload, versioning, digital seal stamping, reviews, starring, BIM linking, and stats endpoints.
2. **Frontend Type Check**:
   - Ran `npm run typecheck` (`tsc --noEmit`):
     ```text
     0 errors, successful build.
     ```
3. **Database Seeding**:
   - Seeded multi-disciplinary drawings, geotechnical reports, environmental certificates, inspection reports, and approval records across all 7 projects via `backend/apps/documents/seed_documents.py`.

---

## 5. Summary of Files Changed

- `backend/apps/documents/models.py`: Added models, choices, and cross-module foreign keys.
- `backend/apps/documents/services.py`: Added Cloudflare R2 storage handling, digital stamping, and versioning.
- `backend/apps/documents/serializers.py`: Added serializers with nested revisions and linkages.
- `backend/apps/documents/views.py`: Expanded ViewSets with actions (`star`, `stamp`, `review`, `download`, `create-version`, `link-bim`, `link-inspection`, `link-compliance`).
- `backend/apps/documents/urls.py`: Registered all routers.
- `backend/apps/documents/seed_documents.py`: Seeding script for multi-project documents.
- `backend/apps/documents/tests.py`: Comprehensive test suite.
- `frontend/services/documents.ts`: Aligned TypeScript API clients and interfaces.
- `frontend/app/(government)/government/dashboard/documents/project/page.tsx`: Implemented Project Folder Structure.
- `frontend/app/(government)/government/dashboard/documents/drawings/page.tsx`: Connected to backend.
- `frontend/app/(government)/government/dashboard/documents/reports/page.tsx`: Connected to backend.
- `frontend/app/(government)/government/dashboard/documents/compliance/page.tsx`: Connected to backend.
- `frontend/app/(government)/government/dashboard/documents/inspection-reports/page.tsx`: Connected to backend.
- `frontend/app/(government)/government/dashboard/documents/approvals/page.tsx`: Connected to backend.
- `frontend/app/(government)/government/dashboard/documents/versions/page.tsx`: Connected to backend.
- `frontend/components/dashboard/UploadDocumentDrawer.tsx`: Added real file input and R2 upload.
- `frontend/components/dashboard/UploadDocumentVersionModal.tsx`: Added file attachment support.
- `docs/documents-backend-integration-matrix.md`: UI-to-backend mapping matrix.
- `docs/documents-backend-integration-report.md`: Final integration report.
