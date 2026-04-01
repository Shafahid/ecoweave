export const features = [
  {
    title: "AI Compliance Risk Scoring",
    description: "Machine learning models analyze production patterns, chemical usage, and operational timing to predict discharge risk per shift/batch.",
    icon: "chart",
  },
  {
    title: "Forensic Data Validation",
    description: "Triangulation engine cross-verifies production volume, chemical invoices, and electricity consumption to detect inconsistencies and falsified data.",
    icon: "shield",
  },
  {
    title: "Financial Risk Translation",
    description: "Convert environmental violations into quantified financial risks: fines, production shutdowns, buyer contract loss, and export blacklisting.",
    icon: "currency",
  },
  {
    title: "Actionable Alerts",
    description: "Real-time shift and batch-level alerts with specific recommendations and cost-benefit analysis for immediate intervention.",
    icon: "bell",
  },
  {
    title: "Compliance & Trust Reporting",
    description: "Generated reports for buyers, regulators, and stakeholders with verification metrics and trend analysis to build trust.",
    icon: "document",
  },
];

export const howItWorksSteps = [
  {
    step: 1,
    title: "Data Template Setup",
    description: "Receive customized CSV/Google Sheets template for production, chemical usage, electricity, and discharge data.",
  },
  {
    step: 2,
    title: "Secure Ingestion",
    description: "Upload data manually or via automated integration. All data encrypted at rest and in transit.",
  },
  {
    step: 3,
    title: "Forensic Validation",
    description: "Triangulation engine validates data consistency. Mismatches flagged for investigation before scoring.",
  },
  {
    step: 4,
    title: "Risk Scoring",
    description: "AI models generate compliance risk scores (0-100) per shift/batch with financial impact forecasts.",
  },
  {
    step: 5,
    title: "Alerts & Reports",
    description: "Receive alerts via email/SMS. Access dashboard and downloadable reports for buyers and regulators.",
  },
];

export const beneficiaries = [
  {
    title: "Textile Factories",
    benefits: [
      "Avoid fines & shutdowns",
      "Protect export contracts",
      "Optimize ETP operations",
      "Build buyer trust",
    ],
  },
  {
    title: "Department of Environment",
    benefits: [
      "Verified compliance data",
      "Prevent strategic bypass",
      "Efficient inspection targeting",
      "Measurable impact tracking",
    ],
  },
  {
    title: "Communities & Rivers",
    benefits: [
      "Reduced toxic discharge",
      "Cleaner water bodies",
      "Improved public health",
      "Ecosystem restoration",
    ],
  },
];

