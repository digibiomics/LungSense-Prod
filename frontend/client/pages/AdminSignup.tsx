import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createAdminUser } from "../../src/api";

export default function AdminSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user is super admin
  const userRole = localStorage.getItem("user_role");
  if (userRole !== "super_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">Only Super Admins can create admin accounts.</p>
            <Button onClick={() => navigate("/admin/dashboard")} className="bg-red-600 hover:bg-red-700">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await createAdminUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      });

      setSuccess(`Admin user created successfully! User ID: ${response.id}`);
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        role: ""
      });

    } catch (err: any) {
      setError(err.message || "Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Create Admin User
          </h1>
          <p className="text-gray-600 font-dm mt-2">
            Add new administrator to the system
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600 text-sm font-dm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-green-600 text-sm font-dm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-gray-700 font-display">
              Full Name
            </Label>
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="mt-1 font-dm"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 font-display">
              Email Address
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1 font-dm"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 font-display">
              Admin Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select admin role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin - Full System Access</SelectItem>
                <SelectItem value="data_admin">Data Admin - ML Training & Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 font-display">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pr-10 font-dm"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 font-display">
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="pr-10 font-dm"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.role}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-display font-semibold"
          >
            {loading ? "Creating Admin..." : "Create Admin User"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-800 font-dm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </button>
        </div>
      </Card>
    </div>
  );
}