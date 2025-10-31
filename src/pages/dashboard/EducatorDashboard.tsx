import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Video, FileText, TrendingUp, Upload, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const EducatorDashboard = () => {
  const { signOut } = useAuth();
  const mockStudents = [
    { id: 1, name: "Alice Johnson", course: "Web Development", progress: 75 },
    { id: 2, name: "Bob Smith", course: "Data Science", progress: 60 },
    { id: 3, name: "Carol Davis", course: "UX Design", progress: 85 },
  ];

  const mockCourses = [
    { id: 1, title: "Introduction to React", students: 45, rating: 4.8 },
    { id: 2, title: "Python Fundamentals", students: 67, rating: 4.9 },
    { id: 3, title: "Data Structures", students: 32, rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-secondary to-accent text-primary-foreground p-6 md:p-8">
        <div className="container mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Educator Dashboard</h1>
            <p className="opacity-90">Shape the future workforce</p>
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
                <Users className="w-4 h-4 text-secondary" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">144</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                Active Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Video Lectures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Student Activity</CardTitle>
              <CardDescription>Monitor student progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                  </div>
                  <Badge variant={student.progress >= 75 ? "default" : "secondary"}>
                    {student.progress}%
                  </Badge>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link to="/students">View All Students</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Your Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>Manage your teaching materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCourses.map((course) => (
                <div key={course.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-2">{course.title}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.students} students</span>
                    <span>★ {course.rating}</span>
                  </div>
                </div>
              ))}
              <Button asChild className="w-full">
                <Link to="/courses/new">Create New Course</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Upload content and manage your materials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/upload/video">
                  <Video className="w-6 h-6" />
                  <span>Upload Video Lecture</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/upload/material">
                  <FileText className="w-6 h-6" />
                  <span>Upload Materials</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/skills/map">
                  <Upload className="w-6 h-6" />
                  <span>Map Skills to Jobs</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducatorDashboard;
