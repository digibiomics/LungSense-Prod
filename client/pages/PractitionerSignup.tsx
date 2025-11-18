import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useState } from "react";

export default function PractitionerSignup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    practitionerId: "",
    institution: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Practitioner Signup:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lungsense-blue-light to-white">
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
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2 font-display">
                Hi! Welcome to
              </h2>
              <h3 className="text-2xl font-bold text-lungsense-blue font-display">
                LungSense
              </h3>
              <p className="text-sm text-gray-600 mt-4 font-dm">
                Already have an account?{" "}
                <Link
                  to="/practitioner/login"
                  className="text-lungsense-blue hover:underline font-medium"
                >
                  Log in here
                </Link>
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    F I R S T&nbsp;N A M E
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Jiara"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="font-display"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    L A S T&nbsp;N A M E
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="font-display"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                >
                  E M A I L
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hello@reallygreatsite.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="font-display"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="practitionerId"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    P R A C T I T I O N E R&nbsp; I D
                  </Label>
                  <Input
                    id="practitionerId"
                    name="practitionerId"
                    type="text"
                    placeholder="238447"
                    value={formData.practitionerId}
                    onChange={handleChange}
                    className="font-display"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="institution"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    I N S T I T U T I O N
                  </Label>
                  <Input
                    id="institution"
                    name="institution"
                    type="text"
                    placeholder="SickKids"
                    value={formData.institution}
                    onChange={handleChange}
                    className="font-display"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="institutionLocation"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                >
                  I N S T I T U T I O N&nbsp; L O C A T I O N
                </Label>
                <Input
                  id="institutionLocation"
                  name="institutionLocation"
                  type="text"
                  placeholder="23 Simcoe St"
                  value={formData.password}
                  onChange={handleChange}
                  className="font-display"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                >
                  C R E A T E&nbsp;P A S S W O R D
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="font-display"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 text-center">
                <p className="font-dm">
                  By Signing Up, You agree to consent to our data collection for
                  <br />
                  research purposes.{" "}
                  <a
                    href="#"
                    className="text-lungsense-blue hover:underline font-medium"
                  >
                    Read our privacy policy here
                  </a>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-bold font-display py-6 rounded-lg"
                size="lg"
              >
                Sign Up
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
