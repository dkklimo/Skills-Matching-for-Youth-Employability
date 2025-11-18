import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Certificate {
  id: string;
  course_id: string;
  completed_at: string;
  course: {
    title: string;
    description: string | null;
  };
}

export function CertificatesView({ userId }: { userId: string }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("course_enrollments")
      .select(`
        id,
        course_id,
        completed_at,
        course:courses(title, description)
      `)
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching certificates",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCertificates(data as Certificate[]);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading certificates...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">No certificates yet</p>
        <p className="text-sm text-muted-foreground">Complete courses to earn certificates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <Card key={cert.id} className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  {cert.course.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {cert.course.description || "Course completed successfully"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-4">
                Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Completed on {format(new Date(cert.completed_at), "MMM d, yyyy")}
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
