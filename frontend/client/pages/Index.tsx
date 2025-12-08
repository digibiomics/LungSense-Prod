import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>

      {/*
          LOADING OVERLAY
       */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-lungsense-blue transition-opacity duration-1000 ease-in-out ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <img
          src="/public/images/logo-new.png"
          alt="Loading..."
          className="w-24 h-24 object-contain animate-pulse"
        />
      </div>

      {/*
          MAIN APP CONTAINER
        */}
      <div className="min-h-screen w-full flex flex-col bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)] text-black relative overflow-hidden">

        {/* HEADER */}
        <header className="w-full flex-none z-20">
            <div className="container mx-auto px-4 py-4 md:py-6">
              <Link
                to="https://digibiomics.com/"
                className="inline-block hover:opacity-80 transition-opacity"
              >

                <img src="/public/images/digibiomics_logo.png" alt="Partner Logo" className="h-20 w-auto" />
              </Link>
            </div>
        </header>

        {/*  BACKGROUND GLOW */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[120px] opacity-40 pointer-events-none"></div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 pb-12">

            <div className={`flex flex-col items-center text-center max-w-2xl w-full space-y-10 ${!isLoading ? "animate-fade-up delay-100" : "opacity-0"}`}>

              {/* The Center Logo Area */}
              <div className="flex flex-col items-center gap-8">

                {/* Logo Circle */}
                <div className="w-40 h-40 rounded-full border-[4px] border-white flex items-center justify-center shadow-xl p-6 bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
                  <img
                      src="/public/images/logo-new.png"
                      alt="LungSense Logo"
                      className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>

                {/* Text Branding */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-SF Pro Display Semibold font-bold tracking-tight text-lungsense-blue">
                    LungSense
                  </h1>
                  <p className="text-xl md:text-3xl text-black font-SF Pro Text Regular leading-relaxed">
                    Your First Line of <br className="hidden md:block" />
                    Lung Health
                  </p>
                </div>
              </div>

              {/* B. The Button */}
              <div className="w-full flex justify-center pt-4">
                <Link to="/select-role">
                  <Button
                    className="
                      bg-lungsense-blue-light hover:bg-lungsense-blue-light
                      text-white text-xl font-bold
                      py-8 px-20
                      rounded-2xl
                      shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all
                    "
                  >
                    Get Started
                  </Button>
                </Link>
              </div>

            </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full flex-none text-center py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide px-4">
            © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </p>
        </footer>

      </div>
    </>
  );
};

export default Index;

