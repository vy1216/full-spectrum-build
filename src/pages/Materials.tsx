import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, PlusCircle, Loader2, UploadCloud } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Material {
  id: string;
  name: string;
  description: string;
  file_url: string;
  uploader_id: string;
  created_at: string;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("materials").select("*");
      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching materials",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to upload.", variant: "destructive" });
      return;
    }
    
    const fileInput = event.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!newMaterialName.trim() || !file) {
      toast({ title: "Validation Error", description: "Material name and file are required.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      let { error: uploadError } = await supabase.storage.from("materials").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("materials").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("materials").insert({
        name: newMaterialName,
        description: newMaterialDescription,
        uploader_id: user.id,
        file_url: publicUrlData.publicUrl,
      });

      if (dbError) throw dbError;

      fetchMaterials(); // Refresh the list
      toast({ title: "Success", description: "Material uploaded successfully." });
      setUploadDialogOpen(false);
      setNewMaterialName("");
      setNewMaterialDescription("");
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Materials</h1>
          <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleUploadMaterial}>
                <DialogHeader>
                  <DialogTitle>Upload a new Material</DialogTitle>
                  <DialogDescription>
                    Share your study resources with the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} className="col-span-3" placeholder="e.g. React Cheatsheet" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={newMaterialDescription} onChange={(e) => setNewMaterialDescription(e.target.value)} className="col-span-3" placeholder="A quick guide to React hooks." />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">File</Label>
                    <Input id="file" type="file" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : materials.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No materials found</h3>
            <p className="text-muted-foreground">Upload some study materials to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle>{material.name}</CardTitle>
                  <CardDescription>{material.description || "No description."}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">View Material</Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Materials;
