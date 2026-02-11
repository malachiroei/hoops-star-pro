import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (password === "2101") {
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        onLogin();
      } else {
        toast({
          title: "Invalid Password",
          description: "Please try again.",
          variant: "destructive",
        });
        setPassword("");
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">🏀 Hoops Star Pro</CardTitle>
          <CardDescription>Enter your password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e as any);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || password.length === 0}
            >
              {isLoading ? "Checking..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
