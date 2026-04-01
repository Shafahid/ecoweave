'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Topbar from '@/components/app/Topbar';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  FileText,
  HelpCircle,
  Video,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I upload batch data?',
      answer: 'Navigate to the Data Upload page from the sidebar. You can either upload a CSV file or load sample data. The CSV should contain columns for batch_id, shift_date, shift_name, production_volume_kg, chemical_usage_kg, etp_runtime_min, electricity_kwh, and chemical_invoice_bdt.',
      category: 'Getting Started'
    },
    {
      question: 'What is a Risk Score?',
      answer: 'The Risk Score is a calculated value (0-100) that indicates the likelihood of ETP bypass or compliance issues. Scores above 75 indicate high risk, 50-75 medium risk, and below 50 low risk. The score is based on multiple validation factors including data triangulation, missing fields, and anomaly detection.',
      category: 'Risk Analysis'
    },
    {
      question: 'How are anomalies detected?',
      answer: 'EcoWeave uses multiple validation checks including: Probable Bypass (chemical vs production mismatch), Triangulation (chemical vs electricity correlation), Invoice Mismatch (reported vs expected costs), Power Anomaly (electricity vs ETP runtime), and Missing Fields detection.',
      category: 'Risk Analysis'
    },
    {
      question: 'What does the Financial Impact show?',
      answer: 'The Financial Impact section shows three key metrics: 1) Estimated Loss if Bypassed - potential environmental penalties and fines, 2) Cost to Run ETP - actual operational costs, 3) Net Benefit - the financial justification for proper ETP operation (showing ROI).',
      category: 'Financial'
    },
    {
      question: 'How do I export batch reports?',
      answer: 'Go to any batch detail page and click "Export Evidence PDF" or "Open Print Preview". This generates a comprehensive forensic report including all validation flags, financial metrics, and recommendations.',
      category: 'Reports'
    },
    {
      question: 'What are the different alert statuses?',
      answer: 'Alerts have three statuses: Pending (unreviewed), Acknowledged (reviewed but not resolved), and Resolved (issue addressed). You can change status from the Alerts page or batch detail page.',
      category: 'Alerts'
    },
    {
      question: 'How long is my data stored?',
      answer: 'Data is stored in your browser\'s localStorage. You can configure the retention period in Settings (30-365 days). For production use, data should be backed up to a secure server.',
      category: 'Data Management'
    },
    {
      question: 'Can I download my data?',
      answer: 'Yes, you can export individual batch reports as PDFs. For bulk data export, use the "Export All Data" option in Settings. This will download all your batch records and alerts as JSON.',
      category: 'Data Management'
    }
  ];

  const filteredFAQs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const categories = ['Getting Started', 'Risk Analysis', 'Financial', 'Reports', 'Alerts', 'Data Management'];

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        {/* Header */}
        <div className="px-3 py-3 z-10 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-medium tracking-tight leading-tight sm:text-4xl">Help Center</h1>
              <p className="text-sm sm:text-base text-foreground/60 mt-1">
                Find answers and learn how to use EcoWeave effectively
              </p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm/3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F7F7F7] border border-border rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Links */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="flex items-center gap-3 p-4 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors text-left">
                    <BookOpen className="w-5 h-5 text-[#004737]" />
                    <div className="flex-1">
                      <div className="font-medium">User Guide</div>
                      <div className="text-xs text-foreground/60">Complete documentation</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40" />
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors text-left">
                    <Video className="w-5 h-5 text-[#004737]" />
                    <div className="flex-1">
                      <div className="font-medium">Video Tutorials</div>
                      <div className="text-xs text-foreground/60">Step-by-step guides</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40" />
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors text-left">
                    <FileText className="w-5 h-5 text-[#004737]" />
                    <div className="flex-1">
                      <div className="font-medium">API Documentation</div>
                      <div className="text-xs text-foreground/60">For developers</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-foreground/40" />
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors text-left">
                    <MessageCircle className="w-5 h-5 text-[#004737]" />
                    <div className="flex-1">
                      <div className="font-medium">Community Forum</div>
                      <div className="text-xs text-foreground/60">Connect with users</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-foreground/40" />
                  </button>
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 text-foreground/30" />
                    <p className="text-foreground/60">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq, idx) => (
                      <details key={idx} className="group">
                        <summary className="flex items-start justify-between cursor-pointer p-4 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium text-foreground mb-1">{faq.question}</div>
                            <div className="text-xs text-foreground/60">{faq.category}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-foreground/40 group-open:rotate-90 transition-transform flex-shrink-0 mt-1" />
                        </summary>
                        <div className="mt-2 pl-4 pr-4 pb-2 text-sm text-foreground/80 leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Contact Support */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-[#004737]" />
                  <h3 className="text-xl tracking-tight font-semibold text-gray-900">Need More Help?</h3>
                </div>
                <p className="text-sm text-foreground/60 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="primary" 
                    className="w-full rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="w-full rounded-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
                <div className="space-y-2">
                  {categories.map((category, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center justify-between p-3 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors text-left text-sm"
                    >
                      <span>{category}</span>
                      <span className="text-xs text-foreground/60">
                        {faqs.filter(f => f.category === category).length} articles
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dashboard</span>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Upload</span>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reports</span>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
