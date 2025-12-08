import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import AIProcessingModal from "@/components/AIProcessingModal";
import { Upload, Play, Pause, X, AlertCircle, FileText, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SYMPTOMS_LIST = [
  "Cough",
  "Shortness of Breath",
  "Flu Symptoms",
  "Chest Pain/ tightness/ Congestion",
  "Fever",
  "Chills or rigors",
  "Fatigue/Weakness",
  "Sputum Change",
  "Wheezing",
  "Night Sweats",
  "Abnormal/Unexpected Weight Loss",
  "Difficulty sleeping due to breathing",
  "Activity Limitation (stairs, walking etc)",
  "Recent Infection or cold before onset",
  "Known Exposure (TB/COVID/flu)",
  "Smoking habits",
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioType, setAudioType] = useState<"chest" | "cough">("chest");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Processing Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processFile = (file: File) => {
    setUploadedFile(file);
    // Generate a temporary URL for the file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

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

  const handleClear = () => {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAudioType("chest");
    setSelectedSymptoms([]);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
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
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
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
          handleClear();
          setUploadedFile(null);
          setAudioType("chest");
        }}
        onViewResults={handleViewResults}
      />

      {/* File Preview Modal */}
      {isPreviewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-display font-semibold text-lg">File Preview: {uploadedFile?.name}</h3>
                    <button
                        onClick={() => setIsPreviewOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
                    {uploadedFile?.type.startsWith('image/') ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded shadow-sm"
                        />
                    ) : (
                        /* For PDFs */
                        <iframe
                            src={previewUrl}
                            className="w-full h-full rounded border border-gray-200 bg-white"
                            title="File Preview"
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
      )}

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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* LEFT COLUMN (Upload & Record) */}
            <div className="lg:col-span-2 space-y-6">

              {/* UPLOAD DATA SECTION */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                <img src="/images/Screenshot 2025-12-02 094841.png" alt="feature 1" className="h-12 w-auto" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">
                       UPLOAD X-RAY DATA
                    </h2>
                </div>

                <div
                    className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-6"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDragDrop}
                >
                    {/* Visual File Placeholder */}
                    <div className="w-full h-48 bg-lungsense-blue-light/20 rounded-lg flex items-center justify-center relative border-2 border-dashed border-lungsense-blue overflow-hidden group">
                        {uploadedFile ? (
                           <>
                             {/* Preview Thumbnail in box */}
                             {uploadedFile.type.startsWith('image/') && previewUrl && (
                                <img src={previewUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                             )}

                             <div className="text-center p-2 flex flex-col items-center z-10">
                                 <FileText className="w-12 h-12 text-lungsense-blue mb-2" />
                                 <div className="absolute bottom-0 left-0 right-0 bg-lungsense-blue/80 backdrop-blur-sm p-2 text-center">
                                   <p className="text-xs text-white truncate font-medium px-2">{uploadedFile.name}</p>
                                 </div>
                             </div>
                             <button
                               onClick={(e) => { e.stopPropagation(); handleClear(); }}
                               className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600 transition-colors z-20"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </>
                        ) : (
                           <div className="flex flex-col items-center justify-center text-lungsense-blue/50 group-hover:text-lungsense-blue/70 transition-colors">
                               {/* Placeholder Image */}
                               <img
                                 src="/images/Screenshot 2025-12-02 095357.png"
                                 alt="Upload Placeholder"
                                 className="w-25 h-25 mb-3 opacity-40 mix-blend-multiply"
                               />
                               <p className="text-sm font-display font-medium">Drag & Drop X-ray file here</p>
                           </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 w-full">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue/90 font-display font-medium text-white py-6 rounded-xl shadow-sm"
                        >
                            Upload X-ray file
                        </Button>
                        <Button
                            disabled={!uploadedFile}
                            onClick={() => setIsPreviewOpen(true)} // Added onClick here
                            className={`w-full font-display font-medium py-6 rounded-xl shadow-sm ${
                                uploadedFile
                                ? "bg-lungsense-blue text-white hover:bg-lungsense-blue/90"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            View File
                        </Button>
                    </div>
                </div>
              </div>

              {/* RECORD SOUNDS SECTION */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                    <img src="/images/Screenshot 2025-12-02 094744.png" alt="feature 1" className="h-12 w-auto" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">
                       RECORD SOUNDS
                    </h2>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center gap-6">

                    {/* Visualizer */}
                    <div className="flex items-center justify-center gap-1 h-12 w-full max-w-md">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-black transition-all duration-100"
                          style={{
                            height: isRecording
                              ? `${Math.random() * 40 + 8}px`
                              : `${[10, 15, 25, 15, 10, 20, 15, 10, 10, 20, 30, 20, 10, 10, 15, 25, 15, 10, 25, 15, 10, 10, 20, 15, 10][i]}px`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Play className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={toggleRecording}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                            isRecording
                              ? "bg-red-500 hover:bg-red-600 scale-105"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {isRecording ? (
                            <div className="w-5 h-5 bg-white rounded-sm" />
                          ) : (
                            <div className="w-5 h-5 bg-white rounded-full" />
                          )}
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Pause className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    {/* Audio Type Toggles */}
                    <div className="w-full">
                        <p className="text-sm font-semibold text-gray-700 font-display mb-2 ml-1">Choose Audio Type</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAudioType("chest")}
                                className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all shadow-sm ${
                                audioType === "chest"
                                    ? "bg-gradient-to-r from-lungsense-blue-light to-lungsense-blue text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Chest Sounds
                            </button>
                            <button
                                onClick={() => setAudioType("cough")}
                                className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all shadow-sm ${
                                audioType === "cough"
                                    ? "bg-gradient-to-r from-lungsense-blue-light to-lungsense-blue text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Cough Sounds
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Demographics & Symptoms) */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
               <div className="flex items-center gap-2 mb-6">
                    <img src="/images/demographics-symptoms.png" alt="feature 3" className="h-12 w-auto" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">
                       DEMOGRAPHICS & SYMPTOMS
                    </h2>
               </div>

              <div className="space-y-6">

                {/* Demographics */}
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="space-y-1.5">
                        <Label htmlFor="age" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">
                            Age
                        </Label>
                        <Input id="Age" className="bg-white" placeholder="ex: 34" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="ethnicity" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">
                            Ethnicity
                        </Label>
                        <select className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md font-display text-sm focus:ring-2 focus:ring-lungsense-blue">
                            <option>Select Ethnicity</option>
                            <option>Asian</option>
                            <option>African</option>
                            <option>Caucasian</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="sex" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">
                            Sex
                        </Label>
                        <select className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md font-display text-sm focus:ring-2 focus:ring-lungsense-blue">
                            <option>Select Sex</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <div className="h-px bg-gray-200" />

                {/* Symptoms */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 font-display">Symptoms</Label>
                    <div className="flex flex-wrap gap-2">
                        {SYMPTOMS_LIST.map((symptom) => {
                            const isSelected = selectedSymptoms.includes(symptom);
                            return (
                                <button
                                    key={symptom}
                                    onClick={() => toggleSymptom(symptom)}
                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm border
                                        ${isSelected
                                            ? "bg-lungsense-blue-light text-white text-bold border-lungsense-blue-light hover:bg-lungsense-blue-light"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {symptom}
                                </button>
                            );
                        })}
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* Privacy Notice  */}
          <div className="bg-lungsense-yellow rounded-lg p-4 border lungsense-green">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-lungsense-blue flex-shrink-0 mt-0.5" />
              <div className="text-sm text-black font-dm">
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

          {/* Submit/Clear Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleClear} // Updated to use handleClear
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-display font-semibold px-8"
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!uploadedFile && !isRecording && selectedSymptoms.length === 0}
              className="flex-1 bg-lungsense-blue-medium hover:bg-lungsense-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-display font-semibold py-6 rounded-lg"
            >
              Submit for AI Generated Diagnosis
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
