"use client";

import {
  AlertTriangle,
  FileBarChart,
  FileSpreadsheet,
  SearchCheck,
  Upload,
} from "lucide-react";

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Data Template Setup",
    date: "Step 1",
    content:
      "Receive customized templates for production, chemical usage, electricity, and discharge data.",
    category: "Ingestion",
    icon: FileSpreadsheet,
    relatedIds: [2],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Secure Ingestion",
    date: "Step 2",
    content:
      "Upload data manually or through integrations, with encryption in transit and at rest.",
    category: "Ingestion",
    icon: Upload,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 88,
  },
  {
    id: 3,
    title: "Forensic Validation",
    date: "Step 3",
    content:
      "Triangulation checks consistency and flags anomalies before final scoring.",
    category: "Validation",
    icon: SearchCheck,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 73,
  },
  {
    id: 4,
    title: "Risk Scoring",
    date: "Step 4",
    content:
      "AI models produce compliance risk scores with financial impact forecasts.",
    category: "Analysis",
    icon: AlertTriangle,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 56,
  },
  {
    id: 5,
    title: "Alerts & Reports",
    date: "Step 5",
    content:
      "Receive alerts and generate buyer and regulator-ready compliance reports.",
    category: "Reporting",
    icon: FileBarChart,
    relatedIds: [4],
    status: "pending" as const,
    energy: 45,
  },
];

export function RadialOrbitalTimelineDemo() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}
