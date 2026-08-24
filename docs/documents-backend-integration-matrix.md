# Nexucon Government Agency Dashboard - Documents Backend Integration Matrix

This matrix maps every user interface action, button, filter, form, and table interaction across the 7 sub-routes of the **Government Documents** domain to its corresponding backend API, service layer, authorization permission, audit event, and notification workflow.

---

## Centralized Document Architecture Principles

1. **Shared Evidence & Records System**: Documents are treated as a shared government record that naturally flows through Project $\rightarrow$ Drawing / Technical Document $\rightarrow$ BIM Review $\rightarrow$ Inspection $\rightarrow$ Compliance $\rightarrow$ Approval $\rightarrow$ Approved Record $\rightarrow$ Version History + Audit.
2. **Immutable Versioning**: Historical document revisions are never overwritten; each revision creates a new `DocumentVersion` with commit metadata and author provenance.
3. **Official Digital Stamping & Verification**: Government digital stamps and signatures create cryptographically verifiable `Approval` and `DocumentReview` records with hash signatures.
4. **Cloudflare R2 Object Storage**: Real file assets are stored in the Cloudflare R2 bucket (`nexucondocument`) with metadata, size, format, page counts, and secure retrieval URLs.

---

## Comprehensive Integration Matrix

| Page | UI Action / Component | Existing Handler | Existing API | Missing API / Enhancements | Backend Service | Permission | Audit Event | Notification | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/documents/project` | **Project Folder Navigation** (Open project directory) | State setter | None (Static) | `GET /api/v1/projects/` & `GET /api/v1/documents/folders/?project={id}` | `DocumentService.get_project_folders` | `documents.view_document` | `PROJECT_FOLDER_ACCESSED` | None | **Planned** |
| `/documents/project` | **Sub-folder Drilldown** (e.g. 01_Architectural, 02_Structural) | Filter state | None | `GET /api/v1/documents/documents/?project={id}&folder={name}` | `DocumentService.get_folder_documents` | `documents.view_document` | `FOLDER_VIEWED` | None | **Planned** |
| `/documents/project` | **Upload Document** (`UploadDocumentDrawer`) | `createDocument()` | `POST /api/v1/documents/documents/` | Multipart file upload with R2 storage integration | `DocumentService.upload_document` | `documents.add_document` | `DOCUMENT_UPLOADED` | `DOCUMENT_SUBMITTED` | **Planned** |
| `/documents/project` | **Toggle Star Document** | `toggleStarDocument()` | `POST /api/v1/documents/documents/{id}/star/` | Connect to backend service | `DocumentService.toggle_star` | `documents.change_document` | `DOCUMENT_STARRED` | None | **Planned** |
| `/documents/project` | **Apply Digital Stamp & Seal** (`DigitalSignatureStampModal`) | `applyDigitalStamp()` | `POST /api/v1/documents/documents/{id}/stamp/` | Official signature hash & certificate generation | `DocumentService.apply_digital_signature_stamp` | `documents.approve_document` | `DOCUMENT_DIGITALLY_STAMPED` | `DOCUMENT_STAMPED_APPROVED` | **Planned** |
| `/documents/project` | **Push New Revision** (`UploadDocumentVersionModal`) | `createDocumentVersion()` | `POST /api/v1/documents/documents/{id}/create-version/` | R2 upload & immutable versioning | `DocumentService.create_version` | `documents.add_documentversion` | `DOCUMENT_VERSION_CREATED` | `DOCUMENT_REVISION_UPLOADED` | **Planned** |
| `/documents/project` | **Download Document** | Toast handler | None | `GET /api/v1/documents/documents/{id}/download/` | `DocumentService.get_download_url` | `documents.view_document` | `DOCUMENT_DOWNLOADED` | None | **Planned** |
| `/documents/project` | **Tab Filters** (All / Shared / Starred) | Tab state | `GET /api/v1/documents/documents/` | `?starred=true`, `?shared=true` query params | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/drawings` | **Load Submitted 2D Drawings** | `fetchDrawings()` | `GET /api/v1/documents/documents/?type=DRAWING` | Type-safe filtering for `SUBMITTED_DRAWING` & `DRAWING` | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/drawings` | **Discipline Filter** (Architecture, Structural, MEP, Planning) | State filter | `?discipline={d}` | Query param filtering on `DocumentViewSet` | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/drawings` | **Upload Drawing CTA** | `UploadDocumentDrawer` | `POST /api/v1/documents/documents/` | Preselect `document_type='SUBMITTED_DRAWING'` | `DocumentService.upload_document` | `documents.add_document` | `DRAWING_SUBMITTED` | `DRAWING_SUBMISSION_ALERT` | **Planned** |
| `/documents/drawings` | **Link Drawing to BIM Model** | None | None | `POST /api/v1/documents/documents/{id}/link-bim/` | `DocumentService.link_to_bim_model` | `documents.change_document` | `DRAWING_LINKED_TO_BIM` | None | **Planned** |
| `/documents/reports` | **Load Technical Reports** | `fetchReports()` | `GET /api/v1/documents/documents/` | Scope to `TECHNICAL_REPORT` / `REPORT` & discipline | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/reports` | **Report Type & Advanced Filter** | State filter | None | `?discipline={d}&status={s}` filter endpoints | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/reports` | **Download Technical Report** | Toast handler | None | `GET /api/v1/documents/documents/{id}/download/` | `DocumentService.get_download_url` | `documents.view_document` | `REPORT_DOWNLOADED` | None | **Planned** |
| `/documents/compliance` | **Load Compliance Metrics & Records** | `fetchCompliance()` | `GET /api/v1/documents/stats/` & `GET /api/v1/documents/documents/` | Dynamic stats calculation for expiry, approval rate | `DocumentStatsViewSet.list` | `documents.view_document` | None | None | **Planned** |
| `/documents/compliance` | **Link Document to Compliance Case** | None | None | `POST /api/v1/documents/documents/{id}/link-compliance/` | `DocumentService.link_to_compliance_case` | `documents.change_document` | `DOCUMENT_LINKED_COMPLIANCE` | None | **Planned** |
| `/documents/inspection-reports` | **Load Inspection Reports** | `fetchReports()` | `GET /api/v1/documents/documents/?type=INSPECTION_REPORT` | Linkage to originating inspection ID and findings | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/inspection-reports` | **Filter by Inspection Type** (Safety, Quality, Environmental) | State filter | `?discipline={d}` | Query param filtering on inspection reports | `DocumentViewSet.get_queryset` | `documents.view_document` | None | None | **Planned** |
| `/documents/inspection-reports` | **Originating Inspection Linkage** | None | None | `POST /api/v1/documents/documents/{id}/link-inspection/` | `DocumentService.link_to_inspection` | `documents.change_document` | `INSPECTION_REPORT_LINKED` | None | **Planned** |
| `/documents/approvals` | **Load Stamped Approvals Vault** | `fetchApprovals()` | `GET /api/v1/documents/approvals/` | Rich serialization with digital stamp seal, signature hash, and version provenance | `ApprovalViewSet.get_queryset` | `documents.view_approval` | None | None | **Planned** |
| `/documents/approvals` | **Verify & Share Approval Seal** | Toast handler | None | `GET /api/v1/documents/approvals/{id}/verify/` | `DocumentService.verify_approval_signature` | `documents.view_approval` | `APPROVAL_SEAL_VERIFIED` | None | **Planned** |
| `/documents/approvals` | **Download Stamped PDF** | Toast handler | None | `GET /api/v1/documents/approvals/{id}/download-stamped/` | `DocumentService.get_stamped_download_url` | `documents.view_approval` | `STAMPED_RECORD_DOWNLOADED` | None | **Planned** |
| `/documents/versions` | **Load Document Versions Timeline** | `fetchVersionsData()` | `GET /api/v1/documents/versions/?document={id}` | Multi-project grouped document selector with optgroups | `VersionViewSet.get_queryset` | `documents.view_version` | None | None | **Planned** |
| `/documents/versions` | **Compare Document Versions** | None | None | `POST /api/v1/documents/versions/compare/` | `DocumentService.compare_versions` | `documents.view_version` | `DOCUMENT_VERSIONS_COMPARED` | None | **Planned** |
| `/documents/versions` | **Download Historical Version** | Toast handler | None | `GET /api/v1/documents/versions/{id}/download/` | `DocumentService.get_version_download_url` | `documents.view_version` | `HISTORICAL_VERSION_DOWNLOADED` | None | **Planned** |

---

## Cross-Module Integration Touchpoints

1. **BIM & Model Review Integration** ([`apps/bim`](file:///Users/mac/Desktop/Nexucon/backend/apps/bim)):
   - Submitted 2D Drawings can link to a corresponding 3D `BIMModel` and `BIMModelVersion`.
2. **Inspections Integration** ([`apps/inspections`](file:///Users/mac/Desktop/Nexucon/backend/apps/inspections)):
   - Inspection reports link directly to their originating statutory `Inspection` record.
3. **Compliance Integration** ([`apps/compliance`](file:///Users/mac/Desktop/Nexucon/backend/apps/compliance)):
   - Compliance documents link directly to active `ComplianceCase` and `SiteFinding` records.
4. **Approvals Integration** ([`apps/approvals`](file:///Users/mac/Desktop/Nexucon/backend/apps/approvals)):
   - Approval records reference the exact document version approved, maintaining digital signature hashes.
5. **Activity & Audit Integration** ([`apps/audit`](file:///Users/mac/Desktop/Nexucon/backend/apps/audit)):
   - All document lifecycle operations (upload, version creation, digital stamp, review, download, archive) record immutable audit entries.
6. **Notifications Integration** ([`apps/notifications`](file:///Users/mac/Desktop/Nexucon/backend/apps/notifications)):
   - Automated alerts dispatched to project stakeholders and government reviewers upon new document submissions, reviews, stamps, and approvals.
