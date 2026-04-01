# EcoWeave - Textile Compliance Monitoring Dashboard

**EcoWeave** is a real-time compliance monitoring and risk analysis dashboard designed for textile manufacturing facilities to detect potential wastewater treatment bypasses and ensure environmental compliance.

## 🎯 Project Overview

EcoWeave uses data triangulation and multi-factor validation to identify suspicious patterns in production data that might indicate ETP (Effluent Treatment Plant) bypasses. By analyzing metrics like production volume, chemical usage, electricity consumption, and ETP runtime, the system generates risk scores and compliance alerts to help facilities maintain environmental standards.

### Key Problem Solved

Textile facilities may bypass wastewater treatment to reduce operational costs, leading to environmental violations. EcoWeave detects these bypasses through automated anomaly detection and cross-validation of operational metrics.

---

## ✨ Features

### 📊 Dashboard Analytics

- **4 Real-time KPI Cards** with circular progress indicators
  - Average Risk Score (0-100 scale)
  - High Risk Batches (count & percentage)
  - Total Anomalies Detected
  - Data Completeness Score
- **Visual Analytics**
  - Risk Score Trend Chart (monthly timeline)
  - Anomaly Distribution Bar Chart
  - Compliance Metrics Radar Chart
  - Validation Summary Panel

### 📤 Data Management

- **CSV Upload Interface**
  - Drag-and-drop file upload
  - Authenticated backend upload (`/api/csv-upload/upload`) when backend is available
  - Sample data loader for demos
  - Real-time validation feedback
  - Automatic fallback to local mode + localStorage when backend is unavailable
- **Data Preview**
  - Filterable batch table
  - Risk score visualization
  - Search by batch ID
  - Risk threshold filtering

### 🚨 Alert System

- **Automated Alert Generation**
  - High-risk batch detection (score ≥ 75)
  - Financial impact estimation (BDT)
  - ROI calculation for treatment vs bypass
  - Alert status workflow (Pending → Acknowledged → Resolved)

### 📁 Batch Management

- **Individual Batch Analysis**
  - Detailed risk breakdown
  - Forensic evidence panel
  - Triangulation metrics
  - Related high-risk batches
- **Evidence Reports**
  - Printable PDF reports (via browser print)
  - Professional compliance documentation
  - Executive summary
  - Recommended actions

### 🔍 Validation Rules (7 Checks)

1. **Missing Fields** - Detects incomplete data
2. **Invalid Values** - Validates data ranges
3. **Triangulation Mismatch** - Cross-checks electricity/chemical/production ratios
4. **Power Anomaly** - Flags unusual electricity patterns
5. **Treatment Inconsistency** - Identifies low ETP runtime
6. **Invoice Mismatch** - Detects pricing discrepancies
7. **Probable Bypass** - High-confidence bypass detection

---

## 🛠️ Tech Stack

### Core Technologies

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **State Management**: React Hooks + backend APIs + local fallback storage

### Key Features

