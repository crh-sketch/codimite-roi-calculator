import { useState, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── Brand ───
const B = {
  primary: "#0B1D3A", accent: "#00A3FF", accentLight: "#E6F5FF",
  success: "#10B981", successLight: "#D1FAE5", warning: "#F59E0B",
  danger: "#EF4444", dangerLight: "#FEE2E2",
  g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB", g300: "#D1D5DB",
  g400: "#9CA3AF", g500: "#6B7280", g700: "#374151", g800: "#1F2937",
  g900: "#111827", white: "#FFFFFF",
};
const COLORS = ["#0B1D3A", "#00A3FF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const fmt = (v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;

// ─── Migration Presets ───
const PRESETS = [
  { id: "slack-zoom", name: "Slack → Zoom Team Chat", icon: "💬", source: "Slack", dest: "Zoom Team Chat", diyWks: 16, coWks: 6, cx: 1.0, desc: "Channels, message history, files, integrations, and workflows" },
  { id: "gong-zoom", name: "Gong → Zoom Revenue Accelerator", icon: "🎥", source: "Gong", dest: "Zoom Revenue Accelerator", diyWks: 20, coWks: 8, cx: 1.3, desc: "Conversation intelligence, call recordings, analytics, and deal insights" },
  { id: "miro-zoom", name: "Miro → Zoom Whiteboards", icon: "🎨", source: "Miro", dest: "Zoom Whiteboards", diyWks: 12, coWks: 5, cx: 0.8, desc: "Boards, templates, team workspaces, and collaborative content" },
  { id: "teams-zoom", name: "Microsoft Teams → Zoom Workplace", icon: "🏢", source: "Microsoft Teams", dest: "Zoom Workplace", diyWks: 22, coWks: 9, cx: 1.4, desc: "Chat, channels, meetings, files, and integrations" },
  { id: "webex-zoom", name: "Webex → Zoom Meetings", icon: "📞", source: "Webex", dest: "Zoom Meetings", diyWks: 14, coWks: 5, cx: 0.9, desc: "Meeting configs, recordings, users, and room systems" },
  { id: "custom", name: "Other Migration", icon: "⚙️", source: "", dest: "", diyWks: 16, coWks: 6, cx: 1.0, desc: "Define your own source and destination" },
];

// ─── Codimite Services ───
const SERVICES = [
  { id: "pm", name: "Intelligent Program Management", desc: "Dedicated PM with enterprise migration expertise, executive reporting, risk mitigation, stakeholder alignment", rate: 225, hrs: 20, cat: "core" },
  { id: "data", name: "Data Architecture & Mapping", desc: "Schema analysis, data mapping, transformation rules, integrity validation across platforms", rate: 200, hrs: 30, cat: "core" },
  { id: "change", name: "Change Management", desc: "Adoption strategy, stakeholder comms, resistance management, organizational readiness", rate: 195, hrs: 15, cat: "core" },
  { id: "tech", name: "Technical Migration", desc: "API integrations, data extraction/load, automated scripts, parallel environment setup", rate: 210, hrs: 35, cat: "exec" },
  { id: "train", name: "Training & Enablement", desc: "Custom curriculum, role-based sessions, train-the-trainer, self-service resources", rate: 175, hrs: 15, cat: "enable" },
  { id: "qa", name: "QA & Validation", desc: "Test plans, data integrity validation, UAT coordination, performance benchmarking", rate: 195, hrs: 20, cat: "exec" },
  { id: "rollback", name: "Rollback & Contingency", desc: "Full rollback procedures, DR plans, data backup strategies, business continuity", rate: 210, hrs: 8, cat: "risk" },
  { id: "hyper", name: "Post-Migration Hypercare", desc: "30-60-90 day support, issue resolution, optimization, adoption monitoring", rate: 185, hrs: 12, cat: "support" },
  { id: "security", name: "Security & Compliance", desc: "Security assessment, compliance gap analysis, data privacy, audit documentation", rate: 230, hrs: 10, cat: "risk" },
  { id: "integ", name: "Integration & Workflow Setup", desc: "Third-party integrations, workflow automation, custom connectors, API config", rate: 205, hrs: 18, cat: "exec" },
];

// ─── Data Volume Impact ───
const dataYearMultiplier = (years) => {
  if (years <= 1) return 1.0;
  if (years <= 3) return 1.15;
  if (years <= 5) return 1.35;
  if (years <= 7) return 1.55;
  return 1.8;
};
const dataYearDIYExtra = (years) => {
  if (years <= 1) return 0;
  if (years <= 3) return 2;
  if (years <= 5) return 4;
  if (years <= 7) return 6;
  return 10;
};

// ─── Tiny Components ───
const Card = ({ children, style = {} }) => (
  <div style={{ background: B.white, borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: `1px solid ${B.g200}`, ...style }}>{children}</div>
);

const OptionCard = ({ selected, onClick, children }) => (
  <div onClick={onClick} style={{
    padding: "18px 20px", borderRadius: 14, cursor: "pointer",
    border: `2px solid ${selected ? B.accent : B.g200}`,
    background: selected ? B.accentLight : B.white,
    transition: "all 0.15s",
  }}>{children}</div>
);

const SliderInput = ({ label, value, onChange, min, max, step = 1, format, help }) => {
  const disp = format === "$" ? fmt(value) : format === "%" ? `${value}%` : format === "wk" ? `${value} weeks` : format === "yr" ? `${value} ${value === 1 ? "year" : "years"}` : value.toLocaleString();
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: B.g700 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: B.accent, fontFamily: "monospace" }}>{disp}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: B.accent, height: 6, cursor: "pointer" }} />
      {help && <p style={{ fontSize: 12, color: B.g400, margin: "4px 0 0" }}>{help}</p>}
    </div>
  );
};

