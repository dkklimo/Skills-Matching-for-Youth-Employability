import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Skill {
  id: string;
  skill_id: string;
  skill_name: string;
  level: number;
}

interface AvailableSkill {
  id: string;
  name: string;
  category: string | null;
}

export function ManageSkillsDialog({ userId, onUpdate }: { userId: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("1");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSkills();
      fetchAvailableSkills();
    }
  }, [open]);

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("student_skills")
      .select(`
        id,
        skill_id,
        level,
        skills(name)
      `)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error fetching skills", variant: "destructive" });
      return;
    }

    setSkills(
      data?.map((s: any) => ({
        id: s.id,
        skill_id: s.skill_id,
        skill_name: s.skills?.name || "Unknown",
        level: s.level,
      })) || []
    );
  };

  const fetchAvailableSkills = async () => {
    const { data, error } = await supabase.from("skills").select("id, name, category").order("name");

    if (error) {
      toast({ title: "Error fetching available skills", variant: "destructive" });
      return;
    }

    setAvailableSkills(data || []);
  };

  const addSkill = async () => {
    if (!selectedSkillId) {
      toast({ title: "Please select a skill", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("student_skills").insert({
      user_id: userId,
      skill_id: selectedSkillId,
      level: parseInt(selectedLevel),
    });

    setLoading(false);

    if (error) {
      toast({ title: "Error adding skill", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Skill added successfully" });
    setSelectedSkillId("");
    setSelectedLevel("1");
    fetchSkills();
    onUpdate();
  };

  const deleteSkill = async (skillId: string) => {
    const { error } = await supabase.from("student_skills").delete().eq("id", skillId);

    if (error) {
      toast({ title: "Error removing skill", variant: "destructive" });
      return;
    }

    toast({ title: "Skill removed" });
    fetchSkills();
    onUpdate();
  };

  const updateSkillLevel = async (skillId: string, newLevel: number) => {
    const { error } = await supabase
      .from("student_skills")
      .update({ level: newLevel })
      .eq("id", skillId);

    if (error) {
      toast({ title: "Error updating skill", variant: "destructive" });
      return;
    }

    toast({ title: "Skill level updated" });
    fetchSkills();
    onUpdate();
  };

  const getLevelLabel = (level: number) => {
    if (level <= 33) return "Beginner";
    if (level <= 66) return "Intermediate";
    return "Expert";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Brain className="h-4 w-4" />
          Manage Skills
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Your Skills</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Skill */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold">Add New Skill</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Skill</Label>
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills
                      .filter((s) => !skills.find((existing) => existing.skill_id === s.id))
                      .map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name} {skill.category && `(${skill.category})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Beginner (0-33%)</SelectItem>
                    <SelectItem value="50">Intermediate (34-66%)</SelectItem>
                    <SelectItem value="90">Expert (67-100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addSkill} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Skill
            </Button>
          </div>

          {/* Current Skills */}
          <div className="space-y-4">
            <h3 className="font-semibold">Your Skills</h3>
            <ScrollArea className="h-[300px] pr-4">
              {skills.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No skills added yet</p>
              ) : (
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.skill_name}</span>
                          <Badge variant="secondary">{getLevelLabel(skill.level)}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Progress value={skill.level} />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSkillLevel(skill.id, 1)}
                            disabled={skill.level <= 33}
                          >
                            Beginner
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSkillLevel(skill.id, 50)}
                            disabled={skill.level > 33 && skill.level <= 66}
                          >
                            Intermediate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSkillLevel(skill.id, 90)}
                            disabled={skill.level > 66}
                          >
                            Expert
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
