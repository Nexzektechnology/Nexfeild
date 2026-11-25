# NexFieldForce — Unified Workforce Platform (HR + Sales Force + Field Operations + AI)

This repository combines the NexFieldForce application with the current EdgeWForce workforce, attendance, collaboration, reporting, and intelligence modules. Operational records, customer exports, employee exports, credentials, upload files, and database dumps are excluded from version control.

## Applications and deployment

- `src/` and `server/` contain the NexFieldForce interface and its MySQL-backed API. Its public registration endpoint is `POST /api/auth/register` and is covered by `server/src/tests/nexfield_registration.test.js`.
- `client/` and `server/src/` contain the Supabase-backed workforce web app and API deployed by `vercel.json`. HR staff registration requires an authorized manager; staff need an assigned workstation for location-restricted sign-in.
- `supabase/install_empty_database.sql` installs the workforce schema without operational records. It was applied to the Nexfeild Supabase project `mpdaomlzhvjytevzucvh` on 25 November 2026. Never run historical seed scripts on a live project.
- Production deployment: https://nexfeild.vercel.app under the `nexzektechnology/nexfeild` Vercel project. Its Supabase URL and API keys are private Vercel environment settings. Do not put secrets in Git. GitHub auto-deploy requires installing Vercel's GitHub app for this repository.
- Media uploads use `nexfeild-media` for field and sales images and `nexfeild-private` for payslips, settlement slips, and signatures. Private uploads return time-limited signed links. Both buckets are provisioned in the Nexfeild Supabase project.
- `supabase/migrations/019_cloud_operational_tables.sql` adds the SOS and operational tables needed by the workforce dashboards. It is included in the clean installer and was applied to the live project after the initial installation.

Run `npm test` for the integrated API tests, `npm run build` for the NexFieldForce interface, and `npm --prefix client run build` for the Vercel interface.

## 1. Overview

**NexFieldForce** is a unified workforce operating system combining:
* **Human Resources Management (HRM)**: Employee Directory, Recruitment ATS, Onboarding, Attendance, Leave Management, Performance & Appraisals, Document Compliance.
* **Staff Self-Service**: Clock-In / Clock-Out, Leave Requests, Assigned Tasks, Goals, Announcements.
* **Commercial Sales Force Automation (Commercial CRM)**: Outlets Directory, Customer Live Map, Sales Order Placement with live calculations, 5% Commission Tracking, Sales Targets Leaderboard.
* **Field Force Cockpit**: Verified GPS Proof of Visits, Route Waypoint Navigator, Mobile Work Orders, Inventory Visibility, Offline Queue Sync.
* **Operations Supervision & Live Telemetry**: Real-time Leaflet + OpenStreetMap tracking of active agents and route progress.
* **Super Administration**: Manual Market & Territory Creator, Route Creator with direct Agent Assignment, Staff Provisioning with Role Selection, Public Registration Approvals.
* **Workforce AI Copilot**: Parameter-checked database query intelligence across all domains.
* **ERP & CRM Operations Suite**: Tenant-scoped procurement, billing, projects, customer support, marketing campaigns, workflow automation, integration registry, and company calendar.

---

## 2. Dynamic Role Workspaces

| Role | Accessible Modules |
|---|---|
| **`SUPER_ADMIN` / `ADMIN`** | Executive Dashboard, Manual Market Creator, Route Creator & Assigner, Staff Roles, Leave Management, Recruitment ATS, Attendance Roster, Orders & Catalog, Customers, Field Visits Proof, Live OpenStreetMap Telemetry, Registration Approvals, AI Command Center. |
| **`MANAGER` / `CEO` / `FINANCE` / `HR_MANAGER`** | Existing operational modules plus the ERP & CRM Operations suite for procurement, billing, projects, support, campaigns, workflows, integrations, and calendars. |
| **`HR_MANAGER`** | HR Overview, Staff Directory, Leave Approvals & Balances, Recruitment ATS Pipeline, Attendance Timesheets, Document Compliance, HR AI. |
| **`SUPERVISOR` / `MANAGER`** | Supervisor Dashboard, Team Dispatch & Work Orders, Live OpenStreetMap Telemetry, Leave Approvals, Customer Directory, Operations AI. |
| **`SALES_AGENT`** | Commercial CRM, Place Sales Orders (with live discount & total calculation), Customer Directory, Customer Live Map, Targets & 5% Commission, Clock-In / Out, Sales AI. |
| **`FIELD_AGENT`** | Today's Field Cockpit, Record Verified Visit (GPS + Notes + Feedback), Work Orders, Customer Directory, Route & Customer Live Map, Clock-In / Out, Field AI. |
| **`STAFF` / `EMPLOYEE`** | My Workspace, My Attendance (Clock In / Out), Request Leave & Leave Balances, My Tasks, My KPI Goals, Workforce AI. *(Strictly isolated from HR admin, recruitment, leave management, onboarding, and field ops).* |

---

## 3. Real-Time Free Map API
* **Engine**: Integrated **Leaflet + OpenStreetMap API**.
* **Zero API fees & no rate limits**: Smooth real-time GPS telemetry, animated pulsing agent markers, merchant outlet pins, and route paths.

---

## 4. Key Deliverable Files
* [`mysql-schema.sql`](C:\Users\HP\Documents\nexfeildforce\mysql-schema.sql) — Hostinger MySQL production schema.
* [`DATA_RESTORATION.md`](file:///c:/Users/HP/Documents/nexfeildforce/DATA_RESTORATION.md) — Data restoration audit.
* [`DATABASE.md`](file:///c:/Users/HP/Documents/nexfeildforce/DATABASE.md) — Complete 40+ table documentation.
* [`API.md`](file:///c:/Users/HP/Documents/nexfeildforce/API.md) — REST API endpoint specification.
* [`HOSTINGER_DEPLOYMENT.md`](C:\Users\HP\Documents\nexfeildforce\HOSTINGER_DEPLOYMENT.md) — Hostinger Node.js + MySQL deployment instructions.
* [`nexfieldforce-hostinger-mysql-production-20261112.zip`](C:\Users\HP\Documents\nexfeildforce\release\nexfieldforce-hostinger-mysql-production-20261112.zip) — Complete MySQL production deployment package.

## ERP & CRM Extension

The new workspace is available from **ERP & CRM Operations** in the NexFieldForce sidebar for authorized management users. Its APIs are served from `/api/business` and all records are scoped by `company_id` on the server.

Before deployment, import [`mysql-schema.sql`](C:\Users\HP\Documents\nexfeildforce\mysql-schema.sql) through Hostinger phpMyAdmin. It creates the complete MySQL schema, including the additive ERP/CRM and document-governance tables, without requiring Supabase. See [`ENTERPRISE_CAPABILITY_MATRIX.md`](C:\Users\HP\Documents\nexfeildforce\ENTERPRISE_CAPABILITY_MATRIX.md) for the complete 20-module mapping.
