import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, TrendingUp, Eye, Activity, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- TYPES ---
interface AnalysisRecord {
  id: number;
  date: string;
  type: string;
  topDiagnosis: string;
  diagnostics: Array<{
    name: string;
    confidence: number;
  }>;
}

// --- MOCK DATA ---
const records: AnalysisRecord[] = [
  {
    id: 1,
    date: "2024-01-15",
    type: "X-ray Analysis",
    topDiagnosis: "COPD",
    diagnostics: [
      { name: "COPD", confidence: 85 },
      { name: "Asthma", confidence: 78 },
      { name: "Nodules", confidence: 60 },
    ],
  },
  {
    id: 2,
    date: "2024-01-10",
    type: "Lung Sound Recording",
    topDiagnosis: "Mild Congestion",
    diagnostics: [
      { name: "Bronchitis", confidence: 72 },
      { name: "Asthma", confidence: 65 },
      { name: "Normal", confidence: 55 },
    ],
  },
  {
    id: 3,
    date: "2024-01-05",
    type: "Combined Analysis",
    topDiagnosis: "Healthy",
    diagnostics: [
      { name: "Normal", confidence: 92 },
      { name: "Minor Inflammation", confidence: 35 },
      { name: "Allergies", confidence: 28 },
    ],
  },
  // Added 2 more records to satisfy "5 data points"
  {
    id: 4,
    date: "2023-12-28",
    type: "Lung Sound Recording",
    topDiagnosis: "Wheezing",
    diagnostics: [
      { name: "Asthma", confidence: 88 },
      { name: "COPD", confidence: 40 },
      { name: "Normal", confidence: 10 },
    ],
  },
  {
    id: 5,
    date: "2023-12-15",
    type: "X-ray Analysis",
    topDiagnosis: "Pneumonia",
    diagnostics: [
      { name: "Pneumonia", confidence: 95 },
      { name: "Infection", confidence: 90 },
      { name: "Normal", confidence: 5 },
    ],
  },
];

// --- SPECTROGRAM COMPONENT ---
const AcousticSpectrogram = () => {

  const heatmapData = [
    // High Freq (Wheeze)
    [20, 30, 10, 80, 15],
    [25, 35, 15, 85, 20],
    [30, 40, 10, 90, 25],
    // Mid Freq
    [40, 60, 20, 60, 80],
    [45, 65, 25, 55, 85],
    [50, 70, 30, 50, 90],
    // Low Freq
    [80, 50, 20, 30, 95],
    [85, 55, 25, 35, 90],
    [90, 45, 15, 25, 85],
  ];

  const getColor = (intensity: number) => {
    if (intensity < 30) return `bg-blue-900/80`;
    if (intensity < 50) return `bg-cyan-600/80`;
    if (intensity < 75) return `bg-yellow-400/80`;
    return `bg-red-500/90`;
  };

  return (
    <Card className="p-6 bg-lungsense-blue text-white border-gray-800 shadow-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-display font-bold text-white">Longitudinal Acoustic Spectrogram</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-dm">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-900 rounded-full"></div> Normal</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Anomaly</span>
        </div>
      </div>



      <div className="flex flex-col relative z-10">
        {/* The Grid */}
        <div className="flex gap-1 h-40">
            <div className="flex flex-col justify-between text-[10px] text-gray-500 font-mono pr-2 py-1">
                <span>High (2k)</span>
                <span>Mid (800)</span>
                <span>Low (100)</span>
            </div>

            {/* Heatmap Columns */}
            {[0, 1, 2, 3, 4].map((colIndex) => (
                <div key={colIndex} className="flex-1 flex flex-col gap-[1px]">
                    {heatmapData.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className={`flex-1 w-full rounded-[1px] transition-all hover:opacity-100 opacity-90 ${getColor(row[colIndex])}`}
                            title={`Intensity: ${row[colIndex]}%`}
                        />
                    ))}
                </div>
            ))}
        </div>

        {/* X-Axis Labels (Dates) */}
        <div className="flex gap-1 mt-2 pl-12">
             {records.slice(0, 5).reverse().map((rec) => (
                 <div key={rec.id} className="flex-1 text-center">
                     <p className="text-[10px] text-gray-400 font-mono">{rec.date}</p>
                 </div>
             ))}
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
    </Card>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function PatientRecords() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

  const handleViewResults = (record: AnalysisRecord) => {
    navigate("/patient/results", { state: { record } });
  };

  return (
    <div className="flex h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)] overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col h-full">

        <div className="flex flex-col h-full p-4 md:p-8 space-y-6">

          {/* 1. Header (Fixed Height) */}
          <div className="flex-none flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Patient History
            </h1>
            <div className="w-10 h-10 bg-lungsense-blue rounded-full flex items-center justify-center">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  alt="User"
                  className="w-full h-full rounded-full"
                />
            </div>
          </div>

          {/* 2. Spectrogram Section */}
          <div className="flex-none">
             <AcousticSpectrogram />
          </div>

          {/* 3.  Records List  */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

            <h3 className="text-lg font-bold text-gray-800 font-display sticky top-0 bg-[#ECEBFA] py-2 z-10">
                Analysis Records
            </h3>

            <div className="grid gap-6">
              {records.map((record) => (
                <Card
                  key={record.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white/80 backdrop-blur-sm border-white/40"
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-lungsense-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                      {record.type.includes("Sound") ? (
                          <Activity className="w-6 h-6 text-lungsense-blue" />
                      ) : (
                          <FileText className="w-6 h-6 text-lungsense-blue" />
                      )}
                    </div>

                    {/* Record Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 font-display">
                        {record.type}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Disease Probabilities Summary */}
                    </div>

                    {/* View Button */}
                    <div className="flex flex-col items-end justify-between gap-8 h-full">
                      <div className="text-right">
                        <Button
                        onClick={() => handleViewResults(record)}
                        className="bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display font-medium"
                        size="sm"
                        >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Analysis
                        </Button>

                      </div>

                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {records.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2 font-display">
                  No Records Yet
                </h3>
                <p className="text-gray-500 font-dm">
                  Your AI analysis results will appear here once you submit data
                  for analysis.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
