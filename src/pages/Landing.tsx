import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Full-Screen Background */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/60 to-secondary/70"></div>
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32 z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              Bridge Skills to{" "}
              <span className="text-secondary-foreground">
                Opportunities
              </span>
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Connect students, educators, and employers to build the workforce of tomorrow
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth/login">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Path</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Discover opportunities, build skills, and launch your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Create your professional profile</li>
                <li>• Match skills with job opportunities</li>
                <li>• Get career guidance & resources</li>
                <li>• Apply for jobs & internships</li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/auth/register?role=student">Join as Student</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-accent">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Educators</CardTitle>
              <CardDescription>
                Guide students and shape the future workforce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Upload training materials</li>
                <li>• Map skills to job roles</li>
                <li>• Monitor student progress</li>
                <li>• Recommend learning paths</li>
              </ul>
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90">
                <Link to="/auth/register?role=educator">Join as Educator</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-secondary">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Employers</CardTitle>
              <CardDescription>
                Find talent and build your dream team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Post job vacancies</li>
                <li>• Search qualified candidates</li>
                <li>• Define skill requirements</li>
                <li>• Receive applications</li>
              </ul>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/auth/register?role=employer">Join as Employer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Smart Matching", desc: "AI-powered job matching based on skills" },
              { title: "Career Guidance", desc: "Personalized learning paths and resources" },
              { title: "Skill Assessment", desc: "Interactive quizzes to validate skills" },
              { title: "Rich Profiles", desc: "Video intros, portfolios & certificates" },
            ].map((feature, i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl p-12">
          <h2 className="text-3xl font-bold">Ready to Transform Your Future?</h2>
          <p className="text-lg opacity-90">
            Join thousands of students, educators, and employers already on the platform
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
