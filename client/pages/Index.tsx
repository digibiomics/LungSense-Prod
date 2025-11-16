import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-lungsense-blue" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight">
              LungSense
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20 flex-1">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left: Text + CTA */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-display leading-tight">
              Advanced AI-Powered<br />Lung Health Analysis
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl italic font-display">
              Some information about the product. Advanced respiratory diagnostics using cutting-edge AI technology for accurate health assessments.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
              <div className="p-4 bg-lungsense-blue-light rounded-lg text-center">
                <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 font-display">X-Ray Analysis</h3>
                <p className="text-sm text-gray-600">Upload and analyze chest X-rays with AI precision</p>
              </div>

              <div className="p-4 bg-lungsense-green/10 rounded-lg text-center">
                <div className="w-10 h-10 bg-lungsense-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 font-display">Sound Recording</h3>
                <p className="text-sm text-gray-600">Record and analyze chest and cough sounds</p>
              </div>

              <div className="p-4 bg-lungsense-yellow/10 rounded-lg text-center">
                <div className="w-10 h-10 bg-lungsense-yellow rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 font-display">AI Diagnosis</h3>
                <p className="text-sm text-gray-600">Get instant AI-powered health insights</p>
              </div>
            </div>

            <div className="pt-6 text-center">
              <Link to="/select-role">
                <Button
                  size="lg"
                  className="bg-lungsense-blue hover:bg-lungsense-blue/90 text-white px-12 py-6 text-lg font-display font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="pt-6 text-sm text-gray-500 max-w-xl">
              <p>
                LungSense uses advanced machine learning models to provide preliminary health assessments. Always consult with healthcare professionals for medical advice.
              </p>
            </div>
          </div>

          {/* Right: Static image */}
          <div className="w-full h-[420px] md:h-[560px] flex items-center justify-center">
            <img
              src="/images/lungs-illustration.png"
              alt="Healthy lungs illustration"
              className="object-contain w-full h-full rounded-2xl shadow-lg"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2024 LungSense. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
