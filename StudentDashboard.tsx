import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, LogOut, User } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Student</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground">
              Ready to practice your interview skills?
            </p>
          </div>

          <Card className="p-8 hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="p-6 rounded-full bg-primary/10">
                  <Video className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Practice Interview</h3>
                <p className="text-muted-foreground mb-4">
                  Start a mock interview session and get instant feedback on your
                  performance
                </p>
              </div>
              <Button size="lg" className="md:flex-shrink-0">
                Start Practice Interview
              </Button>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-muted-foreground">
                Interviews Completed
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-bold text-accent mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-muted-foreground">
                Hours Practiced
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
