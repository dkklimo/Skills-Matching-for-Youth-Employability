import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  approval_status: string;
  job_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export const AdminEmployerOversight = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data: companiesData, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch profiles for each company
    const companiesWithProfiles = await Promise.all(
      (companiesData || []).map(async (company) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", company.employer_id)
          .single();
        
        return {
          ...company,
          profiles: profile || null,
        };
      })
    );

    setCompanies(companiesWithProfiles);
    setLoading(false);
  };

  const handleApprovalStatus = async (companyId: string, status: string) => {
    const { error } = await supabase
      .from("companies")
      .update({ approval_status: status })
      .eq("id", companyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Company ${status}`,
      });
      fetchCompanies();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading employers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employer Oversight</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No companies registered</p>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <Badge
                        variant={
                          company.approval_status === "approved"
                            ? "default"
                            : company.approval_status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {company.approval_status}
                      </Badge>
                    </div>
                    {company.profiles && (
                      <div className="mb-2">
                        <p className="text-sm font-medium">{company.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">{company.profiles.email}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      {company.industry && (
                        <span className="flex items-center gap-1">
                          <Badge variant="outline">{company.industry}</Badge>
                        </span>
                      )}
                      {company.location && <span>📍 {company.location}</span>}
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {company.job_count} active job{company.job_count !== 1 ? "s" : ""}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        Registered: {new Date(company.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {company.approval_status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprovalStatus(company.id, "approved")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApprovalStatus(company.id, "rejected")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {company.approval_status !== "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprovalStatus(company.id, "pending")}
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