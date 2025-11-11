import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Star, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  approval_status: string;
  rating: number | null;
  total_students: number | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export const AdminEducatorOversight = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data: coursesData, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch profiles for each course
    const coursesWithProfiles = await Promise.all(
      (coursesData || []).map(async (course) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", course.educator_id)
          .single();
        
        return {
          ...course,
          profiles: profile || null,
        };
      })
    );

    setCourses(coursesWithProfiles);
    setLoading(false);
  };

  const handleApprovalStatus = async (courseId: string, status: string) => {
    const { error } = await supabase
      .from("courses")
      .update({ approval_status: status })
      .eq("id", courseId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Course ${status}`,
      });
      fetchCourses();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading courses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Educator Oversight</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No courses created</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <Badge variant={course.status === "published" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                      <Badge
                        variant={
                          course.approval_status === "approved"
                            ? "default"
                            : course.approval_status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {course.approval_status}
                      </Badge>
                    </div>
                    {course.profiles && (
                      <div className="mb-2">
                        <p className="text-sm font-medium">Educator: {course.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">{course.profiles.email}</p>
                      </div>
                    )}
                    {course.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.total_students || 0} students
                      </div>
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          {course.rating.toFixed(1)}
                        </div>
                      )}
                      <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {course.approval_status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprovalStatus(course.id, "approved")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApprovalStatus(course.id, "rejected")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {course.approval_status !== "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprovalStatus(course.id, "pending")}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Reset Status
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};