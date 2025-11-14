import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Users, Trophy, Sparkles, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-learning.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LearnEase
              </h1>
              <p className="text-2xl text-muted-foreground">
                Your Personal AI Mentor. Your Global Study Circle.
              </p>
              <p className="text-lg text-foreground/80">
                Transform your learning journey with AI-powered personalization, collaborative communities, and gamified motivation.
              </p>
              <div className="flex gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Get Started Free
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="AI-powered learning platform" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Three Powerful Pillars</h2>
          <p className="text-xl text-muted-foreground">Everything you need to excel in your learning journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-primary">
            <Brain className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-3">AI Mentor</h3>
            <p className="text-muted-foreground mb-4">
              Hyper-personalized learning trained on YOUR content. Upload materials and get instant answers, adaptive quizzes, and intelligent summaries.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                <span>Context-aware AI chatbot</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                <span>Dynamic quiz generation</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                <span>Video & lecture summarization</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-accent">
            <Users className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-3">Community</h3>
            <p className="text-muted-foreground mb-4">
              Never learn alone. Join study circles, connect with mentors, and share knowledge with learners worldwide.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                <span>Real-time study circles</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                <span>1-on-1 mentor sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                <span>Peer material exchange</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-success">
            <Trophy className="w-12 h-12 text-success mb-4" />
            <h3 className="text-2xl font-bold mb-3">Gamification</h3>
            <p className="text-muted-foreground mb-4">
              Stay motivated with achievements, streaks, tournaments, and a visual skill tree that tracks your progress.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                <span>Unique achievement badges</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                <span>Weekly tournaments</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                <span>Visual skill tree progress</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary to-accent py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-foreground/80">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-foreground/80">Quizzes Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Study Circles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-foreground/80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of learners who are already experiencing the future of education with LearnEase.
        </p>
        <Link to="/auth">
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Start Learning Today
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Index;
