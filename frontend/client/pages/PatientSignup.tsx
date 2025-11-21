// frontend/src/pages/PatientSignup.tsx
// screenshot (if you need it): /mnt/data/3ad10541-ded0-49be-9798-f971b5a10aca.png

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-lungsense-blue-light to-white">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <Activity className="w-8 h-8 text-lungsense-blue" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-xl">
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

              <h5 className="text-1xl font-bold text-lungsense-blue font-display">
                Create your Candidate Profile
              </h5>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm"
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
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-xs uppercase tracking-wider text-gray-700 font-dm"
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="practitionerName"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  Y O U R &nbsp; P R A C T I T I O N E R&apos; S &nbsp; N A M E
                </Label>
                <Input
                  id="practitionerName"
                  name="practitionerName"
                  type="text"
                  placeholder="Dr. Clara Smith"
                  value={formData.practitionerName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="birthdate"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  D A T E &nbsp; O F &nbsp; B I R T H
                </Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="ethnicity"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  E T H N I C I T Y
                </Label>
                <select
                  id="ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Ethnicity</option>
                  <option value="asian">Asian</option>
                  <option value="african">African</option>
                  <option value="caucasian">Caucasian</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sex"
                  className="text-xs uppercase tracking-wider text-gray-700 font-dm"
                >
                  S E X
                </Label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
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

              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 text-center">
                <p className="font-dm">
                  By Signing Up, you agree to consent to our data collection for
                  research purposes.
                  <br />
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
                className="w-full bg-lungsense-blue text-white py-6 rounded-lg"
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
    </div>
  );
}
