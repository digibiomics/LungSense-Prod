import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Plus, ShieldCheck, X } from "lucide-react";
import { useState, ChangeEvent, useEffect } from "react";
import { z } from "zod";
import { patientSignupSchema } from "@/schemas/authSchemas";
import { signupPatient,createSubUser } from "../../src/api";



export async function fetchCountriesISO() {
  const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name");

  if (!res.ok) {
    throw new Error("Failed to fetch countries");
  }

  const data = await res.json();

  return data
    .filter((c: any) => c.cca2 && c.name?.common)
    .map((c: any) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}
 
export async function fetchProvincesISO(countryCode: string) {
  const res = await fetch(
    `http://localhost:8000/api/locations/provinces/${countryCode}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch provinces");
  }

  return res.json();
}




type ProfileData = {
  firstName: string;
  lastName: string;
  age: string;
  sex: string;
  ethnicity: string;
  country: string;
  province: string;
  respiratory_history: string[];
  isSmoker: boolean;
  workExposure: boolean;
  historyCOPD: boolean;
  historyCF: boolean;
  historyTB: boolean;
  historyAsthma: boolean;
  noneOfAbove: boolean;
};


export default function PatientSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profiles: [{
      firstName: "", lastName: "", age: "", sex: "", ethnicity: "",
      country: "", province: "",
      isSmoker: false, workExposure: false, historyCOPD: false,
      historyCF: false, historyTB: false, historyAsthma: false,noneOfAbove: false,
    } as ProfileData],
    consent: false,
  });

  const [error, setError] = useState<string | null>(null);
  const labelStyle = "text-xs uppercase tracking-wider text-gray-700 font-dm";
  const buttonDesign = "w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display py-6 rounded-lg shadow-md";

  useEffect(() => {
    fetchCountriesISO().then(setCountries);
  }, []);

 

  const handleProfileChange = (index: number, e: any) => {
  const { name, value, type, checked } = e.target;

  setFormData(prev => {
    const profiles = [...prev.profiles];
    profiles[index] = {
      ...profiles[index],
      [name]: type === "checkbox" ? checked : value,
    };
    return { ...prev, profiles };
  });
};


const handleCountryISOChange = async (e: any) => {
  const countryCode = e.target.value;

  setFormData(prev => {
    const profiles = [...prev.profiles];
    profiles[activeProfileIndex] = {
      ...profiles[activeProfileIndex],
      country: countryCode,
      province: "",
    };
    return { ...prev, profiles };
  });

  if (!countryCode) {
    setProvinces([]);
    return;
  }

  const provs = await fetchProvincesISO(countryCode);
  console.log("Loaded provinces:", provs); // 🔍 DEBUG
  setProvinces(provs);
};



const nextStep = () => {
  setError(null);

  // STEP 1 validation (ACCOUNT ONLY)
  if (currentStep === 1) {
    if (!formData.email) {
      setError("Please enter an email address.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  }

  // STEP 2 validation (PRIMARY PROFILE ONLY)
  if (currentStep === 2) {
    const p = formData.profiles[0];

    if (!p.firstName || !p.lastName) {
      setError("First and last name are required.");
      return;
    }
    if (!p.age || Number(p.age) <= 18) {
      setError("Age must be greater than 18.");
      return;
    }
    if (!p.sex || !p.ethnicity || !p.country || !p.province) {
      setError("Please complete all profile details.");
      return;
    }
  }

  // STEP 3 validation (RESPIRATORY HISTORY)
if (currentStep === 3) {
  const p = formData.profiles[activeProfileIndex];

  const hasSelected =
    p.noneOfAbove ||
    p.historyCOPD ||
    p.historyAsthma ||
    p.historyTB ||
    p.historyCF ||
    p.isSmoker ||
    p.workExposure;

  if (!hasSelected) {
    setError("Please select at least one respiratory history option.");
    return;
  }
}

  setCurrentStep(prev => prev + 1);
};

function buildRespiratoryHistory(p: ProfileData): string[] {
  if (p.noneOfAbove) {
    return ["NONE"];
  }

  const arr: string[] = [];
  if (p.historyCOPD) arr.push("COPD");
  if (p.historyAsthma) arr.push("ASTHMA");
  if (p.historyTB) arr.push("TB");
  if (p.historyCF) arr.push("CF");
  if (p.isSmoker) arr.push("SMOKER");
  if (p.workExposure) arr.push("WORK_EXPOSURE");

  // Safety fallback (should never happen if UI enforces selection)
  return arr.length ? arr : ["NONE"];
}


  const handleSubmit = async (e: any) => {
  e.preventDefault();
  setError(null);

  try {
    // -----------------------------
    // 1️⃣ CREATE PRIMARY PATIENT
    // -----------------------------
    const primary = formData.profiles[0];
    const primaryResp = buildRespiratoryHistory(primary);
 
// const respiratory_history = [];
// if (primary.historyCOPD) respiratory_history.push("COPD");
// if (primary.historyAsthma) respiratory_history.push("ASTHMA");
// if (primary.historyTB) respiratory_history.push("TB");
// if (primary.historyCF) respiratory_history.push("CF");
// if (primary.isSmoker) respiratory_history.push("SMOKER");
// if (primary.workExposure) respiratory_history.push("WORK_EXPOSURE");


    const patientPayload = {
      email: formData.email,
      first_name: primary.firstName,
      last_name: primary.lastName,
      password: formData.password,
      age: Number(primary.age),
      sex: primary.sex.toUpperCase() as "F" | "M" | "O",
      ethnicity: primary.ethnicity,
      country: primary.country.toUpperCase(),
      province: primary.province.toUpperCase(),
      respiratory_history: primaryResp,
    };

    const parsed = patientSignupSchema.safeParse(patientPayload);
    if (!parsed.success) {
      setError("Validation failed for primary profile.");
      console.error(parsed.error.format());
      return;
    }
    console.log("Signup payload:", parsed.data);

    const signupRes = await signupPatient(parsed.data);
    console.log("Signup response:", signupRes);


    // Save auth details
    localStorage.setItem("token", signupRes.access_token);
    localStorage.setItem("user_id", String(signupRes.user_id));

    // -----------------------------
    // 2️⃣ CREATE SUB-USERS (IF ANY)
    // -----------------------------
    if (formData.profiles.length > 1) {
      for (let i = 1; i < formData.profiles.length; i++) {
        const p = formData.profiles[i];
        const subResp = buildRespiratoryHistory(p);

        // Province should already be in ISO-3166-2 format (e.g., "US-CA") from the dropdown
        const provinceCode = p.province.toUpperCase();

        const subUserPayload = {
          email: `${formData.email.split("@")[0]}+profile${i}@temp.com`,
          first_name: p.firstName,
          last_name: p.lastName,
          age: Number(p.age),
          sex: p.sex.toUpperCase() as "F" | "M" | "O",
          ethnicity: p.ethnicity.toUpperCase(), // Ensure uppercase to match enum values (AFR, ASN, etc.)
          country: p.country.toUpperCase(),
          province: provinceCode,
          respiratory_history: subResp, // ✅ ALWAYS ARRAY of strings matching enum values
        };

        // Validate sub-user payload before sending
        if (!subUserPayload.first_name || !subUserPayload.last_name) {
          setError(`Sub-user ${i}: First and last name are required.`);
          return;
        }
        if (!subUserPayload.age || subUserPayload.age <= 0) {
          setError(`Sub-user ${i}: Valid age is required.`);
          return;
        }
        if (!subUserPayload.sex || !["F", "M", "O"].includes(subUserPayload.sex)) {
          setError(`Sub-user ${i}: Valid sex (F/M/O) is required.`);
          return;
        }
        if (!subUserPayload.ethnicity || !["AFR", "ASN", "CAU", "HIS", "MDE", "MIX", "UND"].includes(subUserPayload.ethnicity)) {
          setError(`Sub-user ${i}: Valid ethnicity is required.`);
          return;
        }
        if (!subUserPayload.respiratory_history || subUserPayload.respiratory_history.length === 0) {
          setError(`Sub-user ${i}: At least one respiratory history option is required.`);
          return;
        }

        try {
          await createSubUser(signupRes.user_id, subUserPayload);
        } catch (err: any) {
          console.error(`Failed to create sub-user ${i}:`, err);
          setError(`Failed to create sub-user ${i}: ${err.message || "Unknown error"}`);
          return;
        }
      }
    }

    // -----------------------------
    // 3️⃣ DONE
    // -----------------------------
    setIsSuccess(true);
  } catch (err) {
    console.error(err);
    setError("Signup failed. Please try again.");
  }
};

//  const toggleRespiratory = (key: keyof ProfileData) => {
//   setFormData(prev => {
//     const profiles = [...prev.profiles];
//     profiles[activeProfileIndex] = {
//       ...profiles[activeProfileIndex],
//       [key]: !profiles[activeProfileIndex][key],
//     };
//     return { ...prev, profiles };
//   });
// };

  const toggleRespiratory = (key: keyof ProfileData) => {
  setFormData(prev => {
    const profiles = [...prev.profiles];
    const p = profiles[activeProfileIndex];

    if (key === "noneOfAbove") {
      profiles[activeProfileIndex] = {
        ...p,
        noneOfAbove: !p.noneOfAbove,
        historyCOPD: false,
        historyAsthma: false,
        historyTB: false,
        historyCF: false,
        isSmoker: false,
        workExposure: false,
      };
    } else {
      profiles[activeProfileIndex] = {
        ...p,
        noneOfAbove: false,
        [key]: !p[key],
      };
    }

    return { ...prev, profiles };
  });
};


const addAnotherProfile = () => {
  setFormData(prev => {
    const newProfiles = [
      ...prev.profiles,
      {
        firstName: "",
        lastName: "",
        age: "",
        sex: "",
        ethnicity: "",
        country: "",
        province: "",
        isSmoker: false,
        workExposure: false,
        historyCOPD: false,
        historyCF: false,
        historyTB: false,
        historyAsthma: false,
      } as ProfileData,
    ];

    return {
      ...prev,
      profiles: newProfiles,
    };
  });

  // move index to newly added profile
  setActiveProfileIndex(prev => prev + 1);
  setCurrentStep(2);
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

        

<div className="flex justify-center gap-2 mb-6">
  {[1, 2, 3, 4].map(step => (
    <div
      key={step}
      className={`h-1.5 w-8 rounded-full transition-all ${
        currentStep >= step ? "bg-lungsense-blue" : "bg-gray-200"
      }`}
    />
  ))}
</div>



{currentStep === 1 && (
  <div className="space-y-5 animate-in fade-in">
    <h3 className="text-2xl font-bold font-display">
      Account Registration
    </h3>

    {/* Email */}
    <div className="space-y-2">
      <Label className={labelStyle}>Email Address</Label>
      <Input
        name="email"
        type="email"
        placeholder="e.g. user@example.com"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
      />
    </div>

    {/* Password */}
    <div className="space-y-2">
      <Label className={labelStyle}>Password (Min 8 chars)</Label>
      <Input
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
      />
    </div>

    {/* Confirm Password – now BELOW password */}
    <div className="space-y-2">
      <Label className={labelStyle}>Confirm Password</Label>
      <Input
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
      />
    </div>
 
  </div>
)}


                {currentStep === 2 && (
  <div className="space-y-4 animate-in fade-in">
    <h3 className="text-2xl font-bold font-display">Primary Profile</h3>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className={labelStyle}>First Name</Label>
        <Input
          name="firstName"
          value={formData.profiles[activeProfileIndex].firstName ?? ""}
          onChange={(e) => handleProfileChange(activeProfileIndex, e)}
        />
      </div>

      <div className="space-y-2">
        <Label className={labelStyle}>Last Name</Label>
        <Input
          name="lastName"
          value={formData.profiles[activeProfileIndex].lastName ?? ""}
          onChange={(e) => handleProfileChange(activeProfileIndex, e)}
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label className={labelStyle}>Age</Label>
        <Input
          name="age"
          type="number"
          value={formData.profiles[activeProfileIndex].age ?? ""}
          onChange={(e) => handleProfileChange(activeProfileIndex, e)}
        />
      </div>

      <div className="space-y-2">
        <Label className={labelStyle}>Sex</Label>
        <select
          name="sex"
          className="w-full text-sm border rounded-md p-2 h-10"
          value={formData.profiles[activeProfileIndex].sex ?? ""}
          onChange={(e) => handleProfileChange(activeProfileIndex, e)}
        >
          <option value="">Select</option>
          <option value="F">Female</option>
          <option value="M">Male</option>
          <option value="O">Other</option>
        </select>
      </div>


    <div className="space-y-2">
        <Label className={labelStyle}>Ethnicity</Label>
   <select
  name="ethnicity"
  className="w-full text-sm border rounded-md p-2 h-10"
  value={formData.profiles[activeProfileIndex].ethnicity ?? ""}
  onChange={(e) => handleProfileChange(activeProfileIndex, e)}
>
  <option value="">Select</option>
  <option value="AFR">African</option>
  <option value="ASN">Asian</option>
  <option value="CAU">Caucasian</option>
  <option value="HIS">Hispanic</option>
  <option value="MDE">Middle Eastern</option>
  <option value="MIX">Mixed</option>
  <option value="UND">Prefer not to say</option>
</select>
    </div>
    </div>

    <div className="space-y-2">
      <Label className={labelStyle}>Country</Label>
     <div className="text-xs text-red-500">
</div>
 
      <select
        className="w-full text-sm border rounded-md p-2 h-10"
        value={formData.profiles[activeProfileIndex].country ?? ""}
        onChange={handleCountryISOChange}
      >
        <option value="">Select</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name} ({c.code})
          </option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <Label className={labelStyle}>Province</Label>
      {/* <select
        name="province"
        className="w-full text-sm border rounded-md p-2 h-10 disabled:opacity-50"
        value={formData.profiles[activeProfileIndex].province ?? ""}
        onChange={(e) => handleProfileChange(activeProfileIndex, e)}
        disabled={!provinces.length}
      > */}
      <select
  name="province"
  className="w-full text-sm border rounded-md p-2 h-10 disabled:opacity-50"
  value={formData.profiles[activeProfileIndex].province ?? ""}
  onChange={(e) => handleProfileChange(activeProfileIndex, e)}
  disabled={!formData.profiles[activeProfileIndex].country || !provinces.length}
>

        <option value="">Select</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  </div>
)}

 
                {/* {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-2xl font-bold font-display">Manage Profiles</h3>
                    <div className="space-y-3">
                      {formData.profiles.map((p, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                          <span className="font-medium text-gray-800">{p.firstName || "Primary Profile"} {p.lastName}</span>
                          <Button variant="ghost" size="sm" onClick={() => {setActiveProfileIndex(i); setCurrentStep(2);}} className="text-lungsense-blue">Edit</Button>
                        </div>
                      ))}
                      <Button type="button" onClick={addAnotherProfile} className={buttonDesign}><Plus className="w-4 h-4 mr-2" />Add Another Profile</Button>
                    </div>
                  </div>
                )} */}

                {currentStep === 3 && (
  <div className="space-y-6 animate-in fade-in">
    <h2 className="text-2xl font-bold font-display">
     Respiratory History
    </h2>
     <h3>
      Medical and Family History
     </h3>

    <p className="text-sm text-gray-500">
      Check all that apply to you or your immediate family.
    </p>

    <div className="space-y-3">
      {[
        { key: "historyCOPD", label: "COPD" },
        { key: "historyAsthma", label: "Asthma" },
        { key: "historyTB", label: "Tuberculosis (TB)" },
        { key: "historyCF", label: "Cystic Fibrosis (CF)" },
        { key: "isSmoker", label: "Current or Former Smoker" },
        { key: "workExposure", label: "Occupational Exposure (e.g., Mines, Mining, Industrial Dust)" },
        { key: "noneOfAbove", label: "None of the above" }
      ].map(item => (
        <label
          key={item.key}
          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={(formData.profiles[activeProfileIndex] as any)[item.key]}
            onChange={() => toggleRespiratory(item.key as keyof ProfileData)}
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  </div>
)}

{currentStep === 4 && (
  <div className="space-y-6 animate-in fade-in">
    <h3 className="text-2xl font-bold font-display">
      Manage Profiles
    </h3>

    <div className="space-y-3">
      {formData.profiles.map((p, i) => (
        <div
          key={i}
          className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center"
        >
          <span className="font-medium text-gray-800">
            {p.firstName || "Primary Profile"} {p.lastName}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="text-lungsense-blue"
            onClick={() => {
              setActiveProfileIndex(i);
              setCurrentStep(2); // go back to Profile Details
            }}
          >
            Edit
          </Button>
        </div>
      ))}

      <Button
        type="button"
        onClick={addAnotherProfile}
        className={buttonDesign}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Profile
      </Button>
    </div>

    {/* Consent */}
    <div className="pt-4 border-t space-y-3">
    <p className="text-xs text-gray-600 text-center leading-relaxed">
  In order to proceed, kindly read and accept our{" "}
  <button
    type="button"
    onClick={() => setIsPrivacyOpen(true)}
    className="text-lungsense-blue font-bold hover:underline"
  >
    Privacy Policy
  </button>.
</p>


      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={formData.consent}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              consent: e.target.checked,
            }))
          }
        />
        <span>
          I consent to the collection and analysis of respiratory data
          for all listed profiles.
        </span>
      </label>
    </div>
  </div>
)}


<div className="flex flex-col gap-3 pt-6">
  {/* Continue button (Steps 1–3 only) */}
  {currentStep < 4 && (
    <Button
      type="button"
      className={buttonDesign}
      onClick={nextStep}
    >
      Continue
    </Button>
  )}

    {/* Login link – BELOW button */}
  {currentStep === 1 && (
    <p className="text-sm text-gray-600 text-center">
      Already have an account?{" "}
      <Link
        to="/patient/login"
        className="text-lungsense-blue font-bold hover:underline"
      >
        Login here
      </Link>
    </p>
  )}

  {/* Complete Signup (Step 4 only) */}
  {currentStep === 4 && (
    <Button
      type="submit"
      className={buttonDesign}
      disabled={!formData.consent}
    >
      Complete Signup
    </Button>
  )}

  {/* Back button (Steps 2–4) */}
  {currentStep > 1 && (
    <Button
      type="button"
      variant="ghost"
      onClick={() => setCurrentStep(prev => prev - 1)}
      className="text-gray-500 text-sm"
    >
      Back
    </Button>
  )}
</div>

 
              </form>
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

{isPrivacyOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <Card className="max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl bg-white animate-in zoom-in-95">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lungsense-blue" />
          <h3 className="text-xl font-bold font-display">
            Privacy Policy
          </h3>
        </div>
        <X
          className="cursor-pointer text-gray-400 hover:text-gray-600"
          onClick={() => setIsPrivacyOpen(false)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-sm text-gray-600 leading-relaxed">
        <section>
          <h4 className="font-bold text-gray-900 mb-2">
            1. Data Collection
          </h4>
          <p>
            We collect personal identifiers (name, age, sex) and clinical
            health data including respiratory history. This data is used
            strictly for screening and model improvement.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-gray-900 mb-2">
            2. Usage and Analysis
          </h4>
          <p>
            Your data is processed using proprietary algorithms to identify
            respiratory risk patterns. Data is never sold or shared with
            advertisers.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-gray-900 mb-2">
            3. Security
          </h4>
          <p>
            All data is encrypted in transit and at rest. Identifiers are
            decoupled from clinical data wherever possible.
          </p>
        </section>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-xs">
          <strong>IMPORTANT:</strong> This application is a screening
          support tool and does not provide a medical diagnosis.
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex justify-end">
        <Button
          onClick={() => setIsPrivacyOpen(false)}
          className="bg-lungsense-blue text-white px-8"
        >
          I Understand
        </Button>
      </div>
    </Card>
  </div>
)}

      <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">© 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.</p>
      </footer>
    </div>
  );
}
