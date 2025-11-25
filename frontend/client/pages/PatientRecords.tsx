import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, TrendingUp, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalysisRecord {
  id: number;
  date: string;
  type: string;
  topDiagnosis: string;
  diagnostics: Array<{
    name: string;
    confidence: number;
  }>;
}

export default function PatientRecords() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(
    null,
  );

  // Mock data - replace with API call
  const records: AnalysisRecord[] = [
    {
      id: 1,
      date: "2024-01-15",
      type: "X-ray Analysis",
      topDiagnosis: "COPD",
      diagnostics: [
        { name: "COPD", confidence: 85 },
        { name: "Asthma", confidence: 78 },
        { name: "Nodules", confidence: 60 },
      ],
    },
    {
      id: 2,
      date: "2024-01-10",
      type: "Lung Sound Recording",
      topDiagnosis: "Mild Congestion",
      diagnostics: [
        { name: "Bronchitis", confidence: 72 },
        { name: "Asthma", confidence: 65 },
        { name: "Normal", confidence: 55 },
      ],
    },
    {
      id: 3,
      date: "2024-01-05",
      type: "Combined Analysis",
      topDiagnosis: "Healthy",
      diagnostics: [
        { name: "Normal", confidence: 92 },
        { name: "Minor Inflammation", confidence: 35 },
        { name: "Allergies", confidence: 28 },
      ],
    },
  ];

  const handleViewResults = (record: AnalysisRecord) => {
    navigate("/patient/results", { state: { record } });
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Past Records
            </h1>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  alt="User"
                  className="w-full h-full rounded-full"
                />
            </div>
          </div>

          {/* Records List */}
          <div className="grid gap-6">
            {records.map((record) => (
              <Card
                key={record.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-lungsense-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-lungsense-blue" />
                  </div>

                  {/* Record Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 font-display">
                      {record.type}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Disease Probabilities Summary */}
                    <div className="bg-lungsense-blue-light rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 font-display">
                        Disease Probability Distribution:
                      </h4>
                      <div className="space-y-3">
                        {record.diagnostics.map((diagnostic, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700 font-dm">
                                {diagnostic.name}
                              </span>
                              <span className="text-sm font-bold text-lungsense-blue">
                                {diagnostic.confidence}%
                              </span>
                            </div>
                            <div className="w-full bg-white rounded-full h-2">
                              <div
                                className="bg-lungsense-blue h-2 rounded-full"
                                style={{ width: `${diagnostic.confidence}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="flex flex-col items-end justify-between h-full">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 mb-1 font-display">
                        {record.topDiagnosis}
                      </div>
                      <div className="flex items-center gap-1 text-lungsense-green text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        Top Diagnosis
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewResults(record)}
                      className="bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display font-medium mt-4"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Analysis
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {records.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2 font-display">
                No Records Yet
              </h3>
              <p className="text-gray-500 font-dm">
                Your AI analysis results will appear here once you submit data
                for analysis.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

