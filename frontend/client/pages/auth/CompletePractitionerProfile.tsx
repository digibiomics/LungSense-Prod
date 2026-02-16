import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import tokenManager from '@/lib/tokenManager';
import countriesStatesData from '../../../src/countries+states.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface PractitionerProfileData {
  practitioner_id: string;
  institution: string;
  institution_location_country: string;
  institution_location_province: string;
  consent: boolean;
}

export default function CompletePractitionerProfile() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<{ name: string; states: string[] }[]>([]);
  const [institutionProvinces, setInstitutionProvinces] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<PractitionerProfileData>({
    practitioner_id: '',
    institution: '',
    institution_location_country: '',
    institution_location_province: '',
    consent: false
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

    if (!profileData.consent) {
      setError('Please accept the consent form to continue');
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-2">
            <img src="/images/logo-new.png" alt="LungSense Logo" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 font-display">
              Complete Practitioner Profile
            </CardTitle>
            <CardDescription className="font-dm">
              Please provide your professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
                {error}
              </div>
            )}

            {/* Practitioner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Professional Details</h3>
              
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                  PRACTITIONER ID *
                </Label>
                <Input
                  placeholder="e.g. MED123456"
                  value={profileData.practitioner_id}
                  onChange={(e) => setProfileData(prev => ({ ...prev, practitioner_id: e.target.value }))}
                  className="font-display"
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
                  className="font-display"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-gray-700 font-dm mb-2 block">
                    INSTITUTION COUNTRY *
                  </Label>
                  <select
                    className="w-full border rounded-md p-2 h-10 font-display"
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
                    className="w-full border rounded-md p-2 h-10 font-display"
                    value={profileData.institution_location_province}
                    disabled={institutionProvinces.length === 0}
                    onChange={(e) => setProfileData(prev => ({ ...prev, institution_location_province: e.target.value }))}
                  >
                    <option value="">{institutionProvinces.length === 0 ? 'Select country first' : 'Select Province'}</option>
                    {institutionProvinces.map(province => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>



            {/* Consent */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50">
                <Checkbox
                  checked={profileData.consent}
                  onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, consent: checked as boolean }))}
                />
                <div className="flex-1">
                  <Label className="text-sm font-dm cursor-pointer">
                    I consent to the collection and processing of my data for medical analysis purposes. 
                    I understand that my information will be handled in accordance with applicable privacy laws and regulations.
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-lungsense-green hover:bg-lungsense-green/90 font-display"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>
    </div>
  );
}
