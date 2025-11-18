import { Link } from "react-router-dom";
import { Activity, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
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
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <Construction className="w-24 h-24 text-lungsense-blue-light mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 font-display">{description}</p>
          )}
          <p className="text-gray-500">
            This page is currently under development. Please continue prompting
            to fill in this page's content.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/">
              <Button variant="outline" className="font-display">
                Back to Home
              </Button>
            </Link>
            <Link to="/select-role">
              <Button className="bg-lungsense-blue hover:bg-lungsense-blue/90 font-display">
                Select Role
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
