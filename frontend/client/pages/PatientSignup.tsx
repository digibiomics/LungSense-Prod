// frontend/src/pages/PatientSignup.tsx
// screenshot (if you need it): /mnt/data/3ad10541-ded0-49be-9798-f971b5a10aca.png

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Activity, X, ShieldCheck } from "lucide-react";
import { useState, ChangeEvent, FormEvent } from "react";

/**
 * If you want to demo UI/navigation without backend,
 * set USE_DUMMY = true. When ready to re-enable backend,
 * set it to false and ensure PATIENT_SIGNUP_URL is reachable.
 */
const USE_DUMMY = true;
const PATIENT_SIGNUP_URL = "http://localhost:8000/auth/signup/patient";

type PatientFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  practitionerName: string;
  birthdate: string; // stored as yyyy-mm-dd from <input type="date">
  ethnicity: string;
  sex: string;
  consent: boolean;
};

export default function PatientSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    practitionerName: "",
    birthdate: "",
    ethnicity: "",
    sex: "",
    consent: false,
  });
  
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handles <input>, <select> and checkbox
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const { name, type, checked, value } = target;
      const newValue: string | boolean = type === "checkbox" ? checked : value;
      setFormData((prev) => ({ ...prev, [name]: newValue }) as any);
      return;
    }
    // HTMLSelectElement
    if (target instanceof HTMLSelectElement) {
      const { name, value } = target;
      setFormData((prev) => ({ ...prev, [name]: value }) as any);
    }
  };

  const validate = (data: PatientFormData) => {
    if (!data.email) return "Email is required.";
    if (!data.password || data.password.length < 6)
      return "Password should be at least 6 characters.";
    if (!data.firstName || !data.lastName) return "Full name is required.";
    if (!data.birthdate) return "Birthdate is required.";
    if (!data.ethnicity) return "Please select ethnicity.";
    if (!data.sex) return "Please select sex.";
    if (!data.consent) return "You must agree to the privacy policy.";
    return null;
  };

  // convert "yyyy-mm-dd" -> "dd-mm-yyyy"
  const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const [yyyy, mm, dd] = parts;
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Build payload with snake_case keys for backend compatibility
      const payload = {
        role: "patient",
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        practitioner_name: formData.practitionerName || undefined,
        birthdate: formData.birthdate
          ? formatDateToDDMMYYYY(formData.birthdate)
          : undefined,
        ethnicity: formData.ethnicity || undefined,
        sex: formData.sex || undefined,
        consent: formData.consent,
      };

      if (USE_DUMMY) {
        // Dummy success flow for demo/approval: wait a moment then navigate
        await new Promise((res) => setTimeout(res, 600));
        // Optionally you could store a dummy auth token in localStorage here
        navigate("/patient/login");
        return;
      }

      // Real backend call (only when USE_DUMMY === false)
      const res = await fetch(PATIENT_SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Signup failed (${res.status})`;
        try {
          const json = await res.json();
          if (json?.detail) msg = json.detail;
          else if (json?.message) msg = json.message;
        } catch {
          /* ignore parse error */
        }
        throw new Error(msg);
      }

      // On success, navigate to login page
      navigate("/patient/login");
    } catch (err: any) {
      // keep error user-friendly
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      <header className="bg-transparent border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo-new.png" alt="LungSense Logo" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
            {/*Title*/}
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

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                  required
                />
              </div>

              <div className="pt-2">
                <h5 className="text-lg font-bold text-lungsense-blue font-display">
                  Create your Candidate Profile
                </h5>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practionerName" className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium">
                  Y O U R &nbsp; P R A C T I O N E R's &nbsp; N A M E
                </Label>
                <Input
                  id="practionerName"
                  name="practionerName"
                  type="text"
                  placeholder="Dr. Clara Smith"
                  value={formData.practionerName}
                  onChange={handleChange}
                  className="font-display bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs uppercase tracking-wider text-gray-700 font-dm font-medium">
                  L O C A T I O N
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Canada"
                  value={formData.location}
                  onChange={handleChange}
                  className="font-display bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="consent" className="text-xs text-gray-600">
                  I agree to the privacy policy and data collection for research
                  purposes.
                </Label>
              </div>

              {/* Privacy Notice with Modal Trigger */}
              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 text-center border border-gray-100">
                <p className="font-dm">
                  By Signing Up, You agree to consent to our data collection for
                  <br />
                  research purposes.{" "}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPrivacyOpen(true);
                    }}
                    className="text-lungsense-blue hover:underline font-medium bg-transparent border-none cursor-pointer p-0 inline"
                  >
                    Read our privacy policy here
                  </button>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue/90 text-white font-bold font-display py-6 rounded-lg shadow-md transition-all hover:translate-y-[-1px]"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link
              to="/select-role"
                  className="text-sm text-gray-600 hover:text-lungsense-blue"
            >
              ← Back to role selection
            </Link>
          </div>
        </div>
      </main>
      
      {/*Footer*/}
      <footer className="w-full text-center py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>
      
      {/* PRIVACY MODAL (Rendered conditionally at root level of component) */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lungsense-blue/10 rounded-full flex items-center justify-center">
                             <ShieldCheck className="w-6 h-6 text-lungsense-blue" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-xl text-gray-900">Privacy Policy</h3>
                            <p className="text-xs text-gray-500">Last updated: 2 December 2025</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsPrivacyOpen(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm text-gray-600 font-dm leading-relaxed">
                    <p> This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our medical AI diagnostic application (“Service”). The Service analyzes health information—including symptoms, medical images, and audio—to provide diagnostic insights or decision support to consumers and healthcare professionals.

We are committed to complying with applicable privacy, data protection, and medical device regulations, including the GDPR, UK GDPR, CCPA/CPRA, PIPEDA, LGPD, Australia Privacy Act, Singapore PDPA, and applicable U.S. laws such as HIPAA (when used by covered entities).

If you do not agree with this Policy, please do not use the Service.</p>
                    <p><strong>1. Data Collection & Usage:</strong> We collect respiratory data (audio/images) solely for the purpose of providing AI-generated diagnostic insights. Your data is anonymized before processing.</p>
                    <p><strong>2. HIPAA & GDPR Compliance:</strong> LungSense adheres to strict international standards for medical data protection. Your personal identifiers are encrypted at rest and in transit.</p>
                    <p><strong>3. Data Retention:</strong> Uploaded files are temporarily stored for analysis and are and used for further model re-training and development.</p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 text-xs mt-4">
                        <strong>Note:</strong> By proceeding, you acknowledge that this AI tool is for screening purposes only, that you are minimum 18 years of age and consent to the above mentioned terms.
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <Button onClick={() => setIsPrivacyOpen(false)} className="bg-lungsense-blue text-white hover:bg-lungsense-blue/90">
                        I Understand
                    </Button>
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
}
