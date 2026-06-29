import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  Database, 
  BarChart3, 
  LogOut,
  Brain,
  Search,
  AlertCircle,
  TrendingUp,
  Building2
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Types
interface InstitutionBreakdownItem {
  institution: string;
  case_count: number;
}

interface InstitutionModalityItem {
  practitioner_id: number;
  practitioner_name: string;
  institution: string;
  xray: number;
  cough_audio: number;
  breath_audio: number;
  submitted: number;
  reviewed: number;
  total: number;
}

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
  institution_breakdown: InstitutionBreakdownItem[];
  institution_modality_breakdown: InstitutionModalityItem[];
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
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    diagnosis: "",
    severity: "all",
    confidence_min: "",
    training_ready_only: false,
    institution: "all",
    model_type: "all",
    page: 1,
    limit: 50
  });

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
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (activeTab === "dataset") {
      fetchDatasetExplorer();
    }
  }, [activeTab, filters]);

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/institutions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) return;
      const data = await response.json();
      setInstitutions(data?.data?.institutions || []);
    } catch {
      // Non-critical — silently fail
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
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
        ...(filters.institution && filters.institution !== "all" && { institution: filters.institution }),
        ...(filters.model_type && filters.model_type !== "all" && { model_type: filters.model_type })
      });

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/dataset?${params}`, {
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

  // Aggregate total FILES per institution from the practitioner-level modality breakdown
  // This ensures the bar chart and the table below show consistent numbers
  const institutionFileTotals: Record<string, { cough_audio: number; xray: number; breath_audio: number; total: number }> = {};
  if (summary?.institution_modality_breakdown) {
    for (const row of summary.institution_modality_breakdown) {
      const inst = row.institution;
      if (!institutionFileTotals[inst]) {
        institutionFileTotals[inst] = { cough_audio: 0, xray: 0, breath_audio: 0, total: 0 };
      }
      institutionFileTotals[inst].cough_audio += row.cough_audio;
      institutionFileTotals[inst].xray += row.xray;
      institutionFileTotals[inst].breath_audio += row.breath_audio;
      institutionFileTotals[inst].total += row.total;
    }
  }
  const institutionFileList = Object.entries(institutionFileTotals)
    .map(([institution, counts]) => ({ institution, ...counts }))
    .sort((a, b) => b.total - a.total);
  const maxFileCount = institutionFileList.length
    ? Math.max(...institutionFileList.map(i => i.total))
    : 1;

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

          {/* ── SUMMARY PANEL ── */}
          <TabsContent value="summary" className="space-y-6">
            {/* KPI Cards */}
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

            {/* Institution File Breakdown — bars driven from file counts, consistent with table below */}
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Total Files by Institution</h3>
                <span className="ml-auto text-xs text-gray-400 font-medium">Cough Audio + X-ray + Breath Audio</span>
              </div>

              {institutionFileList.length > 0 ? (
                <div className="space-y-4">
                  {institutionFileList.map((item) => {
                    const pct = Math.round((item.total / maxFileCount) * 100);
                    return (
                      <div key={item.institution}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="w-36 text-sm font-medium text-gray-700 truncate shrink-0" title={item.institution}>
                            {item.institution}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-bold text-indigo-700 shrink-0">
                            {item.total}
                          </span>
                        </div>
                        {/* Mini modality pills */}
                        <div className="ml-36 flex gap-2 pl-3">
                          {item.cough_audio > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                              {item.cough_audio} Cough
                            </span>
                          )}
                          {item.xray > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium">
                              {item.xray} X-ray
                            </span>
                          )}
                          {item.breath_audio > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                              {item.breath_audio} Breath
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No institution data available yet</p>
                </div>
              )}
            </Card>

            {/* Institution × Modality Breakdown */}
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Files per Practitioner by Modality</h3>
                <span className="ml-auto text-xs text-gray-400 font-medium">Cough Audio · X-ray · Breath Audio</span>
              </div>

              {summary?.institution_modality_breakdown && summary.institution_modality_breakdown.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-3 font-semibold text-gray-700">Practitioner Name</th>
                        <th className="text-left p-3 font-semibold text-indigo-700">Institution</th>
                        <th className="text-center p-3 font-semibold text-amber-600">Submitted Cases</th>
                        <th className="text-center p-3 font-semibold text-green-600">Reviewed Cases</th>
                        <th className="text-center p-3 font-semibold text-blue-700">Cough Audio</th>
                        <th className="text-center p-3 font-semibold text-purple-700">X-ray</th>
                        <th className="text-center p-3 font-semibold text-green-700">Breath Audio</th>
                        <th className="text-center p-3 font-semibold text-gray-600">Total Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.institution_modality_breakdown.map((row) => (
                        <tr key={row.practitioner_id} className="border-b hover:bg-indigo-50 transition-colors">
                          <td className="p-3 font-medium text-gray-800">{row.practitioner_name}</td>
                          <td className="p-3 text-indigo-700 font-medium">{row.institution}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-base ${row.submitted > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
                              {row.submitted > 0 ? row.submitted : '—'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-base ${row.reviewed > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                              {row.reviewed > 0 ? row.reviewed : '—'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-base ${row.cough_audio > 0 ? 'text-blue-700' : 'text-gray-300'}`}>
                              {row.cough_audio > 0 ? row.cough_audio : '—'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-base ${row.xray > 0 ? 'text-purple-700' : 'text-gray-300'}`}>
                              {row.xray > 0 ? row.xray : '—'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-base ${row.breath_audio > 0 ? 'text-green-700' : 'text-gray-300'}`}>
                              {row.breath_audio > 0 ? row.breath_audio : '—'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm">
                              {row.total}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No institution modality data available yet</p>
                </div>
              )}
            </Card>
          </TabsContent>


          {/* ── DATASET EXPLORER ── */}
          <TabsContent value="dataset" className="space-y-6">
            {/* Model Type Filter Card */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-900">Filter by Model Type</h3>
              <Select
                value={filters.model_type}
                onValueChange={(value) => {
                  setFilters({ ...filters, model_type: value, page: 1 });
                }}
              >
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
                {/* Institution Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Institution
                  </label>
                  <Select
                    value={filters.institution}
                    onValueChange={(value) => setFilters({ ...filters, institution: value, page: 1 })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Institutions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      {institutions.map((inst) => (
                        <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Diagnosis */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Diagnosis</label>
                  <Input
                    placeholder="Search diagnosis..."
                    value={filters.diagnosis}
                    onChange={(e) => setFilters({ ...filters, diagnosis: e.target.value })}
                  />
                </div>

                {/* Severity */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Severity</label>
                  <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
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
                </div>

                {/* Min Confidence */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Min Confidence</label>
                  <Input
                    placeholder="0.0 – 1.0"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={filters.confidence_min}
                    onChange={(e) => setFilters({ ...filters, confidence_min: e.target.value })}
                  />
                </div>

                {/* Training Ready Toggle */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Training Ready</label>
                  <Button
                    variant={filters.training_ready_only ? "default" : "outline"}
                    onClick={() => setFilters({ ...filters, training_ready_only: !filters.training_ready_only })}
                    className={filters.training_ready_only ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                  >
                    {filters.training_ready_only ? "✓ Only Ready" : "All Cases"}
                  </Button>
                </div>

                {/* Apply */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 invisible">Apply</label>
                  <Button onClick={fetchDatasetExplorer} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>

              {/* Active institution chip */}
              {filters.institution && filters.institution !== "all" && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Filtering by institution:</span>
                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                    <Building2 className="w-3 h-3" />
                    {filters.institution}
                    <button
                      onClick={() => setFilters({ ...filters, institution: "all", page: 1 })}
                      className="ml-1 text-indigo-400 hover:text-indigo-700"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              )}
            </Card>

            {/* Dataset Table */}
            <Card className="p-6 bg-white border-gray-200">
              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <Database className="w-10 h-10 mx-auto mb-2 animate-pulse opacity-40" />
                  <p className="text-sm">Loading dataset...</p>
                </div>
              ) : (
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
                      {datasetRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                            No records match the selected filters.
                          </td>
                        </tr>
                      ) : datasetRows.map((row) => (
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
                                <span className="text-gray-800 capitalize font-medium">{row.severity}</span>
                              ) : "—"}
                            </td>
                            <td className="p-3">
                              {row.confidence_score !== null ? (
                                <span className="text-gray-800 font-medium">{row.confidence_score.toFixed(2)}</span>
                              ) : "—"}
                            </td>
                            <td className="p-3">
                              {row.practitioner_institution ? (
                                <span className="inline-flex items-center gap-1 text-indigo-700 font-medium text-xs">
                                  <Building2 className="w-3 h-3 shrink-0" />
                                  {row.practitioner_institution}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="p-3">
                              <span className="text-gray-800 capitalize font-medium">{row.review_status}</span>
                            </td>
                            <td className="p-3">
                              <span className={`font-medium ${row.review_status === 'final' ? 'text-green-600' : 'text-red-500'}`}>
                                {row.review_status === 'final' ? '✓ Yes' : '✗ No'}
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
                                      <div className="flex items-center gap-1"><strong>Institution:</strong>
                                        {row.practitioner_institution ? (
                                          <span className="inline-flex items-center gap-1 text-indigo-700 font-medium ml-1">
                                            <Building2 className="w-3 h-3" />{row.practitioner_institution}
                                          </span>
                                        ) : " —"}
                                      </div>
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
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}