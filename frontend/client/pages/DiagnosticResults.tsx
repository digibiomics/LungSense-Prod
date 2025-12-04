import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  AlertCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
// Imports for the Histogram
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Histogram Helper Data ---
const generateAcousticData = () => {
  const data = [];
  for (let i = 0; i < 40; i++) {
    const frequency = 100 + (i * 50);
    const randomVar = Math.random() * 20;
    const amplitude = 40 + Math.sin(i / 5) * 30 + (i > 15 && i < 25 ? 40 : 0) + randomVar;
    data.push({
      frequency: `${frequency}Hz`,
      amplitude: Math.max(10, Math.floor(amplitude)),
    });
  }
  return data;
};
const acousticData = generateAcousticData();

export default function DiagnosticResults() {
  const diagnosticData = [
    {
      name: "Chronic Obstructive Pulmonary Disease (COPD)",
      description: "AI detected significant airflow limitation and inflammation.",
      confidence: 85,
      severity: "high",
    },
    {
      name: "Pneumonia",
      description: "Indications of localized lung infection with fluid accumulation.",
      confidence: 65,
      severity: "medium",
    },
    {
      name: "Lung Cancer",
      description: "Small, round-oss nodules identified; further investigation recommended.",
      confidence: 60,
      severity: "medium",
    },
  ];

  const randomPercent = useMemo(() => Math.floor(Math.random() * 40) + 50, []);

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)]">
      <Sidebar />

      <main className="flex-1 md:ml-64 bg-white-100 text-black">
        <div className="p-4 md:p-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold font-display">
              Diagnostic Results
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

          {/* =========================================================
              SECTION 1: SUMMARY
             ========================================================= */}
          <div>
            <h2 className="text-2xl font-bold mb-4 font-display">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {diagnosticData.map((diagnosis, index) => (
                <Card
                  key={index}
                  className={`p-5 bg-gray-100 backdrop-blur-xl border-l-4 ${
                    diagnosis.severity === "high"
                      ? "border-red-500"
                      : diagnosis.severity === "medium"
                      ? "border-yellow-500"
                      : "border-green-500"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-black font-display text-lg leading-tight">
                        {diagnosis.name}
                        </h3>
                        <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                            diagnosis.severity === "high"
                            ? "text-red-500"
                            : diagnosis.severity === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                        >
                        {diagnosis.confidence}% Conf.
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm font-dm leading-snug">
                      {diagnosis.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* =========================================================
             Lung Scan Left, Histogram Right
             ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT: Lung Scan Analysis */}
            <div className="bg-white/50 rounded-xl p-6 border border-white/40 shadow-sm">
                <h2 className="text-xl font-bold mb-6 font-display">
                  Lung Scan Analysis
                </h2>

                <div className="relative w-full max-w-[430px] mx-auto">
                  {/* Lung Image */}
                  <img
                    src="/images/lung-xray.png"
                    alt="Lung XRay"
                    className="w-full rounded-xl opacity-90 shadow-md"
                  />

                  {/* Red Highlight */}
                  <div
                    className="absolute rounded-full bg-red-500 opacity-40 blur-xl"
                    style={{
                      width: "30%",
                      height: "30%",
                      top: "35%",
                      left: "32%",
                    }}
                  />

                  {/* Connector Line (Adjusted for responsiveness) */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <line
                      x1="45%"
                      y1="50%"
                      x2="75%"
                      y2="60%"
                      stroke="white"
                      strokeWidth="2"
                      strokeOpacity="0.8"
                    />
                    <circle cx="45%" cy="50%" r="4" fill="white" />
                  </svg>

                  {/* Glass Card Overlay */}
                  <div
                    className="
                      absolute top-[55%] left-[65%]
                      p-3 w-[140px]
                      bg-white/90 backdrop-blur-xl
                      rounded-xl shadow-lg
                      border border-white/50
                    "
                  >
                    <p className="text-xs text-gray-500 font-bold uppercase">Infection Level</p>
                    <div className="flex items-baseline gap-2 mt-1">
                         <p className="text-2xl text-sm font-bold text-black">{randomPercent}%</p>
                         <span className="text-xs font-semibold text-yellow-600">Moderate</span>
                    </div>
                  </div>
                </div>
            </div>

            {/* RIGHT: Acoustic Histogram */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-lungsense-blue" />
                    </div>
                    <h2 className="text-xl font-bold font-display">
                    Acoustic Analysis
                    </h2>
                </div>

                {/* The Chart */}
                <div className="flex-1 w-full min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={acousticData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="frequency"
                            tick={{ fontSize: 10, fill: 'lungsense-blue' }}
                            tickLine={false} axisLine={false} interval={4}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: 'lungsense-blue' }}
                            tickLine={false} axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="amplitude" radius={[4, 4, 0, 0]}>
                        {acousticData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.amplitude > 80 ? '#ef4444' : '#2C5BA1'} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Footer Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 font-dm uppercase tracking-wider">Peak Freq.</p>
                        <p className="text-lg font-bold text-gray-900 font-display">1,250 Hz</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-dm uppercase tracking-wider">Anomaly</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        High Wheeze
                        </span>
                    </div>
                </div>
            </div>
          </div>

          {/* AI Result explanation*/}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* AI Explanation (Takes up 2/3 width) */}
            <div className="lg:col-span-2">
                <Card className="p-6 bg-white border-white-700 h-full">
                  <h2 className="text-xl font-bold mb-4 font-display">
                    How the AI Derived This Result
                  </h2>
                  <p className="text-gray-700 mb-6 font-dm text-sm leading-relaxed">
                    Our advanced AI models analyze a multimodal dataset
                    including high-resolution lung CT scans, acoustic patterns,
                    and clinical parameters. This enables deep insight into lung
                    function and structural health.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-black mb-1 font-display text-sm">Scan Analysis</h3>
                      <p className="text-gray-500 text-xs font-dm">
                        Deep learning models detect abnormalities such as nodules and infiltrates using overlays.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1 font-display text-sm">Acoustic Biomarkers</h3>
                      <p className="text-gray-500 text-xs font-dm">
                        Spectral signatures differentiate between respiratory diseases like COPD vs Pneumonia.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1 font-display text-sm">Clinical Integration</h3>
                      <p className="text-gray-500 text-xs font-dm">
                        History and environmental data improve the contextual relevance of the diagnosis.
                      </p>
                    </div>
                  </div>
                </Card>
            </div>

            {/* Action Cards */}
            <div className="space-y-4">
              <Card className="p-5 bg-white border-white-700 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-lungsense-blue text-xs" />
                  <div>
                    <h3 className="font-semibold text-indigo-900 font-display">
                      Recommendation
                    </h3>
                    <p className="text-indigo-700/80 text-xs font-dm mt-1">
                      Consult a specialist based on these findings.
                    </p>
                  </div>
                </div>
                <Link to="/patient/recommendations">
                  <Button className="w-full bg-lungsense-blue text-white hover:bg-indigo-700 shadow-md">
                    View Recommendations
                  </Button>
                </Link>
              </Card>

              <Card className="p-5 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Download className="w-5 h-5 text-gray-500" />
                    <div>
                        <h3 className="font-semibold text-gray-900 font-display text-sm">Full Report</h3>
                        <p className="text-gray-500 text-xs">PDF Format • 2.4 MB</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full bg-lungsense-blue-light text-white border-gray-300 hover:bg-gray-50">
                  Download Report
                </Button>
              </Card>
            </div>

          </div>

          <footer className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-500 text-xs">
            © 2025 LUNGSENSE & DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
          </footer>
        </div>
      </main>
    </div>
  );
}

