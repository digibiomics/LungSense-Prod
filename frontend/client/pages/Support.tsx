import React, { useState } from 'react';
import { createSupportTicket } from '../../src/api';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Headphones, Mail, MessageSquare, Send } from 'lucide-react';

const Support = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    email: localStorage.getItem('user_email') || '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await createSupportTicket(formData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'technical',
        email: localStorage.getItem('user_email') || '',
        priority: 'medium'
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-lungsense-blue rounded-full flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-display">Support Center</h1>
              <p className="text-gray-600 mt-1">We're here to help you with any questions or issues</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Ticket Submitted Successfully!</p>
                  <p className="text-sm text-green-700 mt-1">Our support team will get back to you within 24-48 hours.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Submission Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Support Form Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-lungsense-blue to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-display flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Submit a Support Ticket
              </CardTitle>
              <CardDescription className="text-blue-100">
                Fill out the form below and our team will respond as soon as possible
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-700 font-dm font-bold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-lungsense-blue" />
                    Contact Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-300 focus:border-lungsense-blue focus:ring-lungsense-blue"
                    placeholder="your.email@example.com"
                  />
                  <p className="text-xs text-gray-500">We'll use this email to respond to your ticket</p>
                </div>

                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs uppercase tracking-wider text-gray-700 font-dm font-bold">
                    Issue Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    minLength={5}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-gray-300 focus:border-lungsense-blue focus:ring-lungsense-blue"
                    placeholder="Brief summary of your issue"
                  />
                  <p className="text-xs text-gray-500">Minimum 5 characters</p>
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs uppercase tracking-wider text-gray-700 font-dm font-bold">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lungsense-blue focus:border-transparent font-display"
                  >
                    <option value="technical"> Technical Issue</option>
                    <option value="billing"> Billing</option>
                    <option value="account"> Account</option>
                    <option value="feature"> Feature Request</option>
                    <option value="other"> Other</option>
                  </select>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs uppercase tracking-wider text-gray-700 font-dm font-bold">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    required
                    minLength={10}
                    rows={8}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-gray-300 focus:border-lungsense-blue focus:ring-lungsense-blue resize-none"
                    placeholder="Please provide as much detail as possible about your issue, including any error messages, steps to reproduce, or screenshots you may have..."
                  />
                  <p className="text-xs text-gray-500">Minimum 10 characters - The more details you provide, the faster we can help</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display font-semibold py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Submitting Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Support Ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Info Card */}
          <Card className="border-lungsense-blue/30 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-lungsense-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-lungsense-blue" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 font-display">Need Immediate Assistance?</h3>
                  <p className="text-sm text-gray-700">
                    For urgent medical concerns, please contact your healthcare provider immediately. 
                    This support system is for technical and account-related issues only.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Response Time:</strong> We typically respond within 24-48 hours during business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Support;
