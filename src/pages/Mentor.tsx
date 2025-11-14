import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Brain, User, Loader2 } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
}

const Mentor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        text: `This is a simulated response to: "${input}". The real AI Tutor is coming soon!`,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="text-center">
          <Brain className="w-12 h-12 text-primary mx-auto mb-2" />
          <CardTitle>AI Mentor</CardTitle>
          <CardDescription>Your personal AI-powered learning companion.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.isUser ? "justify-end" : ""}`}>
                {!msg.isUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><Brain size={20}/></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-2 max-w-[75%] ${ msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted" }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.isUser && (
                  <Avatar className="w-8 h-8">
                     <AvatarFallback><User size={20}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback><Brain size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin"/>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Mentor anything..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Mentor;
