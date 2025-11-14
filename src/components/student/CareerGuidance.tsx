import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Compass, TrendingUp, BookOpen, Target, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CareerGuidanceProps {
  userId: string;
}

interface SkillGap {
  skill: string;
  inDemand: number;
}

interface CareerPath {
  title: string;
  match: number;
  requiredSkills: string[];
}

export function CareerGuidance({ userId }: CareerGuidanceProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);

  useEffect(() => {
    fetchGuidanceData();
  }, [userId]);

  const fetchGuidanceData = async () => {
    setLoading(true);

    try {
      // Fetch user's skills
      const { data: studentSkills } = await supabase
        .from("student_skills")
        .select("skills(name)")
        .eq("user_id", userId);

      const skills = studentSkills?.map((s: any) => s.skills?.name).filter(Boolean) || [];
      setUserSkills(skills);

      // Fetch in-demand skills from job postings
      const { data: jobSkills } = await supabase
        .from("job_skills")
        .select("skill_id, skills(name)");

      // Count skill frequency
      const skillCounts = new Map<string, number>();
      jobSkills?.forEach((js: any) => {
        const name = js.skills?.name;
        if (name) {
          skillCounts.set(name, (skillCounts.get(name) || 0) + 1);
        }
      });

      // Find gaps (top demanded skills user doesn't have)
      const gaps: SkillGap[] = [];
      skillCounts.forEach((count, skill) => {
        if (!skills.includes(skill)) {
          gaps.push({ skill, inDemand: count });
        }
      });
      gaps.sort((a, b) => b.inDemand - a.inDemand);
      setSkillGaps(gaps.slice(0, 5));

      // Suggest career paths based on skills
      const { data: jobs } = await supabase
        .from("jobs")
        .select("title, job_skills(skills(name))")
        .eq("status", "open")
        .limit(50);

      const pathMap = new Map<string, { count: number; skills: Set<string> }>();
      jobs?.forEach((job: any) => {
        const jobSkills = job.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [];
        const matchCount = jobSkills.filter((s: string) => skills.includes(s)).length;
        
        if (matchCount > 0) {
          const existing = pathMap.get(job.title) || { count: 0, skills: new Set() };
          existing.count += 1;
          jobSkills.forEach((s: string) => existing.skills.add(s));
          pathMap.set(job.title, existing);
        }
      });

      const paths: CareerPath[] = [];
      pathMap.forEach((value, title) => {
        const requiredSkills = Array.from(value.skills);
        const match = Math.min(100, Math.round((skills.filter(s => requiredSkills.includes(s)).length / requiredSkills.length) * 100));
        paths.push({ title, match, requiredSkills: requiredSkills.slice(0, 5) });
      });
      paths.sort((a, b) => b.match - a.match);
      setCareerPaths(paths.slice(0, 3));
    } catch (error) {
      console.error("Error fetching guidance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommended Career Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommended Career Paths
          </CardTitle>
          <CardDescription>Based on your current skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {careerPaths.length === 0 ? (
            <Alert>
              <AlertDescription>
                Add more skills to get personalized career path recommendations!
              </AlertDescription>
            </Alert>
          ) : (
            careerPaths.map((path, idx) => (
              <div key={idx} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{path.title}</h4>
                  <Badge variant={path.match >= 70 ? "default" : "secondary"}>
                    {path.match}% Match
                  </Badge>
                </div>
                <Progress value={path.match} />
                <div className="flex flex-wrap gap-2">
                  {path.requiredSkills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant={userSkills.includes(skill) ? "default" : "outline"}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skills You Should Improve
          </CardTitle>
          <CardDescription>Top in-demand skills you're missing</CardDescription>
        </CardHeader>
        <CardContent>
          {skillGaps.length === 0 ? (
            <Alert>
              <AlertDescription>
                Great! You have many of the in-demand skills. Keep learning!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {skillGaps.map((gap, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{gap.skill}</span>
                  <Badge variant="secondary">
                    {gap.inDemand} job{gap.inDemand !== 1 ? "s" : ""} require this
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Suggested Learning Resources
          </CardTitle>
          <CardDescription>Courses that can help bridge your skill gaps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <Compass className="h-4 w-4" />
            <AlertDescription>
              Check out available courses to learn skills that employers are looking for!
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="w-full" onClick={() => navigate('/courses')}>
            Browse Available Courses
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
