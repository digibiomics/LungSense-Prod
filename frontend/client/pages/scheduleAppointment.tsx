import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, User, Hospital } from "lucide-react";

export default function ScheduleAppointment() {
  const [location, setLocation] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Example dummy clinic data (frontend only)
  const clinics = [
    { name: "Downtown Respiratory Clinic", distance: "1.2 km" },
    { name: "City Pulmonary Center", distance: "2.8 km" },
    { name: "Northside Urgent Care", distance: "4.1 km" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
        Schedule Appointment
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Appointment Form */}
        <Card className="p-6 shadow-sm border border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-lungsense-blue" />
            Book an Appointment
          </h2>

          <div className="space-y-5">
            {/* Practitioner Select */}
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Select Practitioner
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg"
              >
                <option value="">Choose a specialist</option>
                <option value="Dr. Adeel Malik">Dr. Adeel Malik – Pulmonologist</option>
                <option value="Dr. Sara Iqbal">Dr. Sara Iqbal – Respiratory Specialist</option>
                <option value="Dr. Omar Rahman">Dr. Omar Rahman – Internal Medicine</option>
              </select>
            </div>

            {/* Date Select */}
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg"
              />
            </div>

            {/* Time Select */}
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Select Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <Button className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-medium py-3 mt-4">
              Confirm Appointment
            </Button>
          </div>
        </Card>

        {/* Nearby Clinics */}
        <Card className="p-6 shadow-sm border border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-lungsense-blue" />
            Nearby Clinics
          </h2>

          {/* Location Input */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Enter Your Location
            </label>
            <input
              type="text"
              placeholder="Enter your city or postal code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
            />
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-56 bg-gray-200 rounded-lg mb-6 flex items-center justify-center text-gray-600">
            Map Placeholder
          </div>

          {/* Clinics List */}
          <div className="space-y-4">
            {clinics.map((clinic, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Hospital className="w-5 h-5 text-lungsense-blue" />
                    {clinic.name}
                  </h3>
                  <p className="text-sm text-gray-500">{clinic.distance} away</p>
                </div>
                <Button
                  variant="outline"
                  className="border-lungsense-blue text-lungsense-blue hover:bg-lungsense-blue/10"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

