'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Topbar from '@/components/app/Topbar';
import {
  ArrowLeft,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { generateReport, getBatchStats, checkBackendHealth } from '@/lib/api';

export default function ReportsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'financial'>('summary');
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({
    totalBatches: 0,
    avgRiskScore: 0,
    highRisk: 0,
    totalLoss: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const alive = await checkBackendHealth();
        if (alive) {
          const s = await getBatchStats();
          setStats({
            totalBatches: s.total_batches,
            avgRiskScore: Math.round(s.avg_risk_score),
            highRisk: s.high_risk_count,
            totalLoss: s.total_estimated_loss,
          });
        }
      } catch {
        /* empty */
      }
    })();
  }, []);

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      const dateFrom = dateRange !== 'all'
        ? new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString().slice(0, 10)
        : undefined;
      const blob = await generateReport({
        report_type: reportType,
        format,
        date_from: dateFrom,
      });
      const ext = format === 'excel' ? 'xlsx' : format;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecoweave_${reportType}_report.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Report generation failed. Make sure the backend is running.');
    } finally {
      setIsExporting(false);
    }
  };

  const reportTemplates = [
    {
      id: 'compliance',
      title: 'Compliance Summary Report',
      description: 'Overview of compliance metrics and risk scores',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'financial',
      title: 'Financial Impact Analysis',
      description: 'Cost analysis and estimated losses',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'anomaly',
      title: 'Anomaly Detection Report',
      description: 'Detailed breakdown of detected issues',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'batch',
      title: 'Batch Performance Report',
      description: 'Individual batch analysis and trends',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'monthly',
      title: 'Monthly Summary Report',
      description: 'Monthly aggregated compliance data',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'resource',
      title: 'Resource Usage Report',
      description: 'Chemical, water, and energy consumption',
      icon: PieChart,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        {/* Header */}
        <div className="px-3 py-3 z-10 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-medium tracking-tight leading-tight sm:text-4xl">Reports</h1>
              <p className="text-sm sm:text-base text-foreground/60 mt-1">
                Generate comprehensive compliance and performance reports
              </p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Total Batches</div>
              <div className="text-2xl font-bold">{stats.totalBatches}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Avg Risk Score</div>
              <div className="text-2xl font-bold text-orange-600">{stats.avgRiskScore}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Est. Total Loss</div>
              <div className="text-2xl font-bold text-red-600">৳{stats.totalLoss.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">High Risk</div>
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters & Export */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-[#004737]" />
                  <h2 className="text-2xl tracking-tight font-semibold text-gray-900">Report Options</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-2 block">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as any)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="all">All time</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-2 block">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-[#F7F7F7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="summary">Summary Report</option>
                      <option value="detailed">Detailed Report</option>
                      <option value="financial">Financial Report</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                  <Button 
                    variant="primary" 
                    className="w-full sm:w-auto justify-center rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white"
                    onClick={() => handleExportReport('pdf')}
                    disabled={isExporting}
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Export as PDF
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={() => handleExportReport('csv')} disabled={isExporting}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={() => handleExportReport('excel')} disabled={isExporting}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>
              </div>

              {/* Report Templates */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">Report Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        className="flex items-start gap-4 p-4 bg-[#F7F7F7] rounded-lg hover:bg-green-50 transition-colors text-left group"
                      >
                        <div className={`p-3 ${template.bgColor} rounded-lg flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${template.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1 group-hover:text-[#004737]">{template.title}</div>
                          <div className="text-sm text-foreground/60">{template.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">Recent Reports</h2>
                {stats.totalBatches === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-foreground/30" />
                    <p className="text-foreground/60">No data available. Upload batches to generate reports.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-[#004737]" />
                        <div>
                          <div className="font-medium">Compliance Summary - {new Date().toLocaleDateString()}</div>
                          <div className="text-sm text-foreground/60">{stats.totalBatches} batches analyzed</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Financial Impact Analysis</div>
                          <div className="text-sm text-foreground/60">Generated yesterday</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <Activity className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium">Anomaly Detection Report</div>
                          <div className="text-sm text-foreground/60">Generated 2 days ago</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h3 className="text-xl tracking-tight font-semibold text-gray-900 mb-4">Data Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Total Batches</span>
                    <span className="font-semibold">{stats.totalBatches}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Avg Risk</span>
                    <span className="font-semibold">{stats.avgRiskScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">High Risk</span>
                    <span className="font-semibold text-red-600">{stats.highRisk}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Est. Total Loss</span>
                    <span className="font-semibold text-red-600">{stats.totalLoss.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h3 className="text-xl tracking-tight font-semibold text-gray-900 mb-4">Risk Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground/60">High Risk</span>
                      <span className="text-sm font-semibold text-red-600">{stats.highRisk}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${stats.totalBatches > 0 ? (stats.highRisk / stats.totalBatches) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Reports */}
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h3 className="text-xl tracking-tight font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
                <p className="text-sm text-foreground/60 mb-4">
                  Automatically generate and email reports on a schedule
                </p>
                <Button variant="outline" className="w-full rounded-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Configure Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
