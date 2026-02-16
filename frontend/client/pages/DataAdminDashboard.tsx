import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  Database, 
  BarChart3, 
  LogOut,
  Brain,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

// Types
interface DashboardSummary {
  total_cases: number;
  ml_ready_cases: number;
  training_readiness_percentage: number;
  label_status: {
    draft: number;
    final: number;
  };
  modality_breakdown: {
    cough_audio: number;
    breath_audio: number;
    xray: number;
    multi_modal: number;
  };
}

interface DatasetRow {
  catalog_number: string;
  model_types: string[];
  practitioner_id: number | null;
  practitioner_name: string | null;
  practitioner_institution: string | null;
  full_name: string | null;
  symptoms: string[];
  clinical_notes: string | null;
  primary_diagnosis: string | null;
  differential_diagnoses: string | null;
  respiratory_history: string[];
  severity: string | null;
  confidence_score: number | null;
  review_status: string;
  training_ready: boolean;
  review_date: string | null;
  exclusion_reason: string | null;
  created_at: string;
}

export default function DataAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  
  // Data states
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [datasetRows, setDatasetRows] = useState<DatasetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    diagnosis: "",
    severity: "all",
    confidence_min: "",
    training_ready_only: false,
    practitioner_id: "",
    model_type: "all",
    page: 1,
    limit: 50
  });

  // Respiratory History Enums (matching backend constants)
  const RESPIRATORY_HISTORY = {
    COPD: "COPD",
    ASTHMA: "ASTHMA", 
    TB: "TB",
    CF: "CF",
    SMOKER: "SMOKER",
    WORK_EXPOSURE: "WORK_EXPOSURE",
    NONE: "NONE"
  };

  const getRespiratoryHistoryLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      COPD: "COPD",
      ASTHMA: "Asthma",
      TB: "Tuberculosis",
      CF: "Cystic Fibrosis",
      SMOKER: "Smoker",
      WORK_EXPOSURE: "Work Exposure",
      NONE: "None"
    };
    return labels[value] || value;
  };

  const userEmail = localStorage.getItem("user_email");

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  useEffect(() => {
    if (activeTab === "dataset") {
      fetchDatasetExplorer();
    }
  }, [activeTab, filters]);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/admin/dashboard/summary", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch summary");
      
      const data = await response.json();
      setSummary(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasetExplorer = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.diagnosis && { diagnosis: filters.diagnosis }),
        ...(filters.severity && filters.severity !== "all" && { severity: filters.severity }),
        ...(filters.confidence_min && { confidence_min: filters.confidence_min }),
        ...(filters.training_ready_only && { training_ready_only: "true" }),
        ...(filters.practitioner_id && { practitioner_id: filters.practitioner_id }),
        ...(filters.model_type && filters.model_type !== "all" && { model_type: filters.model_type })
      });

      const response = await fetch(`http://localhost:8000/api/admin/dashboard/dataset?${params}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch dataset");
      
      const data = await response.json();
      setDatasetRows(data.data.rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("profile_picture");
    navigate("/auth/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="summary" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Database className="w-4 h-4" />
              Dataset Explorer
            </TabsTrigger>
          </TabsList>

          {/* Summary Panel */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Cases</p>
                    <p className="text-3xl font-bold text-blue-900">{summary?.total_cases || 0}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">ML-Ready Cases</p>
                    <p className="text-3xl font-bold text-green-900">{summary?.ml_ready_cases || 0}</p>
                  </div>
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Training Readiness</p>
                    <p className="text-3xl font-bold text-purple-900">{summary?.training_readiness_percentage || 0}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Draft Labels</p>
                    <p className="text-3xl font-bold text-amber-900">{summary?.label_status.draft || 0}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
              </Card>
            </div>

            {/* Modality Breakdown */}
            <Card className="p-6 bg-white border-gray-200">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Cases per Modality</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">{summary?.modality_breakdown.cough_audio || 0}</p>
                  <p className="text-sm font-medium text-blue-600">Cough Audio</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{summary?.modality_breakdown.breath_audio || 0}</p>
                  <p className="text-sm font-medium text-green-600">Breath Audio</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-700">{summary?.modality_breakdown.xray || 0}</p>
                  <p className="text-sm font-medium text-purple-600">X-ray</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <p className="text-2xl font-bold text-orange-700">{summary?.modality_breakdown.multi_modal || 0}</p>
                  <p className="text-sm font-medium text-orange-600">Multi-modal</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Dataset Explorer */}
          <TabsContent value="dataset" className="space-y-6">
            {/* Model Type Filter Card */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-900">
                Filter by Model Type
              </h3>
              <Select value={filters.model_type} onValueChange={(value) => {
                const newFilters = {...filters, model_type: value, page: 1};
                setFilters(newFilters);
                // Immediately trigger refetch with new filters
                fetchDatasetExplorer();
              }}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select Model Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Model Types</SelectItem>
                  <SelectItem value="cough_audio">Cough Audio</SelectItem>
                  <SelectItem value="breath_audio">Breath Audio</SelectItem>
                  <SelectItem value="xray">X-ray</SelectItem>
                  <SelectItem value="multi_modal">Multi-modal</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Filters Panel */}
            <Card className="p-4 bg-white border-gray-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Search className="w-4 h-4" />
                Additional Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Input
                  placeholder="Diagnosis..."
                  value={filters.diagnosis}
                  onChange={(e) => setFilters({...filters, diagnosis: e.target.value})}
                />
                <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value === "all" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Min Confidence (0-1)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={filters.confidence_min}
                  onChange={(e) => setFilters({...filters, confidence_min: e.target.value})}
                />
                <Input
                  placeholder="Practitioner ID"
                  type="number"
                  value={filters.practitioner_id}
                  onChange={(e) => setFilters({...filters, practitioner_id: e.target.value})}
                />
                <Button
                  variant={filters.training_ready_only ? "default" : "outline"}
                  onClick={() => setFilters({...filters, training_ready_only: !filters.training_ready_only})}
                >
                  Training Ready Only
                </Button>
                <Button onClick={fetchDatasetExplorer} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </Card>

            {/* Dataset Table */}
            <Card className="p-6 bg-white border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">Catalog #</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Model Types</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Diagnosis</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Severity</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Confidence</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Institution</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Training Ready</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasetRows.map((row) => (
                      <>
                        <tr key={row.catalog_number} className="border-b hover:bg-blue-50 transition-colors">
                          <td className="p-3 font-mono text-xs font-medium text-gray-800">{row.catalog_number}</td>
                          <td className="p-3">
                            <div className="flex gap-1 flex-wrap">
                              {row.model_types.map((type) => (
                                <span key={type} className="text-xs px-2 py-1 bg-blue-100 rounded text-blue-800 font-medium">
                                  {type.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-medium text-gray-800">{row.primary_diagnosis || "—"}</td>
                          <td className="p-3">
                            {row.severity ? (
                              <span className="text-gray-800 capitalize font-medium">
                                {row.severity}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="p-3">
                            {row.confidence_score !== null ? (
                              <span className="text-gray-800 font-medium">
                                {row.confidence_score.toFixed(2)}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="p-3 text-gray-800">{row.practitioner_institution || "—"}</td>
                          <td className="p-3">
                            <span className="text-gray-800 capitalize font-medium">
                              {row.review_status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`font-medium ${
                              row.review_status === 'final' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {row.review_status === 'final' ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                const expandedRows = new Set(expandedRowIds);
                                if (expandedRows.has(row.catalog_number)) {
                                  expandedRows.delete(row.catalog_number);
                                } else {
                                  expandedRows.add(row.catalog_number);
                                }
                                setExpandedRowIds(expandedRows);
                              }}
                            >
                              {expandedRowIds.has(row.catalog_number) ? 'Hide' : 'Show'}
                            </Button>
                          </td>
                        </tr>
                        {expandedRowIds.has(row.catalog_number) && (
                          <tr className="bg-blue-50">
                            <td colSpan={9} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-800">Clinical Context</h4>
                                  <div className="space-y-1 text-gray-700">
                                    <div><strong>Symptoms:</strong> {Array.isArray(row.symptoms) ? row.symptoms.join(', ') : (row.symptoms || "—")}</div>
                                    <div><strong>Clinical Notes:</strong> {row.clinical_notes || "—"}</div>
                                    <div><strong>Differential Diagnosis:</strong> {row.differential_diagnoses || "—"}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-800">Patient History</h4>
                                  <div className="space-y-1 text-gray-700">
                                    <div><strong>Respiratory History:</strong> {
                                      (() => {
                                        try {
                                          let history = row.respiratory_history;
                                          if (typeof history === 'string') {
                                            history = JSON.parse(history);
                                          }
                                          if (Array.isArray(history)) {
                                            return history.map(item => getRespiratoryHistoryLabel(item)).join(', ');
                                          }
                                          return getRespiratoryHistoryLabel(history) || "—";
                                        } catch {
                                          return row.respiratory_history || "—";
                                        }
                                      })()
                                    }</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-800">Practitioner Details</h4>
                                  <div className="space-y-1 text-gray-700">
                                    <div><strong>Name:</strong> {row.full_name || "—"}</div>
                                    <div><strong>Institution:</strong> {row.practitioner_institution || "—"}</div>
                                    <div><strong>Practitioner ID:</strong> {row.practitioner_id || "—"}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}