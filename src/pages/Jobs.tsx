import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Clock, Bookmark } from "lucide-react";

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
              <Select defaultValue="all">
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
              <Select defaultValue="all">
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
          {mockJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      {job.match >= 80 && (
                        <Badge className="bg-accent">
                          {job.match}% match
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">{job.company}</CardDescription>
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
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.posted}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button>Apply Now</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
