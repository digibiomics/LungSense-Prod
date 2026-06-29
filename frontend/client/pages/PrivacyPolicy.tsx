import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, Calendar, FileText, Search } from "lucide-react";

interface PrivacySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicy() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("who-we-are");

  // Scroll spy to update active section in sidebar as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".privacy-section");
      let currentActive = "";
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
          currentActive = section.id;
        }
      });
      
      if (currentActive && currentActive !== activeSection) {
        setActiveSection(currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const sections: PrivacySection[] = [
    {
      id: "who-we-are",
      title: "1. Who We Are",
      content: (
        <div className="space-y-3">
          <p>
            DigiBiomics Inc. is a Canadian health-technology company incorporated in Ontario, Canada. We develop and operate the LungSense AI-powered respiratory screening and monitoring platform.
          </p>
          <p>
            For the purposes of applicable privacy legislation, DigiBiomics Inc. is the data controller (or equivalent) responsible for personal information collected through the LungSense platform.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2 space-y-1">
            <p className="font-bold text-gray-800">Contact Information:</p>
            <p>DigiBiomics Inc.</p>
            <p>3052 Owls Foot Dr, Mississauga, ON L5M 6W5, Canada</p>
            <p className="text-lungsense-blue font-medium">Email: info@digibiomics.com</p>
          </div>
        </div>
      )
    },
    {
      id: "information-we-collect",
      title: "2. Information We Collect",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-800 mb-1">2.1 Health and Biometric Data</h4>
            <p className="mb-2">LungSense is a health-focused platform. We collect the following categories of personal health data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cough recordings and respiratory audio signals</li>
              <li>Breathing pattern data</li>
              <li>Physiological monitoring outputs</li>
              <li>Medical images (e.g., chest X-rays, if submitted)</li>
              <li>Symptom inputs (e.g., reported cough, dyspnea, fever)</li>
              <li>Demographic data relevant to respiratory health (age, sex, smoking history)</li>
              <li>AI-generated risk scores and screening outputs</li>
            </ul>
            <p className="text-gray-500 italic mt-2 text-xs">
              Users are advised to utilize the application in a quiet environment; the platform implements processing filters designed to isolate respiratory sounds and intentionally minimize the accidental capture of ambient background voices or bystander data.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-1">2.2 Account and Identity Information</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and account credentials</li>
              <li>Professional role (e.g., healthcare professional, caregiver, individual user)</li>
              <li>Organization or facility name (where applicable)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-1">2.3 Device and Technical Data</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Device type, operating system, and app version</li>
              <li>IP address and approximate location (country/province level)</li>
              <li>App usage logs, session data, and error reports</li>
              <li>Push notification tokens (for alert delivery)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-1">2.4 Data Collected Automatically</h4>
            <p>
              When you use the LungSense app or web platform, we automatically collect certain technical information required to operate and improve the service. This includes usage patterns, feature interactions, and crash reports. We do not use this data for advertising purposes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "legal-basis-processing",
      title: "3. Legal Basis for Processing",
      content: (
        <div className="space-y-3">
          <p>We process your personal information on the following legal bases, depending on the nature of the data and your location:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Explicit Consent:</strong> For collection of sensitive health and biometric data under global frameworks, including Article 6(1)(a) and Article 9(2)(a) of the GDPR, we obtain your explicit, informed, opt-in consent prior to collection. You may withdraw consent at any time (see Section 10).</li>
            <li><strong>Contractual necessity:</strong> To provide the LungSense service to you under our Terms of Use.</li>
            <li><strong>Legitimate interests:</strong> For fraud prevention, security monitoring, and service improvement, where these interests are not overridden by your rights.</li>
            <li><strong>Legal obligation:</strong> To comply with applicable laws including PIPEDA (Canada), GDPR (European Union), and other applicable health data regulations.</li>
            <li><strong>Research and scientific purposes:</strong> For de-identified data used in research, subject to applicable ethics requirements (see Section 9).</li>
          </ul>
        </div>
      )
    },
    {
      id: "how-we-use-information",
      title: "4. How We Use Your Information",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-800 mb-1">4.1 To Provide Service</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and analyze respiratory data to generate screening outputs and risk scores</li>
              <li>Display results to authorized users (individual, clinician, or caregiver)</li>
              <li>Maintain your account and user profile</li>
              <li>Send service-related notifications and alerts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">4.2 To Improve and Develop the Platform</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Improve AI model accuracy and performance through training on de-identified data</li>
              <li>Conduct algorithm validation and benchmarking</li>
              <li>Perform system monitoring, quality assurance, and bug fixes</li>
              <li>Develop new features and product capabilities</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">4.3 For Research and Scientific Purposes</h4>
            <p>
              De-identified or aggregated data may be used for clinical research, validation studies, academic publications, and regulatory submissions. All research use of data will comply with applicable research ethics requirements, including REB/IRB approval where required. No identifiable personal data will be used in publications without appropriate legal permissions and consent.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">4.4 For Regulatory and Legal Compliance</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Comply with applicable laws, regulations, and legal processes</li>
              <li>Support regulatory submissions to Health Canada, FDA, EU MDR, and other bodies</li>
              <li>Responding to lawful requests from regulatory authorities</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "explicit-consent",
      title: "5. Explicit Consent for Sensitive Data",
      content: (
        <div className="space-y-3">
          <p>
            Because LungSense processes sensitive health and biometric data - including cough recordings, respiratory signals, and physiological data - we require your explicit, informed, opt-in consent before collecting this data.
          </p>
          <p>
            At the time of onboarding, we will present a clear consent form that explains exactly what data will be collected, how it will be used (service delivery, AI model improvement, research), who it may be shared with, how long it will be retained, and your rights to withdraw consent or request deletion.
          </p>
          <p>
            For users under the age of 18, or where a substitute decision-maker is involved (e.g., in care facility settings), appropriate guardian or authorized representative consent will be obtained prior to data collection.
          </p>
          <p className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm">
            <strong>Withdrawal of Consent:</strong> You may withdraw your consent at any time by contacting <a href="mailto:privacy@digibiomics.com" className="text-lungsense-blue hover:underline">privacy@digibiomics.com</a>. Withdrawal of consent will not affect the lawfulness of processing carried out prior to withdrawal but will result in cessation of health data collection going forward.
          </p>
        </div>
      )
    },
    {
      id: "data-sharing",
      title: "6. Data Sharing and Disclosure",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-800 mb-1">6.1 Third-Party Service Providers</h4>
            <p>
              We engage third-party service providers to support the operation of the LungSense platform. These providers operate under contractual data protection obligations and are permitted to process your data only for the specific purposes for which they are engaged. Categories of providers include cloud infrastructure, analytics platforms, security monitoring, and notification delivery services.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">6.2 Research and Academic Partners</h4>
            <p>
              De-identified or aggregated data may be shared with research institutions, academic partners, or health organizations for scientific research, algorithm benchmarking, and clinical validation studies. Any such sharing will be governed by data sharing agreements and will comply with applicable ethics requirements. No identifiable data will be shared with research partners without your explicit consent.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">6.3 Regulatory and Legal Disclosure</h4>
            <p>
              We may disclose personal information where required by law, court order, or regulatory obligation, including to Health Canada, FDA, or other regulatory authorities in connection with regulatory submissions or safety reporting obligations. We will notify you of such disclosures where permitted by law.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">6.4 Business Transfers</h4>
            <p>
              In the event of a merger, acquisition, or sale of all or part of DigiBiomics Inc., personal information may be transferred to the acquiring entity, subject to equivalent privacy protections. We will notify users prior to any such transfer that would materially affect how their data is used.
            </p>
          </div>
          <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
            <h4 className="font-bold text-red-900 mb-2">6.5 What We Do Not Do:</h4>
            <ul className="list-disc pl-5 space-y-1 text-red-800 text-sm">
              <li>We do not sell personal information to third parties.</li>
              <li>We do not share identifiable health data for advertising or marketing purposes.</li>
              <li>We do not share data with employers or insurers without your explicit consent.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "data-retention",
      title: "7. Data Retention",
      content: (
        <div className="space-y-3">
          <p>We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Our retention schedule is as follows:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account data:</strong> Retained for the duration of your active account, plus 2 years after account closure.</li>
            <li><strong>Health and biometric data (identifiable):</strong> Retained for the duration of active use, plus 1 year, unless you request earlier deletion. To maintain data integrity, embedded AI-generated risk scores and screening outputs are synchronized to this identical lifecycle and will be retained as part of your 
core health record for the duration of your active account plus 1 year, unless earlier erasure is 
requested. </li>
            <li><strong>AI-generated outputs and risk scores:</strong> Retained for 2 years from generation date, or as required for regulatory compliance.</li>
            <li><strong>Anonymized and aggregated data:</strong> May be retained indefinitely for research, AI model development, and regulatory purposes. This data is permanently and irreversibly scrubbed of all identifying markers such that the individual can never be re-identified any technical means .</li>
            <li><strong>Audit logs and security records:</strong> Retained for 3 years in accordance with security and compliance requirements.</li>
            <li><strong>Legal and regulatory records:</strong> Retained for periods required by applicable law.</li>
          </ul>
        </div>
      )
    },
    {
      id: "privacy-rights",
      title: "8. Your Privacy Rights",
      content: (
        <div className="space-y-4">
          <p>Depending on your jurisdiction, you have the following rights regarding your personal information:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h5 className="font-bold text-gray-800 text-sm">8.1 Right of Access</h5>
              <p className="text-xs text-gray-600">You have the right to request a copy of the personal information we hold about you, including the categories 
of data collected, the purposes of processing, and any third party with whom data has been shared. </p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h5 className="font-bold text-gray-800 text-sm">8.2 Right to Correction</h5>
              <p className="text-xs text-gray-600">You have the right to request corrections of inaccurate or incomplete personal information we hold about 
you.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h5 className="font-bold text-gray-800 text-sm">8.3 Right to Deletion</h5>
              <p className="text-xs text-gray-600">You have the right to request deletion of your personal information, subject to our retention obligations 
under applicable law. Upon a valid deletion request, we will delete or anonymize your identifiable data within 
30 days. </p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h5 className="font-bold text-gray-800 text-sm">8.4 Right to Withdraw Consent</h5>
              <p className="text-xs text-gray-600"> Where processing is based on consent, you may withdraw consent at any time without affecting the 
lawfulness of prior processing. </p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h5 className="font-bold text-gray-800 text-sm">8.5 Right to Data Portability</h5>
              <p className="text-xs text-gray-600"> Where technically feasible and required by applicable law, you have the right to receive your personal data 
in a structured, commonly used, machine-readable format.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h5 className="font-bold text-gray-800 text-sm">8.6 Right to Object/ Restrict Processing </h5>
              <p className="text-xs text-gray-600">You have the right to object to or request restriction of processing in certain circumstances, including where 
data is used for research or analytics beyond direct service delivery. </p>
            </div>
          </div>
         
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-4">
            <h4 className="font-bold text-indigo-950 text-sm mb-2">8.7 How to Exercise Your Rights:</h4>
            <p className="text-sm">
              Please email <a href="mailto:privacy@digibiomics.com" className="text-lungsense-blue font-bold">privacy@digibiomics.com</a> with the subject line <strong>'Privacy Rights Request - [Your Name]'</strong>.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Alternatively, users may initiate an automated account and data deletion request directly within the LungSense mobile application by navigating to Account Settings {' > '} Delete Account. We will respond to all rights requests within 30 days. Where requests are complex or numerous, we may extend this period by a 
further 30 days with notice. 
            </p>
          </div>
        </div>
      )
    },
    {
      id: "children-and-minors",
      title: "9. Children and Minors",
      content: (
        <div className="space-y-3">
          <p>
            LungSense is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13 without verifiable parental or guardian consent.
          </p>
          <p>
            For users between the ages of 13 and 17, or where the LungSense platform is used in a care facility setting involving minors, appropriate parental or authorized representative consent must be obtained prior to data collection. Healthcare professionals and facility administrators are responsible for ensuring that appropriate consent procedures are followed for minor patients or residents in their care.

            
          </p>

<p>
  If we become aware that we have inadvertently collected personal information from a child under 13 without 
appropriate consent, we will promptly delete such data. To report such a concern, please contact 
privacy@digibiomics.com.
  </p>   

        </div>
      )
    },
    {
      id: "data-security",
      title: "10. Data Security",
      content: (
        <div className="space-y-3">
          <p>
            DigiBiomics implements technical and organizational security measures to protect personal and health information against unauthorized access, disclosure, alteration, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Encryption of data in transit (TLS 1.2 or higher) and at rest</li>
            <li>Role-based access controls and authentication requirements</li>
            <li>Audit logging of access to health data</li>
            <li>Cybersecurity monitoring and intrusion detection</li>
            <li>Secure AI model training and data processing pipelines</li>
            <li>Regular security assessments and vulnerability testing</li>
            <li>Staff training on data privacy and security obligations</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
           No system can guarantee absolute security. In the event of a data breach involving personal information, 
DigiBiomics will comply with mandatory breach notification obligations under applicable law, including 
PIPEDA's Breach of Security Safeguards Regulations (Canada) and GDPR Article 33 (EU). We will notify 
affected individuals and relevant supervisory authorities within the timeframes required by law (within 72 
hours to regulators under GDPR; without undue delay under PIPEDA where there is real risk of significant 
harm). 
          </p>
        </div>
      )
    },
    {
      id: "international-transfers",
      title: "11. International Data Transfers",
      content: (
        <div className="space-y-3">
          <p>
            DigiBiomics is based in Canada. If you access LungSense from outside Canada, your personal information may be transferred to, stored, and processed in Canada or in other countries where our service providers operate (including cloud infrastructure providers).
          </p>
          <p>
            For users in the European Union or United Kingdom, we ensure that any international transfers of personal data are subject to appropriate safeguards in accordance with GDPR and UK GDPR requirements, including Standard Contractual Clauses (SCCs) or equivalent transfer mechanisms.
          </p>
          <p>
            For users in the United States, data may be subject to applicable US state privacy laws. DigiBiomics will comply with applicable requirements including those under state health data protection laws.
          </p>
        </div>
      )
    },
    {
      id: "app-store-compliance",
      title: "12. App Store Compliance - Google Play and Apple App Store",
      content: (
        <div className="space-y-4">
          <p>
            LungSense is available on the Google Play Store and Apple App Store. In addition to the privacy practices described in this Policy, the following app store-specific commitments apply:
          </p>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">12.1 Google Play - Data Safety Requirements</h4>
            <p className="mb-2">
              In compliance with Google Play's Data Safety policy, DigiBiomics discloses the following in the app's Data Safety section on Google Play:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Data collected:</strong> Health and fitness data (respiratory signals, symptom inputs), personal info (name, email), app activity (usage data)</li>
              <li><strong>Data shared:</strong> De-identified health data may be shared with research partners as described in this Policy</li>
              <li><strong>Security practices:</strong> Data encrypted in transit; you can request data deletion</li>
              <li><strong>Health &amp; fitness data handling:</strong> Health data is collected and used for app functionality and AI improvement; it is not shared for advertising purposes</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Google Play's Sensitive Data policies require explicit user consent before collecting health or biometric data. LungSense obtains this consent at onboarding as described in Section 5 of this Policy.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-1">12.2 Apple App Store - Privacy Nutrition Label</h4>
            <p className="mb-2">
              In compliance with Apple App Store requirements, LungSense's privacy nutrition label discloses the following data types collected:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Health &amp; Fitness:</strong> Respiratory data, symptom inputs - used for app functionality and AI model improvement</li>
              <li><strong>Contact Info:</strong> Name, email address - used for account management</li>
              <li><strong>Identifiers:</strong> Device ID - used for analytics and security</li>
              <li><strong>Usage Data:</strong> App interactions - used for product improvement</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              LungSense does not use data for tracking across third-party apps and websites. LungSense does not share data with data brokers or advertising networks. All health data is collected only with the user's explicit consent.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-1">12.3 Health App Guidelines</h4>
            <p className="mb-2">
              LungSense complies with Apple's and Google's guidelines for health and medical applications, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Not making unsupported medical claims</li>
              <li>Clearly communicating the non-diagnostic nature of AI outputs</li>
              <li>Directing users to seek professional medical advice</li>
              <li>Not using health data for advertising purposes</li>
              <li>Complying with applicable medical device and SaMD regulatory requirements in each jurisdiction where the app is available</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-1">12.4 Permissions Requested</h4>
            <p className="mb-2">
              LungSense requests the following device permissions, which are used solely for the purposes described:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Microphone:</strong> Required to capture cough and respiratory audio signals for analysis. Not used for any other purpose.</li>
              <li><strong>Camera (optional):</strong> Required only if the user chooses to submit chest X-ray images for analysis.</li>
              <li><strong>Notifications:</strong> Used to deliver respiratory monitoring alerts and screening reminders.</li>
              <li><strong>Storage (Android):</strong> Required to save audio recordings locally before secure upload.</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              All permissions are requested at the time of first use, with a clear explanation of their purpose. Users may deny permissions, which will limit specific features but will not prevent basic use of the platform.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "canadian-pipeda",
      title: "13. Canadian Privacy Law Compliance (PIPEDA)",
      content: (
        <div className="space-y-3">
          <p>
            DigiBiomics complies with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial health privacy legislation. Under PIPEDA, we are committed to the following ten fair information principles:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Accountability:</strong> DigiBiomics designates a Privacy Officer responsible for compliance.</li>
            <li><strong>Identifying Purposes:</strong> Purposes for collection are identified at or before the time of collection.</li>
            <li><strong>Consent:</strong> Consent is obtained for collection, use, and disclosure of personal information.</li>
            <li><strong>Limiting Collection:</strong> We collect only what is necessary for identified purposes.</li>
            <li><strong>Limiting Use, Disclosure, and Retention:</strong> Data is used only for stated purposes and retained only as long as necessary.</li>
            <li><strong>Accuracy:</strong> We take reasonable steps to ensure information is accurate and up to date.</li>
            <li><strong>Safeguards:</strong> Technical and organizational security measures protect personal information.</li>
            <li><strong>Openness:</strong> This Privacy Policy is publicly available and plainly written.</li>
            <li><strong>Individual Access:</strong> Users may access and challenge the accuracy of their personal information.</li>
            <li><strong>Challenging Compliance:</strong> Users may address challenges to compliance to the Privacy Officer.</li>
          </ol>
        </div>
      )
    },
    {
      id: "european-gdpr",
      title: "14. European Users - GDPR Compliance",
      content: (
        <div className="space-y-3">
          <p>
            For users in the European Economic Area (EEA) or United Kingdom, the following additional rights and protections apply under the General Data Protection Regulation (GDPR) and UK GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You have the right to lodge a complaint with your national supervisory authority.</li>
            <li>We will not transfer your personal data outside the EEA without appropriate safeguards (Standard Contractual Clauses or adequacy decision).</li>
            <li>We will conduct Data Protection Impact Assessments (DPIAs) for high-risk processing activities, including large-scale processing of health data.</li>
            <li>We will appoint an EU/UK representative where required by applicable law.</li>
            <li><strong>Automated decision-making:</strong> LungSense uses AI to generate risk scores. These outputs are decision-support tools and are not used for fully automated decisions that produce legal or significant effects on individuals without human oversight.</li>
          </ul>
        </div>
      )
    },
    {
      id: "data-breach-notification",
      title: "15. Data Breach Notification",
      content: (
        <div className="space-y-3">
          <p>
            In the event of a security breach involving personal information that poses a real risk of significant harm to individuals, DigiBiomics will:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Notify affected individuals without undue delay, describing the nature of the breach, the data involved, and steps taken to mitigate harm.</li>
            <li>Notify the Office of the Privacy Commissioner of Canada (OPC) as required under PIPEDA's Breach of Security Safeguards Regulations.</li>
            <li>Notify relevant EU/UK supervisory authorities within 72 hours where GDPR applies.</li>
            <li>Maintain a breach register documenting all breaches regardless of whether notification is required.</li>
          </ul>
          <p className="mt-2">
            To report a suspected security incident or data breach involving your data, please contact <a href="mailto:privacy@digibiomics.com" className="text-lungsense-blue font-semibold hover:underline">privacy@digibiomics.com</a> immediately.
          </p>
        </div>
      )
    },
    {
      id: "ai-transparency",
      title: "16. AI Model Transparency and Updates",
      content: (
        <div className="space-y-3">
          <p>LungSense uses machine learning and artificial intelligence models to generate respiratory risk scores and screening insights. In the interest of transparency:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>AI model versions are logged and tracked internally.</li>
            <li>Material changes to AI models that may affect nature or accuracy of outputs will be communicated to users through the app or by email.</li>
            <li>AI outputs are intended as decision-support tools and do not constitute automated diagnoses. All outputs must be interpreted alongside broader clinical context by qualified healthcare professionals who retain sole diagnostic responsibility.</li>
            <li>Model performance may vary across populations, and we are committed to ongoing validation and bias monitoring.</li>
            <li>The platform has not yet received regulatory clearance as a medical device. It must not be used as a clear SaMD until regulatory authorization is obtained in the relevant jurisdiction.</li>
          </ul>
        </div>
      )
    },
    {
      id: "cookies",
      title: "17. Cookies and Tracking Technologies",
      content: (
        <div className="space-y-3">
          <p>The LungSense web application uses cookies and similar tracking technologies to operate the service and improve user experience. We use:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Essential cookies:</strong> Required for the platform to function (authentication, session management).</li>
            <li><strong>Analytics cookies:</strong> Used to understand how users interact with the platform and improve performance. These do not identify individual users.</li>
          </ul>
          <p>We do not use advertising cookies or tracking technologies for targeted advertising. You may manage cookie preferences through your browser settings. Disabling essential cookies will prevent use of the platform.</p>
        </div>
      )
    },
    {
      id: "changes-to-policy",
      title: "18. Changes to This Privacy Policy",
      content: (
        <div className="space-y-3">
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or regulatory guidance. When we make material changes, we will:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Post the updated Policy with a revised 'Last Updated' date.</li>
            <li>Notify users via in-app notification or email at least 30 days before material changes take effect.</li>
            <li>Where changes affect the legal basis for processing or the types of data collected, obtain fresh consent where required.</li>
          </ul>
          <p>
            Continued use of the LungSense platform after the effective date of any update constitutes acceptance of the revised Policy. If you do not agree with any changes, you should discontinue use of the Service and may request deletion of your data.
          </p>
        </div>
      )
    },
    {
      id: "contact-complaints",
      title: "19. Contact and Complaints",
      content: (
        <div className="space-y-4">
          <p>For any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact:</p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1 text-sm">
            <p className="font-bold text-gray-800">Privacy Officer</p>
            <p>DigiBiomics Inc.</p>
            <p>3052 Owls Foot Dr, Mississauga, ON L5M 6W5, Canada</p>
            <p className="text-lungsense-blue font-bold">Email: privacy@digibiomics.com</p>
            <p className="text-xs text-gray-500">(For all privacy, legal, and data rights inquiries)</p>
          </div>
          <div>
            <p className="mb-2">If you are not satisfied with our response, you have the right to lodge a complaint with:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Office of the Privacy Commissioner of Canada (OPC):</strong> <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.priv.gc.ca</a></li>
              <li><strong>United States:</strong> Your state's Attorney General's Office or the Federal Trade Commission (FTC): <a href="https://www.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.ftc.gov</a></li>
              <li><strong>EU/EEA:</strong> Your national data protection supervisory authority</li>
              <li><strong>UK:</strong> Information Commissioner's Office (ICO): <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.ico.org.uk</a></li>
              <li><strong>India:</strong> Data Protection Board of India (under DPDP Act 2023): <a href="https://www.meity.gov.in" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.meity.gov.in</a></li>
              <li><strong>China:</strong> Cyberspace Administration of China (CAC / PIPL): <a href="https://www.cac.gov.cn" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.cac.gov.cn</a></li>
              <li><strong>Japan:</strong> Personal Information Protection Commission (PPC): <a href="https://www.ppc.go.jp" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.ppc.go.jp</a></li>
              <li><strong>UAE:</strong> UAE Data Office (Federal Decree-Law No. 45 of 2021): <a href="https://www.uaedataoffice.ae" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.uaedataoffice.ae</a></li>
              <li><strong>Saudi Arabia:</strong> Saudi Data &amp; AI Authority (SDAIA / PDPL): <a href="https://www.sdaia.gov.sa" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.sdaia.gov.sa</a></li>
              <li><strong>Qatar:</strong> Ministry of Communications and Information Technology: <a href="https://www.mcit.gov.qa" target="_blank" rel="noopener noreferrer" className="text-lungsense-blue hover:underline">www.mcit.gov.qa</a></li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.id.replace(/-/g, " ").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#C9D4F4_0%,#ECEBFA_50%,#F5F2FD_100%)] text-gray-800">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200/50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <img
                src="/images/logo-new.png"
                alt="LungSense Logo"
                className="h-7 sm:h-8 w-auto"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                LungSense
              </h1>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-500">Privacy Policy</span>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            v1.0
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 text-lungsense-blue font-bold text-sm sm:text-base md:text-lg uppercase tracking-wider mb-3">
              <img
                src="/images/digibiomics_logo.png"
                alt="DigiBiomics Logo"
                className="h-6 sm:h-8 w-auto object-contain"
              />
              <span>Powered by DigiBiomics Inc.</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight mb-4 font-display">
              Privacy Policy
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              This Privacy Policy applies to the LungSense mobile application (iOS and Android), web application, APIs, and all related services operated by DigiBiomics Inc. It governs the collection, use, storage, sharing, and protection of personal and health information submitted through or generated by these platforms.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Last Updated: June 16, 2026
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> Version 1.0 (Active)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* SIDEBAR - TABLE OF CONTENTS */}
          <aside className="lg:col-span-1 bg-white/60 backdrop-blur-sm border border-white/60 p-4 sm:p-5 rounded-2xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto hidden lg:block shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lungsense-blue focus:border-transparent transition-all"
              />
            </div>
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === section.id
                      ? "bg-lungsense-blue text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* MAIN DOCUMENT TEXT */}
          <main className="lg:col-span-3 space-y-6">
            <Card className="p-6 sm:p-8 bg-white border-gray-200/50 shadow-md rounded-2xl">
              <div className="prose prose-blue max-w-none text-sm leading-relaxed text-gray-600 space-y-8">
                
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="privacy-section scroll-mt-28 border-b border-gray-100 pb-8 last:border-0 last:pb-0"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3 font-display">
                      {section.title}
                    </h3>
                    <div className="text-gray-600 space-y-2">
                      {section.content}
                    </div>
                  </div>
                ))}

                {filteredSections.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No privacy policy sections found matching your search.</p>
                  </div>
                )}

              </div>
            </Card>
          </main>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white/40 backdrop-blur-md border-t border-gray-200/50 py-6 text-center text-xs sm:text-sm text-slate-600 mt-12 safe-bottom">
        <p className="font-semibold tracking-wider uppercase">
          © 2025 LUNGSENSE &amp; DIGIBIOMICS. MEDICAL ADVICE DISCLAIMER APPLIES.
        </p>
      </footer>
    </div>
  );
}
