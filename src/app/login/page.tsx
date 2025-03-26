/* File: app/login/page.tsx */
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm p-4 shadow-md">
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-semibold text-center">Login</h1>
          <form className="space-y-4">
            <Input type="email" placeholder="Email" required />
            <Input type="password" placeholder="Password" required />
            <Button type="submit" className="w-full">Log in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}