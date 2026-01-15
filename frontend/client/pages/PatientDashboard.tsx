import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import AIProcessingModal from "@/components/AIProcessingModal";
import { Upload, Play, Pause, X, AlertCircle, FileText, Mic, Users, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

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

const PROFILES = [
  { id: "1", name: "Myself", age: "34", ethnicity: "Caucasian", sex: "Male" },
  { id: "2", name: "Mom (Sarah)", age: "65", ethnicity: "Caucasian", sex: "Female" },
  { id: "3", name: "Dad (Robert)", age: "68", ethnicity: "Caucasian", sex: "Male" },
  { id: "4", name: "Child (Timmy)", age: "8", ethnicity: "Asian", sex: "Male" },
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
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [demographics, setDemographics] = useState({
    age: "",
    ethnicity: "",
    sex: ""
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    setSelectedProfileId(profileId);

    const profile = PROFILES.find((p) => p.id === profileId);
    if (profile) {
      setDemographics({
        age: profile.age,
        ethnicity: profile.ethnicity,
        sex: profile.sex
      });
    } else {
      setDemographics({ age: "", ethnicity: "", sex: "" });
    }
  };

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
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
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
    setIsModalOpen(true);
    setIsProcessing(true);

    setTimeout(() => {
      setAiResults({
        diagnostics: [
          {
            name: "Chronic Obstructive Pulmonary Disease (COPD)",
            description: "AI detected significant airflow limitation and inflammation.",
            confidence: 85,
            severity: "high",
          },
          {
            name: "Bacterial Pneumonia",
            description: "Indications of localized lung infection with fluid accumulation.",
            confidence: 65,
            severity: "medium",
          },
          {
            name: "Early Stage Lung Nodules",
            description: "Small, round nodules identified; further investigation recommended.",
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
      <Sidebar />

      <AIProcessingModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        results={aiResults}
        onClose={() => {
          setIsModalOpen(false);
          handleClear();
          setUploadedFile(null);
          setAudioType("chest");
        }}
        onViewResults={handleViewResults}
      />

      {isPreviewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-display font-semibold text-lg">File Preview: {uploadedFile?.name}</h3>
                    <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
                    {uploadedFile?.type.startsWith('image/') ? (
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded shadow-sm" />
                    ) : (
                        <iframe src={previewUrl} className="w-full h-full rounded border border-gray-200 bg-white" title="File Preview"></iframe>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* PRIVACY POLICY MODAL */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl bg-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-lungsense-blue" />
                <h3 className="text-xl font-bold font-display">Privacy Policy</h3>
              </div>
              <button onClick={() => setIsPrivacyOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-sm text-gray-600 leading-relaxed text-left">
              <section>
                <h4 className="font-bold text-gray-900 mb-2 font-display">1. Data Collection</h4>
                <p>We collect personal identifiers (name, age, sex) and clinical health data (respiratory sounds, medical history). This data is strictly used for screening and model improvement.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 mb-2 font-display">2. Usage and Analysis</h4>
                <p>Your data is processed using proprietary algorithms to detect patterns associated with respiratory conditions. It is not shared with third-party advertisers.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-900 mb-2 font-display">3. Security</h4>
                <p>All data is encrypted in transit and at rest using industry-standard protocols. Identifiers are decoupled from clinical data wherever possible.</p>
              </section>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-xs">
                <strong>IMPORTANT:</strong> This application is a screening tool and does not provide a definitive medical diagnosis. Always consult with a qualified healthcare professional.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button onClick={() => setIsPrivacyOpen(false)} className="bg-lungsense-blue text-white px-8">I Understand</Button>
            </div>
          </Card>
        </div>
      )}

      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-display">Welcome Back, Ayesha</h1>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" alt="User" className="w-full h-full rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* UPLOAD SECTION */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <img src="/images/upload.png" alt="upload" className="h-12 w-auto" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">UPLOAD X-RAY DATA</h2>
                </div>
                <p className="text-xs text-gray-900 mb-4 ml-1">Upload your chest X-ray scans. Supported formats: .JPG, .PNG, .PDF. Drag and drop allowed.</p>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-6" onDragOver={(e) => e.preventDefault()} onDrop={handleDragDrop}>
                    <div className="w-full h-48 bg-lungsense-blue-light/20 rounded-lg flex items-center justify-center relative border-2 border-dashed border-lungsense-blue overflow-hidden group">
                        {uploadedFile ? (
                           <>
                             {uploadedFile.type.startsWith('image/') && previewUrl && (
                                <img src={previewUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                             )}
                             <div className="text-center p-2 flex flex-col items-center z-10">
                                 <FileText className="w-12 h-12 text-lungsense-blue mb-2" />
                                 <div className="absolute bottom-0 left-0 right-0 bg-lungsense-blue/80 backdrop-blur-sm p-2 text-center">
                                   <p className="text-xs text-white truncate font-medium px-2">{uploadedFile.name}</p>
                                 </div>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600 transition-colors z-20">
                               <X className="w-4 h-4" />
                             </button>
                           </>
                        ) : (
                           <div className="flex flex-col items-center justify-center text-lungsense-blue/50 group-hover:text-lungsense-blue/70 transition-colors text-center px-4">
                               <img src="/images/chest-xray-clipart.png" alt="Upload Placeholder" className="w-25 h-25 mb-3 opacity-40 mix-blend-multiply" />
                               <p className="text-sm font-display font-medium">Drag & Drop X-ray scan file here</p>
                           </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                        <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display">
                            Upload X-ray file
                        </Button>
                        <Button disabled={!uploadedFile} onClick={() => setIsPreviewOpen(true)} className={`w-full font-display font-medium py-6 rounded-xl shadow-sm ${uploadedFile ? "bg-lungsense-blue text-white hover:bg-lungsense-blue/90" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                            View File
                        </Button>
                    </div>
                </div>
              </div>

              {/* RECORD SECTION */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <img src="/images/record-sound.png" alt="record" className="h-12 w-auto" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">RECORD SOUNDS</h2>
                </div>
                <p className="text-xs text-gray-900 mb-4 ml-1">Select sound type and record yourself breathing or coughing for AI analysis.</p>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center gap-6">
                    <div className="flex items-center justify-center gap-1 h-12 w-full max-w-md">
                      {[...Array(25)].map((_, i) => (
                        <div key={i} className="w-1.5 rounded-full bg-black transition-all duration-100" style={{ height: isRecording ? `${Math.random() * 40 + 8}px` : `${[10, 15, 25, 15, 10, 20, 15, 10, 10, 20, 30, 20, 10, 10, 15, 25, 15, 10, 25, 15, 10, 10, 20, 15, 10][i]}px`}} />
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-6">
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Play className="w-4 h-4 text-gray-700" /></button>
                        <button onClick={toggleRecording} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${isRecording ? "bg-red-500 hover:bg-red-600 scale-105" : "bg-red-500 hover:bg-red-600"}`}>
                          {isRecording ? <div className="w-5 h-5 bg-white rounded-sm" /> : <div className="w-5 h-5 bg-white rounded-full" />}
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Pause className="w-4 h-4 text-gray-700" /></button>
                    </div>
                    <div className="w-full">
                        <p className="text-sm font-semibold text-gray-700 font-display mb-2 ml-1">Choose Audio Type</p>
                        <div className="flex gap-3">
                            <button onClick={() => setAudioType("chest")} className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all shadow-sm ${audioType === "chest" ? "w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Chest Sounds</button>
                            <button onClick={() => setAudioType("cough")} className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all shadow-sm ${audioType === "cough" ? "w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Cough Sounds</button>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* DEMOGRAPHICS & SYMPTOMS */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
               <div className="flex items-center gap-2 mb-2">
                    <img src="/images/demographics-symptoms.png" alt="demographics" className="h-12 w-auto" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">DEMOGRAPHICS & SYMPTOMS</h2>
               </div>
               <p className="text-xs text-gray-900 mb-6 ml-1">Update patient information and select any current symptoms for better AI accuracy.</p>

              <div className="space-y-6">
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="space-y-1.5 mb-4">
                        <Label className="text-xs uppercase tracking-wider text-lungsense-blue font-dm font-bold flex items-center gap-1">
                            <Users className="w-3 h-3" /> Select Patient Profile
                        </Label>
                        <select
                            value={selectedProfileId}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2.5 border border-lungsense-blue/30 bg-lungsense-blue/5 rounded-md font-display text-sm font-medium text-gray-900 focus:ring-2 focus:ring-lungsense-blue cursor-pointer"
                        >
                            <option value="">-- Select or Enter Manually --</option>
                            {PROFILES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="h-px bg-gray-200 my-2" />

                    <div className="space-y-1.5">
                        <Label htmlFor="age" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Age</Label>
                        <Input id="Age" className="bg-white" placeholder="ex: 34" value={demographics.age} onChange={(e) => setDemographics({...demographics, age: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="ethnicity" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Ethnicity</Label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md font-display text-sm focus:ring-2 focus:ring-lungsense-blue"
                            value={demographics.ethnicity}
                            onChange={(e) => setDemographics({...demographics, ethnicity: e.target.value})}
                        >
                            <option value="">Select Ethnicity</option>
                            <option value="Asian">Asian</option>
                            <option value="African">African</option>
                            <option value="Caucasian">Caucasian</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="sex" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Sex</Label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md font-display text-sm focus:ring-2 focus:ring-lungsense-blue"
                            value={demographics.sex}
                            onChange={(e) => setDemographics({...demographics, sex: e.target.value})}
                        >
                            <option value="">Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="h-px bg-gray-200" />

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

          <div className="bg-lungsense-yellow rounded-lg p-4 border lungsense-green">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-lungsense-blue flex-shrink-0 mt-0.5" />
              <div className="text-sm text-black font-dm">
                <span className="font-semibold">Privacy Notice:</span> We handle
                your data securely and use it only for medical analysis. Read
                our{" "}
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-lungsense-blue hover:underline font-medium bg-transparent border-none cursor-pointer"
                >
                  full privacy policy here
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleClear} className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-display font-semibold px-8 py-6 rounded-lg">Clear</Button>
            <Button
              onClick={handleSubmit}
              disabled={!uploadedFile && !isRecording && selectedSymptoms.length === 0}
              className="flex-1 w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 transition-opacity text-white font-display disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-display font-semibold py-6 rounded-lg"
            >
              Submit for AI Generated Diagnosis
            </Button>
          </div>
        </div>
      </main>

    </div>

  );
}