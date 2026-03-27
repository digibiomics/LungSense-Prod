import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import tokenManager from '@/lib/tokenManager';
import countriesStatesData from '../../../src/countries+states.json';
import PrivacyModal from '@/components/PrivacyModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface PractitionerProfileData {
  practitioner_id: string;
  institution: string;
  institution_location_country: string;
  institution_location_province: string;
}

export default function CompletePractitionerProfile() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<{ name: string; states: string[] }[]>([]);
  const [institutionProvinces, setInstitutionProvinces] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [profileData, setProfileData] = useState<PractitionerProfileData>({
    practitioner_id: '',
    institution: '',
    institution_location_country: '',
    institution_location_province: ''
  });

  useEffect(() => {
    setCountries(countriesStatesData);
  }, []);

  const handleInstitutionCountryChange = (countryName: string) => {
    setProfileData(prev => ({ ...prev, institution_location_country: countryName, institution_location_province: '' }));
    const country = countriesStatesData.find(c => c.name === countryName);
    if (country && country.states.length > 0) {
      setInstitutionProvinces(country.states);
    } else {
      setInstitutionProvinces([]);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!profileData.practitioner_id || !profileData.institution ||
        !profileData.institution_location_country || !profileData.institution_location_province) {
      setError('Please complete all required fields');
      return;
    }

    try {
      const payload = {
        practitioner_id: profileData.practitioner_id,
        institution: profileData.institution,
        institution_location_country: profileData.institution_location_country,
        institution_location_province: profileData.institution_location_province,
        age: 25,
        sex: 'O',
        ethnicity: 'UND',
        country: profileData.institution_location_country,
        province: profileData.institution_location_province,
        respiratory_history: ['NONE']
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
      navigate('/practitioner/patients');
    } catch (err: any) {
      console.error('Profile completion error:', err);
      setError(err.message || 'Failed to complete profile');
    }
  };

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

      {/* + overflow-hidden shell ensures footer always stays visible.
        Main is flex-1 min-h-0 overflow-y-auto so the form card scrolls on short
        viewports rather than pushing the footer off-screen.
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

        {/* MAIN — scrollable */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 flex items-start md:items-center justify-center min-h-full">
            <Card className="w-full max-w-sm sm:max-w-lg md:max-w-2xl shadow-lg">
              <CardHeader className="text-center px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                  Complete Practitioner Profile
                </CardTitle>
                <CardDescription className="font-dm text-sm">
                  Please provide your professional information
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6 pb-5 sm:pb-6">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
                    {error}
                  </div>
                )}

                {/* Professional Details */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-display">
                    Professional Details
                  </h3>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                      PRACTITIONER ID *
                    </Label>
                    <Input
                      placeholder="e.g. MED123456"
                      value={profileData.practitioner_id}
                      onChange={(e) => setProfileData(prev => ({ ...prev, practitioner_id: e.target.value }))}
                      className="font-display text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                      INSTITUTION *
                    </Label>
                    <Input
                      placeholder="e.g. City General Hospital"
                      value={profileData.institution}
                      onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
                      className="font-display text-sm"
                    />
                  </div>

                  {/* Country + Province — stack on xs, side-by-side from sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                        INSTITUTION COUNTRY *
                      </Label>
                      <select
                        className="w-full border rounded-md p-2 h-10 font-display text-sm"
                        value={profileData.institution_location_country}
                        onChange={(e) => handleInstitutionCountryChange(e.target.value)}
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
                        INSTITUTION PROVINCE *
                      </Label>
                      <select
                        className="w-full border rounded-md p-2 h-10 font-display text-sm"
                        value={profileData.institution_location_province}
                        disabled={institutionProvinces.length === 0}
                        onChange={(e) => setProfileData(prev => ({ ...prev, institution_location_province: e.target.value }))}
                      >
                        <option value="">
                          {institutionProvinces.length === 0 ? 'Select country first' : 'Select Province'}
                        </option>
                        {institutionProvinces.map(province => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms notice */}
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

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-lungsense-green hover:bg-lungsense-green/90 font-display text-sm sm:text-base"
                >
                  Complete Profile
                </Button>
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
