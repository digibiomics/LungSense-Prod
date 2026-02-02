import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Users, FileText, Activity, Settings, LogOut, UserPlus,
  Clock, AlertCircle, CheckCircle, XCircle, UserCog, Building
} from "lucide-react";

interface SystemStats {
  total_users: number;
  total_sub_users: number;
  total_practitioners: number;
  active_cases: number;
  unassigned_cases: number;
  draft_cases: number;
  submitted_cases: number;
  reviewed_cases: number;
  final_cases: number;
  file_upload_success_rate: number;
}

interface CaseRow {
  id: number;
  catalog_number: string;
  status: string;
  practitioner_id: number | null;
  practitioner_name: string | null;
  practitioner_db_id: number | null;
  auto_assigned: boolean;
  created_at: string;
  sla_hours: number;
  priority: string;
}

interface PractitionerRow {
  id: number;
  full_name: string;
  practitioner_id: string | null;
  institution: string | null;
  active_cases: number;
  pending_review: number;
  avg_review_time: number | null;
  draft_count: number;
  final_count: number;
  is_active: boolean;
}

interface UserRow {
  id: number;
  type: string;
  full_name: string;
  role: string;
  owner_id: number | null;
  owner_name: string | null;
  is_active: boolean;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [practitioners, setPractitioners] = useState<PractitionerRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  // Assignment state
  const [selectedPractitioner, setSelectedPractitioner] = useState<{[key: number]: number}>({});

  // Filter states
  const [caseFilters, setCaseFilters] = useState({
    status: "all",
    assigned: "all",
    page: 1,
    limit: 50
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchSystemStats();
  }, []);