- Server Components & Client Components
- File-based routing with route groups
- CSS Modules for print styling
- Responsive design (mobile-first)
- No external chart libraries (pure CSS/SVG)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (app)/                    # App route group
│   │   │   ├── layout.tsx            # Sidebar + main layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Main dashboard
│   │   │   ├── data-upload/
│   │   │   │   └── page.tsx          # CSV upload page
│   │   │   ├── batches/
│   │   │   │   ├── page.tsx          # All batches list
│   │   │   │   └── [batchId]/
│   │   │   │       ├── page.tsx      # Batch detail
│   │   │   │       └── print/
│   │   │   │           └── page.tsx  # Print report
│   │   │   └── alerts/
│   │   │       └── page.tsx          # Alerts management
│   │   ├── (marketing)/              # Marketing route group
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── ...
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── app/                      # App-specific components
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardClient.tsx       # Main dashboard logic
│   │   │   │   ├── AnalysisCard.tsx          # KPI cards with circular progress
│   │   │   │   ├── TrendChart.tsx            # Line chart component
│   │   │   │   ├── BarChart.tsx              # Bar chart component
│   │   │   │   ├── RadarChart.tsx            # Radar/spider chart
│   │   │   │   ├── ValidationPanel.tsx       # Data health summary
│   │   │   │   ├── AlertsPanel.tsx           # Alert cards
│   │   │   │   ├── UploadCsvCard.tsx         # File upload widget
│   │   │   │   └── DataPreviewTable.tsx      # Batch data table
│   │   │   ├── batches/
│   │   │   │   ├── BatchDetailsClient.tsx    # Batch detail page
│   │   │   │   ├── BatchPrintClient.tsx      # Print report
│   │   │   │   └── print.module.css          # Print-specific CSS
│   │   │   └── data-upload/
│   │   │       └── DataUploadClient.tsx      # Upload page logic
│   │   ├── sections/                 # Marketing sections
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturesGrid.tsx
│   │   │   ├── HowItWorksTimeline.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                       # Reusable UI components
│   │       └── Button.tsx
│   │
│   └── lib/
│       ├── types.ts                  # TypeScript interfaces
│       ├── risk.ts                   # Core risk logic (validation, scoring)
│       ├── mock.ts                   # Sample data (12 batches)
│       ├── content.ts                # Marketing content
│       └── utils.ts                  # Utility functions
│
├── public/
│   ├── templates/
│   │   └── ecoweave_template.csv    # CSV template for users
│   └── logo/
│
├── components.json                   # UI config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd EcoWeave/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure frontend environment**
   Create `.env.local` and set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 Usage Guide

### 1. Upload Data

**Option A: Upload CSV File**

1. Navigate to **Data Upload** page (sidebar menu)
2. Click or drag-and-drop CSV file
3. File format: `batch_id, shift_date, shift_name, production_volume_kg, chemical_usage_kg, etp_runtime_min, electricity_kwh, chemical_invoice_bdt, etp_cost_bdt, notes`
4. If backend is reachable, data is uploaded, scored, and persisted by backend services
5. If backend is offline, client falls back to local parsing/scoring for demo continuity

**Option B: Load Sample Data**

1. Click "Load Sample Data" button
2. 12 pre-configured batches load instantly
3. Includes various risk scenarios (bypasses, missing data, anomalies)

**Download Template**

- Click "Download Template" for proper CSV format
- Template located at `/templates/ecoweave_template.csv`

### 2. View Dashboard

Navigate to **Dashboard** to see:

- **KPI Cards**: Overall health metrics
- **Charts**: Trends, distributions, compliance metrics
- **Validation Panel**: Data quality and top issues
- **Active Alerts**: High-risk batches requiring attention

### 3. Analyze Batches

**View All Batches**

1. Go to **Batches** page
2. Search by batch ID
3. Filter by risk level (All/High/Medium/Low)
4. Click any batch to see details

**Batch Detail Page**

- Risk score breakdown
- Forensic evidence (validation flags)
- Financial metrics (loss estimation, ROI)
- Raw data table
- Export options

### 4. Manage Alerts

**Alerts Page**

1. View all generated alerts
2. Filter by status (Pending/Acknowledged/Resolved)
3. Sort by risk score or date
4. Change alert status
5. Export individual reports

**Alert Actions**

- **View Details**: Navigate to batch detail
- **Export PDF**: Open print dialog for PDF save
- **Change Status**: Update workflow state

### 5. Export Reports

**Browser Print Method** (No PDF library needed)

1. Navigate to batch detail page
2. Click "Export Evidence Report"
3. Browser print dialog opens
4. Choose "Save as PDF"
5. Professional A4-formatted report downloads

**Report Sections**

1. Executive Summary
2. Forensic Evidence (validation flags)
3. Risk Score Drivers
4. Triangulation Metrics
5. Related High-Risk Batches
6. Raw Batch Data
7. Recommended Action

---

## 🔧 Core Components Explained

### Risk Scoring Algorithm (`src/lib/risk.ts`)

**Base Score Calculation**

```typescript
Base Risk = (Production Volume / 10) + (Chemical Usage)
```

