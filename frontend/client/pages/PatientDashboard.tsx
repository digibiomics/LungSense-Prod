import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import AIProcessingModal from "@/components/AIProcessingModal";
import { Upload, Play, Pause, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioType, setAudioType] = useState<"chest" | "cough">("chest");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Processing Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSubmit = async () => {
    // Open modal and start processing
    setIsModalOpen(true);
    setIsProcessing(true);

    // Simulate AI processing - replace with actual API call
    setTimeout(() => {
      setAiResults({
        diagnostics: [
          {
            name: "Chronic Obstructive Pulmonary Disease (COPD)",
            description:
              "AI detected significant airflow limitation and inflammation.",
            confidence: 85,
            severity: "high",
          },
          {
            name: "Bacterial Pneumonia",
            description:
              "Indications of localized lung infection with fluid accumulation.",
            confidence: 65,
            severity: "medium",
          },
          {
            name: "Early Stage Lung Nodules",
            description:
              "Small, round nodules identified; further investigation recommended.",
            confidence: 60,
            severity: "medium",
          },
        ],
        probabilities: [
          { name: "COPD", value: 85 },
          { name: "Asthma", value: 78 },
          { name: "Nodules", value: 60 },
        ],
      });
      setIsProcessing(false);
    }, 4000);
  };

  const handleViewResults = () => {
    setIsModalOpen(false);
    navigate("/patient/results");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* AI Processing Modal */}
      <AIProcessingModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        results={aiResults}
        onClose={() => {
          setIsModalOpen(false);
          // Reset states
          setUploadedFile(null);
          setAudioType("chest");
        }}
        onViewResults={handleViewResults}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Welcome Back
            </h1>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  alt="User"
                  className="w-full h-full rounded-full"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Data Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 font-display">
                  UPLOAD DATA
                </h2>

                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDragDrop}
                    className="border-2 border-dashed border-lungsense-blue-light rounded-lg p-12 text-center hover:bg-lungsense-blue-light/30 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-lungsense-blue mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2 font-display">
                      Drag files to upload
                    </h3>
                    <p className="text-gray-600 text-sm font-dm mb-4">Or</p>
                    <Button className="bg-lungsense-blue hover:bg-lungsense-blue/90 font-display font-medium">
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-4 font-dm">
                      Max File Size Supported:{" "}
                      <span className="font-bold">50 MB</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-dm">
                      .pdf, .jpg formats accepted
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-lungsense-green rounded-lg p-8 bg-lungsense-green/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-lungsense-green rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 font-display">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-lungsense-green font-dm">
                          Successfully Uploaded
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Record Sounds Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 font-display">
                  Record Sounds
                </h2>

                <div className="space-y-6">
                  {/* Audio Visualization */}
                  <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-1 items-center">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-lungsense-blue transition-all"
                          style={{
                            height: isRecording
                              ? `${Math.sin(i) * 20 + 20}px`
                              : "10px",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={toggleRecording}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-lungsense-blue text-white hover:bg-lungsense-blue/90"
                      }`}
                    >
                      {isRecording ? (
                        <div className="w-4 h-4 bg-white rounded-sm" />
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Play className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Pause className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Audio Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 font-display">
                      Choose Audio Type
                    </Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setAudioType("chest")}
                        className={`px-4 py-2 rounded-lg font-display text-sm font-medium transition-all ${
                          audioType === "chest"
                            ? "bg-lungsense-blue text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Chest Sounds
                      </button>
                      <button
                        onClick={() => setAudioType("cough")}
                        className={`px-4 py-2 rounded-lg font-display text-sm font-medium transition-all ${
                          audioType === "cough"
                            ? "bg-lungsense-blue text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Cough Sounds
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics & Symptoms Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-fit">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 font-display">
                Symptoms
              </h2>

              <form className="space-y-4">

                <div className="space-y-2">

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Cough</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Shortness of Breath</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Weight Loss</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Night Sweats</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Hemoptysis</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Fever</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Chills</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Sputum Change</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Confusion</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Headache</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Wheezing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Anxiety</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Sleep Disturbance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Duration Tracking</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Cyanosis</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Duration/Activity Limitation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-display">Fatigue</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-lungsense-blue-light rounded-lg p-4 border border-lungsense-blue">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-lungsense-blue flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 font-dm">
                <span className="font-semibold">Privacy Notice:</span> We handle
                your data securely and use it only for medical analysis. Read
                our{" "}
                <a
                  href="#"
                  className="text-lungsense-blue hover:underline font-medium"
                >
                  full privacy policy here
                </a>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setUploadedFile(null);
                setAudioType("chest");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-display font-semibold px-8"
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!uploadedFile && !isRecording}
              className="flex-1 bg-lungsense-blue hover:bg-lungsense-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-display font-semibold py-6 rounded-lg"
            >
              Submit for AI Generated Diagnosis
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
