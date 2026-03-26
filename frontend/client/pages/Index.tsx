import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect if user is already logged in
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    const profileCompleted = localStorage.getItem('profile_completed');
    
    if (token && profileCompleted === 'true') {
      if (userRole === 'patient') {
        navigate('/patient/select-profile', { replace: true });
        return;
      } else if (userRole === 'practitioner') {
        navigate('/practitioner/patients', { replace: true });
        return;
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }

        /* Honour notch / home-bar on real mobile browsers */
        @supports (padding: env(safe-area-inset-top)) {
          .safe-top    { padding-top: env(safe-area-inset-top); }
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>

      {/* LOADING OVERLAY */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-lungsense-blue transition-opacity duration-1000 ease-in-out ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <img
          src="/images/logo-new.png"
          alt="Loading..."
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain animate-pulse"
        />
      </div>

      {/*
        MAIN APP CONTAINER
        - Uses h-[100dvh] on ALL sizes so the layout always fills exactly the viewport.
        - overflow-hidden prevents any content from escaping and hiding the footer.
        - flex flex-col means header + main(flex-1) + footer stack and footer is always visible.
      */}
      <div
        className="
          h-[100dvh] w-full flex flex-col
          bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]
          text-black relative overflow-hidden
        "
      >
        {/* HEADER */}
        <header className="w-full flex-none z-20 safe-top">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 md:py-5">
            <Link
              to="https://digibiomics.com/"
              className="inline-block hover:opacity-80 active:opacity-60 transition-opacity"
            >
              <img
                src="/images/digibiomics_logo.png"
                alt="Partner Logo"
                className="h-8 sm:h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </Link>
          </div>
        </header>

        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="
              bg-white rounded-full opacity-40
              w-[200px] h-[200px] blur-[50px]
              sm:w-[320px] sm:h-[320px] sm:blur-[80px]
              md:w-[420px] md:h-[420px] md:blur-[100px]
              lg:w-[500px] lg:h-[500px] lg:blur-[120px]
            "
          />
        </div>

        {/* MAIN CONTENT AREA
            overflow-y-auto here so if a tiny screen still can't fit, content scrolls
            rather than hiding the footer */}
        <main
          className="
            flex-1 min-h-0 overflow-y-auto
            flex flex-col items-center justify-center
            px-4 sm:px-6 relative z-10
          "
        >
          <div
            className={`
              flex flex-col items-center text-center max-w-2xl w-full
              space-y-6 sm:space-y-8 md:space-y-10
              py-4
              ${!isLoading ? "animate-fade-up delay-100" : "opacity-0"}
            `}
          >
            {/* Logo + Branding */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">

              {/* Logo Circle */}
              <div
                className="
                  rounded-full border-white flex items-center justify-center shadow-xl
                  bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]
                  w-20 h-20 border-[2px] p-4
                  sm:w-28 sm:h-28 sm:border-[3px] sm:p-5
                  md:w-36 md:h-36 md:border-[4px] md:p-6
                  lg:w-40 lg:h-40
                "
              >
                <img
                  src="/images/logo-new.png"
                  alt="LungSense Logo"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              {/* Text Branding */}
              <div className="space-y-1 sm:space-y-2 md:space-y-4">
                <h1
                  className="
                    font-bold tracking-tight text-lungsense-blue
                    text-3xl sm:text-4xl md:text-5xl lg:text-7xl
                  "
                >
                  LungSense
                </h1>
                <p
                  className="
                    text-black tracking-tight leading-tight
                    text-base sm:text-lg md:text-2xl lg:text-3xl
                  "
                >
                  Your First Line of{" "}
                  <br className="hidden md:block" />
                  Lung Health
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full flex justify-center pt-1 sm:pt-2 md:pt-4">
              <Link to="/select-role" className="w-full max-w-xs md:w-auto">
                <Button
                  className="
                    bg-lungsense-blue-light hover:bg-lungsense-blue-light
                    text-white font-bold
                    rounded-xl shadow-xl transition-all
                    hover:shadow-2xl hover:-translate-y-1 hover:opacity-90
                    active:scale-[0.98] active:opacity-80
                    w-full text-base py-5 px-6
                    sm:text-lg sm:py-6 sm:px-8
                    md:w-auto md:text-xl md:py-7 md:px-16 md:rounded-2xl
                    lg:py-8 lg:px-20
                  "
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* FOOTER — flex-none means it always stays at the bottom */}
        <footer
          className="
            w-full flex-none text-center py-3 sm:py-4
            border-t border-white/20 bg-white/10 backdrop-blur-sm z-20
            safe-bottom
          "
        >
          <p className="text-slate-500 font-medium tracking-wide px-4 text-[9px] sm:text-[10px]">
            <span className="sm:hidden">
              © 2025 LUNGSENSE & DIGIBIOMICS.<br />MEDICAL ADVICE DISCLAIMER APPLIES.
            </span>
            <span className="hidden sm:inline">
              © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
            </span>
          </p>
        </footer>
      </div>
    </>
  );
};

export default Index;