import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2 } from "lucide-react";

interface AIProcessingModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  results?: {
    diagnostics: Array<{
      name: string;
      description: string;
      confidence: number;
      severity: "high" | "medium" | "low";
    }>;
    probabilities: Array<{ name: string; value: number }>;
    scanImage?: string;
  };
  onClose: () => void;
  onViewResults?: () => void;
}

export default function AIProcessingModal({
  isOpen,
  isProcessing,
  results,
  onClose,
  onViewResults,
}: AIProcessingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Don't go to 100 until actually done
          return prev + Math.random() * 30;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (results) {
      setProgress(100);
    }
  }, [isProcessing, results]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl">
        <div className="p-8">
          {/* Close Button */}
          {!isProcessing && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {isProcessing ? (
            // Processing State
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 font-display">
                  Analyzing Your Data
                </h2>
                <p className="text-gray-600 font-dm">
                  Our AI is processing your medical data to generate insights...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-lungsense-blue to-lungsense-green h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 font-dm">
                  {Math.round(progress)}% complete
                </p>
              </div>

              {/* Processing Steps */}
              <div className="space-y-3 text-left">
                <ProcessingStep
                  title="Analyzing X-ray images"
                  complete={progress > 25}
                />
                <ProcessingStep
                  title="Processing audio patterns"
                  complete={progress > 50}
                />
                <ProcessingStep
                  title="Integrating clinical data"
                  complete={progress > 75}
                />
                <ProcessingStep
                  title="Generating diagnosis"
                  complete={progress > 90}
                />
              </div>

              {/* Animated Dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-lungsense-blue rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          ) : results ? (
            // Results Ready State
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-lungsense-green/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-lungsense-green" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 font-display">
                  Analysis Complete!
                </h2>
                <p className="text-gray-600 font-dm">
                  Your AI diagnostic results are ready for review.
                </p>
              </div>

              {/* Quick Summary */}
              <div className="bg-lungsense-blue-light rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-3 font-display text-sm">
                  Top Findings:
                </h3>
                <div className="space-y-2">
                  {results.diagnostics.slice(0, 2).map((diagnostic, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {diagnostic.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {diagnostic.description}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-lungsense-blue ml-2">
                        {diagnostic.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 font-display"
                >
                  Continue Later
                </Button>
                <Button
                  onClick={onViewResults}
                  className="flex-1 bg-lungsense-blue hover:bg-lungsense-blue/90 text-white font-display"
                >
                  View Full Results
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function ProcessingStep({
  title,
  complete,
}: {
  title: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
          complete
            ? "bg-lungsense-green text-white"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        {complete ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        )}
      </div>
      <span
        className={`text-sm font-dm ${
          complete ? "text-gray-900 font-semibold" : "text-gray-600"
        }`}
      >
        {title}
      </span>
    </div>
  );
}
