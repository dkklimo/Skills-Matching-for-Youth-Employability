import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Eye, PlusCircle, TrendingUp, Search } from "lucide-react";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const mockJobs = [
    { id: 1, title: "Senior Developer", applicants: 24, status: "open" },
    { id: 2, title: "Product Manager", applicants: 18, status: "open" },
    { id: 3, title: "Data Analyst", applicants: 31, status: "closed" },
  ];

  const mockCandidates = [
    { id: 1, name: "Alice Johnson", position: "Senior Developer", match: 92 },
    { id: 2, name: "Bob Smith", position: "Product Manager", match: 88 },
    { id: 3, name: "Carol Davis", position: "Senior Developer", match: 85 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
          <p className="opacity-90">Find and hire top talent</p>
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
              <div className="text-2xl font-bold">8</div>
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
              <div className="text-2xl font-bold">73</div>
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
              <div className="text-2xl font-bold">1.2K</div>
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
              <div className="text-2xl font-bold">12</div>
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
              {mockJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.applicants} applicants</p>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              ))}
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
              {mockCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </div>
                  <Badge variant={candidate.match >= 90 ? "default" : "secondary"}>
                    {candidate.match}%
                  </Badge>
                </div>
              ))}
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
