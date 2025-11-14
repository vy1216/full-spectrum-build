import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Trophy, BookOpen, LogOut, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LearnEase
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.username || "Learner"}!
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tokens</CardDescription>
              <CardTitle className="text-3xl">{profile?.tokens || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Earn by helping others</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl">{profile?.current_streak || 0} 🔥</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Keep learning daily</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quizzes Completed</CardDescription>
              <CardTitle className="text-3xl">{profile?.total_quizzes_completed || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Keep testing yourself</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Reputation</CardDescription>
              <CardTitle className="text-lg">{profile?.reputation_level || "Bronze Learner"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Level up by learning</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <Brain className="w-12 h-12 text-primary mb-2" />
              <CardTitle>AI Mentor</CardTitle>
              <CardDescription>Chat with your personal AI tutor</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-primary to-accent">
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-accent">
            <CardHeader>
              <BookOpen className="w-12 h-12 text-accent mb-2" />
              <CardTitle>My Materials</CardTitle>
              <CardDescription>View and upload study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Materials
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-success">
            <CardHeader>
              <Users className="w-12 h-12 text-success mb-2" />
              <CardTitle>Study Circles</CardTitle>
              <CardDescription>Join collaborative learning rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explore Circles
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">More Features Coming Soon</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="opacity-75">
              <CardHeader>
                <Trophy className="w-8 h-8 text-muted-foreground mb-2" />
                <CardTitle className="text-muted-foreground">Quiz System</CardTitle>
                <CardDescription>AI-generated adaptive quizzes</CardDescription>
              </CardHeader>
            </Card>
            <Card className="opacity-75">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                <CardTitle className="text-muted-foreground">Skill Tree</CardTitle>
                <CardDescription>Visual progress tracking</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
