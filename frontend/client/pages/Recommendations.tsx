import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Maximize2,
  HeartPulse,
  Phone,
  Dumbbell,
  Pill,
  Wind,
  Bell,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Recommendations() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
        <div className="p-4 md:p-8 space-y-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
              Personalized Recommendations
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  alt="User"
                  className="w-full h-full rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Introduction */}
          <p className="text-gray-600 font-dm mb-8">
            Based on the analyzed data, the following general suggestions may help guide your next actions. These are not medical instructions. Please seek clinical evaluation from a healthcare provider for personalized medical advice
          </p>

          {/* Next Steps */}
          <div>
            <h2 className="text-2xl font-bold mb-6 font-display text-gray-900">
              Next Steps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ---- SCHEDULE APPOINTMENT CARD ---- */}
              <Card className="p-6 bg-white border-gray-200 hover:border-lungsense-blue transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lungsense-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-lungsense-blue text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 font-display text-gray-900">
                      Schedule Follow-up Appointment
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 font-dm">
                      For further medical review, please schedule a follow-up with your
                      primary physician or a pulmonologist.
                    </p>

                     <Button className="bg-lungsense-blue-light text-white hover:bg-lungsense-blue font-display font-medium">
                       Schedule Now
                     </Button>
                  </div>
                </div>
              </Card>

              {/* Consider Additional Imaging*/}
              <Card className="p-6 bg-white border-gray-200 hover:border-lungsense-blue transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lungsense-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 font-display text-gray-900">
                      Consider Additional Imaging
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 font-dm">
                      Discuss this option with your doctor to determine
                      suitability.
                    </p>
                    <Button

                      className="bg-lungsense-blue-light text-white hover:bg-lungsense-blue font-display font-medium"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Triage Advice */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 font-display">
              Triage Advice
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-gray-200 hover:border-lungsense-blue transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lungsense-blue rounded-lg flex items-center justify-center flex-shrink-0">
                    <HeartPulse className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 font-display text-gray-900">
                      Monitor Symptoms Daily
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 font-dm">
                      Log changes in your breathing,
                      cough frequency, or chest discomfort for your doctor.
                    </p>
                    <Button
                      className="bg-lungsense-blue-light text-white hover:bg-lungsense-blue font-display font-medium"
                    >
                      Track Symptoms
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-gray-200 hover:border-red-900 transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-500">
                    <Phone className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 font-display">
                      Emergency Contact Information
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 font-dm">
                     Please call 911 in case of emergencies. Keep emergency contacts handy.
                    </p>
                    <Button
                      className="bg-red-200 border-red-500 text-red-400 hover:bg-red-900/20 font-display font-medium"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Follow-Up Actions */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 font-display">
              Follow-Up Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-lungsense-blue-light/20 to-transparent border-lungsense-blue">
                <div className="w-12 h-12 bg-lungsense-blue/30 rounded-lg flex items-center justify-center mb-4">
                  <Dumbbell className="w-6 h-6 text-lungsense-blue" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-display">
                  Lifestyle Adjustments
                </h3>
                <p className="text-black text-sm mb-4 font-dm">
                  Adopt a healthier diet, engage in
                  moderate physical activity, and prioritize rest to
                  support your healing.
                </p>
                <Button className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue/90 font-display font-medium">
                  Explore Wellness
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-lungsense-blue-light/20 to-transparent border-lungsense-blue">
                <div className="w-12 h-12 bg-lungsense-blue/30 rounded-lg flex items-center justify-center mb-4">
                  <Pill className="w-6 h-6 text-lungsense-blue" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-display">
                  Medication Adherence
                </h3>
                <p className="text-black text-sm mb-4 font-dm">
                  Ensure consistent and correct intake of all
                  medications.
                </p>
                <Button
                  className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue text-white font-display font-medium"
                >
                  Set Reminders
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-lungsense-blue-light/20 to-transparent border-lungsense-blue">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-display">
                  Breathing Exercises
                </h3>
                <p className="text-black text-sm mb-4 font-dm">
                  Incorporate targeted breathing exercises to improve lung
                  capacity and efficiency. Consult with a respiratory therapist.

                </p>
                <Button
                  className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue text-white font-display font-medium"
                >
                  Start Exercises
                </Button>
              </Card>
            </div>
          </div>

          {/* Regular Check-ups */}
          <div className="mt-12">
            <Card className="p-6 bg-white/90 backdrop-blur-xl
                      rounded-xl shadow-lg
                      border border-white/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 font-display">
                    Regular Check-ups
                  </h3>
                  <p className="text-gray-900 text-sm mb-4 font-dm">
                    Maintain a schedule of regular medical check-ups to monitor
                    your lung health and detect any changes early.
                  </p>
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-display font-medium">
                    Plan Check-ups
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Book Tele-Consultation feature */}
          <div className="mt-12">
            <Card className="p-8 bg-lungsense-blue-light text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl text-white font-bold mb-3 font-display">
                Connect with a Specialist
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto font-dm">
                Get in touch with our network of pulmonologists and respiratory
                specialists who can provide expert guidance tailored to your
                condition.
              </p>
              <Button className="bg-black text-white hover:bg-gray-900 font-display font-semibold px-8 py-6">
                Book a Tele-Consultation Now
              </Button>
            </Card>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© 2025 Lung Sense. All rights reserved. DigiRomics.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

