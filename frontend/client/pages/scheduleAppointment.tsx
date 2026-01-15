import { useState } from "react";
import Sidebar from "@/components/Sidebar"; // Assuming you have this component
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Hospital,
  Search,
  Star,
  CheckCircle,
  Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScheduleAppointment() {
  const navigate = useNavigate();

  // Form State
  const [location, setLocation] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  // Mock Data: Clinics
  const clinics = [
    {
      id: 1,
      name: "Downtown Respiratory Clinic",
      address: "123 Main St, Toronto",
      distance: "1.2 km",
      rating: 4.8,
      phone: "+1 (416) 555-0199"
    },
    {
      id: 2,
      name: "City Pulmonary Center",
      address: "45 Queen St W, Toronto",
      distance: "2.8 km",
      rating: 4.5,
      phone: "+1 (416) 555-0255"
    },
    {
      id: 3,
      name: "Northside Urgent Care",
      address: "880 Bay St, Toronto",
      distance: "4.1 km",
      rating: 4.9,
      phone: "+1 (416) 555-0881"
    },
  ];

  const handleBook = () => {
    // Simulate booking API call
    setIsBooked(true);
    setTimeout(() => {
        setIsBooked(false);
        navigate("/patient/dashboard");
    }, 3000);
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 font-display">
                Schedule Your Appointment
                </h1>
                <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center">
                    <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                    alt="User"
                    className="w-full h-full rounded-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- LEFT COLUMN: NEARBY CLINICS --- */}
                <Card className="p-0 shadow-lg border border-gray-200 bg-white overflow-hidden flex flex-col h-full">

                    {/* Map Header / Search */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2 font-display">
                            <MapPin className="w-5 h-5 text-lungsense-blue" />
                            Nearby Clinics
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search city, zip, or clinic name..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="pl-10 bg-white border-gray-200"
                            />
                        </div>
                    </div>

                    {/* MOCK MAP VISUALIZATION */}
                    <div className="relative w-full h-64 bg-gray-100 overflow-hidden group">
                         {/* Static Map Background Image (Placeholder) */}
                         <div
                            className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Toronto_neighbourhoods.svg')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500"
                         />

                         {/* Mock Map Pins */}
                         <div className="absolute top-1/4 left-1/3 animate-bounce">
                             <MapPin className="w-8 h-8 text-red-500 drop-shadow-md fill-current" />
                         </div>
                         <div className="absolute top-1/2 left-2/3 animate-bounce delay-100">
                             <MapPin className="w-8 h-8 text-lungsense-blue drop-shadow-md fill-current" />
                         </div>
                         <div className="absolute bottom-1/3 left-1/4 animate-bounce delay-200">
                             <MapPin className="w-8 h-8 text-lungsense-blue drop-shadow-md fill-current" />
                         </div>

                         <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs text-gray-500 font-mono">
                             Map View
                         </div>
                    </div>

                    {/* Clinics List */}
                    <div className="p-4 space-y-3 bg-gray-50/30 flex-1 overflow-y-auto max-h-[400px]">
                        {clinics.map((clinic) => (
                            <div
                                key={clinic.id}
                                onClick={() => setSelectedClinic(clinic.name)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                    selectedClinic === clinic.name
                                    ? "bg-lungsense-blue/5 border-lungsense-blue ring-1 ring-lungsense-blue"
                                    : "bg-white border-gray-200 hover:border-lungsense-blue/50"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            {clinic.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {clinic.address}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-xs font-medium text-lungsense-blue bg-lungsense-blue-light/10 px-2 py-1 rounded-md">
                                                {clinic.distance}
                                            </span>
                                            <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" /> {clinic.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={selectedClinic === clinic.name ? "default" : "outline"}
                                        className={selectedClinic === clinic.name ? "bg-lungsense-blue" : ""}
                                    >
                                        {selectedClinic === clinic.name ? "Selected" : "Select"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* --- RIGHT COLUMN: BOOK APPOINTMENT --- */}
                <Card className="p-6 shadow-lg border border-gray-200 bg-white h-fit">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2 font-display">
                        <Calendar className="w-6 h-6 text-lungsense-blue" />
                        Book Appointment
                    </h2>

                    <div className="space-y-6">

                        {/* Selected Clinic Display */}
                        <div className="p-4 bg-lungsense-blue-light/10 rounded-lg border border-lungsense-blue/20">
                             <Label className="text-xs font-bold text-lungsense-blue uppercase tracking-wider mb-2 block">
                                 Selected Clinic
                             </Label>
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-lungsense-blue/20">
                                     <Hospital className="w-5 h-5 text-lungsense-blue" />
                                 </div>
                                 <div>
                                     <p className="font-semibold text-gray-900">
                                        {selectedClinic || "Please select a clinic from the map"}
                                     </p>
                                     <p className="text-xs text-gray-500">
                                        {selectedClinic ? "Clinic confirmed" : "No location selected"}
                                     </p>
                                 </div>
                             </div>
                        </div>

                        {/* Practitioner Select */}
                        <div className="space-y-2">
                            <Label className="font-medium text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4" /> Specialist
                            </Label>
                            <div className="relative">
                                <select
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-lungsense-blue focus:border-transparent"
                                >
                                    <option value="">Choose a specialist</option>
                                    <option value="Dr. Adeel Malik">Dr. Adeel Malik – Pulmonologist</option>
                                    <option value="Dr. Sara Iqbal">Dr. Sara Iqbal – Respiratory Specialist</option>
                                    <option value="Dr. Omar Rahman">Dr. Omar Rahman – Internal Medicine</option>
                                </select>
                                <div className="absolute right-3 top-3.5 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Date Select */}
                            <div className="space-y-2">
                                <Label className="font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Date
                                </Label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-white"
                                />
                            </div>

                            {/* Time Select */}
                            <div className="space-y-2">
                                <Label className="font-medium text-gray-700 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Time
                                </Label>
                                <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full bg-white"
                                />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-2">
                             <Label className="font-medium text-gray-700">Reason for Visit (Optional)</Label>
                             <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-lungsense-blue focus:border-transparent"
                                placeholder="Briefly describe your symptoms..."
                             ></textarea>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleBook}
                            disabled={!selectedClinic || !selectedDoctor || !selectedDate || !selectedTime}
                            className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-bold py-6 text-lg shadow-md transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Appointment
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
      </main>

      {/* SUCCESS MODAL OVERLAY */}
      {isBooked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">Appointment Confirmed!</h2>
                  <p className="text-gray-600 mb-6 font-dm">
                      You are booked with <span className="font-semibold text-gray-900">{selectedDoctor}</span> at <br/>
                      <span className="font-semibold text-gray-900">{selectedClinic}</span>.
                  </p>
                  <p className="text-sm text-gray-400 mb-6">A confirmation email has been sent to you.</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                      Done
                  </Button>
              </div>
          </div>
      )}

    </div>
  );
}