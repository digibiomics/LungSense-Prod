import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Calendar, MapPin, Heart, Building, LogOut, Edit, Save, X, Plus, Trash2, Users } from 'lucide-react';
import tokenManager from '@/lib/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture_url?: string;
  age?: number;
  sex?: string;
  ethnicity?: string;
  country?: string;
  province?: string;
  respiratory_history?: string[];
  practitioner_id?: string;
  institution?: string;
  institution_location_country?: string;
  institution_location_province?: string;
  created_at: string;
}

interface SubUser {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  sex: string;
  ethnicity: string;
  country: string;
  province: string;
  respiratory_history: string[];
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [editingSubUser, setEditingSubUser] = useState<number | null>(null);
  const [editedSubUser, setEditedSubUser] = useState<SubUser | null>(null);

  const userRole = localStorage.getItem('user_role');
  const userName = localStorage.getItem('user_name');
  const userEmail = localStorage.getItem('user_email');
  const profilePicture = localStorage.getItem('profile_picture');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        toast.error('User not found');
        navigate('/select-role');
        return;
      }

      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/user/${userId}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/select-role');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.data);

      if (userRole === 'patient') {
        fetchSubUsers();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubUsers = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/patient/${userId}/sub-users`
      );

      if (response.ok) {
        const data = await response.json();
        setSubUsers(data.data?.sub_users || []);
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/select-role');
      }
    } catch (error) {
      console.error('Error fetching sub-users:', error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      
      const updateData = {
        age: profile.age,
        sex: profile.sex,
        ethnicity: profile.ethnicity,
        respiratory_history: profile.respiratory_history
      };

      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/user/${profile.id}/dashboard`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCondition = () => {
    if (!newCondition.trim() || !profile) return;
    
    const updatedHistory = [...(profile.respiratory_history || []), newCondition.trim()];
    setProfile({ ...profile, respiratory_history: updatedHistory });
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    if (!profile) return;
    const updatedHistory = profile.respiratory_history?.filter((_, i) => i !== index) || [];
    setProfile({ ...profile, respiratory_history: updatedHistory });
  };

  const handleEditSubUser = (subUser: SubUser) => {
    setEditingSubUser(subUser.id);
    setEditedSubUser({ ...subUser });
  };

  const handleSaveSubUser = async () => {
    if (!editedSubUser) return;

    try {
      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/patient/sub-user/${editedSubUser.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            first_name: editedSubUser.first_name,
            last_name: editedSubUser.last_name,
            age: editedSubUser.age
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update family member');

      toast.success('Family member updated successfully');
      setEditingSubUser(null);
      setEditedSubUser(null);
      fetchSubUsers();
    } catch (error) {
      console.error('Error updating sub-user:', error);
      toast.error('Failed to update family member');
    }
  };

  const handleDeleteSubUser = async (subUserId: number) => {
    if (!confirm('Are you sure you want to delete this family member?')) return;

    try {
      const response = await tokenManager.makeAuthenticatedRequest(
        `${API_BASE_URL}/patient/sub-user/${subUserId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) throw new Error('Failed to delete family member');

      toast.success('Family member deleted successfully');
      fetchSubUsers();
    } catch (error) {
      console.error('Error deleting sub-user:', error);
      toast.error('Failed to delete family member');
    }
  };

  const handleLogout = async () => {
    try {
      await tokenManager.logout();
      navigate('/select-role');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/select-role');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-blue-500 text-white';
      case 'practitioner': return 'bg-green-500 text-white';
      case 'data_admin': return 'bg-purple-500 text-white';
      case 'super_admin': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-lungsense-blue mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-display">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => confirm('Are you sure you want to delete your account? This action cannot be undone.') && toast.error('Account deletion feature coming soon')}
                variant="outline"
                className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Profile Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-lungsense-blue to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profilePicture || ''} alt={userName || ''} />
                    <AvatarFallback className="text-2xl bg-white text-lungsense-blue font-bold">
                      {profile ? getInitials(profile.first_name, profile.last_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-3xl font-display">{userName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-blue-100">{userEmail}</span>
                    </div>
                    <Badge className={`mt-3 ${getRoleColor(userRole || '')} px-3 py-1`}>
                      {userRole?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-lungsense-blue hover:bg-blue-50"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                      className="bg-white/20 border-white text-white hover:bg-white/30"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="sm"
                      className="bg-white text-lungsense-blue hover:bg-blue-50"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                  <User className="w-6 h-6 text-lungsense-blue" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700 font-semibold">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={profile?.age || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
                        min="18"
                        className="border-gray-300"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-lg">{profile?.age || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-gray-700 font-semibold">Sex</Label>
                    {isEditing ? (
                      <select
                        id="sex"
                        value={profile?.sex || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, sex: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium text-lg">
                        {profile?.sex === 'M' ? 'Male' : profile?.sex === 'F' ? 'Female' : profile?.sex === 'O' ? 'Other' : 'Not specified'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ethnicity" className="text-gray-700 font-semibold">Ethnicity</Label>
                    {isEditing ? (
                      <select
                        id="ethnicity"
                        value={profile?.ethnicity || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, ethnicity: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select</option>
                        <option value="AFR">African</option>
                        <option value="ASN">Asian</option>
                        <option value="CAU">Caucasian</option>
                        <option value="HIS">Hispanic</option>
                        <option value="NAM">Native American</option>
                        <option value="PAC">Pacific Islander</option>
                        <option value="OTH">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium text-lg">{profile?.ethnicity || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              {profile?.country && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                      <MapPin className="w-6 h-6 text-lungsense-blue" />
                      Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Country</Label>
                        <p className="text-gray-900 font-medium text-lg">{profile.country}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Province/State</Label>
                        <p className="text-gray-900 font-medium text-lg">{profile.province || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Respiratory History - Only for patients */}
              {userRole === 'patient' && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                      <Heart className="w-6 h-6 text-red-500" />
                      Respiratory History
                    </h3>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">Medical & Family History - Check all that apply to you or your immediate family.</p>
                        <div className="space-y-2">
                          {[
                            { key: 'COPD', label: 'COPD' },
                            { key: 'ASTHMA', label: 'Asthma' },
                            { key: 'TB', label: 'Tuberculosis (TB)' },
                            { key: 'CF', label: 'Cystic Fibrosis (CF)' },
                            { key: 'SMOKER', label: 'Current or Former Smoker' },
                            { key: 'WORK_EXPOSURE', label: 'Occupational Exposure (e.g., Mines, Mining, Industrial Dust)' },
                            { key: 'NONE', label: 'None of the above' }
                          ].map(item => (
                            <label
                              key={item.key}
                              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={profile?.respiratory_history?.includes(item.key) || false}
                                onChange={() => {
                                  if (!profile) return;
                                  const history = [...(profile.respiratory_history || [])];
                                  if (item.key === 'NONE') {
                                    setProfile({ ...profile, respiratory_history: history.includes('NONE') ? [] : ['NONE'] });
                                  } else {
                                    const filtered = history.filter(h => h !== 'NONE');
                                    if (filtered.includes(item.key)) {
                                      setProfile({ ...profile, respiratory_history: filtered.filter(h => h !== item.key) });
                                    } else {
                                      setProfile({ ...profile, respiratory_history: [...filtered, item.key] });
                                    }
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile?.respiratory_history && profile.respiratory_history.length > 0 ? (
                          profile.respiratory_history.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No respiratory conditions recorded</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Practitioner Info */}
              {userRole === 'practitioner' && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                      <Building className="w-6 h-6 text-lungsense-blue" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Practitioner ID</Label>
                        <p className="text-gray-900 font-medium text-lg">{profile?.practitioner_id || 'Not specified'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Institution</Label>
                        <p className="text-gray-900 font-medium text-lg">{profile?.institution || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}


            </CardContent>
          </Card>

          {/* Family Members */}
          {userRole === 'patient' && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-lungsense-blue to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl font-display">
                  <Users className="w-6 h-6" />
                  Family Members
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {subUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subUsers.map((subUser) => (
                      <Card key={subUser.id} className="border-2 border-gray-200 hover:border-lungsense-blue transition-all shadow-md">
                        <CardContent className="p-5">
                          {editingSubUser === subUser.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">First Name</Label>
                                  <Input
                                    value={editedSubUser?.first_name || ''}
                                    onChange={(e) => setEditedSubUser(prev => prev ? {...prev, first_name: e.target.value} : null)}
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Last Name</Label>
                                  <Input
                                    value={editedSubUser?.last_name || ''}
                                    onChange={(e) => setEditedSubUser(prev => prev ? {...prev, last_name: e.target.value} : null)}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Age</Label>
                                <Input
                                  type="number"
                                  value={editedSubUser?.age || ''}
                                  onChange={(e) => setEditedSubUser(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
                                  className="h-8"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveSubUser} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button onClick={() => setEditingSubUser(null)} size="sm" variant="outline" className="flex-1">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">{subUser.first_name} {subUser.last_name}</h4>
                                  <Badge className="mt-1 bg-blue-100 text-blue-800">Family Member</Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => handleEditSubUser(subUser)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-blue-100"
                                  >
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteSubUser(subUser.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Age:</span>
                                  <span className="font-semibold text-gray-900">{subUser.age} years</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sex:</span>
                                  <span className="font-semibold text-gray-900">{subUser.sex === 'M' ? 'Male' : subUser.sex === 'F' ? 'Female' : 'Other'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Ethnicity:</span>
                                  <span className="font-semibold text-gray-900">{subUser.ethnicity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Location:</span>
                                  <span className="font-semibold text-gray-900">{subUser.province}, {subUser.country}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Family Members</h3>
                    <p className="text-gray-500">Add family members from the dashboard to manage their health records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
