import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, Upload, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoIntroUploadProps {
  userId: string;
  videoUrl: string | null;
  onUpdate: () => void;
}

export function VideoIntroUpload({ userId, videoUrl, onUpdate }: VideoIntroUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["video/mp4", "video/mov", "video/webm"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4, MOV, or WebM video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileName = `${userId}/intro-video-${Date.now()}.${file.name.split(".").pop()}`;

      // Delete old video if exists
      if (videoUrl) {
        const oldPath = videoUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("student-videos").remove([oldPath]);
      }

      // Upload new video
      const { error: uploadError } = await supabase.storage
        .from("student-videos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("student-videos")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ video_intro_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({ title: "Video uploaded successfully!" });
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
    if (!videoUrl) return;

    setDeleting(true);

    try {
      const filePath = videoUrl.split("/").slice(-2).join("/");
      const { error: deleteError } = await supabase.storage
        .from("student-videos")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ video_intro_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({ title: "Video deleted successfully" });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Introduction
        </CardTitle>
        <CardDescription>
          Upload a 30-90 second video introducing yourself to employers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {videoUrl ? (
          <div className="space-y-4">
            <video controls className="w-full rounded-lg border" src={videoUrl}>
              Your browser does not support video playback.
            </video>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Replace Video
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
                Your video helps employers get to know you better. Keep it professional and concise!
              </AlertDescription>
            </Alert>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Video
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/mov,video/webm"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          Supported formats: MP4, MOV, WebM • Max size: 50MB • Duration: 30-90 seconds
        </p>
      </CardContent>
    </Card>
  );
}
