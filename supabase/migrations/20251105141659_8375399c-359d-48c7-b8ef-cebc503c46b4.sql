-- Companies table for employers
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  location TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('Full-time', 'Part-time', 'Internship', 'Contract')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  requirements TEXT,
  salary_range TEXT,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skills catalog
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job skills mapping
CREATE TABLE public.job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE(job_id, skill_id)
);

-- Student skills
CREATE TABLE public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Job applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_students INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course enrollments
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Employers can view all companies"
  ON public.companies FOR SELECT
  USING (has_role(auth.uid(), 'employer') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can insert their own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = employer_id AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Employers can update their own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = employer_id AND has_role(auth.uid(), 'employer'));

-- Jobs policies
CREATE POLICY "Everyone can view open jobs"
  ON public.jobs FOR SELECT
  USING (status = 'open' OR has_role(auth.uid(), 'employer') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can insert jobs for their company"
  ON public.jobs FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'employer') AND
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND employer_id = auth.uid())
  );

CREATE POLICY "Employers can update their own jobs"
  ON public.jobs FOR UPDATE
  USING (
    has_role(auth.uid(), 'employer') AND
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND employer_id = auth.uid())
  );

CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs FOR DELETE
  USING (
    has_role(auth.uid(), 'employer') AND
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND employer_id = auth.uid())
  );

-- Skills policies
CREATE POLICY "Everyone can view skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Educators and admins can insert skills"
  ON public.skills FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'educator') OR has_role(auth.uid(), 'admin'));

-- Job skills policies
CREATE POLICY "Everyone can view job skills"
  ON public.job_skills FOR SELECT
  USING (true);

CREATE POLICY "Employers can manage job skills for their jobs"
  ON public.job_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = job_id AND c.employer_id = auth.uid()
    )
  );

-- Student skills policies
CREATE POLICY "Students can view all student skills"
  ON public.student_skills FOR SELECT
  USING (has_role(auth.uid(), 'student') OR has_role(auth.uid(), 'educator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can manage their own skills"
  ON public.student_skills FOR ALL
  USING (auth.uid() = user_id AND has_role(auth.uid(), 'student'));

-- Job applications policies
CREATE POLICY "Students can view their own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id AND has_role(auth.uid(), 'student'));

CREATE POLICY "Employers can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (
    has_role(auth.uid(), 'employer') AND
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = job_id AND c.employer_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'student'));

CREATE POLICY "Employers can update applications for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    has_role(auth.uid(), 'employer') AND
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = job_id AND c.employer_id = auth.uid()
    )
  );

-- Courses policies
CREATE POLICY "Everyone can view published courses"
  ON public.courses FOR SELECT
  USING (status = 'published' OR auth.uid() = educator_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Educators can insert their own courses"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = educator_id AND has_role(auth.uid(), 'educator'));

CREATE POLICY "Educators can update their own courses"
  ON public.courses FOR UPDATE
  USING (auth.uid() = educator_id AND has_role(auth.uid(), 'educator'));

CREATE POLICY "Educators can delete their own courses"
  ON public.courses FOR DELETE
  USING (auth.uid() = educator_id AND has_role(auth.uid(), 'educator'));

-- Course enrollments policies
CREATE POLICY "Students can view their own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'educator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can enroll in courses"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'student'));

CREATE POLICY "Students can update their own enrollments"
  ON public.course_enrollments FOR UPDATE
  USING (auth.uid() = user_id AND has_role(auth.uid(), 'student'));

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_skills_updated_at
  BEFORE UPDATE ON public.student_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();