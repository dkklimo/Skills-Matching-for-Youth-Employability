import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  date: string;
  students: number;
  educators: number;
  employers: number;
}

export const AdminAnalyticsChart = () => {
  const [registrationData, setRegistrationData] = useState<AnalyticsData[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [applicationData, setApplicationData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch registration trends
    const { data: analytics } = await supabase
      .from("user_analytics")
      .select("*")
      .order("date", { ascending: true });

    if (analytics) {
      const grouped = analytics.reduce((acc: any, curr) => {
        const date = curr.date;
        if (!acc[date]) {
          acc[date] = { date, students: 0, educators: 0, employers: 0 };
        }
        acc[date][curr.role] = curr.count;
        return acc;
      }, {});
      setRegistrationData(Object.values(grouped));
    }

    // Fetch top skills
    const { data: skills } = await supabase
      .from("student_skills")
      .select("skill_id, skills(name)")
      .limit(100);

    if (skills) {
      const skillCounts = skills.reduce((acc: any, curr: any) => {
        const name = curr.skills?.name || "Unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const topSkills = Object.entries(skillCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 8);
      
      setSkillsData(topSkills);
    }

    // Fetch application stats
    const { data: applications } = await supabase
      .from("job_applications")
      .select("status");

    if (applications) {
      const statusCounts = applications.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      setApplicationData(
        Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
      );
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="educators" stroke="hsl(var(--secondary))" strokeWidth={2} />
              <Line type="monotone" dataKey="employers" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Skills Among Students</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={applicationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {applicationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};