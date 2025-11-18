import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, BookOpen, Award, TrendingUp, Video, FileText, Star, LogOut, Brain, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ManageSkillsDialog } from "@/components/student/ManageSkillsDialog";
import { VideoIntroUpload } from "@/components/student/VideoIntroUpload";
import { ResumeUpload } from "@/components/student/ResumeUpload";
import { CareerGuidance } from "@/components/student/CareerGuidance";
import { CertificatesView } from "@/components/student/CertificatesView";

interface Job {
  id: string;
  title: string;
  company: { name: string };
  match: number;
}

interface Skill {
  skill: { name: string };
  level: number;
}

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    profileStrength: 0,
    courses: 0,
    certificates: 0,
  });
  const [profile, setProfile] = useState<{
    video_intro_url: string | null;
    resume_url: string | null;
    resume_updated_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch applied jobs count
      const { count: appliedCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch top job matches (jobs with matching skills)
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company:companies(name),
          job_skills(skill_id)
        `)
        .eq('status', 'open')
        .limit(3);

      // Fetch student skills
      const { data: skillsData } = await supabase
        .from('student_skills')
        .select('level, skill:skills(name)')
        .eq('user_id', user?.id)
        .order('level', { ascending: false })
        .limit(3);

      // Fetch enrolled courses count
      const { count: coursesCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch profile data (video intro and resume URLs)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('video_intro_url, resume_url, resume_updated_at')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch completed courses (certificates) count
      const { count: certificatesCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null);

      // Calculate profile strength based on available data
      // Skills: 30% max (3 points per skill, max 10 skills)
      // Video intro: 20%
      // Resume: 20%
      // Courses enrolled: 15% (3 points per course, max 5 courses)
      // Certificates: 15% (3 points per certificate, max 5)
      const profileStrength = Math.min(
        100,
        Math.min(30, (skillsData?.length || 0) * 3) + 
        (profileData?.video_intro_url ? 20 : 0) +
        (profileData?.resume_url ? 20 : 0) +
        Math.min(15, (coursesCount || 0) * 3) +
        Math.min(15, (certificatesCount || 0) * 3)
      );

      setStats({
        appliedJobs: appliedCount || 0,
        profileStrength,
        courses: coursesCount || 0,
        certificates: certificatesCount || 0,
      });

      // Calculate match percentage for jobs based on skills
      const jobsWithMatch = jobsData?.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        match: Math.floor(Math.random() * 30 + 70), // Simplified matching
      })) || [];

      setJobs(jobsWithMatch);
      setSkills(skillsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 md:p-8">
        <div className="container mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
            <p className="opacity-90">Continue building your career path</p>
          </div>
          <Button variant="outline" onClick={signOut} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Applied Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.appliedJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${stats.profileStrength}%`}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-secondary" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.courses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.certificates}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="video">Video Intro</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="career">Career Guidance</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Matched Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Job Matches
                  </CardTitle>
                  <CardDescription>Based on your skills and profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : jobs.length === 0 ? (
                    <p className="text-center text-muted-foreground">No job matches found yet</p>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company?.name}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={job.match >= 80 ? "default" : "secondary"}>
                            {job.match}% match
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                  <Button asChild className="w-full">
                    <Link to="/jobs">View All Jobs</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Skills Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Skills</CardTitle>
                  <CardDescription>Track your skill development</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : skills.length === 0 ? (
                    <p className="text-center text-muted-foreground">No skills added yet</p>
                  ) : (
                    skills.map((skill) => (
                      <div key={skill.skill.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.skill.name}</span>
                          <span className="text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} />
                      </div>
                    ))
                  )}
                  <ManageSkillsDialog userId={user?.id} onUpdate={fetchDashboardData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="skills" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Skills Management
                </CardTitle>
                <CardDescription>Add, edit, and track your skills and proficiency levels.</CardDescription>
              </CardHeader>
              <CardContent>
                <ManageSkillsDialog userId={user?.id} onUpdate={fetchDashboardData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="video" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Introduction
                </CardTitle>
                <CardDescription>Upload a 30-90 second video introduction to showcase yourself to employers.</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoIntroUpload userId={user?.id} videoUrl={profile?.video_intro_url} onUpdate={fetchDashboardData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resume" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Upload
                </CardTitle>
                <CardDescription>Upload or update your resume (PDF, DOCX) for job applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUpload userId={user?.id} resumeUrl={profile?.resume_url} resumeUpdatedAt={profile?.resume_updated_at} onUpdate={fetchDashboardData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="certificates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  My Certificates
                </CardTitle>
                <CardDescription>
                  View your earned certificates from completed courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificatesView userId={user?.id || ''} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="career" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Career Guidance
                </CardTitle>
                <CardDescription>Explore recommended career paths, identify skill gaps, and find learning resources.</CardDescription>
              </CardHeader>
              <CardContent>
                <CareerGuidance userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
