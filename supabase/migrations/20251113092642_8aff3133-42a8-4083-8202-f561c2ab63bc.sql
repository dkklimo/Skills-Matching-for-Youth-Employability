-- Create storage buckets for student videos and resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('student-videos', 'student-videos', true),
  ('student-resumes', 'student-resumes', false);

-- Storage policies for student videos (public read, owner write)
CREATE POLICY "Students can upload their own video"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Students can update their own video"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Students can delete their own video"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Anyone can view student videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'student-videos');

-- Storage policies for student resumes (private, owner only)
CREATE POLICY "Students can upload their own resume"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Students can update their own resume"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Students can delete their own resume"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'student'::app_role)
);

CREATE POLICY "Students can view their own resume"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employers can view student resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-resumes' 
  AND has_role(auth.uid(), 'employer'::app_role)
);

-- Add video and resume URL columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS video_intro_url text,
ADD COLUMN IF NOT EXISTS resume_url text,
ADD COLUMN IF NOT EXISTS resume_updated_at timestamp with time zone;