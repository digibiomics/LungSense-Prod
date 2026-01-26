//working latest
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getSubUsers,
  getUserById,
  createSubUser,
} from "../../src/api";

/* ---------- LOCATION HELPERS ---------- */

export async function fetchCountriesISO() {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=cca2,name"
  );
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
  return res.json();
}

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
    { code: string; name: string }[]
  >([]);
  const [provinces, setProvinces] = useState<
    { code: string; name: string }[]
  >([]);

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

    getUserById(ownerId)
      .then((res: any) => {
        // Handle APIResponse structure: { status, message, data: {...}, id }
        const u = res?.data || res;
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

    getSubUsers(ownerId)
      .then((list: any[]) => {
        if (Array.isArray(list)) {
          setProfiles(
            list.map((u) => ({
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
    fetchCountriesISO().then(setCountries);
  }, [isAdding]);

  /* ---------- COUNTRY → PROVINCE ---------- */

  useEffect(() => {
    if (!form.country) {
      setProvinces([]);
      setForm((p) => ({ ...p, province: "" }));
      return;
    }

    fetchProvincesISO(form.country)
      .then((res: any) => {
        if (Array.isArray(res)) {
          setProvinces(res);
        } else if (Array.isArray(res?.data?.provinces)) {
          setProvinces(res.data.provinces);
        } else {
          console.error("Unexpected provinces response", res);
          setProvinces([]);
        }
      })
      .catch((err) => {
        console.error("Province fetch failed", err);
        setProvinces([]);
      });
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

    if (!form.province) {
      setError("Province/State is required.");
      return;
    }

    // Ensure province is in correct format (should already be from dropdown, but validate)
    const provinceCode = form.province.toUpperCase();
    if (!provinceCode.includes('-')) {
      setError("Province format is invalid. Please select from the dropdown.");
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
      province: provinceCode,
      respiratory_history: buildHistory(),
    };

    try {
      const response = await createSubUser(ownerId, payload);
      
      // Handle APIResponse structure: { status, message, data: {...}, id }
      const created = response?.data || response;
      
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
      const errorMessage = err?.message || err?.detail || err?.error || "Failed to create profile. Please try again.";
      setError(errorMessage);
    }
  };

  const displayProfiles = [
    ...(primaryProfile ? [primaryProfile] : []),
    ...profiles,
  ];

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C9D4F4] via-[#ECEBFA] to-[#F5F2FD] p-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Who is checking in?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            className="bg-white/80 rounded-2xl p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
          >
            <div
              className={`w-24 h-24 rounded-full ${p.avatarColor} flex items-center justify-center text-white text-3xl font-bold mx-auto`}
            >
              {p.name[0]}
            </div>
            <h3 className="mt-4 font-bold text-center">
              {p.name} {p.isPrimary && "(Primary)"}
            </h3>
          </div>
        ))}

        <button
          onClick={() => setIsAdding(true)}
          className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center"
        >
          <Plus className="w-8 h-8" />
          Add Profile
        </button>
      </div>

      {/* ---------- MODAL ---------- */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-8">
            <button onClick={() => setIsAdding(false)} className="float-right">
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-6 flex gap-2">
              <UserPlus /> Add New Profile
            </h2>

            {error && <div className="text-red-600 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input name="firstName" onChange={handleChange} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input name="lastName" onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input name="age" type="number" onChange={handleChange} />
                </div>

                <div>
                  <Label>Sex</Label>
                  <select
                    name="sex"
                    className="w-full border rounded-md p-2"
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                <div>
                  <Label>Ethnicity</Label>
                  <select
                    name="ethnicity"
                    className="w-full border rounded-md p-2"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <select
                    name="country"
                    className="w-full border rounded-md p-2"
                    onChange={handleChange}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Province / State</Label>
                  <select
                    name="province"
                    className="w-full border rounded-md p-2"
                    onChange={handleChange}
                    disabled={!form.country}
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

              <div className="space-y-2 pt-4 border-t">
                <Label>Respiratory History</Label>
                {[
                  ["historyCOPD", "COPD"],
                  ["historyAsthma", "Asthma"],
                  ["historyTB", "Tuberculosis"],
                  ["historyCF", "Cystic Fibrosis"],
                  ["isSmoker", "Smoker"],
                  ["workExposure", "Work Exposure"],
                ].map(([k, l]) => (
                  <label key={k} className="flex gap-2">
                    <input
                      type="checkbox"
                      name={k}
                      checked={(form as any)[k]}
                      onChange={handleChange}
                    />
                    {l}
                  </label>
                ))}
              </div>

              <Button type="submit">Create Profile</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
