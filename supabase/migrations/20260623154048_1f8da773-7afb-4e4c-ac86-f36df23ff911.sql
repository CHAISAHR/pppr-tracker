CREATE TABLE public.capacity_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text,
  event_focus_area text NOT NULL,
  event_date date,
  participant_name text NOT NULL,
  competency text NOT NULL,
  pre_score smallint CHECK (pre_score BETWEEN 1 AND 5),
  post_score smallint CHECK (post_score BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.capacity_assessments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capacity_assessments TO authenticated;
GRANT ALL ON public.capacity_assessments TO service_role;

ALTER TABLE public.capacity_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view capacity assessments"
  ON public.capacity_assessments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert capacity assessments"
  ON public.capacity_assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update capacity assessments"
  ON public.capacity_assessments FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete capacity assessments"
  ON public.capacity_assessments FOR DELETE
  USING (true);

CREATE TRIGGER set_capacity_assessments_updated_at
  BEFORE UPDATE ON public.capacity_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX capacity_assessments_event_id_idx ON public.capacity_assessments (event_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.capacity_assessments;
ALTER TABLE public.capacity_assessments REPLICA IDENTITY FULL;