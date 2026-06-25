
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate policies to reference private.has_role
DROP POLICY IF EXISTS "Admins can insert indicators" ON public.indicators;
DROP POLICY IF EXISTS "Admins can update indicators" ON public.indicators;
DROP POLICY IF EXISTS "Admins can delete indicators" ON public.indicators;
CREATE POLICY "Admins can insert indicators" ON public.indicators FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update indicators" ON public.indicators FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete indicators" ON public.indicators FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert indicator values" ON public.indicator_values;
DROP POLICY IF EXISTS "Admins can update indicator values" ON public.indicator_values;
DROP POLICY IF EXISTS "Admins can delete indicator values" ON public.indicator_values;
CREATE POLICY "Admins can insert indicator values" ON public.indicator_values FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update indicator values" ON public.indicator_values FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete indicator values" ON public.indicator_values FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert sub-activities" ON public.sub_activities;
DROP POLICY IF EXISTS "Admins can update sub-activities" ON public.sub_activities;
DROP POLICY IF EXISTS "Admins can delete sub-activities" ON public.sub_activities;
CREATE POLICY "Admins can insert sub-activities" ON public.sub_activities FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update sub-activities" ON public.sub_activities FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete sub-activities" ON public.sub_activities FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the public version no longer referenced
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
