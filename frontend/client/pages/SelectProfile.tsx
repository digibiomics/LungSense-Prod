import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, User, ArrowRight, X, ChevronRight, UserPlus, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LOCATION_DATA: Record<string, string[]> = {
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  "USA": ["California", "New York", "Texas", "Florida", "Illinois"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Limpopo"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia"]
};

const ETHNICITY_OPTIONS = ["African", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other"];

interface Profile {
  id: number;
  name: string;
  relation: string;
  avatarColor: string;
}

export default function SelectProfile() {
  const navigate = useNavigate();

  // --- STATE ---
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: 1, name: "Ayesha Khan", relation: "Me", avatarColor: "bg-lungsense-blue-light" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Profile Form State (Updated to handle checkboxes)
  const [newProfile, setNewProfile] = useState({
    firstName: "",
    lastName: "",
    age: "",
    sex: "",
    ethnicity: "",
    country: "",
    province: "",
    relation: "Family Member",
    historyCOPD: false,
    historyAsthma: false,
    historyTB: false,
    historyCF: false,
    isSmoker: false,
    workExposure: false
  });

  // --- STYLING CONSTANTS ---
  const labelStyle = "text-xs uppercase tracking-wider text-gray-700 font-dm";
  const buttonDesign = "w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display py-6 rounded-lg shadow-md";

  // --- HANDLERS ---
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "age" && value !== "" && parseInt(value) < 0) return;

    setNewProfile(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ageNum = parseInt(newProfile.age);
    if (!newProfile.firstName || !newProfile.lastName) return setError("First and Last name are required.");
    if (isNaN(ageNum) || ageNum < 18) {
      alert("We're sorry, but users under the age of 18 cannot be added at this time.");
      return;
    }
    if (!newProfile.country || !newProfile.ethnicity) return setError("Please complete all required fields.");

    const newId = profiles.length + 1;
    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"];

    const profileEntry: Profile = {
      id: newId,
      name: `${newProfile.firstName} ${newProfile.lastName}`,
      relation: newProfile.relation,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    };

    setProfiles([...profiles, profileEntry]);
    setIsAdding(false);

    // Reset form
    setNewProfile({
      firstName: "", lastName: "", age: "", sex: "", ethnicity: "", country: "", province: "", relation: "Family Member",
      historyCOPD: false, historyAsthma: false, historyTB: false, historyCF: false, isSmoker: false, workExposure: false
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">

      <header className="bg-transparent border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/images/logo-new.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900 font-display">LungSense</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full">

          <div className="text-center mb-12 space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-display tracking-tight">
              Who is checking in?
            </h1>
            <p className="text-gray-600 font-dm max-w-md mx-auto">
              Select a profile to access specific respiratory records and history.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {profiles.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate("/patient/upload")}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50 p-8 flex flex-col items-center gap-4 hover:-translate-y-1"
              >
                <div className={`w-24 h-24 rounded-full ${p.avatarColor} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-500`}>
                  <span className="text-3xl font-display font-bold">{p.name.charAt(0)}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 font-display">{p.name}</h3>
                  <p className={labelStyle + " mt-2 opacity-60"}>{p.relation}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-lungsense-blue opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}

            <button
              onClick={() => setIsAdding(true)}
              className="group bg-white/40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 hover:bg-white hover:border-lungsense-blue/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-lungsense-blue-light/10 group-hover:text-lungsense-blue transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <span className={labelStyle}>Add Profile</span>
            </button>
          </div>
        </div>
      </main>

      {/* FULL ADD PROFILE MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-8 bg-white shadow-2xl relative my-8">
            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>

            <div className="mb-8">
              <div className="w-12 h-12 bg-lungsense-blue/10 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-lungsense-blue" />
              </div>
              <h2 className="text-2xl font-bold font-display text-gray-900">Add New Profile</h2>
              <p className="text-sm text-gray-500 font-dm">This creates a separate history and analysis profile.</p>
            </div>

            {error && <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className={labelStyle}>First Name</Label><Input name="firstName" placeholder="e.g. John" value={newProfile.firstName} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label className={labelStyle}>Last Name</Label><Input name="lastName" placeholder="e.g. Doe" value={newProfile.lastName} onChange={handleInputChange} /></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label className={labelStyle}>Age</Label><Input name="age" type="number" placeholder="35" value={newProfile.age} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label className={labelStyle}>Sex</Label><select name="sex" className="w-full text-sm border rounded-md p-2 h-10" value={newProfile.sex} onChange={handleInputChange}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div className="space-y-2"><Label className={labelStyle}>Ethnicity</Label><select name="ethnicity" className="w-full text-sm border rounded-md p-2 h-10" value={newProfile.ethnicity} onChange={handleInputChange}><option value="">Select</option>{ETHNICITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className={labelStyle}>Country</Label><select name="country" className="w-full text-sm border rounded-md p-2 h-10" value={newProfile.country} onChange={handleInputChange}><option value="">Select</option>{Object.keys(LOCATION_DATA).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="space-y-2"><Label className={labelStyle}>Relationship</Label><select name="relation" className="w-full text-sm border rounded-md p-2 h-10" value={newProfile.relation} onChange={handleInputChange}><option>Parent</option><option>Child</option><option>Spouse</option><option>Other Family</option><option>Caregiver</option></select></div>
              </div>

              {/* REPLACED MEDICAL & OCCUPATIONAL HISTORY WITH CHECKBOXES */}
              <div className="space-y-3 pt-4 border-t">
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
                                checked={(newProfile as any)[item.id]}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-lungsense-blue focus:ring-lungsense-blue"
                            />
                            <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer leading-none">{item.label}</Label>
                        </div>
                    ))}
                </div>
              </div>

              <Button type="submit" className={buttonDesign}>Create Profile</Button>
            </form>
          </Card>
        </div>
      )}

      <footer className="w-full text-center py-6 border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">© 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.</p>
      </footer>
    </div>
  );
}