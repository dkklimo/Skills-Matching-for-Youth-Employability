import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, User, Briefcase, MapPin, GraduationCap, Brain, Mail, Eye, Check, FileText, Video } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  experience_years: number;
  location: string;
  education_level: string;
  skills: string[];
  resume_url: string | null;
  video_intro_url: string | null;
}

const SearchCandidates = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filters, setFilters] = useState({
    skills: "",
    experience: "",
    location: "",
    education: "",
  });
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchAvailableSkills();
  }, []);

  const fetchAvailableSkills = async () => {
    const { data, error } = await supabase.from("skills").select("id, name").order("name");
    if (error) {
      toast({ title: "Error fetching skills", variant: "destructive" });
    } else {
      setAvailableSkills(data || []);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCandidates([]);

    try {
      let query = supabase.from("profiles").select(`
        id,
        full_name,
        email,
        experience_years,
        location,
        education_level,
        student_skills(skills(name)),
        resume_url,
        video_intro_url
      `);

      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (filters.education) {
        query = query.eq("education_level", filters.education);
      }
      if (filters.experience) {
        query = query.gte("experience_years", parseInt(filters.experience));
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredCandidates: Candidate[] = data?.map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        experience_years: profile.experience_years,
        location: profile.location,
        education_level: profile.education_level,
        skills: profile.student_skills.map((ss: any) => ss.skills?.name).filter(Boolean),
        resume_url: profile.resume_url,
        video_intro_url: profile.video_intro_url,
      })) || [];

      if (filters.skills) {
        const searchSkills = filters.skills.toLowerCase().split(",").map((s) => s.trim());
        filteredCandidates = filteredCandidates.filter((candidate) =>
          searchSkills.every((s) => candidate.skills.map((cs) => cs.toLowerCase()).includes(s))
        );
      }

      setCandidates(filteredCandidates);
      toast({
        title: "Search Complete",
        description: `${filteredCandidates.length} candidates found.`,
      });
    } catch (error) {
      console.error("Error searching candidates:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search candidates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6" />
            Search Candidates
          </CardTitle>
          <CardDescription>Find the perfect candidates using various filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g., React, Node.js"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange("skills", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Min. Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="e.g., 2"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange("experience", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Remote, London"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education Level</Label>
                <Select value={filters.education} onValueChange={(value) => handleFilterChange("education", value)}>
                  <SelectTrigger id="education">
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                    <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                    <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Matching Candidates</h3>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="text-center text-muted-foreground">No candidates found matching your criteria.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="p-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-bold">{candidate.full_name}</CardTitle>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-4 w-4" /> {candidate.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-4 w-4" /> {candidate.experience_years} years experience
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {candidate.location}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" /> {candidate.education_level}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
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
                        <Button size="sm">
                          <Check className="h-4 w-4 mr-2" /> Shortlist
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchCandidates;
