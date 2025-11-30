-- Create indicators table
CREATE TABLE public.indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL, -- e.g., "participants", "USD", "%"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_activities table
CREATE TABLE public.sub_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL, -- References the project ID from the mock data
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indicator_values table to store actual performance data
CREATE TABLE public.indicator_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT, -- Main activity/project
  sub_activity_id UUID REFERENCES public.sub_activities(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  target_value NUMERIC, -- Planned target
  actual_value NUMERIC, -- Actual achievement
  reporting_period TEXT, -- e.g., "Q1 2024", "January 2024"
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (project_id IS NOT NULL OR sub_activity_id IS NOT NULL) -- Must link to either project or sub-activity
);

-- Enable Row Level Security
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for indicators (public read, authenticated can manage)
CREATE POLICY "Anyone can view indicators"
  ON public.indicators FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert indicators"
  ON public.indicators FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update indicators"
  ON public.indicators FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete indicators"
  ON public.indicators FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sub_activities (public read, authenticated can manage)
CREATE POLICY "Anyone can view sub-activities"
  ON public.sub_activities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert sub-activities"
  ON public.sub_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sub-activities"
  ON public.sub_activities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sub-activities"
  ON public.sub_activities FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for indicator_values (public read, authenticated can manage)
CREATE POLICY "Anyone can view indicator values"
  ON public.indicator_values FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert indicator values"
  ON public.indicator_values FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update indicator values"
  ON public.indicator_values FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete indicator values"
  ON public.indicator_values FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_indicators_updated_at
  BEFORE UPDATE ON public.indicators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_activities_updated_at
  BEFORE UPDATE ON public.sub_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicator_values_updated_at
  BEFORE UPDATE ON public.indicator_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();