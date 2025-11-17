import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function PractitionerLogin() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Activity className="w-8 h-8 text-lungsense-blue" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-lg">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2 font-display">
                User Login
              </h2>
              <p className="text-sm text-gray-600 font-dm">
                Don't have an account?{" "}
                <Link
                  to="/practitioner/signup"
                  className="text-lungsense-blue hover:underline font-medium"
                >
                  Sign Up here
                </Link>
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  E M A I L
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@reallygreatsite.com"
                  className="font-display"
                />
              </div>



              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  P A S S W O R D
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  className="font-display"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-bold font-display"
                size="lg"
              >
                Login
              </Button>
            </form>
          </Card>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              to="/select-role"
              className="text-sm text-gray-600 hover:text-lungsense-blue transition-colors"
            >
              ← Back to role selection
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
