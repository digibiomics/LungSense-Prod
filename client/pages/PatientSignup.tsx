import { Link, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useState } from "react";

export default function PatientSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup:", formData);
    // Redirect to dashboard after signup
    navigate("/patient/dashboard");
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
        <div className="max-w-md mx-auto">
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
                  to="/patient/login"
                  className="text-lungsense-blue hover:underline font-medium"
                >
                  Log in here
                </Link>
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
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

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  C R E A T E&nbsp; P A S S W O R D
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={handleChange}
                  className="font-display"
                  required
                />
              </div>

              <h5 className="text-1xl font-bold text-lungsense-blue font-display">
                Create your Candidate Profile
              </h5>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    F I R S T&nbsp; N A M E
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
                    L A S T&nbsp; N A M E
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
                  htmlFor="practionerName"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                >
                  Y O U R &nbsp; P R A C T I O N E R's &nbsp; N A M E
                </Label>
                <Input
                  id="practionerName"
                  name="practionerName"
                  type="text"
                  placeholder="Dr. Clara Smith"
                  value={formData.practionerName}
                  onChange={handleChange}
                  className="font-display"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="birthdate"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                >
                  D A T E &nbsp; O F &nbsp; B I R T H
                </Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  placeholder="01/04/2001"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="font-display"
                  required
                />
              </div>

              <div className="space-y-2">
                  <Label
                    htmlFor="ethnicity"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    E T H N I C I T Y
                  </Label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg font-display text-sm focus:ring-2 focus:ring-lungsense-blue focus:border-transparent">
                    <option>Select Ethnicity</option>
                    <option>Asian</option>
                    <option>African</option>
                    <option>Caucasian</option>
                    <option>Other</option>
                  </select>
              </div>

              <div className="space-y-2">
                  <Label
                    htmlFor="sex"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium"
                  >
                    S E X
                  </Label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg font-display text-sm focus:ring-2 focus:ring-lungsense-blue focus:border-transparent">
                    <option>Select Sex</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
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
