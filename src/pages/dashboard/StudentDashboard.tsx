import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Briefcase, BookOpen, Award, TrendingUp, Video, FileText, Star } from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const mockJobs = [
    { id: 1, title: "Junior Developer", company: "TechCorp", match: 85 },
    { id: 2, title: "Data Analyst", company: "DataFlow", match: 78 },
    { id: 3, title: "UX Designer", company: "DesignHub", match: 72 },
  ];

  const mockSkills = [
    { name: "JavaScript", level: 75 },
    { name: "React", level: 65 },
    { name: "Python", level: 80 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
          <p className="opacity-90">Continue building your career path</p>
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
              <div className="text-2xl font-bold">12</div>
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
              <div className="text-2xl font-bold">78%</div>
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
              <div className="text-2xl font-bold">5</div>
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
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
        </div>

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
              {mockJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={job.match >= 80 ? "default" : "secondary"}>
                      {job.match}% match
                    </Badge>
                  </div>
                </div>
              ))}
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
              {mockSkills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} />
                </div>
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link to="/skills">Manage Skills</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Complete your profile and boost your visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/profile/video">
                  <Video className="w-6 h-6" />
                  <span>Upload Video Intro</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/profile/documents">
                  <FileText className="w-6 h-6" />
                  <span>Update Resume</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/career-guidance">
                  <BookOpen className="w-6 h-6" />
                  <span>Career Guidance</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