const TextInput = ({ label, value, onChange, placeholder, type = "text", required }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 14, fontWeight: 600, color: B.g700, display: "block", marginBottom: 6 }}>
      {label} {required && <span style={{ color: B.danger }}>*</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${B.g200}`, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
  </div>
);

const Metric = ({ label, value, sub, color = B.accent, large }) => (
  <div style={{
    background: `linear-gradient(135deg, ${color}11, ${color}08)`, border: `1.5px solid ${color}33`,
    borderRadius: 14, padding: large ? "28px 20px" : "18px 16px", textAlign: "center", flex: 1, minWidth: 150,
  }}>
    <div style={{ fontSize: large ? 34 : 24, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: large ? 14 : 12, fontWeight: 600, color: B.g700, marginTop: 6 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: B.g400, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function CodimiteROICalculator() {
  const [step, setStep] = useState(0);
  const resultRef = useRef(null);

  // Step 0: Contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  // Step 1: Migration
  const [preset, setPreset] = useState(null);
  const [customSrc, setCustomSrc] = useState("");
  const [customDst, setCustomDst] = useState("");

  // Step 2: Scale
  const [employees, setEmployees] = useState(5000);
  const [affected, setAffected] = useState(3000);
  const [avgSalary, setAvgSalary] = useState(95000);

  // Step 3: Data
  const [dataYears, setDataYears] = useState(3);
  const [numIntegrations, setNumIntegrations] = useState(5);
  const [complianceReq, setComplianceReq] = useState("standard");
  const [customWorkflows, setCustomWorkflows] = useState("some");

  // Step 4: Timeline
  const [urgency, setUrgency] = useState("normal");
  const [riskTolerance, setRiskTolerance] = useState("low");
  const [hasInternalTeam, setHasInternalTeam] = useState("partial");

  // Submission
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const hourly = avgSalary / 2080;
  const weekly = hourly * 40;
  const p = preset || PRESETS[0];

  // ─── CALCULATIONS ───
  const calc = useMemo(() => {
    const dataMult = dataYearMultiplier(dataYears);
    const diyExtraWks = dataYearDIYExtra(dataYears);
    const complexMult = 1 + (numIntegrations > 10 ? 0.3 : numIntegrations > 5 ? 0.15 : 0);
    const complianceMult = complianceReq === "strict" ? 1.25 : complianceReq === "moderate" ? 1.1 : 1.0;
    const workflowMult = customWorkflows === "heavy" ? 1.2 : customWorkflows === "some" ? 1.1 : 1.0;
    const urgencyMult = urgency === "asap" ? 1.3 : urgency === "fast" ? 1.15 : 1.0;
    const totalMult = dataMult * complexMult * complianceMult * workflowMult;

    // DIY
    const baseDiyWks = (p.diyWks || 16) + diyExtraWks;
    const diyWks = Math.round(baseDiyWks * (urgency === "asap" ? 0.75 : urgency === "fast" ? 0.85 : 1.0));
    const diyFTE = hasInternalTeam === "full" ? 3 : hasInternalTeam === "partial" ? 5 : 7;
    const diyAlloc = hasInternalTeam === "full" ? 0.7 : hasInternalTeam === "partial" ? 0.6 : 0.5;
    const diyLabor = diyFTE * weekly * diyAlloc * diyWks * totalMult;
    const prodLossPct = 0.15 * (urgency === "asap" ? 1.3 : 1.0);
    const prodLossWks = Math.ceil(diyWks * 0.4);
    const diyProdLoss = affected * weekly * prodLossPct * prodLossWks;
    const diyOppCost = diyFTE * weekly * (1 - diyAlloc) * diyWks * 0.3;
    const riskPct = riskTolerance === "low" ? 0.3 : riskTolerance === "medium" ? 0.2 : 0.12;
    const diySub = diyLabor + diyProdLoss + diyOppCost;
    const diyRisk = diySub * riskPct;
    const diyTotal = diySub + diyRisk;

    // Codimite
    const coWks = Math.round((p.coWks || 6) * (dataMult > 1.5 ? 1.3 : dataMult > 1.2 ? 1.15 : 1.0) * urgencyMult);
    const scaleFactor = employees > 25000 ? 1.6 : employees > 10000 ? 1.4 : employees > 5000 ? 1.2 : 1.0;
    let coServices = 0;
    const breakdown = {};
    SERVICES.forEach(s => {
      const cost = s.rate * s.hrs * coWks * scaleFactor * totalMult;
      breakdown[s.id] = cost;
      coServices += cost;
    });
    const coTotal = coServices;
    const intCoord = 1 * weekly * 0.25 * coWks;
    const coProdLoss = affected * weekly * (prodLossPct * 0.4) * Math.ceil(prodLossWks * 0.5);
    const withCo = coTotal + intCoord + coProdLoss;

    const savings = diyTotal - withCo;
    const roi = coTotal > 0 ? (savings / coTotal) * 100 : 0;
    const wksSaved = Math.max(0, diyWks - coWks);
    const riskReduct = Math.round(riskPct * 100 * 0.75);

    return { diyWks, diyFTE, diyLabor, diyProdLoss, diyOppCost, diyRisk, diyTotal, coWks, coTotal, breakdown, intCoord, coProdLoss, withCo, savings, roi, wksSaved, riskReduct };
  }, [p, employees, affected, avgSalary, dataYears, numIntegrations, complianceReq, customWorkflows, urgency, riskTolerance, hasInternalTeam, weekly]);

  // ─── Email via Formspree ───
  const sendEstimate = async () => {
    setSending(true);
    const migrationName = p.id === "custom" ? `${customSrc} → ${customDst}` : p.name;
    const payload = {
      _subject: `New ROI Estimate: ${company} — ${migrationName}`,
      name, email, company, role,
      migration: migrationName,
      employees: employees.toLocaleString(),
      affected_users: affected.toLocaleString(),
      avg_salary: fmt(avgSalary),
      data_years: `${dataYears} years`,
      integrations: numIntegrations,
      compliance: complianceReq,
      custom_workflows: customWorkflows,
      urgency, risk_tolerance: riskTolerance,
      internal_team: hasInternalTeam,
      "--- DIY ESTIMATE ---": "",
      diy_total: fmt(calc.diyTotal),
      diy_weeks: `${calc.diyWks} weeks`,
      diy_ftes: calc.diyFTE,
      diy_labor: fmt(calc.diyLabor),
      diy_productivity_loss: fmt(calc.diyProdLoss),
      diy_opportunity_cost: fmt(calc.diyOppCost),
      diy_risk_exposure: fmt(calc.diyRisk),
      "--- CODIMITE ESTIMATE ---": "",
      codimite_services: fmt(calc.coTotal),
      codimite_weeks: `${calc.coWks} weeks`,
      internal_coordination: fmt(calc.intCoord),
      reduced_productivity_loss: fmt(calc.coProdLoss),
      total_with_codimite: fmt(calc.withCo),
      "--- ROI SUMMARY ---": "",
      total_savings: fmt(calc.savings),
      roi_percent: `${Math.round(calc.roi)}%`,
      weeks_saved: calc.wksSaved,
      risk_reduction: `${calc.riskReduct}%`,
      savings_per_user: fmt(calc.savings / Math.max(affected, 1)),
    };

    try {
      // REPLACE "YOUR_FORM_ID" with your actual Formspree form ID
      // Sign up free at https://formspree.io — takes 2 minutes
      await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Email send failed:", err);
    }
    setSubmitted(true);
    setSending(false);
  };

  // Validation
  const canNext = () => {
    if (step === 0) return name.trim() && email.trim() && company.trim();
    if (step === 1) return preset && (preset.id !== "custom" || (customSrc.trim() && customDst.trim()));
    return true;
  };

  const STEPS = [
    { label: "Your Info", icon: "👤" },
    { label: "Migration", icon: "🔄" },
    { label: "Scale", icon: "🏢" },
    { label: "Complexity", icon: "📦" },
    { label: "Timeline", icon: "⏱️" },
    { label: "Estimate", icon: "📊" },
  ];

  const next = () => { if (canNext() && step < 5) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  // Chart data
  const barData = [
    { name: "Internal Labor", DIY: Math.round(calc.diyLabor), Codimite: Math.round(calc.intCoord) },
    { name: "Productivity Loss", DIY: Math.round(calc.diyProdLoss), Codimite: Math.round(calc.coProdLoss) },
    { name: "Opportunity Cost", DIY: Math.round(calc.diyOppCost), Codimite: 0 },
    { name: "Risk Exposure", DIY: Math.round(calc.diyRisk), Codimite: 0 },
    { name: "Pro Services", DIY: 0, Codimite: Math.round(calc.coTotal) },
  ];
  const pieData = SERVICES.map((s) => ({ name: s.name.length > 22 ? s.name.slice(0,22)+"…" : s.name, full: s.name, value: Math.round(calc.breakdown[s.id] || 0) }));

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#F0F4F8", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${B.primary} 0%, #162D54 100%)`, padding: "28px 24px", color: B.white }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: B.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>C</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>codimite.ai</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.65 }}>Enterprise Migration Intelligence</p>
            </div>
          </div>
          <h2 style={{ margin: "14px 0 4px", fontSize: 19, fontWeight: 700 }}>Migration Cost & ROI Estimator</h2>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.7, maxWidth: 550 }}>
            Answer a few questions about your migration and get an instant cost comparison — DIY vs. expert-led migration with Codimite.
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "18px 24px 0" }}>
        <div style={{ display: "flex", gap: 3 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 4, borderRadius: 2, background: i <= step ? B.accent : B.g200, transition: "background 0.2s" }} />
              <span style={{ fontSize: 11, fontWeight: i === step ? 700 : 500, color: i <= step ? B.accent : B.g400, marginTop: 4, display: "block" }}>
                {s.icon} {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px 40px" }}>

        {/* ── STEP 0: CONTACT ── */}
        {step === 0 && (
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.primary }}>Let's get started</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: B.g500 }}>We'll send you a copy of your personalized estimate.</p>
            <TextInput label="Your Name" value={name} onChange={setName} placeholder="Jane Smith" required />
            <TextInput label="Work Email" value={email} onChange={setEmail} placeholder="jane@company.com" type="email" required />
            <TextInput label="Company Name" value={company} onChange={setCompany} placeholder="Acme Corporation" required />
            <TextInput label="Your Role" value={role} onChange={setRole} placeholder="e.g. IT Director, VP of Operations" />
          </Card>
        )}

        {/* ── STEP 1: MIGRATION ── */}
        {step === 1 && (
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.primary }}>What are you migrating?</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: B.g500 }}>Select the platform migration that best matches your project.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PRESETS.map(pr => (
                <OptionCard key={pr.id} selected={preset?.id === pr.id} onClick={() => setPreset(pr)}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{pr.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: B.primary }}>{pr.name}</div>
                  <div style={{ fontSize: 12, color: B.g500, marginTop: 4, lineHeight: 1.5 }}>{pr.desc}</div>
                </OptionCard>
              ))}
            </div>
            {preset?.id === "custom" && (
              <div style={{ display: "flex", gap: 14, marginTop: 16, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}><TextInput label="From" value={customSrc} onChange={setCustomSrc} placeholder="e.g. RingCentral" required /></div>
                <span style={{ fontSize: 20, paddingBottom: 28, color: B.g400 }}>→</span>
                <div style={{ flex: 1 }}><TextInput label="To" value={customDst} onChange={setCustomDst} placeholder="e.g. Zoom Phone" required /></div>
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 2: SCALE ── */}
        {step === 2 && (
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.primary }}>Tell us about your organization</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: B.g500 }}>This helps us estimate labor costs and productivity impact.</p>
            <SliderInput label="Total Employees" value={employees} onChange={setEmployees} min={100} max={150000} step={100} />
            <SliderInput label="Users Affected by Migration" value={affected} onChange={v => setAffected(Math.min(v, employees))} min={50} max={Math.min(employees, 100000)} step={50} help="How many people will be directly impacted" />
            <SliderInput label="Average Fully-Loaded Annual Salary" value={avgSalary} onChange={setAvgSalary} min={40000} max={250000} step={5000} format="$" help="Including benefits & overhead (typically 1.3–1.5x base)" />
            <div style={{ background: B.g50, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 24 }}>
              <div><span style={{ fontSize: 11, color: B.g500 }}>Hourly Rate</span><div style={{ fontSize: 16, fontWeight: 700, color: B.primary }}>{fmt(hourly)}/hr</div></div>
              <div><span style={{ fontSize: 11, color: B.g500 }}>Weekly per FTE</span><div style={{ fontSize: 16, fontWeight: 700, color: B.primary }}>{fmt(weekly)}/wk</div></div>
            </div>
          </Card>
        )}

        {/* ── STEP 3: DATA & COMPLEXITY ── */}
        {step === 3 && (
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.primary }}>Data & Complexity</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: B.g500 }}>More data and integrations increase migration effort — and the value of expert help.</p>

            <SliderInput label="Years of Data to Migrate" value={dataYears} onChange={setDataYears} min={0} max={15} format="yr" help="Historical data that needs to be transferred to the new platform" />
            <div style={{ background: B.accentLight, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: B.primary }}>
              <strong>{dataYears} {dataYears === 1 ? "year" : "years"}</strong> of data adds ~<strong>{Math.round((dataYearMultiplier(dataYears) - 1) * 100)}%</strong> complexity and ~<strong>{dataYearDIYExtra(dataYears)} extra weeks</strong> to a DIY timeline
            </div>

            <SliderInput label="Number of Integrations / Connected Apps" value={numIntegrations} onChange={setNumIntegrations} min={0} max={30} help="Bots, apps, APIs, and workflows connected to the current platform" />

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: B.g700, display: "block", marginBottom: 8 }}>Compliance Requirements</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["standard","Standard","No special regulatory needs"],["moderate","Moderate","SOC2, GDPR, or industry regs"],["strict","Strict","HIPAA, FedRAMP, financial regs"]].map(([v,l,d]) => (
                  <OptionCard key={v} selected={complianceReq===v} onClick={() => setComplianceReq(v)}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.primary }}>{l}</div>
                    <div style={{ fontSize: 11, color: B.g500, marginTop: 2 }}>{d}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: B.g700, display: "block", marginBottom: 8 }}>Custom Workflows & Automations</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["minimal","Minimal","Mostly out-of-box"],["some","Some","Several custom workflows"],["heavy","Heavy","Highly customized platform"]].map(([v,l,d]) => (
                  <OptionCard key={v} selected={customWorkflows===v} onClick={() => setCustomWorkflows(v)}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.primary }}>{l}</div>
                    <div style={{ fontSize: 11, color: B.g500, marginTop: 2 }}>{d}</div>
                  </OptionCard>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 4: TIMELINE ── */}
        {step === 4 && (
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: B.primary }}>Timeline & Resources</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: B.g500 }}>How quickly do you need this done, and what do you have in-house?</p>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: B.g700, display: "block", marginBottom: 8 }}>Migration Urgency</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["normal","Standard","No hard deadline"],["fast","Accelerated","Contract renewal or event"],["asap","Urgent","Need it done ASAP"]].map(([v,l,d]) => (
                  <OptionCard key={v} selected={urgency===v} onClick={() => setUrgency(v)}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.primary }}>{l}</div>
                    <div style={{ fontSize: 11, color: B.g500, marginTop: 2 }}>{d}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: B.g700, display: "block", marginBottom: 8 }}>Risk Tolerance</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["low","Low Risk","Zero tolerance for data loss"],["medium","Moderate","Some flexibility needed"],["high","Flexible","Can tolerate some disruption"]].map(([v,l,d]) => (
                  <OptionCard key={v} selected={riskTolerance===v} onClick={() => setRiskTolerance(v)}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.primary }}>{l}</div>
                    <div style={{ fontSize: 11, color: B.g500, marginTop: 2 }}>{d}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: B.g700, display: "block", marginBottom: 8 }}>Internal Migration Resources</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["full","Dedicated Team","Full team with migration exp"],["partial","Partial","Some IT, not their main job"],["none","No Team","No migration expertise"]].map(([v,l,d]) => (
                  <OptionCard key={v} selected={hasInternalTeam===v} onClick={() => setHasInternalTeam(v)}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.primary }}>{l}</div>
                    <div style={{ fontSize: 11, color: B.g500, marginTop: 2 }}>{d}</div>
                  </OptionCard>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* STEP 5: RESULTS                           */}
        {/* ══════════════════════════════════════════ */}
        {step === 5 && (
          <div ref={resultRef}>
            {!submitted ? (
              <Card style={{ padding: 28, textAlign: "center" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: B.primary }}>Your Estimate is Ready!</h3>
                <p style={{ margin: "0 0 18px", fontSize: 14, color: B.g500 }}>
                  Click below to view your personalized ROI analysis. A copy will be sent to <strong>{email}</strong> and to the Codimite team.
                </p>
                <button onClick={sendEstimate} disabled={sending}
                  style={{ background: B.accent, color: B.white, border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: sending ? "wait" : "pointer", opacity: sending ? 0.7 : 1 }}>
                  {sending ? "Generating..." : "View My Estimate →"}
                </button>
              </Card>
            ) : (
              <>
                {/* Confirmation */}
                <Card style={{ padding: 20, marginBottom: 20, background: B.successLight, border: `1.5px solid ${B.success}44` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: B.success }}>Estimate sent to {email} & the Codimite team</div>
                    <div style={{ fontSize: 13, color: B.g500, marginTop: 4 }}>A migration specialist will follow up within 24 hours.</div>
                  </div>
                </Card>

                {/* Summary Header */}
                <Card style={{ padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: B.accent, textTransform: "uppercase", letterSpacing: 1 }}>Migration Estimate</div>
                      <h3 style={{ margin: "4px 0 2px", fontSize: 20, fontWeight: 800, color: B.primary }}>{company}</h3>
                      <div style={{ fontSize: 14, color: B.g500 }}>
                        {p.id === "custom" ? `${customSrc} → ${customDst}` : p.name} · {affected.toLocaleString()} users · {dataYears} {dataYears === 1 ? "year" : "years"} of data
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: B.g400 }}>Prepared for</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: B.g700 }}>{name}</div>
                      <div style={{ fontSize: 12, color: B.g500 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                    </div>
                  </div>
                </Card>

                {/* Top Metrics */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  <Metric label="Total Savings" value={fmt(Math.max(0,calc.savings))} sub="vs. doing it yourself" color={calc.savings>0 ? B.success : B.danger} large />
                  <Metric label="ROI" value={`${Math.round(calc.roi)}%`} sub="on Codimite investment" color={B.accent} large />
                  <Metric label="Time Saved" value={`${calc.wksSaved} wks`} sub={`${calc.diyWks} → ${calc.coWks} weeks`} color={B.primary} large />
                  <Metric label="Risk Reduction" value={`${calc.riskReduct}%`} sub="lower migration risk" color={B.warning} large />
                </div>

                {/* Side by Side Comparison */}
                <Card style={{ padding: 24, marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700, color: B.primary }}>Total Cost Comparison</h3>
                  <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    {/* DIY */}
                    <div style={{ flex: 1, background: B.dangerLight, borderRadius: 14, padding: 22, border: `1.5px solid ${B.danger}33` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: B.danger }}>DO IT YOURSELF</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: B.g900, fontFamily: "monospace", margin: "4px 0" }}>{fmt(calc.diyTotal)}</div>
                      <div style={{ fontSize: 12, color: B.g500 }}>{calc.diyWks} weeks · {calc.diyFTE} FTEs · Higher risk</div>
                      <div style={{ marginTop: 14, fontSize: 13 }}>
                        {[["Internal Labor",calc.diyLabor],["Productivity Loss",calc.diyProdLoss],["Opportunity Cost",calc.diyOppCost],["Risk Exposure",calc.diyRisk]].map(([l,v]) => (
                          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: B.g700 }}>
                            <span>{l}</span><span style={{ fontFamily: "monospace" }}>{fmt(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: B.g300 }}>vs</div>
                    {/* Codimite */}
                    <div style={{ flex: 1, background: B.successLight, borderRadius: 14, padding: 22, border: `1.5px solid ${B.success}33` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: B.success }}>WITH CODIMITE</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: B.g900, fontFamily: "monospace", margin: "4px 0" }}>{fmt(calc.withCo)}</div>
                      <div style={{ fontSize: 12, color: B.g500 }}>{calc.coWks} weeks · Expert-led · Managed risk</div>
                      <div style={{ marginTop: 14, fontSize: 13 }}>
                        {[["Codimite Services",calc.coTotal],["Internal Coordination",calc.intCoord],["Reduced Prod. Loss",calc.coProdLoss]].map(([l,v]) => (
                          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: B.g700 }}>
                            <span>{l}</span><span style={{ fontFamily: "monospace" }}>{fmt(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {calc.savings > 0 && (
                    <div style={{ background: `${B.success}10`, border: `2px solid ${B.success}44`, borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: B.success }}>NET SAVINGS WITH CODIMITE</div>
                      <div style={{ fontSize: 36, fontWeight: 800, color: B.success, fontFamily: "monospace" }}>{fmt(calc.savings)}</div>
                      <div style={{ fontSize: 12, color: B.g500 }}>{fmt(calc.savings / Math.max(affected,1))} per user · {calc.wksSaved} fewer weeks of disruption</div>
                    </div>
                  )}
                </Card>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <Card style={{ padding: 22 }}>
                    <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: B.primary }}>Cost Breakdown</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={B.g200} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={v => fmt(v)} />
                        <Legend />
                        <Bar dataKey="DIY" fill={B.danger} radius={[4,4,0,0]} />
                        <Bar dataKey="Codimite" fill={B.success} radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card style={{ padding: 22 }}>
                    <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: B.primary }}>Services Included</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={2} dataKey="value">
                          {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v,n,props) => [fmt(v), props.payload.full]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Services Detail */}
                <Card style={{ padding: 24, marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: B.primary }}>What's Included in Your Engagement</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {SERVICES.map(s => (
                      <div key={s.id} style={{ background: B.g50, borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: B.primary }}>{s.name}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: B.accent, fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmt(calc.breakdown[s.id])}</div>
                        </div>
                        <div style={{ fontSize: 12, color: B.g500, marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Why Codimite */}
                <Card style={{ padding: 24, marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: B.primary }}>Why Codimite</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      ["🎯","Battle-Tested Expertise",`100+ enterprise migrations completed. Your ${dataYears}-year dataset is in expert hands.`],
                      ["⚡",`${Math.round((1 - calc.coWks/calc.diyWks)*100)}% Faster`,`${calc.coWks} weeks vs ${calc.diyWks}. That's ${calc.wksSaved} fewer weeks of dual-system pain.`],
                      ["🛡️",`${calc.riskReduct}% Less Risk`,"Proven runbooks, automated validation, rollback procedures, and 24/7 support windows."],
                      ["📈","Adoption-First Approach","Change management & custom training ensure your teams embrace the new platform."],
                      ["🔧","Enterprise Tooling","Proprietary migration accelerators, automated validation, zero-downtime cutover."],
                      ["💰",`${fmt(calc.savings)} in Savings`,"Labor + productivity + risk + opportunity cost — professional services pay for themselves."],
                    ].map(([icon,title,desc],i) => (
                      <div key={i} style={{ background: B.g50, borderRadius: 12, padding: "14px 16px" }}>
                        <span style={{ fontSize: 22 }}>{icon}</span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: B.primary, margin: "4px 0" }}>{title}</div>
                        <div style={{ fontSize: 12, color: B.g500, lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* CTA */}
                <div style={{ background: `linear-gradient(135deg, ${B.primary}, #162D54)`, borderRadius: 16, padding: "30px 24px", textAlign: "center", color: B.white }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Ready to migrate smarter?</h3>
                  <p style={{ margin: "0 0 18px", fontSize: 14, opacity: 0.8 }}>
                    A Codimite specialist will reach out within 24 hours to discuss your {p.id === "custom" ? `${customSrc} → ${customDst}` : p.name} project.
                  </p>
                  <a href="mailto:chajibrahim@gmail.com?subject=ROI%20Estimate%20Follow-Up&body=I%20just%20completed%20the%20ROI%20calculator%20and%20would%20like%20to%20discuss%20my%20migration%20project."
                    style={{ display: "inline-block", background: B.accent, color: B.white, padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                    Schedule a Consultation
                  </a>
                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => window.print()} style={{ background: "rgba(255,255,255,0.15)", color: B.white, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                      Print / Save as PDF
                    </button>
                  </div>
                  <p style={{ margin: "14px 0 0", fontSize: 11, opacity: 0.4 }}>codimite.ai — Enterprise Migration Intelligence</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* NAV BUTTONS */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button onClick={back} disabled={step === 0}
            style={{ padding: "12px 26px", borderRadius: 10, border: `1.5px solid ${step === 0 ? B.g200 : B.g300}`, background: B.white, color: step === 0 ? B.g300 : B.g700, fontSize: 15, fontWeight: 600, cursor: step === 0 ? "default" : "pointer" }}>
            ← Back
          </button>
          {step < 5 && (
            <button onClick={next} disabled={!canNext()}
              style={{ padding: "12px 26px", borderRadius: 10, border: "none", background: canNext() ? B.accent : B.g200, color: canNext() ? B.white : B.g400, fontSize: 15, fontWeight: 700, cursor: canNext() ? "pointer" : "default" }}>
              {step === 4 ? "Generate My Estimate →" : "Continue →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
