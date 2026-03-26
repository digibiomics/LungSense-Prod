// src/components/PrivacyModal.tsx
// Reusable privacy policy modal used across Login, CompleteProfile,
// and PatientDashboard. Reads all content from src/constants/privacyPolicy.ts.
//
// Usage (read-only, e.g. PatientDashboard):
//   <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />
//
// Usage (with acceptance CTA, e.g. Login):
//   <PrivacyModal
//     onClose={() => setIsPrivacyOpen(false)}
//     onAccept={() => { setConsentChecked(true); setIsPrivacyOpen(false); }}
//     showGoogleLinks
//   />

import { X, FileText, ExternalLink } from "lucide-react";
import { PRIVACY_SECTIONS, PRIVACY_META } from "../../src/privacyPolicy";

interface PrivacyModalProps {
  onClose: () => void;
  /** When provided, the footer CTA becomes "I have read and agree…" and calls this on click. */
  onAccept?: () => void;
  /** When true, renders Google Privacy & Terms links at the bottom of the scrollable body. */
  showGoogleLinks?: boolean;
}

export default function PrivacyModal({ onClose, onAccept, showGoogleLinks }: PrivacyModalProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet — bottom on mobile, centered dialog on desktop */}
      <div className="
        relative z-10 w-full md:max-w-2xl
        bg-white rounded-t-3xl md:rounded-3xl
        shadow-2xl flex flex-col
        max-h-[90dvh] md:max-h-[82vh]
      ">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 md:pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-lungsense-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-lungsense-blue" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[15px] leading-tight">
                {PRIVACY_META.title}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Last updated {PRIVACY_META.lastUpdated} · {PRIVACY_META.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-colors ml-3 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {PRIVACY_SECTIONS.map((section, i) => (
            <div key={i}>
              <h4 className="font-semibold text-gray-900 text-[13px] mb-1.5">
                {section.heading}
              </h4>
              <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </div>
          ))}

          {/* Optional Google policy links (used on Login page) */}
          {showGoogleLinks && (
            <div className="pt-3 pb-1 border-t border-gray-100 space-y-1.5">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">
                Google Account
              </p>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-lungsense-blue hover:underline"
              >
                Google Privacy Policy <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-lungsense-blue hover:underline"
              >
                Google Terms of Service <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Contact link — always shown */}
          <div className="pt-3 pb-1 border-t border-gray-100 space-y-1.5">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">
              Contact
            </p>
            <a
              href={`mailto:${PRIVACY_META.contact}`}
              className="flex items-center gap-1.5 text-[13px] text-lungsense-blue hover:underline"
            >
              {PRIVACY_META.contact} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/80 rounded-b-3xl">
          {onAccept ? (
            <button
              onClick={onAccept}
              className="
                w-full py-3.5 rounded-xl
                bg-lungsense-blue text-white font-semibold text-[14px]
                hover:opacity-90 active:scale-[0.98] transition-all shadow-sm
              "
            >
              I have read and agree to these Terms
            </button>
          ) : (
            <button
              onClick={onClose}
              className="
                w-full py-3.5 rounded-xl
                bg-lungsense-blue text-white font-semibold text-[14px]
                hover:opacity-90 active:scale-[0.98] transition-all shadow-sm
              "
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}