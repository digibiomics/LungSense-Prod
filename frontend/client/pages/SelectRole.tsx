import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, User, Stethoscope } from "lucide-react";

export default function SelectRole() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 md:py-6">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo-new.png" alt="LungSense Logo" className="h-10 w-auto" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h3>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
              Choose your Role
            </h2>
            <p className="text-gray-600 font-display">
              Select how you'd like to use LungSense
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
            {/* Patient Card */}
            <Link to="/patient/login">
              <Card className="p-8 h-full flex flex-col hover:shadow-xl transition-all cursor-pointer border-2 hover:border-lungsense-blue group">
                <div className="text-center space-y-6 flex flex-col flex-1">
                  <div className="w-20 h-20 bg-lungsense-blue-light rounded-full flex items-center justify-center mx-auto group-hover:bg-lungsense-blue group-hover:scale-110 transition-all">
                    <User className="w-10 h-10 text-lungsense-blue group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-display">
                      Patient
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Get AI-powered analysis of your lung health with easy data
                      upload and results tracking
                    </p>
                  </div>
                  <Button
                    className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue/90 font-display"
                    size="lg"
                  >
                    Continue as Patient
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Healthcare Practitioner Card */}
            <Link to="/practitioner/login">
              <Card className="p-8 h-full flex flex-col hover:shadow-xl transition-all cursor-pointer border-2 hover:border-lungsense-green group">
                <div className="text-center space-y-6 flex flex-col flex-1">
                  <div className="w-20 h-20 bg-lungsense-green/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-lungsense-green group-hover:scale-110 transition-all">
                    <Stethoscope className="w-10 h-10 text-lungsense-green group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-display">
                      Healthcare Practitioner
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Access advanced diagnostic tools and manage patient
                      records with professional-grade features
                    </p>
                  </div>
                  <Button
                    className="w-full bg-lungsense-green hover:bg-lungsense-green/90 font-display"
                    size="lg"
                  >
                    Continue as Practitioner
                  </Button>
                </div>
              </Card>
            </Link>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-lungsense-blue transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      {/* Footer */}
        <footer className="w-full text-center py-4 mt-auto border-t border-white/20 bg-white/10 backdrop-blur-sm z-20">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">
            © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </p>
        </footer>
    </div>
  );
}
