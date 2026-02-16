import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import tokenManager from '@/lib/tokenManager';
import countriesStatesData from '../../../src/countries+states.json';

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

  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    sex: '',
    ethnicity: '',
    country: '',
    province: '',
    respiratory_history: []
  });

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
      const history = [...prev.respiratory_history];
      if (condition === 'NONE') {
        return { ...prev, respiratory_history: history.includes('NONE') ? [] : ['NONE'] };
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
    const history = [...updatedSubUsers[index].respiratory_history];
    
    if (condition === 'NONE') {
      updatedSubUsers[index].respiratory_history = history.includes('NONE') ? [] : ['NONE'];
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
    // Initialize empty provinces for new sub-user
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
        respiratory_history: profileData.respiratory_history,
        sub_users: subUsers.map(su => ({
          first_name: su.first_name,
          last_name: su.last_name,
          age: parseInt(su.age),
          sex: su.sex,
          ethnicity: su.ethnicity,
          country: su.country,
          province: su.province,
          respiratory_history: su.respiratory_history
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
      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 font-display">
              {isSubUser ? 'Sub-user Profile' : 'Primary Profile'}
            </CardTitle>
            <CardDescription className="font-dm">
              {isSubUser ? `${subUsers[activeSubUserIndex]?.first_name || 'New'} Profile` : 'Complete your profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
                {error}
              </div>
            )}

            {/* Progress indicator */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`h-1.5 w-8 rounded-full transition-all ${
                    currentStep >= step ? "bg-lungsense-blue" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Demographics & Location */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {isSubUser && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">FIRST NAME</Label>
                      <Input
                        placeholder="e.g. John"
                        value={subUsers[activeSubUserIndex]?.first_name || ''}
                        onChange={(e) => {
                          const updated = [...subUsers];
                          updated[activeSubUserIndex].first_name = e.target.value;
                          setSubUsers(updated);
                        }}
                        className="font-display"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">LAST NAME</Label>
                      <Input
                        placeholder="e.g. Doe"
                        value={subUsers[activeSubUserIndex]?.last_name || ''}
                        onChange={(e) => {
                          const updated = [...subUsers];
                          updated[activeSubUserIndex].last_name = e.target.value;
                          setSubUsers(updated);
                        }}
                        className="font-display"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">AGE</Label>
                    <Input
                      type="number"
                      placeholder="35"
                      value={currentProfile.age}
                      onChange={(e) => {
                        if (isSubUser) {
                          const updated = [...subUsers];
                          updated[activeSubUserIndex].age = e.target.value;
                          setSubUsers(updated);
                        } else {
                          setProfileData(prev => ({ ...prev, age: e.target.value }));
                        }
                      }}
                      className="font-display"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">SEX</Label>
                    <select
                      className="w-full border rounded-md p-2 h-10 font-display"
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
                    <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">ETHNICITY</Label>
                    <select
                      className="w-full border rounded-md p-2 h-10 font-display"
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
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">COUNTRY</Label>
                  <select
                    className="w-full border rounded-md p-2 h-10 font-display"
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
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">PROVINCE / STATE</Label>
                  <select
                    className="w-full border rounded-md p-2 h-10 font-display"
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
                    <option value="">{getCurrentProvinces().length === 0 ? 'No provinces available' : 'Select Province'}</option>
                    {getCurrentProvinces().map(province => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  {getCurrentProvinces().length === 0 && currentProfile.country && (
                    <p className="text-xs text-gray-500 mt-1">No province data available for selected country</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Respiratory History */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Respiratory History</h3>
                <p className="text-sm text-gray-600">
                  Medical & Family History - Check all that apply to you or your immediate family.
                </p>

                <div className="space-y-3">
                  {[
                    { key: 'COPD', label: 'COPD' },
                    { key: 'ASTHMA', label: 'Asthma' },
                    { key: 'TB', label: 'Tuberculosis (TB)' },
                    { key: 'CF', label: 'Cystic Fibrosis (CF)' },
                    { key: 'SMOKER', label: 'Current or Former Smoker' },
                    { key: 'WORK_EXPOSURE', label: 'Occupational Exposure (e.g., Mines, Mining, Industrial Dust)' },
                    { key: 'NONE', label: 'None of the above' }
                  ].map(item => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={currentProfile.respiratory_history.includes(item.key)}
                        onChange={() => {
                          if (isSubUser) {
                            toggleSubUserRespiratoryHistory(item.key, activeSubUserIndex);
                          } else {
                            toggleRespiratoryHistory(item.key);
                          }
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Sub-users Management */}
            {currentStep === 3 && !isSubUser && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Manage Profiles</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">
                      Main Profile: {localStorage.getItem('user_name')}
                    </span>
                  </div>

                  {subUsers.map((subUser, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                      <span className="font-medium">
                        {subUser.first_name} {subUser.last_name}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveSubUserIndex(index);
                            // Load provinces for this sub-user if they have a country selected
                            const subUser = subUsers[index];
                            if (subUser.country) {
                              const country = countriesStatesData.find(c => c.name === subUser.country);
                              if (country && country.states.length > 0) {
                                setSubUserProvinces(prev => ({
                                  ...prev,
                                  [index]: country.states
                                }));
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

                  <Button
                    type="button"
                    onClick={addSubUser}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sub-user
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex flex-col gap-3">
              {currentStep < 3 && (
                <Button onClick={nextStep} className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 font-display">
                  Continue
                </Button>
              )}

              {currentStep === 3 && !isSubUser && (
                <Button onClick={handleSubmit} className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 font-display">
                  Complete Profile
                </Button>
              )}

              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="font-display"
                >
                  Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>
    </div>
  );
}