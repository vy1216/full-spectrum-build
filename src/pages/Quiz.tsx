import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Quiz = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Quiz System</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the Quiz System page. AI-generated adaptive quizzes are coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