**Modifiers**

- **High Production Penalty**: +25 (if > 700 kg)
- **Low ETP Runtime Penalty**: +30 (if < 20 min)
- **High Chemical Usage Penalty**: +20 (if > 60 kg)
- **Night Shift Multiplier**: ×1.15
- **Validation Flag Penalties**:
  - High severity: +15 per flag
  - Medium severity: +10 per flag
  - Low severity: +5 per flag

**Score Range**: 0-100 (capped)

- **0-49**: Low Risk (Green)
- **50-74**: Medium Risk (Orange)
- **75-100**: High Risk (Red)

### Financial Loss Estimation

```typescript
Estimated Loss = Base Loss + (Risk Score × Flag Multiplier × Severity Factor)

Base Loss = 50,000 BDT
Flag Multiplier = 5,000 BDT per flag
Severity Factor:
  - High: 3×
  - Medium: 2×
  - Low: 1×
```

### Triangulation Validation

**Electricity Check**

```
Normal Range: 0.08-0.12 kWh per kg production
Flag if: < 0.08 (too low, possible bypass)
```

**Chemical Ratio Check**

```
Normal Range: 0.08-0.12 kg per kg production
Flag if: Outside range
```

**Treatment Intensity Check**

```
Normal Range: 0.03-0.05 min per kg production
Flag if: < 0.03 (inadequate treatment)
```

**Invoice Validation**

```
Expected: ~800 BDT per kg chemical
Flag if: Deviation > 40%
```

---

## 💾 Data Storage

### localStorage Keys (Fallback Mode)

```javascript
// Batch data
localStorage.setItem("ecoweave_dashboard_data", JSON.stringify({ batches }));

// Alerts data
localStorage.setItem("ecoweave_dashboard_alerts", JSON.stringify(alerts));
```

### Data Persistence

- Primary mode: backend persistence (batches, alerts, stats, reports) via API
- Fallback mode: localStorage when backend health check fails
- Fallback data persists across page refreshes
- Local fallback data can be cleared via "Reset Demo" or "Clear Data" buttons

---

## 🎨 Styling & Theming

### Tailwind Configuration

- Custom color variables in `globals.css`
- Dark mode support (CSS variables)
- Print-specific styles in `print.module.css`

### Print Styling

```css
@media print {
  .no-print {
    display: none;
  }
  @page {
    size: A4;
    margin: 15mm 20mm;
  }
  -webkit-print-color-adjust: exact;
}
```

---

## 🧪 Sample Data

**12 Pre-configured Batches** (`src/lib/mock.ts`)

| Batch ID | Risk Score | Scenario                |
| -------- | ---------- | ----------------------- |
| B-2401   | 88         | High-risk bypass        |
| B-2402   | 35         | Normal operation        |
| B-2403   | 72         | Missing data            |
| B-2404   | 42         | Normal with notes       |
| B-2405   | 58         | Medium risk             |
| B-2406   | 31         | Low utilization         |
| B-2407   | 65         | Partial missing data    |
| B-2408   | 48         | Standard production     |
| B-2409   | 52         | Night shift medium risk |
| B-2410   | 78         | Invoice mismatch        |
| B-2411   | 39         | Normal day shift        |
| B-2412   | 82         | Severe bypass           |

---

## 🗺️ Route Structure

### App Routes (with Sidebar)

```
/dashboard           → Main analytics dashboard
/data-upload        → CSV upload interface
/batches            → All batches list
/batches/:id        → Individual batch detail
/batches/:id/print  → Printable evidence report
/alerts             → Alert management
```

### Marketing Routes (with Navbar)

```
/                   → Landing page
/about              → About page
/services           → Services page
/pricing            → Pricing page
/blog               → Blog page
/contact            → Contact page
/sample-report      → Sample report preview
```

---

## 🔐 Security & Privacy

- **Authenticated API access**: protected endpoints use JWT bearer tokens
- **Backend mode**: uploaded CSV and derived analytics are persisted server-side
- **Fallback mode**: if backend is unavailable, processing remains local in browser
- **Frontend app**: no tracking analytics included in this project by default

