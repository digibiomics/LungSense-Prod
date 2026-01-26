import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import { Upload, Play, Pause, X, AlertCircle, FileText, Mic, Users, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { createCase, getProfileDetails, updateUser, updateUserDashboard, updateSubUser, updateSubUserDashboard } from "../../src/api";
import { useToast } from "@/hooks/use-toast";

const SYMPTOMS_LIST = [
  { id: 1, name: "Cough" },
  { id: 2, name: "Shortness of Breath" },
  { id: 3, name: "Flu Symptoms" },
  { id: 4, name: "Chest Pain/ tightness/ Congestion" },
  { id: 5, name: "Fever" },
  { id: 6, name: "Chills or rigors" },
  { id: 7, name: "Fatigue/Weakness" },
  { id: 8, name: "Sputum Change" },
  { id: 9, name: "Wheezing" },
  { id: 10, name: "Night Sweats" },
  { id: 11, name: "Abnormal/Unexpected Weight Loss" },
  { id: 12, name: "Difficulty sleeping due to breathing" },
  { id: 13, name: "Activity Limitation (stairs, walking etc)" },
  { id: 14, name: "Recent Infection or cold before onset" },
  { id: 15, name: "Known Exposure (TB/COVID/flu)" },
  { id: 16, name: "Smoking habits" },
];



export default function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get selected user from navigation state
  const selectedUserId = location.state?.userId;
  const selectedUserType = location.state?.userType || 'self';
  const selectedUserName = location.state?.userName || "";
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [coughAudio, setCoughAudio] = useState<Blob | null>(null);
  const [audioType, setAudioType] = useState<"chest" | "cough">("chest");
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [uploadedCoughAudio, setUploadedCoughAudio] = useState<File | null>(null);
  const [uploadedChestAudio, setUploadedChestAudio] = useState<File | null>(null);
  const coughAudioInputRef = useRef<HTMLInputElement>(null);
  const chestAudioInputRef = useRef<HTMLInputElement>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Array<{id: number, severity: number, duration_days: number}>>([]);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrls, setAudioUrls] = useState<{chest?: string, cough?: string}>({});

  const [selectedProfileId, setSelectedProfileId] = useState(selectedUserId || "");
  const [demographics, setDemographics] = useState({
    age: "",
    ethnicity: "",
    sex: ""
  });
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [originalDemographics, setOriginalDemographics] = useState({
    age: "",
    ethnicity: "",
    sex: ""
  });
  const [isSavingDemographics, setIsSavingDemographics] = useState(false);

  // Fetch demographics for selected user on mount
  useEffect(() => {
    const fetchUserDemographics = async () => {
      if (!selectedUserId) {
        console.log("No userId provided");
        return;
      }
      
      console.log("Fetching demographics for userId:", selectedUserId, "type:", selectedUserType);
      
      try {
        // Use profile API instead of user API to avoid 403
        const profileType = selectedUserType === 'self' ? 'user' : 'sub_user';
        const response = await getProfileDetails(profileType, selectedUserId);
        console.log("API Response:", response);
        
        // Handle response structure: { status, message, data: {...} }
        const profile = response?.data || response;
        console.log("Profile data:", profile);
        
        if (profile) {
          const demographicsData = {
            age: String(profile.age || ""),
            ethnicity: String(profile.ethnicity || ""),
            sex: String(profile.sex || "")
          };
          setDemographics(demographicsData);
          setOriginalDemographics(demographicsData);
          console.log("Demographics set:", { age: profile.age, ethnicity: profile.ethnicity, sex: profile.sex });
        }
      } catch (error: any) {
        console.error("Error fetching demographics:", error);
        toast({
          title: "Error",
          description: "Failed to load user demographics",
          variant: "destructive",
        });
      }
    };
    
    fetchUserDemographics();
  }, [selectedUserId, selectedUserType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // Cleanup audio URLs
      Object.values(audioUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrl, audioUrls]);

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
    setRecordedAudio(null);
    setCoughAudio(null);
    setUploadedCoughAudio(null);
    setUploadedChestAudio(null);
    setRecordingTime(0);
    // Clear audio URLs
    Object.values(audioUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setAudioUrls({});
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        if (audioType === "chest") {
          setRecordedAudio(blob);
          setAudioUrls(prev => ({ ...prev, chest: audioUrl }));
        } else {
          setCoughAudio(blob);
          setAudioUrls(prev => ({ ...prev, cough: audioUrl }));
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Microphone access denied",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const deleteRecording = (type: "chest" | "cough") => {
    if (type === "chest") {
      setRecordedAudio(null);
      if (audioUrls.chest) {
        URL.revokeObjectURL(audioUrls.chest);
        setAudioUrls(prev => ({ ...prev, chest: undefined }));
      }
    } else {
      setCoughAudio(null);
      if (audioUrls.cough) {
        URL.revokeObjectURL(audioUrls.cough);
        setAudioUrls(prev => ({ ...prev, cough: undefined }));
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "chest" | "cough") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "cough") {
        setUploadedCoughAudio(file);
      } else {
        setUploadedChestAudio(file);
      }
    }
  };

  const toggleSymptom = (symptomId: number) => {
    const exists = selectedSymptoms.find(s => s.id === symptomId);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s.id !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, { id: symptomId, severity: 3, duration_days: 3 }]);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      
      formData.append("profile_type", selectedUserType);
      formData.append("profile_id", String(selectedUserId));
      
      // Format symptoms as required by backend
      const symptomsData = selectedSymptoms.map(s => ({
        symptom_id: s.id,
        severity: s.severity,
        duration_days: s.duration_days
      }));
      formData.append("symptoms", JSON.stringify(symptomsData));
      
      // Add files
      if (uploadedFile) {
        formData.append("xray", uploadedFile);
      }
      
      // Recorded or uploaded cough audio
      if (coughAudio) {
        formData.append("cough_audio", coughAudio, "cough_recorded.wav");
      } else if (uploadedCoughAudio) {
        formData.append("cough_audio", uploadedCoughAudio);
      }
      
      // Recorded or uploaded chest audio
      if (recordedAudio) {
        formData.append("breath_audio", recordedAudio, "breath_recorded.wav");
      } else if (uploadedChestAudio) {
        formData.append("breath_audio", uploadedChestAudio);
      }

      const response = await createCase(formData);
      
      toast({
        title: "Data Uploaded Successfully",
        description: `Case assigned to practitioner. Please wait for the reports...`,
      });

      // Clear form after successful submission
      handleClear();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create case",
        variant: "destructive",
      });
    }
  };

  const handleViewResults = () => {
    navigate("/patient/results");
  };

  const saveDemographics = async () => {
    try {
      setIsSavingDemographics(true);
      
      const updateData: any = {};
      
      // Include fields that have values (for patient dashboard, we only update age, ethnicity, and sex)
      if (demographics.age) {
        updateData.age = parseInt(demographics.age);
      }
      if (demographics.ethnicity) {
        updateData.ethnicity = demographics.ethnicity;
      }
      if (demographics.sex) {
        updateData.sex = demographics.sex;
      }
      
      // Only make API call if there are actual changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Info",
          description: "No changes to save",
        });
        setIsEditingDemographics(false);
        return;
      }
      
      if (selectedUserType === 'self') {
        await updateUserDashboard(selectedUserId, updateData);
      } else {
        await updateSubUserDashboard(selectedUserId, updateData);
      }
      
      setOriginalDemographics(demographics);
      setIsEditingDemographics(false);
      
      toast({
        title: "Success",
        description: "Demographics updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update demographics",
        variant: "destructive",
      });
    } finally {
      setIsSavingDemographics(false);
    }
  };

  const cancelEditDemographics = () => {
    setDemographics(originalDemographics);
    setIsEditingDemographics(false);
  };

  const hasUnsavedChanges = () => {
    return JSON.stringify(demographics) !== JSON.stringify(originalDemographics);
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      <Sidebar />

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
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Upload Data for {selectedUserName || "User"}
            </h1>
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
                <p className="text-xs text-gray-900 mb-4 ml-1">Select sound type and record (10 sec max) or upload audio file.</p>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center gap-6">
                    {/* Audio Type Selection */}
                    <div className="w-full">
                        <p className="text-sm font-semibold text-gray-700 font-display mb-2 ml-1">Choose Audio Type</p>
                        <div className="flex gap-3">
                            <button onClick={() => setAudioType("chest")} className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all shadow-sm ${audioType === "chest" ? "bg-lungsense-blue-light text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Chest Sounds</button>
                            <button onClick={() => setAudioType("cough")} className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all shadow-sm ${audioType === "cough" ? "bg-lungsense-blue-light text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Cough Sounds</button>
                        </div>
                    </div>

                    {/* Waveform */}
                    <div className="flex items-center justify-center gap-1 h-12 w-full max-w-md">
                      {[...Array(25)].map((_, i) => (
                        <div key={i} className="w-1.5 rounded-full bg-black transition-all duration-100" style={{ height: isRecording ? `${Math.random() * 40 + 8}px` : `${[10, 15, 25, 15, 10, 20, 15, 10, 10, 20, 30, 20, 10, 10, 15, 25, 15, 10, 25, 15, 10, 10, 20, 15, 10][i]}px`}} />
                      ))}
                    </div>

                    {/* Recording Timer */}
                    {isRecording && (
                      <div className="text-red-500 font-bold text-lg">
                        Recording: {recordingTime}s / 10s
                      </div>
                    )}

                    {/* Recording Status & Preview */}
                    {audioType === "chest" && recordedAudio && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-600 text-sm font-medium">✓ Chest audio recorded</span>
                          <button
                            onClick={() => deleteRecording("chest")}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        {audioUrls.chest && (
                          <audio controls className="w-full h-8">
                            <source src={audioUrls.chest} type="audio/wav" />
                          </audio>
                        )}
                      </div>
                    )}
                    {audioType === "cough" && coughAudio && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-600 text-sm font-medium">✓ Cough audio recorded</span>
                          <button
                            onClick={() => deleteRecording("cough")}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        {audioUrls.cough && (
                          <audio controls className="w-full h-8">
                            <source src={audioUrls.cough} type="audio/wav" />
                          </audio>
                        )}
                      </div>
                    )}
                    {audioType === "chest" && uploadedChestAudio && (
                      <div className="text-green-600 text-sm font-medium">✓ Chest audio uploaded: {uploadedChestAudio.name}</div>
                    )}
                    {audioType === "cough" && uploadedCoughAudio && (
                      <div className="text-green-600 text-sm font-medium">✓ Cough audio uploaded: {uploadedCoughAudio.name}</div>
                    )}

                    {/* Recording Controls */}
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={toggleRecording} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${isRecording ? "bg-red-500 hover:bg-red-600 scale-105" : "bg-red-500 hover:bg-red-600"}`}>
                          {isRecording ? <div className="w-5 h-5 bg-white rounded-sm" /> : <Mic className="w-6 h-6 text-white" />}
                        </button>
                    </div>

                    {/* Upload Audio File */}
                    <div className="w-full border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700 font-display mb-2 text-center">Or Upload Audio File</p>
                        <input 
                          ref={audioType === "cough" ? coughAudioInputRef : chestAudioInputRef}
                          type="file" 
                          accept="audio/*,.wav,.mp3,.m4a" 
                          onChange={(e) => handleAudioUpload(e, audioType)} 
                          className="hidden" 
                        />
                        <Button 
                          onClick={() => audioType === "cough" ? coughAudioInputRef.current?.click() : chestAudioInputRef.current?.click()} 
                          className="w-full bg-lungsense-blue-light hover:bg-lungsense-blue-light hover:opacity-90 text-white font-display"
                        >
                          Upload {audioType === "chest" ? "Chest" : "Cough"} Audio
                        </Button>
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
                            <Users className="w-3 h-3" /> Patient Profile
                        </Label>
                        <div className="w-full px-3 py-2.5 border border-lungsense-blue/30 bg-lungsense-blue/5 rounded-md font-display text-sm font-medium text-gray-900">
                            {selectedUserName || "User"}
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 my-2" />

                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Demographics</Label>
                        <div className="flex gap-2">
                            {isEditingDemographics ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={cancelEditDemographics}
                                        className="text-xs text-gray-500 hover:underline font-medium"
                                        disabled={isSavingDemographics}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveDemographics}
                                        className={`text-xs font-medium px-2 py-1 rounded ${
                                            hasUnsavedChanges() && !isSavingDemographics
                                                ? "text-white bg-lungsense-blue hover:bg-lungsense-blue/90"
                                                : "text-gray-400 bg-gray-200 cursor-not-allowed"
                                        }`}
                                        disabled={!hasUnsavedChanges() || isSavingDemographics}
                                    >
                                        {isSavingDemographics ? "Saving..." : "Save"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingDemographics(true)}
                                    className="text-xs text-lungsense-blue hover:underline font-medium"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="age" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Age</Label>
                        <Input 
                            id="Age" 
                            className="bg-white" 
                            placeholder="ex: 34" 
                            value={demographics.age} 
                            onChange={(e) => setDemographics({...demographics, age: e.target.value})} 
                            disabled={!isEditingDemographics}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="ethnicity" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Ethnicity</Label>
                        <select
                            name="ethnicity"
                            className="w-full text-sm border rounded-md p-2 h-10"
                            value={demographics.ethnicity ?? ""}
                            onChange={(e) => setDemographics({...demographics, ethnicity: e.target.value})}
                            disabled={!isEditingDemographics}
                        >
                            <option value="">Select</option>
                            <option value="AFR">African</option>
                            <option value="ASN">Asian</option>
                            <option value="CAU">Caucasian</option>
                            <option value="HIS">Hispanic</option>
                            <option value="MDE">Middle Eastern</option>
                            <option value="MIX">Mixed</option>
                            <option value="UND">Prefer not to say</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="sex" className="text-xs uppercase tracking-wider text-gray-500 font-dm font-bold">Sex</Label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md font-display text-sm focus:ring-2 focus:ring-lungsense-blue"
                            value={demographics.sex}
                            onChange={(e) => setDemographics({...demographics, sex: e.target.value})}
                            disabled={!isEditingDemographics}
                        >
                            <option value="">Select Sex</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                        </select>
                    </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 font-display">Symptoms</Label>
                    <div className="flex flex-wrap gap-2">
                        {SYMPTOMS_LIST.map((symptom) => {
                            const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                            return (
                                <button
                                    key={symptom.id}
                                    onClick={() => toggleSymptom(symptom.id)}
                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm border
                                        ${isSelected
                                            ? "bg-lungsense-blue-light text-white text-bold border-lungsense-blue-light hover:bg-lungsense-blue-light"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {symptom.name}
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