import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── Brand Colors ───
const BRAND = {
  primary: "#0B1D3A",
  accent: "#00A3FF",
  accentLight: "#E6F5FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  white: "#FFFFFF",
};

const CHART_COLORS = ["#0B1D3A", "#00A3FF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// ─── Migration Presets ───
const MIGRATION_PRESETS = [
  {
    id: "slack-zoom-chat",
    name: "Slack → Zoom Team Chat",
    source: "Slack",
    destination: "Zoom Team Chat",
    icon: "💬",
    complexity: 1.0,
    description: "Migrate channels, message history, files, integrations, and workflows",
    typicalWeeksDIY: 16,
    typicalWeeksCodimite: 6,
    defaultServices: {
      dataMapping: true,
      channelMigration: true,
      userProvisioning: true,
      integrationSetup: true,
      changeManagement: true,
      training: true,
      qaValidation: true,
      rollbackPlanning: true,
      postMigrationSupport: true,
    },
  },
  {
    id: "gong-zoom-video",
    name: "Gong → Zoom Revenue Accelerator",
    source: "Gong",
    destination: "Zoom Revenue Accelerator",
    icon: "🎥",
    complexity: 1.3,
    description: "Migrate conversation intelligence, call recordings, analytics, and deal insights",
    typicalWeeksDIY: 20,
    typicalWeeksCodimite: 8,
    defaultServices: {
      dataMapping: true,
      recordingMigration: true,
      analyticsSetup: true,
      integrationSetup: true,
      changeManagement: true,
      training: true,
      qaValidation: true,
      rollbackPlanning: true,
      postMigrationSupport: true,
    },
  },
  {
    id: "miro-zoom-whiteboards",
    name: "Miro → Zoom Whiteboards",
    source: "Miro",
    destination: "Zoom Whiteboards",
    icon: "🎨",
    complexity: 0.8,
    description: "Migrate boards, templates, team workspaces, and collaborative content",
    typicalWeeksDIY: 12,
    typicalWeeksCodimite: 5,
    defaultServices: {
      dataMapping: true,
      contentMigration: true,
      templateSetup: true,
      integrationSetup: true,
      changeManagement: true,
      training: true,
      qaValidation: true,
      rollbackPlanning: true,
      postMigrationSupport: true,
    },
  },
  {
    id: "custom",
    name: "Custom Migration",
    source: "",
    destination: "",
    icon: "⚙️",
    complexity: 1.0,
    description: "Define your own source and destination platforms",
    typicalWeeksDIY: 16,
    typicalWeeksCodimite: 6,
    defaultServices: {
      dataMapping: true,
      changeManagement: true,
      training: true,
      qaValidation: true,
      rollbackPlanning: true,
      postMigrationSupport: true,
    },
  },
];

// ─── Codimite Service Definitions ───
const SERVICE_CATALOG = [
  { id: "programManagement", name: "Intelligent Program Management", description: "Dedicated PM with enterprise migration expertise, executive reporting, risk mitigation, and stakeholder alignment", baseRate: 225, hoursPerWeek: 20, category: "core" },
  { id: "dataMapping", name: "Data Architecture & Mapping", description: "Schema analysis, data mapping, transformation rules, and integrity validation across platforms", baseRate: 200, hoursPerWeek: 30, category: "core" },
  { id: "changeManagement", name: "Change Management & Communications", description: "Adoption strategy, stakeholder communications, resistance management, and organizational readiness", baseRate: 195, hoursPerWeek: 15, category: "core" },
  { id: "technicalMigration", name: "Technical Migration Execution", description: "API integrations, data extraction/load, automated migration scripts, and parallel environment setup", baseRate: 210, hoursPerWeek: 35, category: "execution" },
  { id: "training", name: "End-User Training & Enablement", description: "Custom training curriculum, role-based sessions, train-the-trainer programs, and self-service resources", baseRate: 175, hoursPerWeek: 15, category: "enablement" },
  { id: "qaValidation", name: "QA & Validation Testing", description: "Comprehensive test plans, data integrity validation, UAT coordination, and performance benchmarking", baseRate: 195, hoursPerWeek: 20, category: "execution" },
  { id: "rollbackPlanning", name: "Rollback & Contingency Planning", description: "Full rollback procedures, disaster recovery plans, data backup strategies, and business continuity", baseRate: 210, hoursPerWeek: 8, category: "risk" },
  { id: "postMigrationSupport", name: "Post-Migration Hypercare", description: "30-60-90 day support, issue resolution, optimization recommendations, and adoption monitoring", baseRate: 185, hoursPerWeek: 12, category: "support" },
  { id: "securityCompliance", name: "Security & Compliance Review", description: "Security assessment, compliance gap analysis, data privacy validation, and audit documentation", baseRate: 230, hoursPerWeek: 10, category: "risk" },
  { id: "integrationSetup", name: "Integration & Workflow Setup", description: "Third-party integrations, workflow automation, custom connector development, and API configuration", baseRate: 205, hoursPerWeek: 18, category: "execution" },
];

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

const formatNumber = (val) => val.toLocaleString();

// ─── Reusable Components ───
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: BRAND.primary, display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
        <span style={{ fontSize: 26 }}>{icon}</span> {title}
      </h2>
      {subtitle && <p style={{ color: BRAND.gray500, margin: "4px 0 0 36px", fontSize: 14 }}>{subtitle}</p>}
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step = 1, format = "number", helpText }) {
  const displayValue = format === "currency" ? formatCurrency(value) : format === "percent" ? `${value}%` : format === "weeks" ? `${value} weeks` : formatNumber(value);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray700 }}>{label}</label>
        <span style={{ fontSize: 15, fontWeight: 700, color: BRAND.accent, fontFamily: "monospace" }}>{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: BRAND.accent, height: 6, cursor: "pointer" }}
      />
      {helpText && <p style={{ fontSize: 12, color: BRAND.gray400, margin: "4px 0 0 0" }}>{helpText}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange, description }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 10,
        cursor: "pointer",
        background: checked ? BRAND.accentLight : BRAND.gray50,
        border: `1.5px solid ${checked ? BRAND.accent : BRAND.gray200}`,
        transition: "all 0.15s",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 40,
          minWidth: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? BRAND.accent : BRAND.gray300,
          position: "relative",
          transition: "background 0.15s",
          marginTop: 1,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: BRAND.white,
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            transition: "left 0.15s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray800 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: BRAND.gray500, marginTop: 2 }}>{description}</div>}
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, color = BRAND.accent, large = false }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}11, ${color}08)`,
        border: `1.5px solid ${color}33`,
        borderRadius: 14,
        padding: large ? "28px 24px" : "18px 16px",
        textAlign: "center",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: large ? 36 : 26, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: large ? 15 : 13, fontWeight: 600, color: BRAND.gray700, marginTop: 6 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 12, color: BRAND.gray500, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

// ─── Custom Line Items ───
function CustomLineItems({ items, onChange }) {
  const addItem = () => onChange([...items, { name: "", cost: 0 }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: field === "cost" ? Number(val) : val };
    onChange(updated);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray700 }}>Custom Cost Line Items</span>
        <button
          onClick={addItem}
          style={{
            background: BRAND.accent,
            color: BRAND.white,
            border: "none",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add Item
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Description"
            value={item.name}
            onChange={(e) => updateItem(idx, "name", e.target.value)}
            style={{
              flex: 2,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${BRAND.gray200}`,
              fontSize: 13,
              outline: "none",
            }}
          />
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: BRAND.gray400, fontSize: 13 }}>$</span>
            <input
              type="number"
              placeholder="0"
              value={item.cost || ""}
              onChange={(e) => updateItem(idx, "cost", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 22px",
                borderRadius: 8,
                border: `1px solid ${BRAND.gray200}`,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={() => removeItem(idx)}
            style={{
              background: BRAND.dangerLight,
              color: BRAND.danger,
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Calculator Component ───
export default function CodimiteROICalculator() {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(0);

  // Company Info
  const [companyName, setCompanyName] = useState("");
  const [employeeCount, setEmployeeCount] = useState(5000);
  const [avgSalary, setAvgSalary] = useState(95000);
  const [affectedUsers, setAffectedUsers] = useState(3000);

  // Migration Selection
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customSource, setCustomSource] = useState("");
  const [customDest, setCustomDest] = useState("");

  // DIY Assumptions
  const [diyWeeks, setDiyWeeks] = useState(16);
  const [diyFTECount, setDiyFTECount] = useState(4);
  const [diyFTEPercentAllocation, setDiyFTEPercentAllocation] = useState(60);
  const [productivityLossPercent, setProductivityLossPercent] = useState(15);
  const [productivityLossWeeks, setProductivityLossWeeks] = useState(6);
  const [diyRiskPercent, setDiyRiskPercent] = useState(25);
  const [diyCustomItems, setDiyCustomItems] = useState([]);

  // Codimite Services
  const [enabledServices, setEnabledServices] = useState({
    programManagement: true,
    dataMapping: true,
    changeManagement: true,
    technicalMigration: true,
    training: true,
    qaValidation: true,
    rollbackPlanning: true,
    postMigrationSupport: true,
    securityCompliance: false,
    integrationSetup: true,
  });
  const [codimiteWeeks, setCodimiteWeeks] = useState(6);
  const [codimiteCustomItems, setCodimiteCustomItems] = useState([]);
  const [codimiteDiscount, setCodimiteDiscount] = useState(0);

  // Select a preset
  const handlePresetSelect = useCallback((preset) => {
    setSelectedPreset(preset);
    if (preset.id !== "custom") {
      setDiyWeeks(preset.typicalWeeksDIY);
      setCodimiteWeeks(preset.typicalWeeksCodimite);
    }
  }, []);

  // ─── Cost Calculations ───
  const calculations = useMemo(() => {
    const hourlyRate = avgSalary / 2080;
    const weeklyRate = hourlyRate * 40;

    // DIY Costs
    const diyLaborCost = diyFTECount * weeklyRate * (diyFTEPercentAllocation / 100) * diyWeeks;
    const diyProductivityLoss = affectedUsers * weeklyRate * (productivityLossPercent / 100) * productivityLossWeeks;
    const diyOpportunityCost = diyFTECount * weeklyRate * ((100 - diyFTEPercentAllocation) / 100) * diyWeeks * 0.3;
    const diySubtotal = diyLaborCost + diyProductivityLoss + diyOpportunityCost;
    const diyRiskCost = diySubtotal * (diyRiskPercent / 100);
    const diyCustomTotal = diyCustomItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const diyTotalCost = diySubtotal + diyRiskCost + diyCustomTotal;

    // Codimite Costs
    const codimiteServiceCosts = {};
    let codimiteServicesTotal = 0;
    SERVICE_CATALOG.forEach((service) => {
      if (enabledServices[service.id]) {
        const cost = service.baseRate * service.hoursPerWeek * codimiteWeeks;
        const scaleFactor = employeeCount > 10000 ? 1.4 : employeeCount > 5000 ? 1.2 : 1.0;
        const scaledCost = cost * scaleFactor;
        codimiteServiceCosts[service.id] = scaledCost;
        codimiteServicesTotal += scaledCost;
      }
    });
    const codimiteCustomTotal = codimiteCustomItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const discountAmount = codimiteServicesTotal * (codimiteDiscount / 100);
    const codimiteTotalCost = codimiteServicesTotal - discountAmount + codimiteCustomTotal;

    // Remaining internal costs when using Codimite (reduced team, shorter period)
    const internalWithCodimite = 1 * weeklyRate * 0.25 * codimiteWeeks;
    const productivityLossWithCodimite = affectedUsers * weeklyRate * (productivityLossPercent / 100) * Math.ceil(productivityLossWeeks * 0.4);
    const totalWithCodimite = codimiteTotalCost + internalWithCodimite + productivityLossWithCodimite;

    // ROI
    const totalSavings = diyTotalCost - totalWithCodimite;
    const roiPercent = codimiteTotalCost > 0 ? ((totalSavings / codimiteTotalCost) * 100) : 0;
    const weeksSaved = diyWeeks - codimiteWeeks;
    const riskReduction = diyRiskPercent * 0.75;

    return {
      hourlyRate,
      weeklyRate,
      diyLaborCost,
      diyProductivityLoss,
      diyOpportunityCost,
      diySubtotal,
      diyRiskCost,
      diyCustomTotal,
      diyTotalCost,
      codimiteServiceCosts,
      codimiteServicesTotal,
      codimiteCustomTotal,
      discountAmount,
      codimiteTotalCost,
      internalWithCodimite,
      productivityLossWithCodimite,
      totalWithCodimite,
      totalSavings,
      roiPercent,
      weeksSaved,
      riskReduction,
    };
  }, [
    avgSalary, employeeCount, affectedUsers, diyFTECount, diyFTEPercentAllocation,
    diyWeeks, productivityLossPercent, productivityLossWeeks, diyRiskPercent,
    diyCustomItems, enabledServices, codimiteWeeks, codimiteCustomItems,
    codimiteDiscount,
  ]);

  // Chart data
  const comparisonChartData = [
    { name: "Internal Labor", DIY: Math.round(calculations.diyLaborCost), Codimite: Math.round(calculations.internalWithCodimite) },
    { name: "Productivity Loss", DIY: Math.round(calculations.diyProductivityLoss), Codimite: Math.round(calculations.productivityLossWithCodimite) },
    { name: "Opportunity Cost", DIY: Math.round(calculations.diyOpportunityCost), Codimite: 0 },
    { name: "Risk Exposure", DIY: Math.round(calculations.diyRiskCost), Codimite: 0 },
    { name: "Professional Services", DIY: 0, Codimite: Math.round(calculations.codimiteTotalCost) },
  ];

  const serviceBreakdownData = SERVICE_CATALOG.filter((s) => enabledServices[s.id]).map((s) => ({
    name: s.name.length > 20 ? s.name.substring(0, 20) + "..." : s.name,
    fullName: s.name,
    value: Math.round(calculations.codimiteServiceCosts[s.id] || 0),
  }));

  const totalComparisonData = [
    { name: "Do-It-Yourself", cost: Math.round(calculations.diyTotalCost) },
    { name: "With Codimite", cost: Math.round(calculations.totalWithCodimite) },
  ];

  // Steps
  const steps = ["Company Info", "Migration Type", "DIY Costs", "Codimite Services", "ROI Results"];

  const canProceed = () => {
    if (currentStep === 1 && !selectedPreset) return false;
    if (currentStep === 1 && selectedPreset?.id === "custom" && (!customSource || !customDest)) return false;
    return true;
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#F0F4F8", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, #162D54 100%)`,
          padding: "32px 24px 28px",
          color: BRAND.white,
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: BRAND.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800 }}>C</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>codimite.ai</h1>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Enterprise Migration Intelligence</p>
            </div>
          </div>
          <h2 style={{ margin: "16px 0 4px", fontSize: 20, fontWeight: 600 }}>Migration ROI Calculator</h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.75, maxWidth: 600 }}>
            Discover the true cost of platform migration — and how Codimite's professional services deliver measurable savings, reduced risk, and faster time-to-value.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => { if (idx < currentStep || (idx === currentStep)) return; if (idx <= currentStep + 1 && canProceed()) setCurrentStep(idx); }}
              style={{
                flex: 1,
                textAlign: "center",
                cursor: idx <= currentStep ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  height: 5,
                  borderRadius: 3,
                  background: idx <= currentStep ? BRAND.accent : BRAND.gray200,
                  marginBottom: 6,
                  transition: "background 0.2s",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: idx === currentStep ? 700 : 500,
                  color: idx <= currentStep ? BRAND.accent : BRAND.gray400,
                }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 40px" }}>
        {/* Step 0: Company Info */}
        {currentStep === 0 && (
          <div>
            <SectionHeader icon="🏢" title="Company Information" subtitle="Tell us about the organization to calibrate cost estimates" />
            <Card>
              <div style={{ padding: 28 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray700, display: "block", marginBottom: 6 }}>Company / Client Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${BRAND.gray200}`,
                      fontSize: 15,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <Slider label="Total Employees" value={employeeCount} onChange={setEmployeeCount} min={100} max={150000} step={100} helpText="Total headcount across the organization" />
                <Slider label="Affected Users (to be migrated)" value={affectedUsers} onChange={setAffectedUsers} min={50} max={Math.min(employeeCount, 100000)} step={50} helpText="Number of users directly impacted by the migration" />
                <Slider label="Average Fully-Loaded Annual Salary" value={avgSalary} onChange={setAvgSalary} min={40000} max={250000} step={5000} format="currency" helpText="Including benefits, taxes, and overhead (typically 1.3-1.5x base salary)" />
                <div style={{ background: BRAND.gray50, borderRadius: 10, padding: "14px 18px", marginTop: 16, display: "flex", gap: 24 }}>
                  <div>
                    <span style={{ fontSize: 12, color: BRAND.gray500 }}>Effective Hourly Rate</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.primary }}>{formatCurrency(calculations.hourlyRate)}/hr</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: BRAND.gray500 }}>Weekly Rate per FTE</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.primary }}>{formatCurrency(calculations.weeklyRate)}/wk</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 1: Migration Type */}
        {currentStep === 1 && (
          <div>
            <SectionHeader icon="🔄" title="Migration Type" subtitle="Select a preset migration path or define a custom one" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280, 1fr))", gap: 12 }}>
              {MIGRATION_PRESETS.map((preset) => (
                <Card key={preset.id}>
                  <div
                    onClick={() => handlePresetSelect(preset)}
                    style={{
                      padding: 20,
                      cursor: "pointer",
                      borderRadius: 12,
                      border: selectedPreset?.id === preset.id ? `2px solid ${BRAND.accent}` : "2px solid transparent",
                      background: selectedPreset?.id === preset.id ? BRAND.accentLight : BRAND.white,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{preset.icon}</div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>{preset.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: BRAND.gray500, lineHeight: 1.5 }}>{preset.description}</p>
                    {preset.id !== "custom" && (
                      <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 12, color: BRAND.gray400 }}>
                        <span>DIY: ~{preset.typicalWeeksDIY} wks</span>
                        <span>Codimite: ~{preset.typicalWeeksCodimite} wks</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            {selectedPreset?.id === "custom" && (
              <Card className="mt-4">
                <div style={{ padding: 20, marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray700, display: "block", marginBottom: 6 }}>Source Platform</label>
                      <input
                        type="text"
                        value={customSource}
                        onChange={(e) => setCustomSource(e.target.value)}
                        placeholder="e.g., Microsoft Teams"
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BRAND.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10, fontSize: 20 }}>→</div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray700, display: "block", marginBottom: 6 }}>Destination Platform</label>
                      <input
                        type="text"
                        value={customDest}
                        onChange={(e) => setCustomDest(e.target.value)}
                        placeholder="e.g., Zoom Workplace"
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BRAND.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: DIY Costs */}
        {currentStep === 2 && (
          <div>
            <SectionHeader icon="🔧" title="Do-It-Yourself Cost Estimate" subtitle="Model what it would cost to handle this migration internally" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>Internal Resources</h3>
                  <Slider label="Project Duration" value={diyWeeks} onChange={setDiyWeeks} min={4} max={52} format="weeks" />
                  <Slider label="Internal FTEs Assigned" value={diyFTECount} onChange={setDiyFTECount} min={1} max={20} />
                  <Slider label="% Time Allocated to Migration" value={diyFTEPercentAllocation} onChange={setDiyFTEPercentAllocation} min={10} max={100} format="percent" helpText="How much of each FTE's time is dedicated to this project" />
                </div>
              </Card>
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>Productivity & Risk</h3>
                  <Slider label="Productivity Loss During Transition" value={productivityLossPercent} onChange={setProductivityLossPercent} min={0} max={50} format="percent" helpText="Average productivity drop per affected user" />
                  <Slider label="Duration of Productivity Impact" value={productivityLossWeeks} onChange={setProductivityLossWeeks} min={1} max={20} format="weeks" />
                  <Slider label="Risk Premium (failed migration, rework)" value={diyRiskPercent} onChange={setDiyRiskPercent} min={0} max={50} format="percent" helpText="Probability-weighted cost of delays, rework, or data issues" />
                </div>
              </Card>
            </div>
            <Card className="mt-4">
              <div style={{ padding: 24, marginTop: 12 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>DIY Cost Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ background: BRAND.gray50, borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: BRAND.gray500 }}>Internal Labor</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.primary }}>{formatCurrency(calculations.diyLaborCost)}</div>
                  </div>
                  <div style={{ background: BRAND.warningLight, borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: BRAND.gray500 }}>Productivity Loss</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.warning }}>{formatCurrency(calculations.diyProductivityLoss)}</div>
                  </div>
                  <div style={{ background: BRAND.gray50, borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: BRAND.gray500 }}>Opportunity Cost</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.primary }}>{formatCurrency(calculations.diyOpportunityCost)}</div>
                  </div>
                  <div style={{ background: BRAND.dangerLight, borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: BRAND.gray500 }}>Risk Exposure</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.danger }}>{formatCurrency(calculations.diyRiskCost)}</div>
                  </div>
                </div>
                <CustomLineItems items={diyCustomItems} onChange={setDiyCustomItems} />
                <div style={{ marginTop: 16, padding: "14px 18px", background: BRAND.primary, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 15 }}>Total DIY Cost Estimate</span>
                  <span style={{ color: BRAND.white, fontWeight: 800, fontSize: 24, fontFamily: "monospace" }}>{formatCurrency(calculations.diyTotalCost)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Codimite Services */}
        {currentStep === 3 && (
          <div>
            <SectionHeader icon="🚀" title="Codimite Professional Services" subtitle="Select the services included in your engagement" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Card>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>Service Selection</h3>
                    <p style={{ margin: "0 0 16px", fontSize: 13, color: BRAND.gray500 }}>Toggle services to customize your engagement scope</p>
                    {SERVICE_CATALOG.map((service) => (
                      <Toggle
                        key={service.id}
                        label={service.name}
                        description={service.description}
                        checked={enabledServices[service.id]}
                        onChange={(val) => setEnabledServices((prev) => ({ ...prev, [service.id]: val }))}
                      />
                    ))}
                  </div>
                </Card>
              </div>
              <div>
                <Card>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>Engagement Parameters</h3>
                    <Slider label="Engagement Duration" value={codimiteWeeks} onChange={setCodimiteWeeks} min={2} max={26} format="weeks" />
                    <Slider label="Volume Discount" value={codimiteDiscount} onChange={setCodimiteDiscount} min={0} max={30} format="percent" helpText="Multi-migration or enterprise agreement discount" />

                    <h4 style={{ margin: "24px 0 12px", fontSize: 14, fontWeight: 700, color: BRAND.gray700 }}>Service Cost Breakdown</h4>
                    {SERVICE_CATALOG.filter((s) => enabledServices[s.id]).map((service) => (
                      <div key={service.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BRAND.gray100}`, fontSize: 13 }}>
                        <span style={{ color: BRAND.gray700 }}>{service.name}</span>
                        <span style={{ fontWeight: 600, color: BRAND.primary, fontFamily: "monospace" }}>{formatCurrency(calculations.codimiteServiceCosts[service.id] || 0)}</span>
                      </div>
                    ))}
                    {codimiteDiscount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BRAND.gray100}`, fontSize: 13 }}>
                        <span style={{ color: BRAND.success }}>Discount ({codimiteDiscount}%)</span>
                        <span style={{ fontWeight: 600, color: BRAND.success, fontFamily: "monospace" }}>-{formatCurrency(calculations.discountAmount)}</span>
                      </div>
                    )}

                    <CustomLineItems items={codimiteCustomItems} onChange={setCodimiteCustomItems} />

                    <div style={{ marginTop: 16, padding: "14px 18px", background: BRAND.accent, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 15 }}>Codimite Investment</span>
                      <span style={{ color: BRAND.white, fontWeight: 800, fontSize: 24, fontFamily: "monospace" }}>{formatCurrency(calculations.codimiteTotalCost)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: ROI Results */}
        {currentStep === 4 && (
          <div>
            <SectionHeader icon="📊" title="ROI Analysis" subtitle={`Migration ROI for ${companyName || "your organization"} — ${selectedPreset?.id === "custom" ? `${customSource} → ${customDest}` : selectedPreset?.name}`} />

            {/* Top Metrics */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <MetricCard
                label="Total Cost Savings"
                value={formatCurrency(Math.max(0, calculations.totalSavings))}
                subtitle="vs. doing it yourself"
                color={calculations.totalSavings > 0 ? BRAND.success : BRAND.danger}
                large
              />
              <MetricCard
                label="Return on Investment"
                value={`${Math.round(calculations.roiPercent)}%`}
                subtitle="on Codimite engagement"
                color={BRAND.accent}
                large
              />
              <MetricCard
                label="Time Saved"
                value={`${calculations.weeksSaved} weeks`}
                subtitle={`${diyWeeks} → ${codimiteWeeks} weeks`}
                color={BRAND.primary}
                large
              />
              <MetricCard
                label="Risk Reduction"
                value={`${Math.round(calculations.riskReduction)}%`}
                subtitle="lower migration risk"
                color={BRAND.warning}
                large
              />
            </div>

            {/* Total Comparison */}
            <Card>
              <div style={{ padding: 28 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: BRAND.primary }}>Total Cost Comparison</h3>
                <div style={{ display: "flex", gap: 20, marginBottom: 24, alignItems: "stretch" }}>
                  <div style={{ flex: 1, background: BRAND.dangerLight, borderRadius: 14, padding: 24, border: `1.5px solid ${BRAND.danger}33` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.danger, marginBottom: 4 }}>DO IT YOURSELF</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: BRAND.gray900, fontFamily: "monospace" }}>{formatCurrency(calculations.diyTotalCost)}</div>
                    <div style={{ fontSize: 13, color: BRAND.gray500, marginTop: 8 }}>{diyWeeks} weeks · {diyFTECount} FTEs · Higher risk</div>
                    <div style={{ marginTop: 16, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Internal Labor</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.diyLaborCost)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Productivity Loss</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.diyProductivityLoss)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Opportunity Cost</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.diyOpportunityCost)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Risk Exposure</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.diyRiskCost)}</span></div>
                      {calculations.diyCustomTotal > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Custom Items</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.diyCustomTotal)}</span></div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: BRAND.gray300 }}>vs</div>
                  <div style={{ flex: 1, background: BRAND.successLight, borderRadius: 14, padding: 24, border: `1.5px solid ${BRAND.success}33` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.success, marginBottom: 4 }}>WITH CODIMITE</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: BRAND.gray900, fontFamily: "monospace" }}>{formatCurrency(calculations.totalWithCodimite)}</div>
                    <div style={{ fontSize: 13, color: BRAND.gray500, marginTop: 8 }}>{codimiteWeeks} weeks · Expert-led · Managed risk</div>
                    <div style={{ marginTop: 16, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Codimite Services</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.codimiteTotalCost)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Internal Coordination</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.internalWithCodimite)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Reduced Productivity Loss</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.productivityLossWithCodimite)}</span></div>
                      {calculations.codimiteCustomTotal > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: BRAND.gray700 }}><span>Custom Items</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(calculations.codimiteCustomTotal)}</span></div>}
                    </div>
                  </div>
                </div>

                {calculations.totalSavings > 0 && (
                  <div style={{ background: `linear-gradient(135deg, ${BRAND.success}15, ${BRAND.success}08)`, border: `2px solid ${BRAND.success}44`, borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.success }}>NET SAVINGS WITH CODIMITE</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: BRAND.success, fontFamily: "monospace", margin: "4px 0" }}>{formatCurrency(calculations.totalSavings)}</div>
                    <div style={{ fontSize: 13, color: BRAND.gray500 }}>
                      That's {formatCurrency(calculations.totalSavings / Math.max(affectedUsers, 1))} saved per affected user · {calculations.weeksSaved} fewer weeks of disruption
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>Cost Category Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BRAND.gray200} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="DIY" fill={BRAND.danger} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Codimite" fill={BRAND.success} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: BRAND.primary }}>Codimite Services Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {serviceBreakdownData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, name, props) => [formatCurrency(v), props.payload.fullName]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Value Proposition */}
            <Card>
              <div style={{ padding: 28, marginTop: 20 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: BRAND.primary }}>Why Codimite — What You're Getting</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { icon: "🎯", title: "Intelligent Program Management", desc: "Dedicated migration PMs who've executed 100+ enterprise transitions. Executive-level reporting, proactive risk mitigation, and stakeholder alignment from day one." },
                    { icon: "⚡", title: `${Math.round((1 - codimiteWeeks / diyWeeks) * 100)}% Faster Time-to-Value`, desc: `Complete your migration in ${codimiteWeeks} weeks instead of ${diyWeeks}. That's ${calculations.weeksSaved} fewer weeks of dual-system complexity, confusion, and productivity loss.` },
                    { icon: "🛡️", title: "De-Risked Migration", desc: `Reduce migration failure risk by ${Math.round(calculations.riskReduction)}% with proven runbooks, automated validation, rollback procedures, and 24/7 migration support windows.` },
                    { icon: "📈", title: "Adoption-First Approach", desc: "Change management, custom training programs, and post-migration hypercare ensure your teams actually embrace the new platform — not just tolerate it." },
                    { icon: "🔧", title: "Enterprise-Grade Tooling", desc: "Proprietary migration accelerators, automated data validation, parallel testing environments, and zero-downtime cutover strategies." },
                    { icon: "💰", title: `${formatCurrency(calculations.totalSavings)} in Real Savings`, desc: "When you factor in internal labor, productivity loss, opportunity cost, and risk — professional migration services pay for themselves and then some." },
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: BRAND.gray50, borderRadius: 12, padding: "18px 20px" }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.primary, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: BRAND.gray500, lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* CTA */}
            <div style={{ marginTop: 24, background: `linear-gradient(135deg, ${BRAND.primary}, #162D54)`, borderRadius: 16, padding: "32px 28px", textAlign: "center", color: BRAND.white }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Ready to migrate smarter?</h3>
              <p style={{ margin: "0 0 20px", fontSize: 15, opacity: 0.8 }}>
                Let Codimite.ai handle your {selectedPreset?.id === "custom" ? `${customSource} → ${customDest}` : selectedPreset?.name} migration with expert-led professional services.
              </p>
              <div style={{ display: "inline-flex", gap: 12 }}>
                <div style={{ background: BRAND.accent, color: BRAND.white, padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Schedule a Consultation
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", color: BRAND.white, padding: "12px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer", border: "1px solid rgba(255,255,255,0.3)" }}>
                  Download Full Report
                </div>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 12, opacity: 0.5 }}>codimite.ai — Enterprise Migration Intelligence</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              border: `1.5px solid ${currentStep === 0 ? BRAND.gray200 : BRAND.gray300}`,
              background: BRAND.white,
              color: currentStep === 0 ? BRAND.gray300 : BRAND.gray700,
              fontSize: 15,
              fontWeight: 600,
              cursor: currentStep === 0 ? "default" : "pointer",
            }}
          >
            ← Back
          </button>
          {currentStep < 4 && (
            <button
              onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                border: "none",
                background: canProceed() ? BRAND.accent : BRAND.gray200,
                color: canProceed() ? BRAND.white : BRAND.gray400,
                fontSize: 15,
                fontWeight: 700,
                cursor: canProceed() ? "pointer" : "default",
              }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
