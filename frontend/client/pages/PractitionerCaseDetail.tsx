import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, Download, Play, User, Calendar, FileText, Stethoscope } from "lucide-react";
import { getCaseDetails, submitCaseReview, getUserById, getSubUserById } from "../../src/api";
import { 
  getEthnicityName, 
  getSexName, 
  getRespiratoryHistoryNames, 
  getCountryName, 
  getProvinceName 
} from "../../src/displayMappings";

interface CaseDetail {
  id: number;
  status: string;
  created_at: string;
  patient_id?: number;
  sub_user_id?: number;
  patient: {
    name: string;
    age?: number;
    sex?: string;
    ethnicity?: string;
    country?: string;
    province?: string;
    respiratory_history?: string;
  };
  symptoms: Array<{
    name: string;
  }>;
  files: Array<{
    id: number;
    modality: string;
    file_type: string;
    file_size: number;
    presigned_url: string;
    uploaded_at: string;
  }>;
  reviews: Array<{
    id: number;
    primary_diagnosis?: string;
    differential_diagnoses?: string;
    severity?: string;
    confidence_score?: number;
    clinical_notes?: string;
    is_final: boolean;
    created_at: string;
  }>;
}

interface ReviewForm {
  primary_diagnosis: string;
  differential_diagnoses: string;
  severity: string;
  confidence_score: number;
  clinical_notes: string;
  is_final: boolean;
}

