
ALTER TABLE public.indicators
  ADD COLUMN workstream text,
  ADD COLUMN organisation text,
  ADD COLUMN activity_id text,
  ADD COLUMN subactivity_id text,
  ADD COLUMN core_indicators text,
  ADD COLUMN year integer,
  ADD COLUMN target numeric,
  ADD COLUMN q1 numeric,
  ADD COLUMN q2 numeric,
  ADD COLUMN q3 numeric,
  ADD COLUMN q4 numeric,
  ADD COLUMN annual_performance numeric,
  ADD COLUMN evidence text;
