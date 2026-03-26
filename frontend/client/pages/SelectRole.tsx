import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, User, Stethoscope } from "lucide-react";
import { useEffect } from "react";

export default function SelectRole() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect if user is already logged in
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    const profileCompleted = localStorage.getItem('profile_completed');
    
    if (token && profileCompleted === 'true') {
      if (userRole === 'patient') {
        navigate('/patient/select-profile', { replace: true });
      } else if (userRole === 'practitioner') {
        navigate('/practitioner/patients', { replace: true });
      }
    }
  }, [navigate]);

  return (
    <>
      <style>{`
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top    { padding-top: env(safe-area-inset-top); }
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>

      {/*
        h-[100dvh] + overflow-hidden on all sizes ensures the layout always fits
        the viewport and the footer is never pushed off-screen.
        flex flex-col with flex-1 main + overflow-y-auto on main handles
        cases where content is taller than the viewport (unlikely here, but safe).
      */}
      <div
        className="
          h-[100dvh] flex flex-col overflow-hidden
          bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]
        "
      >
        {/* HEADER */}
        <header className="
          border-b border-gray-200/50 bg-white/30 backdrop-blur-md z-30 flex-none
          safe-top
        ">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 md:py-5 lg:py-6">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity"
            >
              <img
                src="/images/logo-new.png"
                alt="LungSense Logo"
                className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto"
              />
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 font-display tracking-tight">
                LungSense
              </h3>
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT — scrollable so nothing clips on short viewports */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 lg:py-20 h-full">
            <div className="max-w-4xl mx-auto flex flex-col h-full">

              {/* Title */}
              <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4 font-display">
                  Choose your Role
                </h2>
                <p className="text-gray-600 text-sm md:text-base font-display">
                  Select how you'd like to use LungSense
                </p>
              </div>

              {/*
                Role cards — single-column stacked list on small screens,
                side-by-side cards from md upward.
                The transition between these layouts is smooth because both
                use the same visual language (icon + label + description).
              */}

              {/* SMALL SCREENS (< md): native-style list rows */}
              <div className="flex flex-col gap-3 sm:gap-4 md:hidden">
                <Link
                  to="/auth/login?role=patient"
                  className="active:scale-[0.98] transition-transform"
                >
                  <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-white">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-lungsense-blue-light rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Patient</p>
                        <p className="text-xs text-gray-500">Upload data &amp; track health</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>

                <Link
                  to="/auth/login?role=practitioner"
                  className="active:scale-[0.98] transition-transform"
                >
                  <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-white">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-lungsense-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-lungsense-green" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Practitioner</p>
                        <p className="text-xs text-gray-500">Manage patient records</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              </div>

              {/* MEDIUM + LARGE SCREENS (≥ md): side-by-side cards */}
              <div className="hidden md:grid grid-cols-2 gap-5 lg:gap-8 max-w-3xl mx-auto w-full items-stretch">

                {/* Patient Card */}
                <Link to="/auth/login?role=patient">
                  <Card className="p-6 lg:p-8 h-full flex flex-col hover:shadow-xl transition-all cursor-pointer border-2 hover:border-lungsense-blue group">
                    <div className="text-center space-y-4 lg:space-y-6 flex flex-col flex-1">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-lungsense-blue-light rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-all">
                        <User className="w-8 h-8 lg:w-10 lg:h-10 text-lungsense-blue group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1 lg:mb-2 font-display">
                          Patient
                        </h3>
                        <p className="text-gray-600 text-xs lg:text-sm">
                          Get AI-powered analysis of your lung health with easy data
                          upload and results tracking
                        </p>
                      </div>
                      <Button
                        className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity font-display text-sm lg:text-base"
                        size="lg"
                      >
                        Continue as Patient
                      </Button>
                    </div>
                  </Card>
                </Link>

                {/* Practitioner Card */}
                <Link to="/auth/login?role=practitioner">
                  <Card className="p-6 lg:p-8 h-full flex flex-col hover:shadow-xl transition-all cursor-pointer border-2 hover:border-lungsense-green group">
                    <div className="text-center space-y-4 lg:space-y-6 flex flex-col flex-1">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-lungsense-green/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-lungsense-green group-hover:scale-110 transition-all">
                        <Stethoscope className="w-8 h-8 lg:w-10 lg:h-10 text-lungsense-green group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1 lg:mb-2 font-display">
                          Healthcare Practitioner
                        </h3>
                        <p className="text-gray-600 text-xs lg:text-sm">
                          Access advanced diagnostic tools and manage patient
                          records.
                        </p>
                      </div>
                      <Button
                        className="w-full bg-lungsense-green hover:bg-lungsense-green/90 font-display text-sm lg:text-base"
                        size="lg"
                      >
                        Continue as Practitioner
                      </Button>
                    </div>
                  </Card>
                </Link>
              </div>

              {/* Back link — pushed to bottom */}
              <div className="text-center mt-auto pt-6 sm:pt-8 pb-2">
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-lungsense-blue active:opacity-50 transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>

            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="
          w-full flex-none text-center py-3 sm:py-4
          border-t border-white/20 bg-white/10 backdrop-blur-sm z-20
          safe-bottom
        ">
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide">
            © 2025 LUNGSENSE &amp; DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </p>
        </footer>
      </div>
    </>
  );
}