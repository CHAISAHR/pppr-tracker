## Goal
Formalize the two-role model (Admin / User), restrict destructive and organisation-management actions to Admins, and introduce an admin-approved sign-up flow with a Facebook-style notification ribbon showing pending user requests.

## 1. Backend (railway/backend, MySQL/Express)

**New table `user_requests`** (migration in `railway/schema.sql`):
- id, name, email (unique), password_hash, organization, status (`pending`/`approved`/`rejected`), requested_at, reviewed_at, reviewed_by

**New routes `/api/user-requests`:**
- `POST /` — public; create a pending request (replaces direct register)
- `GET /` — admin only; list pending requests
- `GET /count` — admin only; pending count (for ribbon polling)
- `POST /:id/approve` — admin only; creates user in `users` table, marks request approved
- `POST /:id/reject` — admin only; marks rejected

**Keep `/api/auth/register`** but mark it unused, OR have it write into `user_requests` instead. We will route it to `user_requests`.

## 2. Frontend permissions

`src/services/api.ts` — add `userRequests` API methods + `requestAccess` (no auto-login).

**Auth page** — re-introduce a "Request Access" tab (replaces the Register tab I removed earlier). Submitting shows "Your request has been sent to an admin for approval." No session is created.

**Permission gates (admin-only via `isAdmin()`):**
- Delete buttons in `ProjectTable`, `IndicatorsTab`, `MeetingTable`, `WorkshopTable`
- All CRUD in `Organisations` page (add/edit/delete) — Users get read-only
- Already done: Excel import/templates on trackers, User Management, Administration

**Kept for General Users:**
- View Activity Tracker, Indicator Tracker, Event Schedule
- Add new Activities & Indicators
- Edit records where `deliveryPartner` matches their `organization` (existing `canEditProject`)
- Access Events/Meetings module

## 3. Notification Ribbon (Facebook-style)

New `PendingRequestsBell` component shown in the top header **only when `isAdmin()`**:
- Bell icon with a red rounded badge showing pending count (hidden when 0; "9+" when >9)
- Click opens a dropdown listing recent pending requests with name/email/org and "Approve" / "Reject" buttons
- "View all" link → `/administration` (new "User Requests" section)
- Polls `/api/user-requests/count` every 30 s; refreshes count on approve/reject

**Administration page** — add a "User Requests" panel above existing sections showing the full pending list with approve/reject actions.

## 4. Tech notes

- The backend is MySQL on Railway, not Supabase — no Supabase migration. The schema change goes in `railway/schema.sql` with a clear "run this in MySQL Workbench" comment, and a sibling `railway/migrations/2026-06-23-user-requests.sql` for the incremental change.
- Mock mode (`MOCK_MODE`) will also implement the request flow against `localStorage` so the UI works without the Railway backend.
- Header layout in `src/App.tsx` gets the bell to the left of the user dropdown.

## Files to add
- `railway/backend/src/routes/userRequests.js`
- `railway/migrations/2026-06-23-user-requests.sql`
- `src/components/PendingRequestsBell.tsx`
- `src/components/UserRequestsPanel.tsx`

## Files to edit
- `railway/backend/src/index.js` (mount new route), `railway/schema.sql`
- `src/services/api.ts` (request endpoints + mock impl)
- `src/pages/Auth.tsx` (Request Access tab)
- `src/App.tsx` (bell in header)
- `src/pages/Administration.tsx` (requests panel)
- `src/pages/Organisations.tsx` (admin-only CRUD)
- `src/components/ProjectTable.tsx`, `src/components/performance/IndicatorsTab.tsx`, meeting/workshop tables (gate delete)

## Out of scope
- Email notifications to admins/users on request/approval
- Self-service password change after approval (admin sets initial password during approval, or we generate one and surface it to the admin)

## Open question (please confirm before I build)
On approval, should the admin **set the password** in a dialog, or should the requester's submitted password be used as-is? Facebook-style flow usually keeps the requester's password; that's the simpler default.