  useEffect(() => {
    if (activeTab === "cases") {
      fetchCases();
      fetchPractitioners(); // Fetch practitioners for dropdown
    }
    if (activeTab === "practitioners") fetchPractitioners();
    if (activeTab === "users") fetchUsers();
  }, [activeTab, caseFilters]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/admin/super/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: caseFilters.page.toString(),
        limit: caseFilters.limit.toString(),
        ...(caseFilters.status !== "all" && { status: caseFilters.status }),
        ...(caseFilters.assigned !== "all" && { assigned: caseFilters.assigned })
      });
      const response = await fetch(`http://localhost:8000/api/admin/super/cases?${params}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch cases");
      const data = await response.json();
      setCases(data.data.cases);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/admin/super/practitioners", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch practitioners");
      const data = await response.json();
      setPractitioners(data.data.practitioners);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/admin/super/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const assignCase = async (caseId: number, practitionerId: number) => {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/admin/super/cases/${caseId}/assign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ practitioner_id: practitionerId })
      });
      if (!response.ok) throw new Error("Failed to assign case");
      setSuccess("Case assigned successfully!");
      fetchCases();
      fetchSystemStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePractitionerStatus = async (practitionerId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/admin/super/practitioners/${practitionerId}/toggle`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to toggle status");
      fetchPractitioners();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleUserStatus = async (userId: number, type: string) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = type === "sub_user" 
        ? `http://localhost:8000/api/admin/super/sub-users/${userId}/toggle`
        : `http://localhost:8000/api/admin/super/users/${userId}/toggle`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to toggle status");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
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
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/admin/signup")}
                className="bg-red-600 hover:bg-red-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
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
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              System Health
            </TabsTrigger>
            <TabsTrigger 
              value="cases"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Case Assignment
            </TabsTrigger>
            <TabsTrigger 
              value="practitioners"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Practitioners
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              User Management
            </TabsTrigger>
          </TabsList>

          {/* 1️⃣ SYSTEM HEALTH OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-sm text-gray-600">Sub Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_sub_users || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Practitioners</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_practitioners || 0}</p>
                  </div>
                  <UserCog className="w-8 h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Cases</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.active_cases || 0}</p>
                    <p className="text-xs text-red-600 mt-1">Unassigned: {stats?.unassigned_cases || 0}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Case Status Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-700">{stats?.draft_cases || 0}</p>
                  <p className="text-sm text-yellow-600">Draft</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-700">{stats?.submitted_cases || 0}</p>
                  <p className="text-sm text-red-600">Submitted</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{stats?.reviewed_cases || 0}</p>
                  <p className="text-sm text-green-600">Reviewed</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 2️⃣ CASE ASSIGNMENT & WORKFLOW */}
          <TabsContent value="cases" className="space-y-6">
            <Card className="p-4">
              <div className="flex gap-4">
                <Select value={caseFilters.status} onValueChange={(value) => setCaseFilters({...caseFilters, status: value})}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={caseFilters.assigned} onValueChange={(value) => setCaseFilters({...caseFilters, assigned: value})}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cases</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Case ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Catalog Number</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Practitioner ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Assigned To</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">SLA Timer</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <span className="font-semibold text-gray-900">{c.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                            {c.catalog_number}
                          </span>
                        </td>
                        <td className="p-4">
                          <span 
                            className={
                              c.status === 'submitted' 
                                ? 'text-red-600 font-semibold' 
                                : c.status === 'reviewed' 
                                ? 'text-green-600 font-semibold' 
                                : c.status === 'draft'
                                ? 'text-yellow-600 font-semibold'
                                : 'text-gray-600 font-semibold'
                            }
                          >
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          {c.practitioner_db_id ? (
                            <span className="font-mono text-sm text-indigo-700 font-semibold">
                              {c.practitioner_db_id}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not Assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-gray-900 font-medium">
                            {c.practitioner_name || <span className="text-gray-400">Unassigned</span>}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={
                            c.status === 'submitted'
                              ? "text-red-600 font-semibold" 
                              : c.status === 'reviewed'
                              ? "text-green-600 font-semibold"
                              : "text-gray-600"
                          }>
                            {c.sla_hours}h
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Select 
                              value={selectedPractitioner[c.id]?.toString() || ""}
                              onValueChange={(value) => {
                                console.log('Selected practitioner:', value);
                                setSelectedPractitioner({...selectedPractitioner, [c.id]: parseInt(value)});
                              }}
                            >
                              <SelectTrigger className="w-48 h-9">
                                <SelectValue placeholder="Select Practitioner" />
                              </SelectTrigger>
                              <SelectContent>
                                {practitioners.length > 0 ? (
                                  practitioners.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.full_name} (ID: {p.id})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    No practitioners available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
                              disabled={!selectedPractitioner[c.id]}
                              onClick={() => {
                                console.log('Assigning case:', c.id, 'to practitioner:', selectedPractitioner[c.id]);
                                if (selectedPractitioner[c.id]) {
                                  assignCase(c.id, selectedPractitioner[c.id]);
                                }
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* 3️⃣ PRACTITIONER MANAGEMENT */}
          <TabsContent value="practitioners" className="space-y-6">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-3 text-base">ID</th>
                      <th className="text-left p-3 text-base">Name</th>
                      <th className="text-left p-3 text-base">Practitioner ID</th>
                      <th className="text-left p-3 text-base">Institution</th>
                      <th className="text-left p-3 text-base">Active Cases</th>
                      <th className="text-left p-3 text-base">Pending Review</th>
                      <th className="text-left p-3 text-base">Avg Review Time</th>
                      <th className="text-left p-3 text-base">Draft/Final</th>
                      <th className="text-left p-3 text-base">Status</th>
                      <th className="text-left p-3 text-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practitioners.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-semibold text-gray-900 text-base">
                            {p.id}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-base">{p.full_name}</td>
                        <td className="p-3 font-mono text-sm">{p.practitioner_id || "—"}</td>
                        <td className="p-3 text-base">{p.institution || "—"}</td>
                        <td className="p-3 text-base">{p.active_cases}</td>
                        <td className="p-3 text-base">
                          <span className={p.pending_review > 0 ? "text-orange-600 font-semibold" : ""}>
                            {p.pending_review}
                          </span>
                        </td>
                        <td className="p-3 text-base">{p.avg_review_time ? `${p.avg_review_time}h` : "—"}</td>
                        <td className="p-3 text-base">
                          <span className="text-yellow-600">{p.draft_count}</span>
                          {" / "}
                          <span className="text-green-600">{p.final_count}</span>
                        </td>
                        <td className="p-3 text-base">
                          <span className={p.is_active ? "text-green-600 font-semibold" : "text-gray-500 font-semibold"}>
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => togglePractitionerStatus(p.id)}>
                            {p.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* 4️⃣ USER & ACCESS MANAGEMENT */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Full Name</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Owner ID</th>
                      <th className="text-left p-3">Owner Name</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={`${u.type}-${u.id}`} className={`border-b hover:bg-gray-50 ${u.type === 'sub_user' ? 'bg-blue-50' : ''}`}>
                        <td className="p-3">{u.id}</td>
                        <td className="p-3 font-medium">{u.full_name}</td>
                        <td className="p-3">
                          <Badge variant={u.type === 'sub_user' ? 'secondary' : 'default'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-3">{u.owner_id || "—"}</td>
                        <td className="p-3">{u.owner_name || "—"}</td>
                        <td className="p-3">
                          <Badge variant={u.is_active ? "default" : "secondary"}>
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id, u.type)}>
                            {u.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
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
