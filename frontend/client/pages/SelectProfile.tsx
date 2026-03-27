import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, X, UserPlus, LogOut, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import tokenManager from "@/lib/tokenManager";
import countriesStatesData from "../../src/countries+states.json";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
  const [countries, setCountries] = useState<{ name: string; states: string[] }[]>([]);
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

    tokenManager
      .makeAuthenticatedRequest(`${API_BASE_URL}/user/${ownerId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) navigate("/select-role");
          throw new Error("Failed to fetch user");
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
      .catch((err) => console.error("Failed to fetch primary user:", err));

    tokenManager
      .makeAuthenticatedRequest(`${API_BASE_URL}/patient/${ownerId}/sub-users`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) navigate("/select-role");
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
      .catch((err) => console.error("Failed to fetch sub-users:", err));
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
    const country = countriesStatesData.find((c) => c.name === form.country);
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

  const handleSignOut = () => {
    [
      "access_token", "refresh_token", "user_id", "user_role",
      "user_email", "user_name", "profile_completed", "profile_picture",
    ].forEach((k) => localStorage.removeItem(k));
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        { method: "POST", body: JSON.stringify(payload) }
      );

      if (!response.ok) {
        if (response.status === 401) { navigate("/select-role"); return; }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || errorData?.detail || "Failed to create profile");
      }

      const data = await response.json();
      const created = data?.data || data;
      if (!created || !created.id) throw new Error("Failed to create profile. Invalid response from server.");

      setProfiles((p) => [
        ...p,
        {
          id: created.id,
          name: `${created.first_name} ${created.last_name}`,
          avatarColor: "bg-lungsense-blue-light",
        },
      ]);
      setForm({
        firstName: "", lastName: "", age: "", sex: "", ethnicity: "",
        country: "", province: "", historyCOPD: false, historyAsthma: false,
        historyTB: false, historyCF: false, isSmoker: false, workExposure: false,
      });
      setIsAdding(false);
      setError(null);
    } catch (err: any) {
      console.error("Failed to create sub-user:", err);
      setError(err?.message || "Failed to create profile. Please try again.");
    }
  };

  const displayProfiles = [
    ...(primaryProfile ? [primaryProfile] : []),
    ...profiles,
  ];

  /* ---------- UI ---------- */
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .app-root {
            height: 100dvh;
            overflow: hidden;
          }
        }
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top    { padding-top: env(safe-area-inset-top); }
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>

      <div
        className="
          app-root
          min-h-screen flex flex-col
          bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]
        "
      >
        {/* ── HEADER ── */}
        <header className="
          w-full flex-none border-b border-gray-200/60
          bg-white/30 backdrop-blur-md z-30
          safe-top
        ">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-5">
            <div className="flex items-center justify-between">

              {/* Left: back chevron (mobile) + logo */}
              <div className="flex items-center gap-2">
                {/* Back arrow — mobile only */}
                <button
                  onClick={() => navigate("/select-role")}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 active:bg-white/70 transition-colors -ml-1 mr-1"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <Link
                  to="/"
                  className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity"
                >
                  <img
                    src="/images/logo-new.png"
                    alt="LungSense Logo"
                    className="h-8 md:h-10 w-auto"
                  />
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
                    LungSense
                  </h1>
                </Link>
              </div>

              {/* Right: Sign Out */}
              <button
                onClick={handleSignOut}
                className="
                  flex items-center gap-1.5
                  text-sm text-gray-500 hover:text-red-500
                  active:opacity-60 transition-colors
                  px-3 py-1.5 rounded-xl hover:bg-white/50
                "
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="flex-1 overflow-y-auto container mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* Title */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-display mb-2 md:mb-4">
              Who is checking in?
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-dm">
              Select a profile to access specific respiratory records and history.
            </p>
          </div>

          {/* ── MOBILE: native-style list rows (hidden on md+) ── */}
          <div className="flex flex-col gap-3 md:hidden max-w-sm mx-auto">
            {displayProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  navigate("/patient/upload", {
                    state: { userId: p.id, userType: p.isPrimary ? "self" : "sub_user", userName: p.name },
                  })
                }
                className="
                  bg-white/80 backdrop-blur-sm
                  flex items-center gap-4
                  px-5 py-4 rounded-2xl
                  shadow-sm border border-white
                  active:scale-[0.98] transition-all text-left
                "
              >
                <div
                  className={`
                    w-12 h-12 rounded-full ${p.avatarColor}
                    flex items-center justify-center
                    text-white text-lg font-bold flex-shrink-0
                  `}
                >
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{p.name}</p>
                  {p.isPrimary && (
                    <p className="text-xs text-gray-400 mt-0.5">MY PROFILE</p>
                  )}
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180 flex-shrink-0" />
              </button>
            ))}

            {/* Add profile row */}
            <button
              onClick={() => setIsAdding(true)}
              className="
                bg-white/50 border-2 border-dashed border-gray-300
                flex items-center gap-4
                px-5 py-4 rounded-2xl
                active:scale-[0.98] transition-all
              "
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-500 text-sm tracking-wide">ADD PROFILE</p>
            </button>
          </div>

          {/* ── DESKTOP: card grid (hidden below md) ── */}
          <div className="hidden md:flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-4xl">
              {displayProfiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() =>
                    navigate("/patient/upload", {
                      state: { userId: p.id, userType: p.isPrimary ? "self" : "sub_user", userName: p.name },
                    })
                  }
                  className="bg-white/90 rounded-2xl p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 text-center"
                >
                  <div
                    className={`w-24 h-24 rounded-full ${p.avatarColor} flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4`}
                  >
                    {p.name[0]}
                  </div>
                  <h3 className="font-bold text-gray-900 font-display text-lg">{p.name}</h3>
                  {p.isPrimary && (
                    <p className="text-sm text-gray-500 font-dm mt-1">ME</p>
                  )}
                </div>
              ))}

              <div
                onClick={() => setIsAdding(true)}
                className="bg-white/70 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all"
              >
                <Plus className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-dm font-medium">ADD PROFILE</p>
              </div>
            </div>
          </div>

          {/* Back to role selection — desktop only */}
          <div className="hidden md:block text-center mt-10">
            <Link
              to="/select-role"
              className="text-sm text-gray-500 hover:text-lungsense-blue transition-colors"
            >
              ← Back to role selection
            </Link>
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="
          w-full flex-none text-center py-4
          border-t border-white/20 bg-white/10 backdrop-blur-sm z-20
          safe-bottom
        ">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">
            © 2025 LUNGSENSE &amp; DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </p>
        </footer>

        {/* ══════════════════════════════════════════
            ADD PROFILE MODAL
            - Mobile: bottom sheet
            - Desktop: centered dialog
        ══════════════════════════════════════════ */}
        {isAdding && (
          <div
            className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsAdding(false); }}
          >
            {/* Sheet */}
            <div
              className="
                w-full md:max-w-2xl
                bg-white
                rounded-t-3xl md:rounded-3xl
                shadow-2xl flex flex-col
                max-h-[92dvh] md:max-h-[90vh]
              "
            >
              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 md:px-8 pt-4 md:pt-8 pb-4 flex-shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
                  <UserPlus className="w-5 h-5 md:w-6 md:h-6" /> Add New Profile
                </h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="overflow-y-auto flex-1 px-5 md:px-8 pb-4">
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">FIRST NAME</Label>
                      <Input name="firstName" onChange={handleChange} placeholder="e.g. John" className="font-display text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">LAST NAME</Label>
                      <Input name="lastName" onChange={handleChange} placeholder="e.g. Doe" className="font-display text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">AGE</Label>
                      <Input name="age" type="number" onChange={handleChange} placeholder="35" className="font-display text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">SEX</Label>
                      <select name="sex" className="w-full border rounded-xl p-2 h-10 font-display text-sm" onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">ETHNICITY</Label>
                      <select name="ethnicity" className="w-full border rounded-xl p-2 h-10 font-display text-sm" onChange={handleChange}>
                        <option value="">Select</option>
                        {ETHNICITY_OPTIONS.map((e) => (
                          <option key={e.code} value={e.code}>{e.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">COUNTRY</Label>
                      <select name="country" className="w-full border rounded-xl p-2 h-10 font-display text-sm" onChange={handleChange}>
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-1.5 block">PROVINCE / STATE</Label>
                      <select
                        name="province"
                        className="w-full border rounded-xl p-2 h-10 font-display text-sm"
                        onChange={handleChange}
                        disabled={provinces.length === 0}
                      >
                        <option value="">{provinces.length === 0 ? "N/A" : "Select"}</option>
                        {provinces.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {provinces.length === 0 && form.country && (
                        <p className="text-[11px] text-gray-400 mt-1">No province data for selected country</p>
                      )}
                    </div>
                  </div>

                  {/* Respiratory history */}
                  <div className="space-y-3 pt-3 border-t">
                    <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm">RESPIRATORY HISTORY</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["historyCOPD",    "COPD"],
                        ["historyAsthma",  "Asthma"],
                        ["historyTB",      "Tuberculosis"],
                        ["historyCF",      "Cystic Fibrosis"],
                        ["isSmoker",       "Smoker"],
                        ["workExposure",   "Work Exposure"],
                        ["none",           "None"],
                      ].map(([k, l]) => (
                        <label
                          key={k}
                          className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            name={k}
                            checked={(form as any)[k]}
                            onChange={handleChange}
                            className="rounded"
                          />
                          <span className="text-sm font-dm">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="flex gap-3 pt-3 pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 font-display text-sm rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-lungsense-blue hover:bg-lungsense-blue/90 font-display text-sm rounded-xl"
                    >
                      Create Profile
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}