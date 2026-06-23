
CREATE TABLE public.org_logos (
  name text PRIMARY KEY,
  data_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.org_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_logos TO authenticated;
GRANT ALL ON public.org_logos TO service_role;

ALTER TABLE public.org_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view org logos"
  ON public.org_logos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert org logos"
  ON public.org_logos FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update org logos"
  ON public.org_logos FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete org logos"
  ON public.org_logos FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_org_logos_updated_at
  BEFORE UPDATE ON public.org_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.org_logos;
