import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { googleOAuthCallback } from '../../../src/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface GoogleAuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
  role: string;
  profile_completed: boolean;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const profileCompleted = localStorage.getItem('profile_completed');
    
    if (token && profileCompleted === 'true') {
      const userRole = localStorage.getItem('user_role');
      if (userRole === 'patient') {
        navigate('/patient/select-profile');
      } else if (userRole === 'practitioner') {
        navigate('/practitioner/patients');
      }
    }
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google credential response:', credentialResponse);
      
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }
      
      const data = await googleOAuthCallback(credentialResponse.credential, role);
      
      console.log('OAuth callback response:', data);
      
      if (!data || !data.access_token || !data.user_id) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_id', data.user_id.toString());
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('user_name', `${data.first_name} ${data.last_name}`);
      localStorage.setItem('profile_completed', data.profile_completed.toString());
      
      if (data.profile_picture_url) {
        localStorage.setItem('profile_picture', data.profile_picture_url);
      }

      toast.success('Login successful!');

      if (!data.profile_completed) {
        if (data.role === 'patient') {
          navigate('/auth/complete-profile');
        } else if (data.role === 'practitioner') {
          navigate('/auth/complete-practitioner-profile');
        }
      } else {
        if (data.role === 'patient') {
          navigate('/patient/select-profile');
        } else if (data.role === 'practitioner') {
          navigate('/practitioner/patients');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear any stored tokens on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('profile_completed');
      localStorage.removeItem('profile_picture');
      
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      
      if (errorMessage.includes('deleted')) {
        toast.error('Your account has been deleted. Please contact support.');
      } else {
        toast.error(`Login failed: ${errorMessage}`);
      }
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication failed');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Continue as {role === 'patient' ? 'Patient' : 'Practitioner'}
            </CardTitle>
            <CardDescription>
              Use your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                size="large"
                text="signin_with"
                shape="rectangular"
                theme="outline"
              />
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/select-role')}
                className="text-sm"
              >
                ← Back to role selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}