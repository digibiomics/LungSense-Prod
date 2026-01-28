import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPractitionerCases, getPractitionerStats } from "../../src/api";

interface CaseRecord {
  id: number;
  patient_name: string;
  catalog_number: string;
  status: string;
  created_at: string;
  last_review_date?: string;
  primary_diagnosis?: string;
}

interface DashboardStats {
  total_cases: number;
  pending_review: number;
  reviewed_cases: number;
  completion_rate: number;
}

export default function PractitionerPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCasesAndStats();
  }, []);

  const fetchCasesAndStats = async () => {
    try {
      setLoading(true);
      
      // Fetch cases and stats in parallel
      const [casesResponse, statsResponse] = await Promise.all([
        getPractitionerCases(),
        getPractitionerStats()
      ]);
      
      if (casesResponse.status === 'success') {
        console.log('Full cases response:', casesResponse);
        console.log('Cases data:', casesResponse.data);
        const casesArray = casesResponse.data?.cases || casesResponse.data || [];
        console.log('Cases array:', casesArray);
        setCases(Array.isArray(casesArray) ? casesArray : []);
      }
      
      if (statsResponse.status === 'success') {
        setStats(statsResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = Array.isArray(cases) ? cases.filter(
    (case_item) =>
      case_item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_item.catalog_number.toLowerCase().includes(searchTerm.toLowerCase()),
  ) : [];

  const handleViewCase = (case_item: CaseRecord) => {
    navigate(`/practitioner/case/${case_item.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reviewed":
        return "bg-green-100 text-green-800 border-green-300";
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reviewed":
        return <CheckCircle className="w-4 h-4" />;
      case "submitted":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lungsense-blue mx-auto mb-4"></div>
            <p className="text-gray-600 font-dm">Loading cases...</p>
          </div>
        </main>
      </div>
    );
  }

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
              Patient Cases
            </h1>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center text-white font-bold">
              ©
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-dm">Total Cases</p>
                    <p className="text-2xl font-bold text-gray-900 font-display">{stats.total_cases}</p>
                  </div>
                  <FileText className="w-8 h-8 text-lungsense-blue" />
                </div>
              </Card>
              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-dm">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600 font-display">{stats.pending_review}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </Card>
              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-dm">Reviewed</p>
                    <p className="text-2xl font-bold text-green-600 font-display">{stats.reviewed_cases}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-dm">Completion Rate</p>
                    <p className="text-2xl font-bold text-lungsense-blue font-display">{stats.completion_rate}%</p>
                  </div>
                  <div className="w-8 h-8 bg-lungsense-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                    %
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 px-4 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by patient name or catalog number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus:ring-0 font-dm"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-dm">{error}</p>
            </div>
          )}

          {/* Cases List */}
          <div className="grid gap-4">
            {filteredCases.length > 0 ? (
              filteredCases.map((case_item) => (
                <Card
                  key={case_item.id}
                  className="p-6 hover:shadow-lg transition-shadow border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-lungsense-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {case_item.patient_name[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 font-display">
                            {case_item.patient_name} - #{case_item.catalog_number}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-600 font-dm font-semibold mb-1">
                            Submitted
                          </p>
                          <p className="text-sm text-gray-900 font-display">
                            {new Date(case_item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-600 font-dm font-semibold mb-1">
                            Status
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(
                              case_item.status,
                            )}`}
                          >
                            {getStatusIcon(case_item.status)}
                            {case_item.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-600 font-dm font-semibold mb-1">
                            Diagnosis
                          </p>
                          <p className="text-sm text-gray-900 font-display">
                            {case_item.primary_diagnosis || "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewCase(case_item)}
                      className="bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display font-medium ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Case
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2 font-display">
                  No Cases Found
                </h3>
                <p className="text-gray-500 font-dm">
                  {searchTerm ? "Try adjusting your search criteria" : "No cases assigned yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
