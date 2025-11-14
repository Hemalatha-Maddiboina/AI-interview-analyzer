import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Building2 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interview Practice Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master your interview skills or find the perfect candidate
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">For Students</h2>
                <p className="text-muted-foreground mb-6">
                  Practice interview questions and improve your skills
                </p>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/auth?type=student")}
              >
                Get Started as Student
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Building2 className="w-12 h-12 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">For Companies</h2>
                <p className="text-muted-foreground mb-6">
                  Create job positions and find qualified candidates
                </p>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full"
                onClick={() => navigate("/auth?type=company")}
              >
                Get Started as Company
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
