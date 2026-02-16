import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  FileText, 
  Database, 
  BarChart3, 
  Settings, 
  Download, 
  UserPlus,
  LogOut,
  Brain,
  Activity
} from "lucide-react";

interface AdminStats {
  // Super Admin stats
  total_users?: number;
  total_cases?: number;
  total_files?: number;
  total_reviews?: number;
  patients?: number;
  practitioners?: number;
  pending_cases?: number;
  system_health?: string;
  
  // Data Admin stats
  reviewed_cases?: number;
  training_ready_cases?: number;
  file_types?: Array<[string, number]>;
  data_quality_score?: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get current user info
  const userRole = localStorage.getItem("user_role");
  const userEmail = localStorage.getItem("user_email");
  const isSuper = userRole === "super_admin";
  const isDataAdmin = userRole === "data_admin";

  // Redirect based on role
  useEffect(() => {
    if (isSuper) {
      navigate("/admin/super-dashboard");
    } else if (isDataAdmin) {
      navigate("/admin/data-dashboard");
    }
  }, [isSuper, isDataAdmin, navigate]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/admin/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data.data);
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
    navigate("auth/admin/login");
  };

  const exportTrainingData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/admin/training-data?format=json&anonymize=true", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to export training data");
      }

      const data = await response.json();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">
                  {isSuper ? "Super Admin" : "Data Admin"} Dashboard
                </h1>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isSuper && (
                <Button
                  onClick={() => navigate("/admin/signup")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
              )}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isSuper ? (
            // Super Admin Stats
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cases</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_cases || 0}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.pending_cases || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-yellow-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-lg font-semibold text-green-600">{stats?.system_health || "Unknown"}</p>
                  </div>
                  <Settings className="w-8 h-8 text-gray-600" />
                </div>
              </Card>
            </>
          ) : (
            // Data Admin Stats
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Training Ready</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.training_ready_cases || 0}</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Files</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_files || 0}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Data Quality</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.data_quality_score || 0}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reviewed Cases</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.reviewed_cases || 0}</p>
                  </div>
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSuper && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Management</h3>
              <p className="text-gray-600 mb-4">Manage system users and permissions</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Card>
          )}

          {(isSuper || isDataAdmin) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Training Data Export</h3>
              <p className="text-gray-600 mb-4">Export anonymized data for ML training</p>
              <Button 
                onClick={exportTrainingData}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </Card>
          )}

          {isDataAdmin && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Model Analytics</h3>
              <p className="text-gray-600 mb-4">View training metrics and model performance</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Card>
          )}

          {isSuper && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Settings</h3>
              <p className="text-gray-600 mb-4">Configure system parameters and settings</p>
              <Button className="w-full bg-gray-600 hover:bg-gray-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Card>
          )}
        </div>

        {/* File Types Distribution (Data Admin) */}
        {isDataAdmin && stats?.file_types && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">File Types Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {stats.file_types.map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}