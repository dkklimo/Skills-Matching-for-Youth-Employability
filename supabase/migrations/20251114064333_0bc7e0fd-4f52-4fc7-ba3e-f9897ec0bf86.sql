-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for course videos (public read, educators can upload)
CREATE POLICY "Anyone can view course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

CREATE POLICY "Educators can upload course videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);

CREATE POLICY "Educators can update their own course videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-videos' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);

CREATE POLICY "Educators can delete their own course videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-videos' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);

-- RLS policies for course materials (private, only students enrolled + educators)
CREATE POLICY "Educators can view course materials"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course-materials' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);

CREATE POLICY "Educators can upload course materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);

CREATE POLICY "Educators can update course materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-materials' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);

CREATE POLICY "Educators can delete course materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-materials' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'educator'
  ))
);