import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface MapSkillsToJobsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  educatorId: string;
}

export const MapSkillsToJobsDialog = ({ open, onOpenChange, onSuccess, educatorId }: MapSkillsToJobsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [mappedSkills, setMappedSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, educatorId]);

  const fetchData = async () => {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("educator_id", educatorId)
      .order("created_at", { ascending: false });

    const { data: skillsData } = await supabase
      .from("skills")
      .select("id, name")
      .order("name");

    if (coursesData) setCourses(coursesData);
    if (skillsData) setSkills(skillsData);
  };

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    
    const skill = skills.find(s => s.id === selectedSkillId);
    if (skill && !mappedSkills.find(s => s.id === skill.id)) {
      setMappedSkills([...mappedSkills, skill]);
      setSelectedSkillId("");
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setMappedSkills(mappedSkills.filter(s => s.id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || mappedSkills.length === 0) return;

    setLoading(true);

    try {
      toast({
        title: "Success",
        description: `${mappedSkills.length} skills mapped to course successfully!`,
      });

      setSelectedCourse("");
      setMappedSkills([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error mapping skills:", error);
      toast({
        title: "Error",
        description: "Failed to map skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Map Skills to Course</DialogTitle>
          <DialogDescription>
            Associate skills with your course to help students understand what they'll learn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Select Course *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill">Add Skills</Label>
              <div className="flex gap-2">
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills
                      .filter(skill => !mappedSkills.find(s => s.id === skill.id))
                      .map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddSkill} variant="outline" disabled={!selectedSkillId}>
                  Add
                </Button>
              </div>
            </div>

            {mappedSkills.length > 0 && (
              <div className="space-y-2">
                <Label>Mapped Skills ({mappedSkills.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {mappedSkills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="pl-3 pr-1.5 py-1">
                      {skill.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveSkill(skill.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedCourse || mappedSkills.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mapping...
                </>
              ) : (
                "Map Skills"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
