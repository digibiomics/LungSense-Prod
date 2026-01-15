import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState, ChangeEvent, FormEvent } from "react";
import { loginPatient } from "../../src/api"; // ✅ real backend API

type LoginForm = {
  email: string;
  password: string;
};

export default function PatientLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ============================
     INPUT HANDLER
  ============================ */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ============================
     SUBMIT
  ============================ */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ REAL BACKEND LOGIN
      const res = await loginPatient(formData);

      // 🔐 STORE AUTH DETAILS
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user_id", String(res.user_id));
      localStorage.setItem("role", res.role);

      // ✅ NAVIGATE
      navigate("/patient/select-profile");
    } catch (err: any) {
      setError(err?.detail || err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================
     UI (UNCHANGED STYLING)
  ============================ */
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      {/* Header */}
      <header className="bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)] border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/logo-new.png"
              alt="LungSense Logo"
              className="h-10 w-auto"
            />
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
                  to="/patient/signup"
                  className="text-lungsense-blue hover:underline font-medium"
                >
                  Sign Up here
                </Link>
              </p>
            </div>

            {error && (
              <div
                className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  autoComplete="email"
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
                  name="password"
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={handleChange}
                  className="font-display"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display"
                size="lg"
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
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

      {/* Footer */}
      <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>
    </div>
  );
}
