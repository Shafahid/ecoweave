import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  BarChart3,
  Shield,
  DollarSign,
  Bell,
  FileCheck,
  TrendingUp,
} from "lucide-react";

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 bg-[#faf8f5] relative overflow-hidden">
      {/* Organic texture overlay */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23004737' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#004737]/[0.02] to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-3 px-4 py-1.5 bg-[#004737]/5 border border-[#004737]/10 rounded-full">
            <span className="text-[#004737] text-sm font-medium tracking-wider uppercase">Platform Features</span>
          </div>
          <h2 className="text-5xl font-bold mb-5 text-[#004737] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Turn Data Into Compliance Intelligence
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#004737]/40 to-transparent mx-auto mb-6"></div>
          <p className="text-xl text-[#2d5f4f]/80 max-w-2xl mx-auto font-light leading-relaxed">
            AI-powered risk scoring and forensic validation to prevent pollution and protect profits.
          </p>
        </div>

        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[22rem]">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={item.className}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

const SkeletonOne = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#e8f5f1] relative overflow-hidden p-6">
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <div className="inline-block px-3 py-1 bg-white rounded-full text-xs text-[#004737]/60 font-medium mb-2">
          Generated Output
        </div>
      </div>
      <div className="bg-[#1a1a1a] rounded-lg p-4 flex-1 relative overflow-hidden">
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-2 bg-[#2d5f4f] rounded w-8"></div>
              <div className="h-2 bg-[#e8f5f1]/20 rounded flex-1"></div>
            </div>
          ))}
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <div className="w-16 h-6 bg-white/10 rounded"></div>
          <div className="w-20 h-6 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonTwo = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#004737] relative overflow-hidden p-6">
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-[#4285f4] rounded-lg shadow-lg"></div>
          <div className="flex flex-col gap-1 items-center">
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-gradient-to-br from-[#ea4335] via-[#fbbc05] to-[#34a853] rounded-lg shadow-lg"></div>
          <div className="flex flex-col gap-1 items-center">
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-[#2b579a] rounded-lg shadow-lg"></div>
          <div className="flex flex-col gap-1 items-center">
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonThree = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#004737] relative overflow-hidden p-6">
    <div className="w-full h-full flex items-center justify-center">
      <div className="space-y-3 w-full max-w-[200px]">
        <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-md">
          <span className="text-xs text-[#004737] font-medium">batch-2401.csv</span>
          <div className="w-6 h-6 bg-[#e8f5f1] rounded-full flex items-center justify-center">
            <div className="w-3 h-3 text-[#004737]">✓</div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-md">
          <span className="text-xs text-[#004737] font-medium">etp-report.xlsx</span>
          <div className="w-6 h-6 bg-[#e8f5f1] rounded-full flex items-center justify-center">
            <div className="w-3 h-3 text-[#004737]">✓</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonFour = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#e8f5f1] relative overflow-hidden p-6">
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-[220px]">
        <div className="text-xs text-[#004737]/60 font-medium mb-3">Team Members</div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#004737] to-[#2d5f4f] rounded-full"></div>
              <div className="space-y-1">
                <div className="h-2 bg-[#004737]/20 rounded w-16"></div>
                <div className="h-1.5 bg-[#004737]/10 rounded w-12"></div>
              </div>
            </div>
            <div className="px-2 py-1 bg-[#e8f5f1] rounded text-xs text-[#004737] font-medium">Active</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2d5f4f] to-[#004737] rounded-full"></div>
              <div className="space-y-1">
                <div className="h-2 bg-[#004737]/20 rounded w-16"></div>
                <div className="h-1.5 bg-[#004737]/10 rounded w-12"></div>
              </div>
            </div>
            <div className="px-2 py-1 bg-[#e8f5f1] rounded text-xs text-[#004737] font-medium">Active</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonFive = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#e8f5f1] relative overflow-hidden p-6">
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 bg-[#004737] rounded-full flex items-center justify-center shadow-lg">
        <TrendingUp className="w-6 h-6 text-white" />
      </div>
      <div className="text-xs text-[#004737]/60 font-medium">Data Processing</div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-[200px]">
        <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center">
          <div className="w-6 h-6 bg-[#21759b] rounded"></div>
        </div>
        <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center">
          <div className="w-6 h-6 bg-[#0084ff] rounded-full"></div>
        </div>
        <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center">
          <div className="w-6 h-6 bg-[#ff7a59] rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const items = [
  {
    title: "Smart Data Processing",
    description: "Transform raw production data into structured compliance reports with intelligent formatting and validation.",
    header: <SkeletonOne />,
    className: "md:col-span-2",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Multi-Platform Publishing",
    description: "Export compliance reports to Google Sheets, Excel, or integrate with your existing workflow with one click.",
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    title: "AI Batch Optimization",
    description: "Intelligent analysis of batch data to identify pollution patterns and optimize production schedules.",
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Team Collaboration",
    description: "Invite team members with role-based permissions for seamless compliance management across departments.",
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Real-Time Integration",
    description: "Connect with buyer portals, regulatory systems, and supply chain platforms for instant data sharing.",
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <DollarSign className="h-5 w-5" />,
  },
];

