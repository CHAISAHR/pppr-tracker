# Capacity Tracker module

Promote before/after capacity tracking from an embedded section on Event Schedule into a standalone module with its own page, sidebar entry, and shared storage (so all users see the same data).

## What the user gets

A new **Capacity Tracker** item in the left sidebar (between Event Schedule and Organisations). It opens a page listing all capacity assessments, each linked to an event. From there users can:

- See a summary table of every tracked event: event name, date, # participants, average change per competency.
- Click an event to open a details dialog showing per-participant before/after scores and computed change.
- Add a new capacity record: pick an existing event (from Event Schedule), define competencies for that event, and add participants with 1-5 scores before and after.
- Edit or delete records (admin or the record's creator).
- Export the data to Excel (admin only), matching the pattern used by other trackers.

On the Event Schedule page, the inline "Capacity Outcomes" editor is removed. Instead each event card/details dialog shows a small read-only summary ("3 participants assessed, +0.8 avg change") with a link that jumps to the Capacity Tracker filtered to that event.

## Structure

```text
Sidebar
  ├── Activity Tracker
  ├── Indicator Tracker
  ├── Event Schedule          ← capacity editor removed, summary + link added
  ├── Capacity Tracker        ← NEW
  ├── Organisations
  └── Administration
```

## Technical details

**Routing & nav**
- New route `/capacity` → `src/pages/Capacity.tsx`.
- Add nav entry in `src/components/AppSidebar.tsx` and route in `src/App.tsx`.

**Storage (shared across users/devices)**
- New Lovable Cloud table `public.capacity_assessments`:
  - `id uuid pk`
  - `event_id text` (references the meeting id stored client-side; nullable so records survive event deletion)
  - `event_focus_area text` (denormalised label so the row is readable even if the event is gone)
  - `event_date date`
  - `participant_name text not null`
  - `competency text not null`
  - `pre_score smallint check 1..5`
  - `post_score smallint check 1..5`
  - `created_by uuid` (auth.uid)
  - `created_at`, `updated_at` timestamps
- RLS: anyone authenticated can read; insert/update/delete restricted to admins or `created_by = auth.uid()`. GRANTs to `authenticated` and `service_role`; `SELECT` to `anon` so public read-only viewers see the same data as other trackers.
- One row per (participant × competency × event) keeps schema simple and exports clean. The page assembles rows into per-participant cards in the UI.

**New files**
- `src/pages/Capacity.tsx` — list, filters (event, competency), summary table.
- `src/components/capacity/AddCapacityRecordDialog.tsx` — pick event, define competencies, add participants.
- `src/components/capacity/EditCapacityRecordDialog.tsx`
- `src/components/capacity/CapacityDetailsDialog.tsx` — per-participant table reused from current `CapacityAssessmentsEditor` view logic.
- `src/components/capacity/CapacityExcelExport.tsx`
- `src/lib/capacity.ts` — Supabase CRUD helpers + realtime subscription emitting `capacity-changed`.

**Files edited**
- `src/components/MeetingDetailsDialog.tsx` — replace the inline outcomes section with a compact summary + "View in Capacity Tracker" link. Drop `competencies` / `capacityAssessments` fields from the `Meeting` type.
- `src/components/AddMeetingDialog.tsx`, `src/components/EditMeetingDialog.tsx` — remove the capacity editor block and related form state.
- `src/components/AppSidebar.tsx`, `src/App.tsx` — add nav + route.

**Files removed**
- `src/components/CapacityAssessmentsEditor.tsx` (logic moves into the new capacity dialogs).

**Migration of existing data**
- Capacity data added so far lives only in `localStorage` under `meetings` on individual browsers — there is no shared copy to migrate. On first load of the new module the table starts empty; existing meeting records keep their fields but the UI stops reading them.

## Out of scope

- Bulk Excel upload for capacity records (export only for now — can add later if needed).
- Charts/visualisations beyond the average-change table.
- Linking capacity records to attendance from `Organisations`.