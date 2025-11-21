import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useState, ChangeEvent, FormEvent } from "react";

/**
 * Update this to your FastAPI practitioners signup endpoint.
 */
const PRACTITIONER_SIGNUP_URL = "http://localhost:8000/api/practitioners/signup";

type PractitionerFormData = {
  firstName: string;
  lastName: string;
  email: string;
  practitionerId: string;
  institution: string;
  institutionLocation: string;
  password: string;
  consent: boolean;
};

export default function PractitionerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PractitionerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    practitionerId: "",
    institution: "",
    institutionLocation: "",
    password: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // unified handler (works for inputs/selects/checkboxes)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const target = e.target;

  // Case 1: Input element (text/password/checkbox/date/etc.)
  if (target instanceof HTMLInputElement) {
    const { name, type, value, checked } = target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    return;
  }

  // Case 2: Select element
  if (target instanceof HTMLSelectElement) {
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
    return;
  }
};

  const validate = (d: PractitionerFormData) => {
    if (!d.email) return "Email is required.";
    if (!d.firstName || !d.lastName) return "Full name is required.";
    if (!d.password || d.password.length < 6) return "Password must be at least 6 characters.";
    if (!d.practitionerId) return "Practitioner ID is required.";
    if (!d.institution) return "Institution is required.";
    if (!d.institutionLocation) return "Institution location is required.";
    if (!d.consent) return "You must agree to the privacy policy.";
    return null;
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
      const payload = {
        role: "practitioner",
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        practitioner_id: formData.practitionerId,
        institution: formData.institution,
        institution_location: formData.institutionLocation,
        password: formData.password,
        consent: formData.consent,
      };

      const res = await fetch(PRACTITIONER_SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Signup failed (${res.status})`;
        try {
          const json = await res.json();
          if (json?.detail) msg = json.detail;
        } catch {
          /* ignore parse error */
        }
        throw new Error(msg);
      }

      // On success, send to login (or change to dashboard per your flow)
      navigate("/practitioner/login");
    } catch (err: any) {
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">LungSense</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2 font-display">Hi! Welcome to</h2>
              <h3 className="text-2xl font-bold text-lungsense-blue font-display">LungSense</h3>
              <p className="text-sm text-gray-600 mt-4 font-dm">
                Already have an account?{" "}
                <Link to="/practitioner/login" className="text-lungsense-blue hover:underline font-medium">Log in here</Link>
              </p>
            </div>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-gray-700 font-dm">F I R S T&nbsp;N A M E</Label>
                  <Input id="firstName" name="firstName" type="text" placeholder="Jiara" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-gray-700 font-dm">L A S T&nbsp;N A M E</Label>
                  <Input id="lastName" name="lastName" type="text" placeholder="Smith" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-700 font-dm">E M A I L</Label>
                <Input id="email" name="email" type="email" placeholder="hello@reallygreatsite.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="practitionerId" className="text-xs uppercase tracking-wider text-gray-700 font-dm">P R A C T I T I O N E R&nbsp; I D</Label>
                  <Input id="practitionerId" name="practitionerId" type="text" placeholder="238447" value={formData.practitionerId} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="institution" className="text-xs uppercase tracking-wider text-gray-700 font-dm">I N S T I T U T I O N</Label>
                  <Input id="institution" name="institution" type="text" placeholder="SickKids" value={formData.institution} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionLocation" className="text-xs uppercase tracking-wider text-gray-700 font-dm">I N S T I T U T I O N &nbsp; L O C A T I O N</Label>
                <Input id="institutionLocation" name="institutionLocation" type="text" placeholder="23 Simcoe St" value={formData.institutionLocation} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-700 font-dm">C R E A T E&nbsp;P A S S W O R D</Label>
                <Input id="password" name="password" type="password" placeholder="••••••" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="flex items-center space-x-2">
                <input id="consent" name="consent" type="checkbox" checked={formData.consent} onChange={handleChange} className="h-4 w-4" />
                <Label htmlFor="consent" className="text-xs text-gray-600">I agree to the privacy policy and data collection for research purposes.</Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 text-center">
                <p className="font-dm">
                  By Signing Up, You agree to consent to our data collection for research purposes.
                  <br />
                  <a href="#" className="text-lungsense-blue hover:underline font-medium">Read our privacy policy here</a>
                </p>
              </div>

              <Button type="submit" className="w-full bg-lungsense-blue text-white py-6 rounded-lg" disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link to="/select-role" className="text-sm text-gray-600 hover:text-lungsense-blue">← Back to role selection</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
