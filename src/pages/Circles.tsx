import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, PlusCircle, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Circle {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  creator_id: string;
  created_at: string;
}

const Circles = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleDescription, setNewCircleDescription] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("study_circles")
        .select("*")
        .eq("is_public", true);

      if (error) throw error;
      setCircles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching circles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCircle = async () => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a circle.", variant: "destructive" });
        return;
    }
    if (!newCircleName.trim()) {
        toast({ title: "Validation Error", description: "Circle name cannot be empty.", variant: "destructive" });
        return;
    }

    try {
      const { data, error } = await supabase
        .from("study_circles")
        .insert({
          name: newCircleName,
          description: newCircleDescription,
          creator_id: user.id,
          is_public: true, // Defaulting to public for now
        })
        .select();

      if (error) throw error;
      if (data) {
        setCircles([ ...circles, data[0] ]);
        toast({
          title: "Circle Created!",
          description: `The circle "${newCircleName}" has been created.`,
        });
      }
      setNewCircleName("");
      setNewCircleDescription("");
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error creating circle",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Placeholder for joining a circle
  const handleJoinCircle = (circleId: string) => {
    toast({
        title: "Coming Soon!",
        description: "Joining circles is not yet implemented.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Study Circles</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Circle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a new Study Circle</DialogTitle>
                <DialogDescription>
                  Start a new collaborative learning room.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newCircleName}
                    onChange={(e) => setNewCircleName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. React Ninjas"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newCircleDescription}
                    onChange={(e) => setNewCircleDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. A group for mastering React."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateCircle}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No circles found</h3>
            <p className="text-muted-foreground">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => (
              <Card key={circle.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{circle.name}</CardTitle>
                  <CardDescription>{circle.description || "No description provided."}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <Button className="w-full mt-4" onClick={() => handleJoinCircle(circle.id)}>Join Circle</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Circles;