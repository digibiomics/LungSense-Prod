import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientRecord {
  id: number;
  name: string;
  email: string;
  lastAnalysis: string;
  topDiagnosis: string;
  status: "normal" | "warning" | "critical";
}

export default function PractitionerPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock patient data - replace with API call
  const patients: PatientRecord[] = [
    {
      id: 1,
      name: "Jiara Martins",
      email: "jiara@example.com",
      lastAnalysis: "2024-01-15",
      topDiagnosis: "COPD",
      status: "warning",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      lastAnalysis: "2024-01-14",
      topDiagnosis: "Normal",
      status: "normal",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael@example.com",
      lastAnalysis: "2024-01-12",
      topDiagnosis: "Pneumonia",
      status: "critical",
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleViewRecords = (patient: PatientRecord) => {
    navigate(`/practitioner/patient/${patient.id}`, { state: { patient } });
  };

  const getStatusColor = (status: PatientRecord["status"]) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Patient Records
            </h1>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center text-white font-bold">
              ©
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 px-4 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus:ring-0 font-dm"
              />
            </div>
          </div>

          {/* Patients List */}
          <div className="grid gap-4">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className="p-6 hover:shadow-lg transition-shadow border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-lungsense-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {patient.name[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 font-display">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-dm">
                            {patient.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-600 font-dm font-semibold mb-1">
                            Last Analysis
                          </p>
                          <p className="text-sm text-gray-900 font-display">
                            {new Date(
                              patient.lastAnalysis,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-600 font-dm font-semibold mb-1">
                            Top Diagnosis
                          </p>
                          <p className="text-sm text-gray-900 font-display">
                            {patient.topDiagnosis}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs uppercase tracking-wider text-gray-600 font-dm font-semibold mb-1">
                            Status
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(
                              patient.status,
                            )}`}
                          >
                            {patient.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewRecords(patient)}
                      className="bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display font-medium ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Records
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2 font-display">
                  No Patients Found
                </h3>
                <p className="text-gray-500 font-dm">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
