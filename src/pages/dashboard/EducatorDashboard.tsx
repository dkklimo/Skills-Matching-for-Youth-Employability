import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Video, FileText, TrendingUp, Upload, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateCourseDialog } from "@/components/educator/CreateCourseDialog";
import { UploadVideoLectureDialog } from "@/components/educator/UploadVideoLectureDialog";
import { UploadMaterialsDialog } from "@/components/educator/UploadMaterialsDialog";
import { MapSkillsToJobsDialog } from "@/components/educator/MapSkillsToJobsDialog";

interface StudentActivity {
  id: string;
  name: string;
  course: string;
  progress: number;
}

interface Course {
  id: string;
  title: string;
  students: number;
  rating: number;
}

const EducatorDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    videoLectures: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [uploadVideoOpen, setUploadVideoOpen] = useState(false);
  const [uploadMaterialsOpen, setUploadMaterialsOpen] = useState(false);
  const [mapSkillsOpen, setMapSkillsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch educator's courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          rating,
          total_students,
          status
        `)
        .eq('educator_id', user?.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch active courses count
      const { count: activeCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('educator_id', user?.id)
        .eq('status', 'published');

      // Fetch recent student activity
      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select('user_id, progress, courses!inner(title, educator_id)')
        .eq('courses.educator_id', user?.id)
        .order('enrolled_at', { ascending: false })
        .limit(3);

      // Fetch profiles for enrolled students
      let formattedStudents: StudentActivity[] = [];
      if (enrollmentsData && enrollmentsData.length > 0) {
        const userIds = enrollmentsData.map(e => e.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        formattedStudents = enrollmentsData.map(enrollment => {
          const profile = profilesData?.find(p => p.id === enrollment.user_id);
          return {
            id: enrollment.user_id,
            name: profile?.full_name || 'Unknown',
            course: enrollment.courses.title,
            progress: enrollment.progress,
          };
        });
      }

      // Calculate total unique students
      const { data: allEnrollments } = await supabase
        .from('course_enrollments')
        .select('user_id, courses!inner(educator_id)')
        .eq('courses.educator_id', user?.id);

      const uniqueStudents = new Set(allEnrollments?.map(e => e.user_id)).size;

      // Calculate average rating
      const avgRating = coursesData?.length
        ? coursesData.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesData.length
        : 0;

      const formattedCourses = coursesData?.map(course => ({
        id: course.id,
        title: course.title,
        students: course.total_students || 0,
        rating: course.rating || 0,
      })) || [];

      setStudents(formattedStudents);
      setCourses(formattedCourses);
      setStats({
        totalStudents: uniqueStudents,
        activeCourses: activeCourses || 0,
        videoLectures: 0, // TODO: Implement video lectures tracking
        avgRating: Number(avgRating.toFixed(1)),
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
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalStudents}</div>
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
              <div className="text-2xl font-bold">{loading ? "..." : stats.activeCourses}</div>
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
              <div className="text-2xl font-bold">{loading ? "..." : stats.videoLectures}</div>
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
              <div className="text-2xl font-bold">{loading ? "..." : stats.avgRating}</div>
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
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : students.length === 0 ? (
                <p className="text-center text-muted-foreground">No student activity yet</p>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">{student.course}</p>
                    </div>
                    <Badge variant={student.progress >= 75 ? "default" : "secondary"}>
                      {student.progress}%
                    </Badge>
                  </div>
                ))
              )}
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
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : courses.length === 0 ? (
                <p className="text-center text-muted-foreground">No courses created yet</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-medium mb-2">{course.title}</h4>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.students} students</span>
                      <span>★ {course.rating}</span>
                    </div>
                  </div>
                ))
              )}
              <Button onClick={() => setCreateCourseOpen(true)} className="w-full">
                Create New Course
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
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setUploadVideoOpen(true)}
              >
                <Video className="w-6 h-6" />
                <span>Upload Video Lecture</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setUploadMaterialsOpen(true)}
              >
                <FileText className="w-6 h-6" />
                <span>Upload Materials</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setMapSkillsOpen(true)}
              >
                <Upload className="w-6 h-6" />
                <span>Map Skills to Jobs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateCourseDialog
        open={createCourseOpen}
        onOpenChange={setCreateCourseOpen}
        onSuccess={fetchDashboardData}
        educatorId={user?.id || ""}
      />

      <UploadVideoLectureDialog
        open={uploadVideoOpen}
        onOpenChange={setUploadVideoOpen}
        onSuccess={fetchDashboardData}
        educatorId={user?.id || ""}
      />

      <UploadMaterialsDialog
        open={uploadMaterialsOpen}
        onOpenChange={setUploadMaterialsOpen}
        onSuccess={fetchDashboardData}
        educatorId={user?.id || ""}
      />

      <MapSkillsToJobsDialog
        open={mapSkillsOpen}
        onOpenChange={setMapSkillsOpen}
        onSuccess={fetchDashboardData}
        educatorId={user?.id || ""}
      />
    </div>
  );
};

export default EducatorDashboard;
