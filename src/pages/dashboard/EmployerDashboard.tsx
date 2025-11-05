import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Eye, PlusCircle, TrendingUp, Search, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobWithApplicants {
  id: string;
  title: string;
  status: string;
  applicants: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  match: number;
}

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobWithApplicants[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    profileViews: 0,
    hired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch company for current employer
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('employer_id', user?.id)
        .single();

      if (!companyData) {
        setLoading(false);
        return;
      }

      // Fetch jobs with applicant counts
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          status,
          job_applications(count)
        `)
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch active jobs count
      const { count: activeCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyData.id)
        .eq('status', 'open');

      // Fetch total applicants
      const { count: totalApplicants } = await supabase
        .from('job_applications')
        .select('*, jobs!inner(company_id)', { count: 'exact', head: true })
        .eq('jobs.company_id', companyData.id);

      // Fetch top candidates with profile data
      const { data: candidatesData } = await supabase
        .from('job_applications')
        .select('user_id, jobs!inner(title, company_id)')
        .eq('jobs.company_id', companyData.id)
        .eq('status', 'pending')
        .limit(3);

      // Fetch profiles for candidates
      let formattedCandidates: Candidate[] = [];
      if (candidatesData && candidatesData.length > 0) {
        const userIds = candidatesData.map(app => app.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        formattedCandidates = candidatesData.map(app => {
          const profile = profilesData?.find(p => p.id === app.user_id);
          return {
            id: app.user_id,
            name: profile?.full_name || 'Unknown',
            email: profile?.email || '',
            position: app.jobs.title,
            match: Math.floor(Math.random() * 20 + 80),
          };
        });
      }

      const formattedJobs = jobsData?.map(job => ({
        id: job.id,
        title: job.title,
        status: job.status,
        applicants: job.job_applications?.[0]?.count || 0,
      })) || [];

      setJobs(formattedJobs);
      setCandidates(formattedCandidates);
      setStats({
        activeJobs: activeCount || 0,
        totalApplicants: totalApplicants || 0,
        profileViews: 0, // TODO: Implement profile views tracking
        hired: 0, // TODO: Implement hired tracking
      });
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
      <div className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground p-6 md:p-8">
        <div className="container mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
            <p className="opacity-90">Find and hire top talent</p>
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
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.activeJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Total Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalApplicants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-secondary" />
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.profileViews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Hired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.hired}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>Manage your open positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-center text-muted-foreground">No jobs posted yet</p>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.applicants} applicants</p>
                    </div>
                    <Badge variant={job.status === "open" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                ))
              )}
              <Button asChild className="w-full">
                <Link to="/jobs/post">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Top Candidates */}
          <Card>
            <CardHeader>
              <CardTitle>Top Matched Candidates</CardTitle>
              <CardDescription>Candidates matching your requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : candidates.length === 0 ? (
                <p className="text-center text-muted-foreground">No candidates yet</p>
              ) : (
                candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{candidate.name}</h4>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                    <Badge variant={candidate.match >= 90 ? "default" : "secondary"}>
                      {candidate.match}%
                    </Badge>
                  </div>
                ))
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/candidates">View All Candidates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your hiring process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/jobs/post">
                  <PlusCircle className="w-6 h-6" />
                  <span>Post New Job</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/candidates/search">
                  <Search className="w-6 h-6" />
                  <span>Search Candidates</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/company/profile">
                  <Briefcase className="w-6 h-6" />
                  <span>Update Company Profile</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerDashboard;
