
-- Capacity assessments: remove public access entirely; require authenticated
DROP POLICY IF EXISTS "Anyone can view capacity assessments" ON public.capacity_assessments;
DROP POLICY IF EXISTS "Anyone can insert capacity assessments" ON public.capacity_assessments;
DROP POLICY IF EXISTS "Anyone can update capacity assessments" ON public.capacity_assessments;
DROP POLICY IF EXISTS "Anyone can delete capacity assessments" ON public.capacity_assessments;

CREATE POLICY "Authenticated can view capacity assessments"
  ON public.capacity_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert capacity assessments"
  ON public.capacity_assessments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update capacity assessments"
  ON public.capacity_assessments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete capacity assessments"
  ON public.capacity_assessments FOR DELETE TO authenticated USING (true);

-- Role infrastructure for admin-only writes
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Indicators: writes admin-only (fixes always-true UPDATE/INSERT/DELETE and authenticated-write findings)
DROP POLICY IF EXISTS "Authenticated users can insert indicators" ON public.indicators;
DROP POLICY IF EXISTS "Authenticated users can update indicators" ON public.indicators;
DROP POLICY IF EXISTS "Authenticated users can delete indicators" ON public.indicators;
CREATE POLICY "Admins can insert indicators" ON public.indicators
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update indicators" ON public.indicators
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete indicators" ON public.indicators
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Indicator values: same restriction
DROP POLICY IF EXISTS "Authenticated users can insert indicator values" ON public.indicator_values;
DROP POLICY IF EXISTS "Authenticated users can update indicator values" ON public.indicator_values;
DROP POLICY IF EXISTS "Authenticated users can delete indicator values" ON public.indicator_values;
CREATE POLICY "Admins can insert indicator values" ON public.indicator_values
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update indicator values" ON public.indicator_values
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete indicator values" ON public.indicator_values
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Org logos: admin-only writes
DROP POLICY IF EXISTS "Authenticated can insert org logos" ON public.org_logos;
DROP POLICY IF EXISTS "Authenticated can update org logos" ON public.org_logos;
DROP POLICY IF EXISTS "Authenticated can delete org logos" ON public.org_logos;
CREATE POLICY "Admins can insert org logos" ON public.org_logos
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update org logos" ON public.org_logos
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete org logos" ON public.org_logos
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Sub-activities: admin-only writes
DROP POLICY IF EXISTS "Authenticated users can insert sub-activities" ON public.sub_activities;
DROP POLICY IF EXISTS "Authenticated users can update sub-activities" ON public.sub_activities;
DROP POLICY IF EXISTS "Authenticated users can delete sub-activities" ON public.sub_activities;
CREATE POLICY "Admins can insert sub-activities" ON public.sub_activities
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sub-activities" ON public.sub_activities
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sub-activities" ON public.sub_activities
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
