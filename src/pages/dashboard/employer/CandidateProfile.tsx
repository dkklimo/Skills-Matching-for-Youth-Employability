import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, FileText, Video, Loader2 } from "lucide-react";

interface CandidateProfileData {
  id: string;
  full_name: string;
  email: string;
  skills: string[];
  resume_url: string | null;
  video_intro_url: string | null;
}

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Candidate ID is missing.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            resume_url,
            video_intro_url
          `)
          .eq("id", id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          const { data: studentSkillsData, error: skillsError } = await supabase
            .from("student_skills")
            .select("skills(name)")
            .eq("user_id", id);

          if (skillsError) throw skillsError;

          const skills = studentSkillsData?.map((ss: any) => ss.skills?.name).filter(Boolean) || [];

          setCandidate({
            id: profileData.id,
            full_name: profileData.full_name,
            email: profileData.email,
            skills,
            resume_url: profileData.resume_url,
            video_intro_url: profileData.video_intro_url,
          });
        }
      } catch (error) {
        console.error("Error fetching candidate profile:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load candidate profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateProfile();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Candidate Not Found</h2>
        <p className="text-muted-foreground">The requested candidate profile could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            {candidate.full_name}
          </CardTitle>
          <CardDescription>Detailed profile of the candidate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-4 w-4" /> {candidate.email}
          </p>
          <div>
            <h4 className="font-semibold mb-2">Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.length > 0 ? (
                candidate.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No skills listed.</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {candidate.resume_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(candidate.resume_url!, "_blank")}>
                <FileText className="h-4 w-4 mr-2" /> View Resume
              </Button>
            )}
            {candidate.video_intro_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(candidate.video_intro_url!, "_blank")}>
                <Video className="h-4 w-4 mr-2" /> Watch Video Intro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateProfile;
