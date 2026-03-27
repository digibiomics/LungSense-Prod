import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { googleOAuthCallback, recordConsent } from '../../../src/api';
import { User, Stethoscope, CheckSquare, Square } from 'lucide-react';
import PrivacyModal from '@/components/PrivacyModal';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GOOGLE_BTN_NATIVE_WIDTH = 400;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const [consentChecked, setConsentChecked] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [btnScale, setBtnScale] = useState(1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const isPatient = role === 'patient';
  const RoleIcon = isPatient ? User : Stethoscope;
  const roleLabel = isPatient ? 'Patient' : 'Practitioner';
  const roleAccent = isPatient ? 'bg-lungsense-blue-light' : 'bg-lungsense-green';

  const loginHint = localStorage.getItem('user_email') || undefined;

  const updateScale = useCallback(() => {
    if (!wrapperRef.current) return;
    const available = wrapperRef.current.getBoundingClientRect().width;
    if (available > 0) {
      setBtnScale(Math.min(1, available / GOOGLE_BTN_NATIVE_WIDTH));
    }
  }, []);

  useEffect(() => {
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [updateScale]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const profileCompleted = localStorage.getItem('profile_completed');
    if (token && profileCompleted === 'true') {
      const userRole = localStorage.getItem('user_role');
      if (userRole === 'patient') navigate('/patient/select-profile');
      else if (userRole === 'practitioner') navigate('/practitioner/patients');
    }
  }, [navigate]);

  const clearAuthData = () => {
    ['access_token', 'refresh_token', 'user_id', 'user_role', 'user_email',
     'user_name', 'profile_completed', 'profile_picture'].forEach(k => localStorage.removeItem(k));
  };

  const processBackendLogin = async (idToken: string) => {
    try {
      const data = await googleOAuthCallback(idToken, role);
      if (!data || !data.access_token || !data.user_id) throw new Error('Invalid response from server');

      // Store auth data first — recordConsent needs the token to be in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_id', data.user_id.toString());
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('user_name', `${data.first_name} ${data.last_name}`);
      localStorage.setItem('profile_completed', data.profile_completed.toString());
      if (data.profile_picture_url) localStorage.setItem('profile_picture', data.profile_picture_url);

      // Record consent in the database now that we have a valid token.
      // This is non-blocking — a failure here will not prevent login from succeeding.
      await recordConsent();

      toast.success('Login successful!');
      if (!data.profile_completed) {
        navigate(data.role === 'patient' ? '/auth/complete-profile' : '/auth/complete-practitioner-profile');
      } else {
        navigate(data.role === 'patient' ? '/patient/select-profile' : '/practitioner/patients');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      clearAuthData();
      const msg = error instanceof Error ? error.message : 'Please try again.';
      toast.error(msg.includes('deleted') ? 'Your account has been deleted. Please contact support.' : `Login failed: ${msg}`);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) { toast.error('No credential received from Google'); return; }
    await processBackendLogin(credentialResponse.credential);
  };

  const handleGoogleError = () => toast.error('Google authentication failed');

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>

      {showPolicy && (
        <PrivacyModal
          onClose={() => setShowPolicy(false)}
          onAccept={() => { setConsentChecked(true); setShowPolicy(false); }}
          showGoogleLinks
        />
      )}

      <>
        <style>{`
          @supports (padding: env(safe-area-inset-top)) {
            .safe-top    { padding-top: env(safe-area-inset-top); }
            .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
          }
        `}</style>

        <div className="
          h-[100dvh] flex flex-col overflow-hidden
          bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]
        ">
          {/* HEADER */}
          <header className="
            w-full flex-none border-b border-gray-200/50 bg-white/30 backdrop-blur-md z-30
            safe-top
          ">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 md:py-5 lg:py-6">
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity"
              >
                <img src="/images/logo-new.png" alt="LungSense Logo" className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto" />
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 font-display tracking-tight">
                  LungSense
                </h3>
              </Link>
            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-12 lg:py-20">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
              <div className="
                bg-white/80 backdrop-blur-sm
                rounded-2xl md:rounded-3xl
                shadow-xl border border-white
                p-6 sm:p-7 md:p-8 lg:p-10
                flex flex-col items-center
                gap-4 sm:gap-5 md:gap-6 lg:gap-8
              ">

                {/* Role badge */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                  <div className={`w-13 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 ${roleAccent} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <RoleIcon className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 font-display tracking-tight">
                      Sign in as {roleLabel}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Use your Google account to continue
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full border-t border-gray-100" />

                {/* Consent checkbox */}
                <div className="w-full">
                  <button
                    onClick={() => consentChecked ? setConsentChecked(false) : setShowPolicy(true)}
                    className="w-full flex items-start gap-3 text-left group"
                  >
                    <div className="flex-shrink-0 mt-0.5 transition-transform active:scale-90">
                      {consentChecked ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-lungsense-blue" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
                      )}
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed">
                      I have read and agree to the{' '}
                      <span
                        className="text-lungsense-blue underline font-medium cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setShowPolicy(true); }}
                      >
                        Terms of Use & Medical Disclaimer
                      </span>
                      {' '}and acknowledge that LungSense does not provide medical advice.
                    </p>
                  </button>
                </div>

                {/* Google Sign-In */}
                <div className="w-full flex flex-col items-center gap-2 sm:gap-3">
                  <div
                    ref={wrapperRef}
                    className={`w-full transition-opacity duration-200 ${consentChecked ? 'opacity-100' : 'opacity-35 pointer-events-none'}`}
                    style={{ height: `${Math.round(btnScale * 44)}px` }}
                  >
                    <div
                      style={{
                        width: `${GOOGLE_BTN_NATIVE_WIDTH}px`,
                        transformOrigin: 'top left',
                        transform: `scale(${btnScale})`,
                      }}
                    >
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        auto_select={false}
                        login_hint={loginHint}
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        theme="outline"
                        width={String(GOOGLE_BTN_NATIVE_WIDTH)}
                      />
                    </div>
                  </div>

                  {!consentChecked && (
                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                      Please review and accept the Terms above to continue
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="w-full border-t border-gray-100" />

                {/* Google policy links */}
                <div className="w-full flex justify-center items-center gap-4">
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Google Privacy
                  </a>
                  <span className="text-gray-200 select-none">|</span>
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Google Terms
                  </a>
                </div>

                {/* Back */}
                <Button
                  variant="ghost"
                  onClick={() => navigate('/select-role')}
                  className="text-xs sm:text-sm text-gray-500 hover:text-lungsense-blue active:opacity-50 transition-colors -mt-1 -mb-2"
                >
                  ← Back to role selection
                </Button>

              </div>
            </div>
          </main>

          {/* FOOTER */}
          <footer className="
            w-full flex-none text-center py-3 sm:py-4
            border-t border-white/20 bg-white/10 backdrop-blur-sm z-20
            safe-bottom
          ">
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide px-4">
              © 2025 LUNGSENSE &amp; DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
            </p>
          </footer>
        </div>
      </>

    </GoogleOAuthProvider>
  );
}