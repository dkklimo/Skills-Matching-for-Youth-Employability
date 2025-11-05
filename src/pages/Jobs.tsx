import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Clock, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Job {
  id: string;
  title: string;
  company: { name: string };
  location: string;
  job_type: string;
  posted_at: string;
  job_skills: Array<{ skill: { name: string } }>;
}

const Jobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("all");
  const [locationType, setLocationType] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, jobType, locationType]);

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          job_type,
          posted_at,
          company:companies(name),
          job_skills(skill:skills(name))
        `)
        .eq('status', 'open')
        .order('posted_at', { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (jobType !== 'all') {
        const typeMap: { [key: string]: string } = {
          fulltime: 'Full-time',
          parttime: 'Part-time',
          internship: 'Internship',
        };
        query = query.eq('job_type', typeMap[jobType]);
      }

      if (locationType !== 'all') {
        if (locationType === 'remote') {
          query = query.ilike('location', '%remote%');
        } else {
          query = query.not('location', 'ilike', '%remote%');
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Applied",
            description: "You have already applied for this job",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully",
        });
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const mockJobs = [
    {
      id: 1,
      title: "Junior Frontend Developer",
      company: "TechCorp Inc",
      location: "Remote",
      type: "Full-time",
      skills: ["React", "TypeScript", "CSS"],
      posted: "2 days ago",
      match: 85,
    },
    {
      id: 2,
      title: "Data Analyst Intern",
      company: "DataFlow Solutions",
      location: "New York, NY",
      type: "Internship",
      skills: ["Python", "SQL", "Excel"],
      posted: "5 days ago",
      match: 78,
    },
    {
      id: 3,
      title: "UX Designer",
      company: "DesignHub",
      location: "San Francisco, CA",
      type: "Full-time",
      skills: ["Figma", "User Research", "Prototyping"],
      posted: "1 week ago",
      match: 72,
    },
    {
      id: 4,
      title: "Backend Developer",
      company: "CloudServe",
      location: "Remote",
      type: "Full-time",
      skills: ["Node.js", "MongoDB", "AWS"],
      posted: "3 days ago",
      match: 80,
    },
    {
      id: 5,
      title: "Marketing Coordinator",
      company: "BrandBoost",
      location: "Chicago, IL",
      type: "Part-time",
      skills: ["Social Media", "Content Writing", "Analytics"],
      posted: "1 day ago",
      match: 65,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="opacity-90">Explore opportunities that match your skills</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, skills, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fulltime">Full-time</SelectItem>
                  <SelectItem value="parttime">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Results */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Loading jobs...</p>
              </CardContent>
            </Card>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No jobs found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">{job.company?.name}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.job_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getRelativeTime(job.posted_at)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.job_skills?.map((js, idx) => (
                      <Badge key={idx} variant="secondary">
                        {js.skill.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApply(job.id)}>Apply Now</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
