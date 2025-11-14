import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface UploadMaterialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  educatorId: string;
}

export const UploadMaterialsDialog = ({ open, onOpenChange, onSuccess, educatorId }: UploadMaterialsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
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
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Material must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setMaterialFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile || !selectedCourse) return;

    setUploading(true);
    setLoading(true);

    try {
      const fileExt = materialFile.name.split(".").pop();
      const fileName = `${educatorId}/${selectedCourse}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, materialFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(fileName);

      toast({
        title: "Success",
        description: `Material "${title}" uploaded successfully!`,
      });

      setMaterialFile(null);
      setTitle("");
      setSelectedCourse("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading material:", error);
      toast({
        title: "Error",
        description: "Failed to upload material. Please try again.",
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
          <DialogTitle>Upload Course Materials</DialogTitle>
          <DialogDescription>
            Upload documents, slides, or other materials for your course (max 50MB).
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
              <Label htmlFor="material-title">Material Title *</Label>
              <Input
                id="material-title"
                placeholder="e.g., Week 1 Slides"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Material File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  required
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {materialFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {materialFile.name} ({(materialFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !materialFile || !selectedCourse}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Material"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
