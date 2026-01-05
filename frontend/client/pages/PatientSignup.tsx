// frontend/src/pages/PatientSignup.tsx
// screenshot (if you need it): /mnt/data/3ad10541-ded0-49be-9798-f971b5a10aca.png

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft, Plus, Trash2, ShieldCheck, X } from "lucide-react";
import { useState, ChangeEvent } from "react";

const LOCATION_DATA: Record<string, string[]> = {
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  "USA": ["California", "New York", "Texas", "Florida", "Illinois"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Limpopo"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia"]
};

const ETHNICITY_OPTIONS = ["African", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other"];

type ProfileData = {
  firstName: string;
  lastName: string;
  age: string;
  sex: string;
  ethnicity: string;
  country: string;
  province: string;
  // Updated fields
  isSmoker: boolean;
  workExposure: boolean; // e.g. Mines, construction
  historyCOPD: boolean;
  historyCF: boolean;
  historyTB: boolean;
  historyAsthma: boolean;
};

export default function PatientSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profiles: [{
      firstName: "", lastName: "", age: "", sex: "", ethnicity: "",
      country: "", province: "",
      isSmoker: false, workExposure: false, historyCOPD: false,
      historyCF: false, historyTB: false, historyAsthma: false
    } as ProfileData],
    consent: false,
  });

  const [error, setError] = useState<string | null>(null);
  const labelStyle = "text-xs uppercase tracking-wider text-gray-700 font-dm";
  const buttonDesign = "w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display py-6 rounded-lg shadow-md";

  const handleProfileChange = (index: number, e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "age" && value !== "" && parseInt(value) < 0) return;

    const updatedProfiles = [...formData.profiles];
    updatedProfiles[index] = {
        ...updatedProfiles[index],
        [name]: type === 'checkbox' ? checked : value
    };
    setFormData({ ...formData, profiles: updatedProfiles });
  };

  const addAnotherProfile = () => {
    setFormData(prev => ({
      ...prev,
      profiles: [...prev.profiles, {
        firstName: "", lastName: "", age: "", sex: "", ethnicity: "",
        country: "", province: "",
        isSmoker: false, workExposure: false, historyCOPD: false,
        historyCF: false, historyTB: false, historyAsthma: false
      }]
    }));
    setActiveProfileIndex(formData.profiles.length);
    setCurrentStep(2);
  };

  const nextStep = () => {
    setError(null);
    const activeProfile = formData.profiles[activeProfileIndex];

    if (currentStep === 1) {
      if (!formData.email) return setError("Please enter an email address.");
      if (formData.password.length < 6) return setError("Password must be at least 6 characters.");
      if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    }

    if (currentStep === 2) {
      const ageNum = parseInt(activeProfile.age);
      if (!activeProfile.firstName || !activeProfile.lastName) return setError("Name is required.");
      if (isNaN(ageNum) || ageNum < 18) {
        alert("We're sorry, but users under the age of 18 cannot proceed with this application.");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      <header className="bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)] border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/images/logo-new.png" alt="LungSense Logo" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">LungSense</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm border-none">
            {!isSuccess ? (
              <div className="space-y-6">
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 w-8 rounded-full ${currentStep >= s ? 'bg-lungsense-blue' : 'bg-gray-200'}`} />)}
                </div>

                {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

                {/* STEP 1: ACCOUNT */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in">
                    <h3 className="text-2xl font-bold font-display">Account Registration</h3>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label className={labelStyle}>Email Address</Label><Input name="email" type="email" placeholder="e.g. user@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                      <div className="space-y-2"><Label className={labelStyle}>Password (Min 6 chars)</Label><Input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
                      <div className="space-y-2"><Label className={labelStyle}>Confirm Password</Label><Input name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} /></div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PROFILE DETAILS */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in">
                    <h3 className="text-2xl font-bold font-display">{activeProfileIndex === 0 ? "Primary Profile" : "Additional Profile"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className={labelStyle}>First Name</Label><Input name="firstName" placeholder="e.g. John" value={formData.profiles[activeProfileIndex].firstName} onChange={(e) => handleProfileChange(activeProfileIndex, e)} /></div>
                      <div className="space-y-2"><Label className={labelStyle}>Last Name</Label><Input name="lastName" placeholder="e.g. Doe" value={formData.profiles[activeProfileIndex].lastName} onChange={(e) => handleProfileChange(activeProfileIndex, e)} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2"><Label className={labelStyle}>Age</Label><Input name="age" type="number" placeholder="35" value={formData.profiles[activeProfileIndex].age} onChange={(e) => handleProfileChange(activeProfileIndex, e)} /></div>
                      <div className="space-y-2"><Label className={labelStyle}>Sex</Label><select name="sex" className="w-full text-sm border rounded-md p-2 h-10" value={formData.profiles[activeProfileIndex].sex} onChange={(e) => handleProfileChange(activeProfileIndex, e)}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                      <div className="space-y-2"><Label className={labelStyle}>Ethnicity</Label><select name="ethnicity" className="w-full text-sm border rounded-md p-2 h-10" value={formData.profiles[activeProfileIndex].ethnicity} onChange={(e) => handleProfileChange(activeProfileIndex, e)}><option value="">Select</option>{ETHNICITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label className={labelStyle}>Country</Label><select name="country" className="w-full text-sm border rounded-md p-2 h-10" value={formData.profiles[activeProfileIndex].country} onChange={(e) => handleProfileChange(activeProfileIndex, e)}><option value="">Select Country</option>{Object.keys(LOCATION_DATA).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                      <div className="space-y-2"><Label className={labelStyle}>Province / State</Label><select name="province" disabled={!formData.profiles[activeProfileIndex].country} className="w-full text-sm border rounded-md p-2 h-10 disabled:opacity-50" value={formData.profiles[activeProfileIndex].province} onChange={(e) => handleProfileChange(activeProfileIndex, e)}><option value="">Select Province</option>{formData.profiles[activeProfileIndex].country && LOCATION_DATA[formData.profiles[activeProfileIndex].country].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    </div>
                  </div>
                )}

                {/* STEP 3: RESPIRATORY HISTORY (UPDATED) */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-2xl font-bold font-display">Respiratory History</h3>

                    <div className="space-y-3">
                        <Label className={labelStyle}>Medical & Family History</Label>
                        <p className="text-[10px] text-gray-500 -mt-2">Check all that apply to you or your immediate family.</p>

                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: "historyCOPD", label: "COPD" },
                                { id: "historyAsthma", label: "Asthma" },
                                { id: "historyTB", label: "Tuberculosis (TB)" },
                                { id: "historyCF", label: "Cystic Fibrosis (CF)" },
                                { id: "isSmoker", label: "Current or Former Smoker" },
                                { id: "workExposure", label: "Occupational Exposure (e.g., Mines, Mining, Industrial Dust)" }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-white/50 hover:bg-white transition-colors">
                                    <input
                                        type="checkbox"
                                        id={item.id}
                                        name={item.id}
                                        checked={(formData.profiles[activeProfileIndex] as any)[item.id]}
                                        onChange={(e) => handleProfileChange(activeProfileIndex, e)}
                                        className="h-4 w-4 rounded border-gray-300 text-lungsense-blue focus:ring-lungsense-blue"
                                    />
                                    <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer leading-none">{item.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-2xl font-bold font-display">Manage Profiles</h3>
                    <div className="space-y-3">
                      {formData.profiles.map((p, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                          <span className="font-medium text-gray-800">{p.firstName || "Primary Profile"} {p.lastName}</span>
                          <Button variant="ghost" size="sm" onClick={() => {setActiveProfileIndex(i); setCurrentStep(2);}} className="text-lungsense-blue">Edit</Button>
                        </div>
                      ))}
                      <Button type="button" onClick={addAnotherProfile} className={buttonDesign}>
                        <Plus className="w-4 h-4 mr-2" /> Add Another Profile
                      </Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600 text-center leading-relaxed">
                        In order to proceed, kindly read and accept our{" "}
                        <button type="button" onClick={() => setIsPrivacyOpen(true)} className="text-lungsense-blue font-bold hover:underline">
                          Privacy Policy
                        </button>
                        .
                      </p>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="consent" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} className="mt-1 h-4 w-4" />
                        <Label htmlFor="consent" className="text-xs text-gray-600 leading-tight cursor-pointer">
                          I consent to the collection and analysis of respiratory data for all listed profiles.
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                  <Button onClick={currentStep === 4 ? () => setIsSuccess(true) : nextStep} className={buttonDesign}>
                    {currentStep === 4 ? "Complete Signup" : "Continue"}
                  </Button>
                  {currentStep === 1 && <p className="text-center text-sm text-gray-600">Already have an account? <Link to="/patient/login" className="text-lungsense-blue font-bold hover:underline">Login here</Link></p>}
                  {currentStep > 1 && <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)} className="text-gray-500 text-sm">Back</Button>}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold font-display">Account Created!</h3>
                <p className="text-gray-600 mb-8">Please log in to your account to begin.</p>
                <Button onClick={() => navigate("/patient/login")} className={buttonDesign}>Proceed to Login</Button>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* PRIVACY MODAL */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl bg-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-lungsense-blue" />
                <h3 className="text-xl font-bold font-display">Privacy Policy</h3>
              </div>
              <X className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setIsPrivacyOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-sm text-gray-600 leading-relaxed">
              <section>
                <h4 className="font-bold text-gray-900 mb-2">1. Data Collection</h4>
                <p>We collect personal identifiers (name, age, sex) and clinical health data (respiratory sounds, medical history). This data is strictly used for screening and model improvement.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 mb-2">2. Usage and Analysis</h4>
                <p>Your data is processed using proprietary algorithms to detect patterns associated with respiratory conditions. It is not shared with third-party advertisers.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 mb-2">3. Security</h4>
                <p>All data is encrypted in transit and at rest using industry-standard protocols. Identifiers are decoupled from clinical data wherever possible.</p>
              </section>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-xs">
                <strong>IMPORTANT:</strong> This application is a screening tool and does not provide a definitive medical diagnosis. Always consult with a qualified healthcare professional.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button onClick={() => setIsPrivacyOpen(false)} className="bg-lungsense-blue text-white px-8">I Understand</Button>
            </div>
          </Card>
        </div>
      )}

      <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">
            © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </p>
      </footer>
    </div>
  );
}