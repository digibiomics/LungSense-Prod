import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SelectRole from "./pages/SelectRole";
import PatientLogin from "./pages/PatientLogin";
import PatientSignup from "./pages/PatientSignup";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRecords from "./pages/PatientRecords";
import DiagnosticResults from "./pages/DiagnosticResults";
import Recommendations from "./pages/Recommendations";
import PractitionerLogin from "./pages/PractitionerLogin";
import PractitionerSignup from "./pages/PractitionerSignup";
import PractitionerPatients from "./pages/PractitionerPatients";
import PractitionerPatientDetail from "./pages/PractitionerPatientDetail";
import NotFound from "./pages/NotFound";
import ScheduleAppointment from "./pages/scheduleAppointment";
import SelectProfile from "./pages/SelectProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/patient/upload" element={<PatientDashboard />} />
          <Route path="/patient/records" element={<PatientRecords />} />
          <Route path="/patient/results" element={<DiagnosticResults />} />
          <Route
            path="/patient/recommendations"
            element={<Recommendations />}
          />
          <Route path="/patient/scheduleAppointment" element={<ScheduleAppointment />} />
          <Route path="/practitioner/login" element={<PractitionerLogin />} />
          <Route path="/practitioner/signup" element={<PractitionerSignup />} />
          <Route
            path="/practitioner/patients"
            element={<PractitionerPatients />}
          />
          <Route
            path="/practitioner/patient/:id"
            element={<PractitionerPatientDetail />}
          />
          <Route path="/patient/select-profile" element={<SelectProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
