import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Application {
  id: string;
  applied_at: string; // Changed from created_at to applied_at
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
  jobs: {
    title: string;
  };
}

const ITEMS_PER_PAGE = 10;

const AllCandidates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  useEffect(() => {
    if (user) {
      fetchApplications(currentPage);
    }
  }, [user, currentPage]);

  const fetchApplications = async (page: number) => {
    setLoading(true);
    try {
      // Fetch company for current employer
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('employer_id', user?.id)
        .single();

      if (companyError || !companyData) {
        toast({
          title: "Error",
          description: "Could not find associated company profile.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      type RawApplication = {
        id: string;
        applied_at: string; // Changed from created_at to applied_at
        status: string;
        user_id: string;
        jobs: { title: string } | null;
      };

      const { data: applicationsRawData, error: applicationsError, count } = await supabase
        .from("job_applications")
        .select(
          `
            id,
            applied_at,
            status,
            user_id,
            jobs!inner(title)
          `,
          { count: "exact" }
        );

      if (applicationsError) throw applicationsError;

      const applicationsData: RawApplication[] = applicationsRawData || [];

      if (applicationsData.length === 0) {
        setApplications([]);
        setTotalApplications(count || 0);
        setLoading(false);
        return;
      }

      const userIds = applicationsData.map(app => app.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      const formattedApplications: Application[] = applicationsData.map(app => ({
        id: app.id,
        applied_at: app.applied_at, // Changed from created_at to applied_at
        status: app.status,
        profiles: {
          full_name: profilesMap.get(app.user_id)?.full_name || "N/A",
          email: profilesMap.get(app.user_id)?.email || "N/A",
        },
        jobs: {
          title: app.jobs?.title || "N/A",
        },
      }));

      setApplications(formattedApplications);
      setTotalApplications(count || 0);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalApplications / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewCandidate = (candidateId: string) => {
    // TODO: Implement navigation to candidate profile page
    toast({
      title: "View Candidate",
      description: `Viewing profile for candidate ID: ${candidateId}`,
    });
    console.log(`View candidate with ID: ${candidateId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            All Candidates
          </CardTitle>
          <CardDescription>View and manage all applications to your job postings.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applications found yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate Name</TableHead>
                      <TableHead>Job Applied For</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>{app.jobs?.title || "N/A"}</TableCell>
                        <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === "Hired" ? "default" : app.status === "Reviewed" ? "secondary" : "outline"}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewCandidate(app.profiles.full_name)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={handlePreviousPage} disabled={currentPage === 1} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <Button
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={handleNextPage} disabled={currentPage === totalPages} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllCandidates;
