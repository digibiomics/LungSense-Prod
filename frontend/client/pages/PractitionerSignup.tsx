import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, X } from "lucide-react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { signupPractitioner } from "../../src/api";
import { practitionerSignupSchema } from "@/schemas/authSchemas";

/**
 * Toggle dummy mode if needed
 */
const USE_DUMMY = false;

type PractitionerFormData = {
  firstName: string;
  lastName: string;
  email: string;
  practitionerId: string;
  institution: string;
  password: string;
  consent: boolean;
};

type Option = {
  code: string;
  name: string;
};

/* ============================
   ISO FETCH (SAME AS PATIENT)
============================ */
async function fetchCountriesISO() {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=cca2,name"
  );
  if (!res.ok) throw new Error("Failed to fetch countries");

  const data = await res.json();
  return data
    .filter((c: any) => c.cca2 && c.name?.common)
    .map((c: any) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}

async function fetchProvincesISO(countryCode: string) {
  const res = await fetch(
    `http://localhost:8000/api/locations/provinces/${countryCode}`
  );
  if (!res.ok) throw new Error("Failed to fetch provinces");
  return res.json(); // [{ code: "IN-AP", name: "Andhra Pradesh" }]
}

export default function PractitionerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PractitionerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    practitionerId: "",
    institution: "",
    password: "",
    consent: false,
  });

  const [countries, setCountries] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ============================
     LOAD COUNTRIES
  ============================ */
  useEffect(() => {
    fetchCountriesISO().then(setCountries).catch(console.error);
  }, []);

  /* ============================
     COUNTRY → PROVINCE
  ============================ */
  const handleCountryChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCountry(code);
    setProvince("");
    setProvinces([]);

    if (!code) return;
    const provs = await fetchProvincesISO(code);
    setProvinces(provs);
  };

  /* unified handler */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement) {
      const { name, type, value, checked } = target;
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      return;
    }

    if (target instanceof HTMLSelectElement) {
      const { name, value } = target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    if (!formData.email) return "Email is required.";
    if (!formData.firstName || !formData.lastName)
      return "Full name is required.";
    if (!formData.password || formData.password.length < 8)
      return "Password must be at least 8 characters.";
    if (!formData.practitionerId)
      return "Practitioner ID is required.";
    if (!formData.institution) return "Institution is required.";
    if (!country || !province)
      return "Institution country and province are required.";
    if (!formData.consent)
      return "You must agree to the privacy policy.";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      password: formData.password,
      practitioner_id: formData.practitionerId,
      institution: formData.institution,
      institution_location_country: country,
      institution_location_province: province,
    };

    const parsed = practitionerSignupSchema.safeParse(payload);
    if (!parsed.success) {
      setError("Validation failed. Please check all fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (USE_DUMMY) {
        await new Promise(res => setTimeout(res, 500));
        navigate("/practitioner/login");
        return;
      }

      await signupPractitioner(parsed.data);
      navigate("/practitioner/login");
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      {/* Header */}
      <header className="bg-transparent border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/images/logo-new.png" alt="LungSense Logo" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
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
                <Link to="/practitioner/login" className="text-lungsense-blue hover:underline font-medium">
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
              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                    F I R S T&nbsp;N A M E
                  </Label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                    L A S T&nbsp;N A M E
                  </Label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                  E M A I L
                </Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>

              {/* ID + Institution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                    P R A C T I T I O N E R&nbsp; I D
                  </Label>
                  <Input name="practitionerId" value={formData.practitionerId} onChange={handleChange} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                    I N S T I T U T I O N
                  </Label>
                  <Input name="institution" value={formData.institution} onChange={handleChange} />
                </div>
              </div>

              {/* Country */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                  I N S T I T U T I O N&nbsp; C O U N T R Y
                </Label>
                <select
                  className="w-full border rounded-md p-2 h-10 text-sm"
                  value={country}
                  onChange={handleCountryChange}
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Province */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                  I N S T I T U T I O N&nbsp; P R O V I N C E
                </Label>
                <select
                  className="w-full border rounded-md p-2 h-10 text-sm"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  disabled={!country || !provinces.length}
                >
                  <option value="">Select Province</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">
                  C R E A T E&nbsp;P A S S W O R D
                </Label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} />
              </div>

              {/* Consent */}
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} />
                <Label className="text-xs text-gray-600">
                  I agree to the privacy policy and data collection for research purposes.
                </Label>
              </div>

              {/* Privacy Info Box */}
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
                className="w-full bg-lungsense-blue text-white py-6 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link to="/select-role" className="text-sm text-gray-600 hover:text-lungsense-blue">
              ← Back to role selection
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>

      {/* PRIVACY MODAL */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lungsense-blue/10 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-lungsense-blue" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-gray-900">
                    Privacy Policy
                  </h3>
                  <p className="text-xs text-gray-500">
                    Last updated: 2 December 2025
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm text-gray-600 font-dm leading-relaxed">
              <p>
                This Privacy Policy explains how we collect, use, disclose, and
                protect your information when you use our medical AI diagnostic
                application (“Service”).
              </p>
              <p>
                <strong>1. Data Collection & Usage:</strong> We collect
                respiratory data solely for providing AI-generated insights.
              </p>
              <p>
                <strong>2. HIPAA & GDPR Compliance:</strong> All data is encrypted
                at rest and in transit.
              </p>
              <p>
                <strong>3. Data Retention:</strong> Uploaded files are temporarily
                stored and may be used for research and model improvement.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 text-xs mt-4">
                <strong>Note:</strong> By proceeding, you acknowledge this tool is
                for screening purposes only and you are 18+ years of age.
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button
                onClick={() => setIsPrivacyOpen(false)}
                className="bg-lungsense-blue text-white hover:bg-lungsense-blue/90"
              >
                I Understand
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
