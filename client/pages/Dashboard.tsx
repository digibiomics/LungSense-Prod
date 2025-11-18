import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart, HeartPulse, Wind, Thermometer } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

export default function LungDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pl-24 md:pl-72 transition-all">
      {/* Sidebar */}
      <Sidebar />

      <div className="max-w-7xl mx-auto space-y-10">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Your Lung Health Dashboard
        </h1>


        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Oxygen Level */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Oxygen Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">97%</p>
              <p className="text-xs text-gray-500 mt-2">Normal Range</p>
            </CardContent>
          </Card>

          {/* Respiratory Rate */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Respiratory Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">18</p>
              <p className="text-xs text-gray-500 mt-2">breaths/min</p>
            </CardContent>
          </Card>

          {/* Lung Score */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold">89%</div>
              <p className="text-sm text-gray-500">Lung Health Score</p>
            </div>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Lung Placeholder */}
          <Card className="md:col-span-2 backdrop-blur-xl bg-white shadow-md h-80 flex items-center justify-center">
            <img
              src="/images/lung-dashboard.jpg"
              alt="Healthy lungs illustration"
              className="object-contain w-full h-full rounded-2xl shadow-lg"
            />

          </Card>

          {/* Body Placeholder */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-36 h-64 bg-gray-200 rounded-xl mx-auto" />
              <p className="text-gray-500 mt-4">Body Placeholder</p>
            </div>
          </Card>
        </div>

        {/* Lower Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Lungs Status */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-16 h-16 bg-blue-200 rounded-lg" />
              <div>
                <h3 className="text-lg font-semibold">Lungs</h3>
                <p className="text-sm text-green-600 font-medium">Normal</p>
              </div>
            </CardContent>
          </Card>

          {/* Blood Oxygen */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Blood Oxygen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">102</p>
              <p className="text-xs text-gray-500 mt-2">SpO₂ Index</p>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">37.2°</p>
              <p className="text-xs text-gray-500 mt-2">Body Temp</p>
            </CardContent>
          </Card>

          {/* Breathing Pattern */}
          <Card className="backdrop-blur-xl bg-white/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Breathing Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">Stable</p>
              <p className="text-xs text-gray-500 mt-2">No abnormalities</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}