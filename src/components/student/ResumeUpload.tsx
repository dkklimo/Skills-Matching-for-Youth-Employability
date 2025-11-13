import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResumeUploadProps {
  userId: string;
  resumeUrl: string | null;
  resumeUpdatedAt: string | null;
  onUpdate: () => void;
}

export function ResumeUpload({ userId, resumeUrl, resumeUpdatedAt, onUpdate }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Resume must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/resume-${Date.now()}.${fileExt}`;

      // Delete old resume if exists
      if (resumeUrl) {
        const oldPath = resumeUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("student-resumes").remove([oldPath]);
      }

      // Upload new resume
      const { error: uploadError } = await supabase.storage
        .from("student-resumes")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL (for authenticated users)
      const { data: { publicUrl } } = supabase.storage
        .from("student-resumes")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          resume_url: publicUrl,
          resume_updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({ title: "Resume uploaded successfully!" });
      onUpdate();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!resumeUrl) return;

    setDeleting(true);

    try {
      const filePath = resumeUrl.split("/").slice(-2).join("/");
      const { error: deleteError } = await supabase.storage
        .from("student-resumes")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          resume_url: null,
          resume_updated_at: null
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({ title: "Resume deleted successfully" });
      onUpdate();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume / CV
        </CardTitle>
        <CardDescription>
          Keep your resume up to date for employers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeUrl ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>Resume uploaded</span>
                {resumeUpdatedAt && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {new Date(resumeUpdatedAt).toLocaleDateString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Replace
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Upload your resume to automatically improve your profile strength and increase visibility to employers.
              </AlertDescription>
            </Alert>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Resume
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, DOCX • Max size: 10MB
        </p>
      </CardContent>
    </Card>
  );
}