export const pricingTiers = [
  {
    name: "Basic",
    price: "1500 BDT",
    description: "Perfect for testing EcoWeave in a single production line or facility.",
    features: [
      "Up to 1 production line",
      "CSV/Sheets upload + data preview",
      "Basic risk scoring (per shift/batch)",
      "Core validation flags (missing fields, ETP-off risk)",
      "Monthly compliance report (demo-ready)",
      "Email support",
      "3-month pilot setup",
    ],
    cta: "Start Basic Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "4000 BDT",
    description: "Comprehensive monitoring for mid-sized facilities with multiple production lines.",
    features: [
      "Up to 5 production lines",
      "Full forensic validation (triangulation: production ↔ invoices ↔ electricity)",
      "Real-time alerts (dashboard + email; SMS optional)",
      "Weekly reports + trend charts",
      "Buyer-ready compliance pack (audit-friendly format)",
      "Priority support",
      "API access (for future integrations)",
    ],
    cta: "Request Demo",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "6000 BDT",
    description: "Full-scale deployment across multiple facilities with advanced integrations.",
    features: [
      "Unlimited production lines",
      "Multi-facility dashboard + role-based views",
      "Custom integrations (meters / invoices / ERP as available)",
      "Real-time monitoring + anomaly detection at scale",
      "Dedicated account manager",
      "Private cloud / on-premise option",
      "White-label reporting (buyer/regulator packs)",
      "SLA & enterprise support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export const faqs = [
  {
    question: "How accurate is the risk scoring?",
    answer: "Our AI models achieve 85%+ accuracy in predicting high-risk discharge periods based on validated production data. Accuracy improves with more historical data and forensic validation of inputs.",
  },
  {
    question: "What if our data has gaps or is incomplete?",
    answer: "EcoWeave flags incomplete data and provides specific guidance on what's missing. The triangulation engine requires minimum data thresholds for reliable scoring. We help you establish systematic data collection processes.",
  },
  {
    question: "Can you integrate with our existing systems?",
    answer: "Yes. Standard tier includes API access for automated data ingestion from your ERP, SCADA, or metering systems. Enterprise tier offers custom integrations with dedicated technical support.",
  },
  {
    question: "Who owns our factory data?",
    answer: "You do. EcoWeave operates on a read-only basis with strict access controls. Your data is encrypted and never shared without explicit permission. Optional on-premise deployment available for sensitive environments.",
  },
  {
    question: "How quickly can we start?",
    answer: "Pilot deployment takes 2 weeks: data template setup, initial upload, validation, and first risk scores. Standard deployment takes 4-6 weeks including integration and team training.",
  },
  {
    question: "What happens if we get a high-risk alert?",
    answer: "High-risk alerts include specific recommendations (e.g., 'Run ETP for next batch'), cost-benefit analysis (potential fine vs ETP cost), and deadline for action. You decide whether to intervene based on financial data.",
  },
];

export const blogPosts = [
  {
    title: "How Risk Scoring Prevents ETP Bypass",
    excerpt: "Learn how predictive analytics identify high-risk production periods before discharge occurs, enabling proactive compliance.",
    category: "Technology",
    date: "2026-02-10",
    readTime: "5 min read",
  },
  {
    title: "Triangulation: Verifying Compliance Data",
    excerpt: "Understanding how cross-verification of production, chemical invoices, and electricity consumption builds forensic-level trust.",
    category: "Methodology",
    date: "2026-02-08",
    readTime: "7 min read",
  },
  {
    title: "Export Compliance Readiness for RMG",
    excerpt: "How global buyers are demanding verified environmental compliance data and what factories need to demonstrate.",
    category: "Industry",
    date: "2026-02-05",
    readTime: "6 min read",
  },
  {
    title: "The Economics of Strategic Pollution",
    excerpt: "Why fixed fines make bypass rational, and how financial risk translation changes the calculus for factory owners.",
    category: "Analysis",
    date: "2026-02-01",
    readTime: "8 min read",
  },
  {
    title: "Bangladesh River Pollution: The Textile Impact",
    excerpt: "A data-driven look at how textile effluent affects Buriganga, Turag, and Shitalakkhya rivers and surrounding communities.",
    category: "Environment",
    date: "2026-01-28",
    readTime: "10 min read",
  },
  {
    title: "From Pilot to Production: Deployment Guide",
    excerpt: "Best practices for rolling out compliance risk monitoring across multiple production lines and facilities.",
    category: "Implementation",
    date: "2026-01-25",
    readTime: "6 min read",
  },
];

export const services = [
  {
    title: "Factory Onboarding & Data Template Setup",
    description: "We work with your team to customize data collection templates, establish baseline metrics, and configure production line parameters.",
    deliverables: [
      "Customized data templates",
      "Baseline production profile",
      "Team training session",
    ],
    timeline: "Week 1",
  },
  {
    title: "Risk Scoring & Alerting Deployment",
    description: "Deploy AI models calibrated to your production patterns. Configure alert thresholds and notification channels.",
    deliverables: [
      "Calibrated risk models",
      "Alert configuration",
      "Dashboard access",
    ],
    timeline: "Week 2",
  },
  {
    title: "Compliance Reporting for Buyers & Regulators",
    description: "Generate buyer-ready compliance reports with verification metrics. Optional Department of Environment report format.",
    deliverables: [
      "Monthly compliance reports",
      "Buyer presentation templates",
      "DoE-compatible formats",
    ],
    timeline: "Ongoing",
  },
  {
    title: "Optional Integrations",
    description: "Connect EcoWeave to your existing systems: flow meters, chemical management software, ERP systems, and electricity monitoring.",
    deliverables: [
      "API integration",
      "Automated data feeds",
      "Real-time monitoring",
    ],
    timeline: "4-6 weeks",
  },
  {
    title: "Support & Training",
    description: "Comprehensive training for factory staff, ongoing technical support, and regular optimization reviews.",
    deliverables: [
      "Training documentation",
      "Priority support channel",
      "Quarterly review calls",
    ],
    timeline: "Ongoing",
  },
];

export const workflow = [
  {
    phase: "Overview",
    title: "How EcoWeave Works",
    description: "A complete workflow from data collection to actionable compliance insights.",
  },
  {
    phase: "Step 1",
    title: "Data Collection",
    description: "Factories input production data through CSV uploads or automated integrations.",
    details: [
      "Production volume per shift",
      "Chemical usage and invoices",
      "Electricity consumption",
      "Discharge timing (if available)",
    ],
  },
  {
    phase: "Step 2",
    title: "Forensic Validation",
    description: "Cross-reference three data sources to verify authenticity and completeness.",
    details: [
      "Production-chemical correlation",
      "Chemical-electricity alignment",
      "Flag mismatches and anomalies",
      "Calculate confidence score",
    ],
  },
  {
    phase: "Step 3",
    title: "Risk Scoring",
    description: "AI models analyze patterns and predict compliance risk (0-100) per batch/shift.",
    details: [
      "Historical pattern analysis",
      "Production intensity scoring",
      "Operational timing risk",
      "Financial impact estimation",
    ],
  },
  {
    phase: "Step 4",
    title: "Alerts & Action",
    description: "Receive real-time alerts with cost-benefit recommendations before discharge occurs.",
    details: [
      "High-risk batch detection",
      "Financial loss vs ETP cost",
      "Specific recommendations",
      "Action deadline",
    ],
  },
  {
    phase: "Step 5",
    title: "Reporting & Trust",
    description: "Generate verified compliance reports for buyers, regulators, and stakeholders.",
    details: [
      "Compliance score trends",
      "Verified data attestation",
      "Export-ready documentation",
      "Continuous improvement metrics",
    ],
  },
];
