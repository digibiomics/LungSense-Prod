import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";

export default function DiagnosticResults() {
  const diagnosticData = [
    {
      name: "Chronic Obstructive Pulmonary Disease (COPD)",
      description:
        "AI detected significant airflow limitation and inflammation.",
      confidence: 85,
      severity: "high",
    },
    {
      name: "Lung Cancer",
      description:
        "Indications of localized lung infection with fluid accumulation.",
      confidence: 65,
      severity: "medium",
    },
    {
      name: "Pneumonia",
      description:
        "Small, round-oss nodules identified; further investigation recommended.",
      confidence: 60,
      severity: "medium",
    },
  ];

  const probabilityData = [
    { name: "COPD", value: 85 },
    { name: "Asthma", value: 78 },
    { name: "Nodules", value: 60 },
  ];

  // infection % for glass card — consistent on each render
  const randomPercent = useMemo(() => Math.floor(Math.random() * 40) + 50, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 md:ml-64 bg-white-100 text-black">
        <div className="p-4 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-display">
              AI Diagnostic Results
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white-800 rounded-lg transition-colors">
                <AlertCircle className="w-6 h-6" />
              </button>

              <div className="w-10 h-10 bg-white-700 rounded-full flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  alt="User"
                  className="w-full h-full rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">

              {/* Diagnostic Summary */}
              <div>
                <h2 className="text-2xl font-bold mb-6 font-display">
                  Diagnostic Summary
                </h2>

                <div className="space-y-4">
                  {diagnosticData.map((diagnosis, index) => (
                    <Card
                      key={index}
                      className={`p-5 bg-gray-800 border-l-4 ${
                        diagnosis.severity === "high"
                          ? "border-red-500"
                          : diagnosis.severity === "medium"
                            ? "border-yellow-500"
                            : "border-green-500"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-black font-display text-lg">
                          {diagnosis.name}
                        </h3>

                        <span
                          className={`text-sm font-semibold ${
                            diagnosis.severity === "high"
                              ? "text-red-400"
                              : diagnosis.severity === "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          Confidence: {diagnosis.confidence}%
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm font-dm">
                        {diagnosis.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              {/*  LUNG SCAN WITH HIGHLIGHT + GLASS CARD SECTION   */}

              <div>
                <h2 className="text-2xl font-bold mb-6 font-display">
                  Lung Scan Analysis
                </h2>

                <div className="relative w-[430px] mx-auto">
                  {/* Lung Image */}
                  <img
                    src="/images/lung-xray.png"
                    alt="Lung XRay"
                    className="w-full rounded-xl opacity-90"
                  />

                  {/* Red Highlight (random infection area mock) */}
                  <div
                    className="absolute rounded-full bg-red-500 opacity-40 blur-xl"
                    style={{
                      width: "130px",
                      height: "130px",
                      top: "150px",
                      left: "140px",
                    }}
                  />

                  {/* Connector Line */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <line
                      x1="205"
                      y1="215"
                      x2="345"
                      y2="250"
                      stroke="white"
                      strokeWidth="2"
                      strokeOpacity="0.7"
                    />
                    <circle cx="205" cy="215" r="6" fill="white" opacity="0.9" />
                  </svg>

                  {/* Glass Card */}
                  <div
                    className="
                      absolute top-[240px] left-[360px]
                      p-4 w-[170px]
                      bg-white/90 backdrop-blur-xl
                      rounded-xl shadow-lg
                      border border-white/30
                    "
                  >
                    <p className="text-sm text-black-100">Infection Level</p>

                    <p className="text-xs text-black-200 mt-1">
                      Status: <span className="font-semibold">Moderate</span>
                    </p>

                    <p className="mt-2 text-3xl font-bold text-black">
                      {randomPercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 font-display">
                  How the AI Derived This Result
                </h2>

                <Card className="p-6 bg-gray-100 border-white-700">
                  <p className="text-gray-900 mb-6 font-dm">
                    Our advanced AI models analyze a multimodal dataset
                    including high-resolution lung CT scans, acoustic patterns,
                    and clinical parameters. This enables deep insight into lung
                    function and structural health.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-black mb-2 font-display">
                        Scan Analysis
                      </h3>
                      <p className="text-white-400 text-sm font-dm">
                        Deep learning models detect abnormalities such as
                        nodules, infiltrates, and structural deformities. Areas
                        with potential concern are highlighted using overlays.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-black mb-2 font-display">
                        Acoustic Biomarkers
                      </h3>
                      <p className="text-gray-900 text-sm font-dm">
                        AI analyzes cough and breath spectral signatures to
                        differentiate between respiratory diseases.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-black mb-2 font-display">
                        Clinical Data Integration
                      </h3>
                      <p className="text-gray-900 text-sm font-dm">
                        Clinical history and environmental exposure data improve
                        accuracy and contextual relevance of diagnostic output.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <Card className="p-6 bg-white-800 border-gray-700">
                <h3 className="text-xl font-semibold mb-2 font-display">
                  Disease Probability Distribution
                </h3>

                <div className="space-y-4">
                  {probabilityData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300 font-dm">
                          {item.name}
                        </span>
                        <span className="text-sm font-semibold text-lungsense-blue">
                          {item.value}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-700 rounded-full h-8">
                        <div
                          className="bg-lungsense-blue h-8 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${item.value}%` }}
                        >
                          <span className="text-xs text-white font-semibold">
                            {item.value}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-gray-800 border-gray-700">
                <h3 className="text-xl font-semibold mb-2 font-display">
                  Download Comprehensive Report
                </h3>

                <Button className="w-full bg-lungsense-blue hover:bg-lungsense-blue/90">
                  <Download className="w-5 h-5 mr-2" />
                  Download Report
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-lungsense-blue/20 border-lungsense-blue">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-white mb-2 font-display">
                      Important Notice
                    </h3>
                    <p className="text-gray-300 text-sm font-dm">
                      This AI analysis is for informational purposes only.
                      Please consult a licensed healthcare professional for a
                      medical diagnosis.
                    </p>
                  </div>
                </div>

                <Link to="/patient/recommendations">
                  <Button className="w-full bg-white text-gray-600 hover:bg-gray-100 font-display">
                    View Personalized Recommendations
                  </Button>
                </Link>
              </Card>
            </div>
          </div>

          <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © 2025 Lung Sense. DigiRomics.
          </footer>
        </div>
      </main>
    </div>
  );
}
