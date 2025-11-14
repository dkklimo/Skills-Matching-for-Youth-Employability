import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface UploadVideoLectureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  educatorId: string;
}

export const UploadVideoLectureDialog = ({ open, onOpenChange, onSuccess, educatorId }: UploadVideoLectureDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open, educatorId]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("educator_id", educatorId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCourses(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be less than 500MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !selectedCourse) return;

    setUploading(true);
    setLoading(true);

    try {
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${educatorId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-videos")
        .getPublicUrl(fileName);

      toast({
        title: "Success",
        description: `Video lecture "${title}" uploaded successfully!`,
      });

      setVideoFile(null);
      setTitle("");
      setSelectedCourse("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Video Lecture</DialogTitle>
          <DialogDescription>
            Upload a video lecture for one of your courses (max 500MB).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Select Course *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lecture-title">Lecture Title *</Label>
              <Input
                id="lecture-title"
                placeholder="e.g., Introduction to React Hooks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Video File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="video"
                  type="file"
                  accept="video/mp4,video/webm,video/mov"
                  onChange={handleFileChange}
                  required
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {videoFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !videoFile || !selectedCourse}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
