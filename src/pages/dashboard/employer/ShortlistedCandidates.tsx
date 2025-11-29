import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, User, Mail, Eye, FileText, Video, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ShortlistedCandidate {
  id: string;
  full_name: string;
  email: string;
  resume_url: string | null;
  video_intro_url: string | null;
  shortlist_id: string; // ID from the shortlist table
}

const ShortlistedCandidates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shortlistedCandidates, setShortlistedCandidates] = useState<ShortlistedCandidate[]>([]);

  useEffect(() => {
    fetchShortlistedCandidates();
  }, [user]);

  const fetchShortlistedCandidates = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shortlists")
        .select(`
          id:shortlist_id,
          profiles(
            id,
            full_name,
            email,
            resume_url,
            video_intro_url
          )
        `)
        .eq("employer_id", user.id);

      if (error) throw error;

      const candidates = data?.map((item: any) => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name,
        email: item.profiles.email,
        resume_url: item.profiles.resume_url,
        video_intro_url: item.profiles.video_intro_url,
        shortlist_id: item.id, // The ID of the shortlist entry
      })) || [];

      setShortlistedCandidates(candidates);
    } catch (error) {
      console.error("Error fetching shortlisted candidates:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load shortlisted candidates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShortlist = async (shortlistId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("shortlists")
        .delete()
        .eq("shortlist_id", shortlistId);

      if (error) throw error;

      toast({
        title: "Removed from Shortlist",
        description: "Candidate has been removed from your shortlist.",
      });
      fetchShortlistedCandidates(); // Refresh the list
    } catch (error) {
      console.error("Error removing from shortlist:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove candidate from shortlist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6" />
            Shortlisted Candidates
          </CardTitle>
          <CardDescription>Candidates you have marked as potential hires.</CardDescription>
        </CardHeader>
        <CardContent>
          {shortlistedCandidates.length === 0 ? (
            <p className="text-center text-muted-foreground">You have no candidates in your shortlist yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {shortlistedCandidates.map((candidate) => (
                <Card key={candidate.id} className="p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">{candidate.full_name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/candidate/${candidate.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveFromShortlist(candidate.shortlist_id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {candidate.email}
                    </p>
                    <div className="flex gap-2 mt-4">
                      {candidate.resume_url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(candidate.resume_url!, "_blank")}>
                          <FileText className="h-4 w-4 mr-2" /> Resume
                        </Button>
                      )}
                      {candidate.video_intro_url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(candidate.video_intro_url!, "_blank")}>
                          <Video className="h-4 w-4 mr-2" /> Video Intro
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortlistedCandidates;
