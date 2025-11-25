-- Update RLS policy to allow employers to view student skills
DROP POLICY IF EXISTS "Students can view all student skills" ON public.student_skills;

CREATE POLICY "Users can view all student skills"
ON public.student_skills
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role) OR 
  has_role(auth.uid(), 'educator'::app_role) OR 
  has_role(auth.uid(), 'employer'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);