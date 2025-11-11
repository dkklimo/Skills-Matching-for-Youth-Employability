-- Add status column to profiles table for account management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  recipient_role text, -- null means all users
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view notifications for their role"
  ON public.notifications FOR SELECT
  USING (
    recipient_role IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role::text = recipient_role
    )
  );

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add approval status to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Add approval status to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Add job posting count to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS job_count integer DEFAULT 0;

-- Create trigger to update job count
CREATE OR REPLACE FUNCTION public.update_company_job_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.companies 
    SET job_count = job_count + 1 
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.companies 
    SET job_count = job_count - 1 
    WHERE id = OLD.company_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_company_job_count_trigger
  AFTER INSERT OR DELETE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_job_count();

-- Create user_analytics table for tracking registration trends
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  role text NOT NULL,
  count integer DEFAULT 0,
  UNIQUE(date, role)
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Admins can view analytics
CREATE POLICY "Admins can view analytics"
  ON public.user_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to aggregate daily registrations
CREATE OR REPLACE FUNCTION public.aggregate_user_registrations()
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_analytics (date, role, count)
  SELECT 
    DATE(p.created_at) as date,
    ur.role::text as role,
    COUNT(*) as count
  FROM public.profiles p
  JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE DATE(p.created_at) >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY DATE(p.created_at), ur.role::text
  ON CONFLICT (date, role) 
  DO UPDATE SET count = EXCLUDED.count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Run initial aggregation
SELECT public.aggregate_user_registrations();