import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Send } from "lucide-react";
import { getCaseDetails } from "../../src/api";
import { useToast } from "@/hooks/use-toast";

// mock data

export default function PractitionerPatientDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
  const patient = location.state?.patient;

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [savedFeedback, setSavedFeedback] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!caseId) return;
      
      try {
        setLoading(true);
        const response = await getCaseDetails(caseId);
        setCaseData(response.data || response);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch case details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lungsense-blue mx-auto mb-4"></div>
            <p className="text-gray-600 font-dm">Loading case details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!caseData && !patient) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 font-dm mb-4">No case data found</p>
            <Button onClick={() => navigate("/practitioner/patients")}>
              Back to Cases
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const displayData = caseData || patient;

  const handleSaveFeedback = async () => {
    if (!feedback.trim()) return;

    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSavedFeedback([...savedFeedback, feedback]);
    setFeedback("");
    setIsSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
            <button
              onClick={() => navigate("/practitioner/patients")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display truncate">
                {displayData.patient_name || displayData.name || "Patient"}
              </h1>
              <p className="text-sm text-gray-600 font-dm">{displayData.catalog_number ? `Case #${displayData.catalog_number}` : displayData.email}</p>
            </div>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {(displayData.patient_name || displayData.name || "P")[0]}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Patient Analysis Results */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Diagnostic Summary */}
              <Card className="p-4 sm:p-6 bg-white border-gray-200 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 font-display">
                  Latest AI Analysis Results
                </h2>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 font-display">
                        Chronic Obstructive Pulmonary Disease (COPD)
                      </h3>
                      <span className="text-sm font-bold text-red-600">
                        85%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-dm">
                      AI detected significant airflow limitation and
                      inflammation.
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 font-display">
                        Bacterial Pneumonia
                      </h3>
                      <span className="text-sm font-bold text-yellow-600">
                        65%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-dm">
                      Indications of localized lung infection with fluid
                      accumulation.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 font-display">
                        Early Stage Lung Nodules
                      </h3>
                      <span className="text-sm font-bold text-orange-600">
                        60%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-dm">
                      Small, round nodules identified; further investigation
                      recommended.
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display">
                  View Full AI Analysis Report
                </Button>
              </Card>

              {/* Disease Probability Distribution */}
              <Card className="p-4 sm:p-6 bg-white border-gray-200 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 font-display">
                  Disease Probability Distribution
                </h2>

                <div className="space-y-4">
                  {[
                    { name: "COPD", value: 85 },
                    { name: "Asthma", value: 78 },
                    { name: "Nodules", value: 60 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-700 font-dm">
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-lungsense-blue">
                          {item.value}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-lungsense-blue h-3 rounded-full"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Feedback Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Add Feedback */}
              <Card className="p-4 sm:p-6 bg-white border-gray-200 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 font-display">
                  Add Feedback
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 font-display mb-2 block">
                      Your Professional Assessment
                    </Label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add your clinical notes and recommendations..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-dm text-sm focus:ring-2 focus:ring-lungsense-blue focus:border-transparent resize-none h-32"
                    />
                  </div>

                  <Button
                    onClick={handleSaveFeedback}
                    disabled={!feedback.trim() || isSaving}
                    className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-display font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Submit Feedback"}
                  </Button>
                </div>
              </Card>

              {/* Previous Feedback */}
              {savedFeedback.length > 0 && (
                <Card className="p-4 sm:p-6 bg-white border-gray-200 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 font-display">
                    Feedback History
                  </h3>

                  <div className="space-y-4">
                    {savedFeedback.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-lungsense-blue-light rounded-lg"
                      >
                        <p className="text-sm text-gray-700 font-dm">{note}</p>
                        <p className="text-xs text-gray-500 mt-2 font-dm">
                          Just now
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Patient Information */}
              <Card className="p-4 sm:p-6 bg-white border-gray-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 font-display">
                  Patient Information
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-dm mb-1">Submitted</p>
                    <p className="text-gray-900 font-display font-semibold">
                      {new Date(displayData.created_at || displayData.lastAnalysis).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-dm mb-1">Diagnosis</p>
                    <p className="text-gray-900 font-display font-semibold">
                      {displayData.primary_diagnosis || displayData.topDiagnosis || "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-dm mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        displayData.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : displayData.status === "submitted"
                            ? "bg-yellow-100 text-yellow-800"
                            : displayData.status === "critical"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {displayData.status}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
