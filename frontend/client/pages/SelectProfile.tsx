//working latest
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import tokenManager from "@/lib/tokenManager";

import countriesStatesData from "../../src/countries+states.json";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';



/* ---------- TYPES ---------- */

interface ProfileCard {
  id: number;
  name: string;
  avatarColor: string;
  isPrimary?: boolean;
}

const ETHNICITY_OPTIONS = [
  { code: "AFR", label: "African" },
  { code: "ASN", label: "Asian" },
  { code: "CAU", label: "Caucasian" },
  { code: "HIS", label: "Hispanic" },
  { code: "MDE", label: "Middle Eastern" },
  { code: "MIX", label: "Mixed" },
  { code: "UND", label: "Prefer not to say" },
];

/* ---------- COMPONENT ---------- */

export default function SelectProfile() {
  const navigate = useNavigate();
  const ownerId = Number(localStorage.getItem("user_id"));

  const [primaryProfile, setPrimaryProfile] = useState<ProfileCard | null>(null);
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [countries, setCountries] = useState<
    { name: string; states: string[] }[]
  >([]);
  const [provinces, setProvinces] = useState<string[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    sex: "",
    ethnicity: "",
    country: "",
    province: "",
    historyCOPD: false,
    historyAsthma: false,
    historyTB: false,
    historyCF: false,
    isSmoker: false,
    workExposure: false,
  });

  /* ---------- FETCH USERS ---------- */

  useEffect(() => {
    if (!ownerId) return;

    tokenManager.makeAuthenticatedRequest(`${API_BASE_URL}/user/${ownerId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/select-role');
          }
          throw new Error('Failed to fetch user');
        }
        const data = await res.json();
        const u = data?.data || data;
        if (u && u.id) {
          setPrimaryProfile({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            avatarColor: "bg-gray-400",
            isPrimary: true,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch primary user:", err);
      });

    tokenManager.makeAuthenticatedRequest(`${API_BASE_URL}/patient/${ownerId}/sub-users`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/select-role');
          }
          return;
        }
        const data = await res.json();
        const list = data?.data?.sub_users || [];
        if (Array.isArray(list)) {
          setProfiles(
            list.map((u: any) => ({
              id: u.id,
              name: `${u.first_name} ${u.last_name}`,
              avatarColor: "bg-lungsense-blue-light",
            }))
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch sub-users:", err);
      });
  }, [ownerId]);

  /* ---------- COUNTRIES ---------- */

  useEffect(() => {
    if (!isAdding) return;
    setCountries(countriesStatesData);
  }, [isAdding]);

  /* ---------- COUNTRY → PROVINCE ---------- */

  useEffect(() => {
    if (!form.country) {
      setProvinces([]);
      setForm((p) => ({ ...p, province: "" }));
      return;
    }

    const country = countriesStatesData.find(c => c.name === form.country);
    if (country && country.states.length > 0) {
      setProvinces(country.states);
    } else {
      setProvinces([]);
    }
  }, [form.country]);

  /* ---------- HELPERS ---------- */

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const buildHistory = () => {
    const h: string[] = [];
    if (form.historyCOPD) h.push("COPD");
    if (form.historyAsthma) h.push("ASTHMA");
    if (form.historyTB) h.push("TB");
    if (form.historyCF) h.push("CF");
    if (form.isSmoker) h.push("SMOKER");
    if (form.workExposure) h.push("WORK_EXPOSURE");
    return h.length ? h : ["NONE"];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required.");
      return;
    }

    if (!form.age || Number(form.age) <= 0) {
      setError("Age must be greater than 0.");
      return;
    }

    if (!form.sex || !["F", "M", "O"].includes(form.sex)) {
      setError("Please select a valid sex (Male/Female/Other).");
      return;
    }

    if (!form.ethnicity || !["AFR", "ASN", "CAU", "HIS", "MDE", "MIX", "UND"].includes(form.ethnicity)) {
      setError("Please select a valid ethnicity.");
      return;
    }

    if (!form.country) {
      setError("Country is required.");
      return;
    }

    if (!form.province && provinces.length > 0) {
      setError("Province/State is required.");
      return;
    }

    // Generate a unique email for sub-user
    // Use ownerId + timestamp to ensure uniqueness
    const timestamp = Date.now();
    const subUserEmail = `subuser${ownerId}_${timestamp}@lungsense.temp`;

    const payload = {
      email: subUserEmail,
      first_name: form.firstName,
      last_name: form.lastName,
      age: Number(form.age),
      sex: form.sex.toUpperCase() as "F" | "M" | "O",
      ethnicity: form.ethnicity.toUpperCase(),
      country: form.country.toUpperCase(),
      province: form.province || "",
      respiratory_history: buildHistory(),
    };

    try {
      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/patient/${ownerId}/sub-user`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/select-role');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || errorData?.detail || 'Failed to create profile');
      }

      const data = await response.json();
      const created = data?.data || data;
      
      if (!created || !created.id) {
        throw new Error("Failed to create profile. Invalid response from server.");
      }

      setProfiles((p) => [
        ...p,
        {
          id: created.id,
          name: `${created.first_name} ${created.last_name}`,
          avatarColor: "bg-lungsense-blue-light",
        },
      ]);

      // Reset form and close modal
      setForm({
        firstName: "",
        lastName: "",
        age: "",
        sex: "",
        ethnicity: "",
        country: "",
        province: "",
        historyCOPD: false,
        historyAsthma: false,
        historyTB: false,
        historyCF: false,
        isSmoker: false,
        workExposure: false,
      });
      setIsAdding(false);
      setError(null);
    } catch (err: any) {
      console.error("Failed to create sub-user:", err);
      const errorMessage = err?.message || "Failed to create profile. Please try again.";
      setError(errorMessage);
    }
  };

  const displayProfiles = [
    ...(primaryProfile ? [primaryProfile] : []),
    ...profiles,
  ];

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      {/* Header */}
      <header className="bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)] border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-new.png"
              alt="LungSense Logo"
              className="h-10 w-auto"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 font-display mb-3 sm:mb-4">
            Who is checking in?
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-dm">
            Select a profile to access specific respiratory records and history.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl w-full">
            {displayProfiles.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate("/patient/upload", {
                  state: {
                    userId: p.id,
                    userType: p.isPrimary ? "self" : "sub_user",
                    userName: p.name
                  }
                })}
                className="bg-white/90 rounded-2xl p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 text-center"
              >
                <div
                  className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full ${p.avatarColor} flex items-center justify-center text-white text-xl sm:text-3xl font-bold mx-auto mb-3 sm:mb-4`}
                >
                  {p.name[0]}
                </div>
                <h3 className="font-bold text-gray-900 font-display text-sm sm:text-lg truncate">
                  {p.name}
                </h3>
                {p.isPrimary && (
                  <p className="text-xs text-gray-500 font-dm mt-1">ME</p>
                )}
              </div>
            ))}

            <div
              onClick={() => setIsAdding(true)}
              className="bg-white/70 border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all"
            >
              <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-4" />
              <p className="text-xs sm:text-sm text-gray-600 font-dm font-medium">ADD PROFILE</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>

      {/* ---------- MODAL ---------- */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl p-4 sm:p-6 md:p-8 bg-white shadow-2xl my-4">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" /> Add New Profile
              </h2>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {error && (
              <div className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">FIRST NAME</Label>
                  <Input 
                    name="firstName" 
                    onChange={handleChange} 
                    placeholder="e.g. John"
                    className="font-display text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">LAST NAME</Label>
                  <Input 
                    name="lastName" 
                    onChange={handleChange} 
                    placeholder="e.g. Doe"
                    className="font-display text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">AGE</Label>
                  <Input 
                    name="age" 
                    type="number" 
                    onChange={handleChange} 
                    placeholder="35"
                    className="font-display text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">SEX</Label>
                  <select
                    name="sex"
                    className="w-full border rounded-md p-2 h-10 font-display text-sm"
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">ETHNICITY</Label>
                  <select
                    name="ethnicity"
                    className="w-full border rounded-md p-2 h-10 font-display text-sm"
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {ETHNICITY_OPTIONS.map((e) => (
                      <option key={e.code} value={e.code}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">COUNTRY</Label>
                  <select
                    name="country"
                    className="w-full border rounded-md p-2 h-10 font-display text-sm"
                    onChange={handleChange}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">PROVINCE / STATE</Label>
                  <select
                    name="province"
                    className="w-full border rounded-md p-2 h-10 font-display text-sm"
                    onChange={handleChange}
                    disabled={provinces.length === 0}
                  >
                    <option value="">{provinces.length === 0 ? 'No provinces available' : 'Select'}</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {provinces.length === 0 && form.country && (
                    <p className="text-xs text-gray-500 mt-1">No province data available for selected country</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 sm:pt-4 border-t">
                <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">RESPIRATORY HISTORY</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    ["historyCOPD", "COPD"],
                    ["historyAsthma", "Asthma"],
                    ["historyTB", "Tuberculosis"],
                    ["historyCF", "Cystic Fibrosis"],
                    ["isSmoker", "Current/Former Smoker"],
                    ["workExposure", "Occupational Exposure"],
                    ["none", "None"],
                  ].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name={k}
                        checked={(form as any)[k]}
                        onChange={handleChange}
                        className="rounded"
                      />
                      <span className="text-xs sm:text-sm font-dm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 font-display text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-lungsense-blue hover:bg-lungsense-blue/90 font-display text-sm"
                >
                  Create Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
