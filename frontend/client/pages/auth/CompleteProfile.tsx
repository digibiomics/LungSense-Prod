import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import tokenManager from '@/lib/tokenManager';
import countriesStatesData from '../../../src/countries+states.json';
import PrivacyModal from '@/components/PrivacyModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ProfileData {
  age: string;
  sex: string;
  ethnicity: string;
  country: string;
  province: string;
  respiratory_history: string[];
}

interface SubUserData extends ProfileData {
  first_name: string;
  last_name: string;
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<{ name: string; states: string[] }[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [subUserProvinces, setSubUserProvinces] = useState<{ [key: number]: string[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    sex: '',
    ethnicity: '',
    country: '',
    province: '',
    respiratory_history: []
  });
  const [otherText, setOtherText] = useState('');
  const [subUserOtherText, setSubUserOtherText] = useState<{ [key: number]: string }>({});

  const [subUsers, setSubUsers] = useState<SubUserData[]>([]);
  const [activeSubUserIndex, setActiveSubUserIndex] = useState(-1);

  useEffect(() => {
    setCountries(countriesStatesData);
  }, []);

  const handleCountryChange = (countryName: string) => {
    setProfileData(prev => ({ ...prev, country: countryName, province: '' }));
    const country = countriesStatesData.find(c => c.name === countryName);
    if (country && country.states.length > 0) {
      setProvinces(country.states);
    } else {
      setProvinces([]);
    }
  };

  const handleSubUserCountryChange = (countryName: string, index: number) => {
    const updatedSubUsers = [...subUsers];
    updatedSubUsers[index] = { ...updatedSubUsers[index], country: countryName, province: '' };
    setSubUsers(updatedSubUsers);
    const country = countriesStatesData.find(c => c.name === countryName);
    if (country && country.states.length > 0) {
      setSubUserProvinces(prev => ({ ...prev, [index]: country.states }));
    } else {
      setSubUserProvinces(prev => ({ ...prev, [index]: [] }));
    }
  };

  const toggleRespiratoryHistory = (condition: string) => {
    setProfileData(prev => {
      const history = [...prev.respiratory_history].filter(h => !h.startsWith('OTHER:'));
      if (condition === 'NONE') {
        return { ...prev, respiratory_history: history.includes('NONE') ? [] : ['NONE'] };
      } else if (condition === 'OTHER') {
        const hasOther = prev.respiratory_history.some(h => h.startsWith('OTHER'));
        const filtered = history.filter(h => h !== 'NONE');
        return { ...prev, respiratory_history: hasOther ? filtered : [...filtered, 'OTHER'] };
      } else {
        const filtered = history.filter(h => h !== 'NONE');
        if (filtered.includes(condition)) {
          return { ...prev, respiratory_history: filtered.filter(h => h !== condition) };
        } else {
          return { ...prev, respiratory_history: [...filtered, condition] };
        }
      }
    });
  };

  const getCurrentProvinces = () => {
    if (activeSubUserIndex >= 0) {
      return subUserProvinces[activeSubUserIndex] || [];
    }
    return provinces;
  };

  const toggleSubUserRespiratoryHistory = (condition: string, index: number) => {
    const updatedSubUsers = [...subUsers];
    const history = [...updatedSubUsers[index].respiratory_history].filter(h => !h.startsWith('OTHER:'));
    if (condition === 'NONE') {
      updatedSubUsers[index].respiratory_history = history.includes('NONE') ? [] : ['NONE'];
    } else if (condition === 'OTHER') {
      const hasOther = updatedSubUsers[index].respiratory_history.some(h => h.startsWith('OTHER'));
      const filtered = history.filter(h => h !== 'NONE');
      updatedSubUsers[index].respiratory_history = hasOther ? filtered : [...filtered, 'OTHER'];
    } else {
      const filtered = history.filter(h => h !== 'NONE');
      if (filtered.includes(condition)) {
        updatedSubUsers[index].respiratory_history = filtered.filter(h => h !== condition);
      } else {
        updatedSubUsers[index].respiratory_history = [...filtered, condition];
      }
    }
    setSubUsers(updatedSubUsers);
  };

  const addSubUser = () => {
    setSubUsers(prev => [...prev, {
      first_name: '',
      last_name: '',
      age: '',
      sex: '',
      ethnicity: '',
      country: '',
      province: '',
      respiratory_history: []
    }]);
    const newIndex = subUsers.length;
    setActiveSubUserIndex(newIndex);
    setSubUserProvinces(prev => ({ ...prev, [newIndex]: [] }));
    setCurrentStep(1);
  };

  const removeSubUser = (index: number) => {
    setSubUsers(prev => prev.filter((_, i) => i !== index));
    setActiveSubUserIndex(-1);
  };

  const nextStep = () => {
    setError(null);
    if (activeSubUserIndex >= 0) {
      const subUser = subUsers[activeSubUserIndex];
      if (currentStep === 1) {
        if (!subUser.first_name || !subUser.last_name || !subUser.age || !subUser.sex || !subUser.ethnicity || !subUser.country || !subUser.province) {
          setError('Please complete all fields');
          return;
        }
      }
      if (currentStep === 2) {
        if (subUser.respiratory_history.length === 0) {
          setError('Please select at least one respiratory history option');
          return;
        }
        setActiveSubUserIndex(-1);
        setCurrentStep(3);
        return;
      }
    } else {
      if (currentStep === 1) {
        if (!profileData.age || !profileData.sex || !profileData.ethnicity || !profileData.country || !profileData.province) {
          setError('Please complete all fields');
          return;
        }
      }
      if (currentStep === 2) {
        if (profileData.respiratory_history.length === 0) {
          setError('Please select at least one respiratory history option');
          return;
        }
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        age: parseInt(profileData.age),
        sex: profileData.sex,
        ethnicity: profileData.ethnicity,
        country: profileData.country,
        province: profileData.province,
        respiratory_history: profileData.respiratory_history.map(h =>
          h === 'OTHER' && otherText.trim() ? `OTHER:${otherText.trim()}` : h
        ),
        sub_users: subUsers.map((su, i) => ({
          first_name: su.first_name,
          last_name: su.last_name,
          age: parseInt(su.age),
          sex: su.sex,
          ethnicity: su.ethnicity,
          country: su.country,
          province: su.province,
          respiratory_history: su.respiratory_history.map(h =>
            h === 'OTHER' && subUserOtherText[i]?.trim() ? `OTHER:${subUserOtherText[i].trim()}` : h
          )
        }))
      };

      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/auth/google/complete-profile`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/select-role');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || errorData?.detail || 'Failed to complete profile');
      }

      toast.success('Profile completed successfully!');
      localStorage.setItem('profile_completed', 'true');
      const userRole = localStorage.getItem('user_role');
      if (userRole === 'patient') {
        navigate('/patient/select-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Profile completion error:', err);
      setError(err.message || 'Failed to complete profile');
    }
  };

  const currentProfile = activeSubUserIndex >= 0 ? subUsers[activeSubUserIndex] : profileData;
  const isSubUser = activeSubUserIndex >= 0;

  return (
    <>
      <style>{`
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top    { padding-top: env(safe-area-inset-top); }
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>

      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {/*
        h-[100dvh] + overflow-hidden shell: header + scrollable main + footer
        always fit the viewport at every size. Footer is always visible.
      */}
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">

        {/* HEADER — clicking logo/title navigates to index */}
        <header className="flex-none border-b border-gray-200/60 bg-white/30 backdrop-blur-md z-30 safe-top">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 md:py-5">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity w-fit"
            >
              <img
                src="/images/logo-new.png"
                alt="LungSense Logo"
                className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto"
              />
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 font-display tracking-tight">
                LungSense
              </h1>
            </Link>
          </div>
        </header>

        {/* MAIN — scrollable so the card is always reachable on short viewports */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 flex items-start md:items-center justify-center min-h-full">
            <Card className="w-full max-w-xs sm:max-w-sm md:max-w-lg shadow-lg">
              <CardHeader className="text-center px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                  {isSubUser ? 'Sub-user Profile' : 'Primary Profile'}
                </CardTitle>
                <CardDescription className="font-dm text-sm">
                  {isSubUser
                    ? `${subUsers[activeSubUserIndex]?.first_name || 'New'} Profile`
                    : 'Complete your profile information'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6 pb-5 sm:pb-6">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
                    {error}
                  </div>
                )}

                {/* Progress dots */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map(step => (
                    <div
                      key={step}
                      className={`h-1.5 w-8 rounded-full transition-all ${
                        currentStep >= step ? 'bg-lungsense-blue' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* ── Step 1: Demographics & Location ── */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    {isSubUser && (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                            FIRST NAME
                          </Label>
                          <Input
                            placeholder="e.g. John"
                            value={subUsers[activeSubUserIndex]?.first_name || ''}
                            onChange={(e) => {
                              const updated = [...subUsers];
                              updated[activeSubUserIndex].first_name = e.target.value;
                              setSubUsers(updated);
                            }}
                            className="font-display text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                            LAST NAME
                          </Label>
                          <Input
                            placeholder="e.g. Doe"
                            value={subUsers[activeSubUserIndex]?.last_name || ''}
                            onChange={(e) => {
                              const updated = [...subUsers];
                              updated[activeSubUserIndex].last_name = e.target.value;
                              setSubUsers(updated);
                            }}
                            className="font-display text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Age / Sex / Ethnicity — 3-col on sm+, stack on xs */}
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                          AGE
                        </Label>
                        <Input
                          type="number"
                          placeholder="35"
                          min="1"
                          max="120"
                          value={currentProfile.age}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 120)) {
                              if (isSubUser) {
                                const updated = [...subUsers];
                                updated[activeSubUserIndex].age = value;
                                setSubUsers(updated);
                              } else {
                                setProfileData(prev => ({ ...prev, age: value }));
                              }
                            }
                          }}
                          className="font-display text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                          SEX
                        </Label>
                        <select
                          className="w-full border rounded-md p-2 h-10 font-display text-sm"
                          value={currentProfile.sex}
                          onChange={(e) => {
                            if (isSubUser) {
                              const updated = [...subUsers];
                              updated[activeSubUserIndex].sex = e.target.value;
                              setSubUsers(updated);
                            } else {
                              setProfileData(prev => ({ ...prev, sex: e.target.value }));
                            }
                          }}
                        >
                          <option value="">Select</option>
                          <option value="F">Female</option>
                          <option value="M">Male</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                          ETHNICITY
                        </Label>
                        <select
                          className="w-full border rounded-md p-2 h-10 font-display text-sm"
                          value={currentProfile.ethnicity}
                          onChange={(e) => {
                            if (isSubUser) {
                              const updated = [...subUsers];
                              updated[activeSubUserIndex].ethnicity = e.target.value;
                              setSubUsers(updated);
                            } else {
                              setProfileData(prev => ({ ...prev, ethnicity: e.target.value }));
                            }
                          }}
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

                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                        COUNTRY
                      </Label>
                      <select
                        className="w-full border rounded-md p-2 h-10 font-display text-sm"
                        value={currentProfile.country}
                        onChange={(e) => {
                          if (isSubUser) {
                            handleSubUserCountryChange(e.target.value, activeSubUserIndex);
                          } else {
                            handleCountryChange(e.target.value);
                          }
                        }}
                      >
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country.name} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                        PROVINCE / STATE
                      </Label>
                      <select
                        className="w-full border rounded-md p-2 h-10 font-display text-sm"
                        value={currentProfile.province}
                        disabled={getCurrentProvinces().length === 0}
                        onChange={(e) => {
                          if (isSubUser) {
                            const updated = [...subUsers];
                            updated[activeSubUserIndex].province = e.target.value;
                            setSubUsers(updated);
                          } else {
                            setProfileData(prev => ({ ...prev, province: e.target.value }));
                          }
                        }}
                      >
                        <option value="">
                          {getCurrentProvinces().length === 0 ? 'No provinces available' : 'Select Province'}
                        </option>
                        {getCurrentProvinces().map(province => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      {getCurrentProvinces().length === 0 && currentProfile.country && (
                        <p className="text-xs text-gray-500 mt-1">
                          No province data available for selected country
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 2: Respiratory History ── */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold">Respiratory History</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Medical & Family History — Check all that apply to you or your immediate family.
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { key: 'COPD',          label: 'COPD' },
                        { key: 'ASTHMA',        label: 'Asthma' },
                        { key: 'TB',            label: 'Tuberculosis (TB)' },
                        { key: 'CF',            label: 'Cystic Fibrosis (CF)' },
                        { key: 'SMOKER',        label: 'Current or Former Smoker' },
                        { key: 'WORK_EXPOSURE', label: 'Occupational Exposure (e.g., Mines, Mining, Industrial Dust)' },
                        { key: 'NONE',          label: 'None of the above' },
                        { key: 'OTHER',         label: 'Other' },
                      ].map(item => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 p-2.5 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={
                              item.key === 'OTHER'
                                ? (isSubUser
                                    ? subUsers[activeSubUserIndex].respiratory_history.some(h => h.startsWith('OTHER'))
                                    : currentProfile.respiratory_history.some(h => h.startsWith('OTHER')))
                                : currentProfile.respiratory_history.includes(item.key)
                            }
                            onChange={() => {
                              if (isSubUser) {
                                toggleSubUserRespiratoryHistory(item.key, activeSubUserIndex);
                              } else {
                                toggleRespiratoryHistory(item.key);
                              }
                            }}
                            className="flex-shrink-0"
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                      {/* Other text box */}
                      {(isSubUser
                        ? subUsers[activeSubUserIndex].respiratory_history.some(h => h.startsWith('OTHER'))
                        : currentProfile.respiratory_history.some(h => h.startsWith('OTHER'))
                      ) && (
                        <textarea
                          value={isSubUser ? (subUserOtherText[activeSubUserIndex] || '') : otherText}
                          onChange={e => {
                            if (isSubUser) {
                              setSubUserOtherText(prev => ({ ...prev, [activeSubUserIndex]: e.target.value }));
                            } else {
                              setOtherText(e.target.value);
                            }
                          }}
                          placeholder="Please describe your condition..."
                          rows={2}
                          className="w-full border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-lungsense-blue"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Manage Profiles ── */}
                {currentStep === 3 && !isSubUser && (
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold">Manage Profiles</h3>

                    <div className="space-y-3">
                      {/* Main profile pill */}
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                        <span className="font-medium text-green-800 text-sm sm:text-base">
                          Main Profile: {localStorage.getItem('user_name')}
                        </span>
                      </div>

                      {/* Sub-user entries */}
                      {subUsers.map((subUser, index) => (
                        <div
                          key={index}
                          className="p-3 sm:p-4 bg-gray-50 rounded-lg border flex justify-between items-center gap-2"
                        >
                          <span className="font-medium text-sm sm:text-base truncate">
                            {subUser.first_name} {subUser.last_name}
                          </span>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs sm:text-sm"
                              onClick={() => {
                                setActiveSubUserIndex(index);
                                const su = subUsers[index];
                                if (su.country) {
                                  const country = countriesStatesData.find(c => c.name === su.country);
                                  if (country && country.states.length > 0) {
                                    setSubUserProvinces(prev => ({ ...prev, [index]: country.states }));
                                  }
                                }
                                setCurrentStep(1);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubUser(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add sub-user */}
                      <Button
                        type="button"
                        onClick={addSubUser}
                        className="w-full text-sm sm:text-base"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sub-user
                      </Button>
                    </div>

                    {/* ── Terms & Conditions notice (Step 3 only) ── */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        By completing your profile and using LungSense, you agree to our{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-lungsense-blue underline font-medium hover:opacity-80 transition-opacity"
                        >
                          Terms of Use &amp; Medical Disclaimer
                        </button>
                        . LungSense does not provide medical advice — all outputs are
                        intended for screening and monitoring purposes only.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Navigation buttons ── */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  {currentStep < 3 && (
                    <Button
                      onClick={nextStep}
                      className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 font-display text-sm sm:text-base"
                    >
                      Continue
                    </Button>
                  )}

                  {currentStep === 3 && !isSubUser && (
                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 font-display text-sm sm:text-base"
                    >
                      Complete Profile
                    </Button>
                  )}

                  {currentStep > 1 && (
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="font-display text-sm sm:text-base"
                    >
                      Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex-none w-full text-center py-3 sm:py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm safe-bottom">
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide px-4">
            © 2025 LUNGSENSE &amp; DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </p>
        </footer>
      </div>
    </>
  );
}