---

## 📱 Responsive Design

- **Mobile**: Single column layout, collapsible sections
- **Tablet**: 2-column grids, optimized spacing
- **Desktop**: Full multi-column layouts with sidebar
- **Print**: A4-optimized layout with page breaks

---

## 🔄 Data Flow

```
1. CSV selected on Data Upload page
  ↓
2. Health check backend
  ↓
3a. Backend online:
   upload to /api/csv-upload/upload → backend scoring + persistence
   ↓
   dashboard fetches /api/batches, /api/batches/stats, /api/alerts

3b. Backend offline:
   local parse + validate + score
   ↓
   fallback data saved to localStorage
```

---

## 🎯 Key TypeScript Interfaces

```typescript
interface BatchRecord {
  batch_id: string;
  shift_date: string;
  shift_name: string;
  production_volume_kg: number | null;
  chemical_usage_kg: number | null;
  etp_runtime_min: number | null;
  electricity_kwh: number | null;
  chemical_invoice_bdt: number | null;
  etp_cost_bdt: number | null;
  notes?: string;
}

interface ValidationFlag {
  batch_id: string;
  type:
    | "missing_field"
    | "invalid_value"
    | "triangulation_mismatch"
    | "power_anomaly"
    | "treatment_inconsistency"
    | "invoice_mismatch"
    | "probable_bypass";
  message: string;
  severity: "low" | "medium" | "high";
}

interface ScoredBatch extends BatchRecord {
  risk_score: number;
  estimated_loss_bdt: number;
  flags: ValidationFlag[];
}

interface Alert {
  id: string;
  batch_id: string;
  risk_score: number;
  estimated_loss_bdt: number;
  etp_cost_bdt: number;
  recommendation: string;
  flags: ValidationFlag[];
  status: "pending" | "acknowledged" | "resolved";
  createdAt: string;
}
```

---

## 🚧 Future Enhancements

### Planned Features

- [ ] User authentication & multi-tenancy
- [ ] Real-time data streaming
- [ ] IoT sensor integration
- [ ] Machine learning risk prediction
- [ ] Historical trend analysis
- [ ] Email alert notifications
- [ ] Advanced reporting (charts in PDFs)
- [ ] Data export (Excel, JSON)
- [ ] Audit log tracking

### Scalability

- [ ] PostgreSQL/MongoDB database
- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] Microservices architecture
- [ ] Containerization (Docker)
- [ ] Cloud deployment (AWS/Azure)

---

## 🤝 Contributing

This is a demo project for **GenMorphix EcoWeave**.

### Development Guidelines

1. Follow TypeScript strict mode
2. Use Tailwind utility classes
3. Maintain responsive design
4. Write semantic HTML
5. Keep components modular
6. Add comments for complex logic

---

## 📄 License

Proprietary - GenMorphix © 2026

---

## 👥 Team

**Project**: EcoWeave Compliance Monitoring Dashboard  
**Organization**: GenMorphix  
**Category**: Environmental Technology / Textile Manufacturing

---

## 📞 Support

For questions or support regarding EcoWeave:

- Visit our website
- Contact via the contact page
- Review the sample report for demo

---

## 🎓 Learning Resources

### Technologies Used

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)
- [Lucide Icons](https://lucide.dev/)

### Concepts Demonstrated

- **Data Triangulation**: Cross-validation using multiple metrics
- **Risk Scoring**: Multi-factor heuristic algorithms
- **Anomaly Detection**: Pattern recognition in operational data
- **Compliance Monitoring**: Real-time alerting systems
- **Evidence Generation**: Forensic reporting for audits

---

## 📊 Statistics

- **Total Components**: 25+
- **Total Routes**: 12+
- **Lines of Code**: ~3,500+
- **Validation Rules**: 7
- **Sample Batches**: 12
- **localStorage Keys**: 2
- **Chart Types**: 4 (Line, Bar, Radar, Circular)

---

**Built with ❤️ for a sustainable textile industry**