export default function PractitionerCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [displayNames, setDisplayNames] = useState({
    country: '',
    province: '',
    ethnicity: '',
    sex: '',
    respiratoryHistory: ''
  });
  
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    primary_diagnosis: "",
    differential_diagnoses: "",
    severity: "",
    confidence_score: 0.5,
    clinical_notes: "",
    is_final: false
  });

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail();
    }
  }, [caseId]);

  const fetchCaseDetail = async () => {
    try {
      setLoading(true);
      const response = await getCaseDetails(caseId!);
      
      if (response.status === 'success') {
        console.log('Case detail response:', response.data); // Debug log
        console.log('Patient data from backend:', response.data.patient); // Debug patient data
        
        let caseData = response.data;
        
        // The backend already provides complete patient data, so we don't need to fetch it again
        // Just use the data directly from the response
        console.log('Final patient data being set:', caseData.patient);
        
        setCaseDetail(caseData);
        
        // Convert codes to display names
        const names = {
          ethnicity: getEthnicityName(caseData.patient.ethnicity),
          sex: getSexName(caseData.patient.sex),
          respiratoryHistory: getRespiratoryHistoryNames(caseData.patient.respiratory_history),
          province: getProvinceName(caseData.patient.province),
          country: '' // Will be set asynchronously
        };
        
        // Get country name asynchronously
        if (caseData.patient.country) {
          getCountryName(caseData.patient.country).then(countryName => {
            names.country = countryName;
            setDisplayNames({...names});
          });
        } else {
          setDisplayNames(names);
        }
        
        // Pre-fill form with latest review if exists
        const latestReview = caseData.reviews[caseData.reviews.length - 1];
        if (latestReview && !latestReview.is_final) {
          setReviewForm({
            primary_diagnosis: latestReview.primary_diagnosis || "",
            differential_diagnoses: latestReview.differential_diagnoses || "",
            severity: latestReview.severity || "",
            confidence_score: latestReview.confidence_score || 0.5,
            clinical_notes: latestReview.clinical_notes || "",
            is_final: false
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (isFinal: boolean) => {
    try {
      setSubmitting(true);
      
      const reviewData = {
        ...reviewForm,
        is_final: isFinal
      };
      
      const response = await submitCaseReview(caseId!, reviewData);
      
      if (response.status === 'success') {
        // Refresh case data
        await fetchCaseDetail();
        
        // Reset form if final submission
        if (isFinal) {
          setReviewForm({
            primary_diagnosis: "",
            differential_diagnoses: "",
            severity: "",
            confidence_score: 0.5,
            clinical_notes: "",
            is_final: false
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getFileIcon = (modality: string) => {
    switch (modality) {
      case "xray":
        return <FileText className="w-5 h-5" />;
      case "cough_audio":
      case "breath_audio":
        return <Play className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

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

  if (error || !caseDetail) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-dm mb-4">{error || "Case not found"}</p>
            <Button onClick={() => navigate("/practitioner/patients")}>
              Back to Cases
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isReviewed = caseDetail.status === "reviewed";
  const hasReviews = caseDetail.reviews.length > 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/practitioner/patients")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                Case #{caseDetail.id}
              </h1>
              <p className="text-gray-600 font-dm">
                Submitted on {new Date(caseDetail.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isReviewed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}>
              {caseDetail.status}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Case Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Information */}
              <Card className="p-6 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-lungsense-blue" />
                  <h2 className="text-xl font-semibold text-gray-900 font-display">
                    Patient Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-dm mb-1">Name</p>
                    <p className="text-gray-900 font-display font-semibold">{caseDetail.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-dm mb-1">Age</p>
                    <p className="text-gray-900 font-display">{caseDetail.patient.age ? `${caseDetail.patient.age} years` : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-dm mb-1">Sex</p>
                    <p className="text-gray-900 font-display capitalize">{displayNames.sex || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-dm mb-1">Ethnicity</p>
                    <p className="text-gray-900 font-display">{displayNames.ethnicity || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-dm mb-1">Country</p>
                    <p className="text-gray-900 font-display">{displayNames.country || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-dm mb-1">Province</p>
                    <p className="text-gray-900 font-display">{displayNames.province || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-dm mb-1">Respiratory History</p>
                    <p className="text-gray-900 font-display">{displayNames.respiratoryHistory || 'Not provided'}</p>
                  </div>
                </div>
              </Card>

              {/* Symptoms */}
              <Card className="p-6 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Stethoscope className="w-5 h-5 text-lungsense-blue" />
                  <h2 className="text-xl font-semibold text-gray-900 font-display">
                    Reported Symptoms
                  </h2>
                </div>
                
                <div className="grid gap-3">
                  {caseDetail.symptoms.map((symptom, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900 font-display">{symptom.name}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Data Provided by Patient */}
              <Card className="p-6 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-lungsense-blue" />
                  <h2 className="text-xl font-semibold text-gray-900 font-display">
                    Data Provided by the Patient
                  </h2>
                </div>
                
                <div className="grid gap-3">
                  {caseDetail.files.length > 0 ? (
                    caseDetail.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.modality)}
                          <div>
                            <p className="font-semibold text-gray-900 font-display capitalize">
                              {file.modality.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600 font-dm">
                              {file.file_type.toUpperCase()} • {(file.file_size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(file.presigned_url, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-600 font-dm">No files uploaded for this case</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Previous Reviews */}
              {hasReviews && (
                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-lungsense-blue" />
                    <h2 className="text-xl font-semibold text-gray-900 font-display">
                      Review History
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {caseDetail.reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-dm">
                            {new Date(review.created_at).toLocaleString()}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            review.is_final ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {review.is_final ? "Final" : "Draft"}
                          </span>
                        </div>
                        {review.primary_diagnosis && (
                          <p className="text-gray-900 font-display font-semibold mb-1">
                            Diagnosis: {review.primary_diagnosis}
                          </p>
                        )}
                        {review.severity && (
                          <p className="text-gray-700 font-dm mb-1">
                            Severity: {review.severity}
                          </p>
                        )}
                        {review.clinical_notes && (
                          <p className="text-gray-700 font-dm">
                            Notes: {review.clinical_notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Review Form */}
            {!isReviewed && (
              <div className="space-y-6">
                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display">
                    Medical Review
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 font-display mb-2 block">
                        Primary Diagnosis
                      </Label>
                      <Textarea
                        value={reviewForm.primary_diagnosis}
                        onChange={(e) => setReviewForm({...reviewForm, primary_diagnosis: e.target.value})}
                        placeholder="Enter primary diagnosis..."
                        className="font-dm text-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 font-display mb-2 block">
                        Differential Diagnoses
                      </Label>
                      <Textarea
                        value={reviewForm.differential_diagnoses}
                        onChange={(e) => setReviewForm({...reviewForm, differential_diagnoses: e.target.value})}
                        placeholder="Enter alternative diagnoses..."
                        className="font-dm text-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 font-display mb-2 block">
                        Severity Level
                      </Label>
                      <Select
                        value={reviewForm.severity}
                        onValueChange={(value) => setReviewForm({...reviewForm, severity: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 font-display mb-2 block">
                        Confidence Score: {Math.round(reviewForm.confidence_score * 100)}%
                      </Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={reviewForm.confidence_score}
                        onChange={(e) => setReviewForm({...reviewForm, confidence_score: parseFloat(e.target.value)})}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 font-display mb-2 block">
                        Clinical Notes
                      </Label>
                      <Textarea
                        value={reviewForm.clinical_notes}
                        onChange={(e) => setReviewForm({...reviewForm, clinical_notes: e.target.value})}
                        placeholder="Add clinical observations and recommendations..."
                        className="font-dm text-sm"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_final"
                        checked={reviewForm.is_final}
                        onChange={(e) => setReviewForm({...reviewForm, is_final: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="is_final" className="text-sm font-semibold text-gray-700 font-display">
                        Mark as Final Review
                      </Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleSubmitReview(reviewForm.is_final)}
                        disabled={submitting || !reviewForm.primary_diagnosis.trim()}
                        className="flex-1 bg-lungsense-blue hover:bg-lungsense-blue/90"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {reviewForm.is_final ? 'Submit Final Review' : 'Save Draft'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}