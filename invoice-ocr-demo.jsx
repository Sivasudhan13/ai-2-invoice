import { useState, useRef, useCallback } from "react";

const MOCK_INVOICE = {
  invoice_number: "INV-2025-0042",
  invoice_date: "10 March 2025",
  due_date: "25 March 2025",
  supplier: {
    name: "ABC Textiles Pvt. Ltd.",
    address: "Plot No. 14, MIDC Industrial Area, Bhiwandi, Maharashtra - 421302",
    phone: "+91 98765 43210",
    email: "billing@abctextiles.in",
    gstin: "27AABCT1234M1Z5",
    pan: "AABCT1234M"
  },
  bill_to: {
    name: "Sharma Garments Pvt. Ltd.",
    address: "12, Cloth Market, Ulhasnagar, Maharashtra - 421003",
    gstin: "27AADCS5678N1Z2"
  },
  line_items: [
    { description: "Cotton Fabric 40s (White)", quantity: 50, unit: "meters", unit_price: 180, discount: 0, tax_rate: 5, amount: 9450 },
    { description: "Polyester Blend Fabric", quantity: 30, unit: "meters", unit_price: 220, discount: 5, tax_rate: 12, amount: 7012 },
    { description: "Denim Fabric 10oz", quantity: 20, unit: "meters", unit_price: 350, discount: 0, tax_rate: 12, amount: 7840 },
    { description: "Lining Material (Black)", quantity: 40, unit: "meters", unit_price: 95, discount: 0, tax_rate: 5, amount: 3990 },
  ],
  subtotal: 28292,
  discount_total: 330,
  tax_details: { cgst: 1247, sgst: 1247, igst: null, other: null },
  total_tax: 2494,
  grand_total: 30456,
  currency: "₹",
  payment_terms: "Net 15 Days",
  notes: "Goods once sold will not be taken back. Subject to Bhiwandi jurisdiction.",
  bank_details: {
    bank_name: "HDFC Bank",
    account_number: "50100123456789",
    ifsc: "HDFC0001234"
  }
};

const STEPS = [
  { id: "upload",    label: "Upload",    icon: "📤" },
  { id: "reading",   label: "AI Reading", icon: "🔍" },
  { id: "parsing",   label: "Parsing",   icon: "⚙️" },
  { id: "done",      label: "Done!",     icon: "✅" },
];

const LOG_STEPS = [
  { delay: 300,  msg: "📄 File received: ABC_Textiles_Invoice.pdf", color: "#94a3b8" },
  { delay: 900,  msg: "🔵 Trying Gemini Flash...", color: "#4285f4" },
  { delay: 1700, msg: "✓ Gemini connected successfully", color: "#34d399" },
  { delay: 2400, msg: "🧠 Analyzing invoice layout...", color: "#fbbf24" },
  { delay: 3100, msg: "📋 Extracting supplier details...", color: "#fbbf24" },
  { delay: 3700, msg: "🔢 Reading line items (4 found)...", color: "#fbbf24" },
  { delay: 4300, msg: "💰 Calculating tax breakdown...", color: "#fbbf24" },
  { delay: 4900, msg: "🏦 Extracting bank details...", color: "#fbbf24" },
  { delay: 5500, msg: "✅ JSON generated successfully!", color: "#34d399" },
  { delay: 6000, msg: "⚡ Extraction complete in 5.7s", color: "#a78bfa" },
];

export default function Demo() {
  const [stage, setStage] = useState("idle"); // idle | animating | done
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [extracted, setExtracted] = useState(null);
  const [tab, setTab] = useState("structured");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const timers = useRef([]);

  const startDemo = () => {
    if (stage === "animating") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("animating");
    setLogs([]);
    setExtracted(null);
    setActiveStep(0);

    // Step progression
    const stepTimes = [0, 900, 3700, 6000];
    stepTimes.forEach((t, i) => {
      timers.current.push(setTimeout(() => setActiveStep(i), t));
    });

    // Log messages
    LOG_STEPS.forEach(({ delay, msg, color }) => {
      timers.current.push(setTimeout(() => setLogs(l => [...l, { msg, color, id: Date.now() + delay }]), delay));
    });

    // Final result
    timers.current.push(setTimeout(() => {
      setExtracted(MOCK_INVOICE);
      setStage("done");
      setActiveStep(3);
    }, 6300));
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage("idle"); setLogs([]); setExtracted(null); setActiveStep(0); setTab("structured");
  };

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(MOCK_INVOICE, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(MOCK_INVOICE, null, 2)], { type: "application/json" }));
    a.download = "invoice_INV-2025-0042.json"; a.click();
  };

  const Field = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
      <div style={{ marginBottom: 9 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", marginBottom: 2, fontFamily: "monospace" }}>{label}</div>
        <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.4 }}>{String(value)}</div>
      </div>
    );
  };

  const Sec = ({ title, children }) => (
    <div style={{ background: "#f8faff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "#6c63ff", textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace", borderBottom: "1px solid #e2e8f0", paddingBottom: 7 }}>{title}</div>
      {children}
    </div>
  );

  const rawJson = JSON.stringify(MOCK_INVOICE, null, 2);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f23", fontFamily: "system-ui, sans-serif", color: "#f1f5f9" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(108,99,255,.3)}50%{box-shadow:0 0 40px rgba(108,99,255,.7)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scanLine{0%{top:0%}100%{top:100%}}
        .fade{animation:fadeUp .5s ease forwards}
        .log-entry{animation:slideIn .3s ease forwards}
        .hov{transition:all .15s;cursor:pointer}
        .hov:hover{opacity:.88;transform:translateY(-1px)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", animation: stage === "animating" ? "glow 2s infinite" : "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.01em" }}>InvoiceAI</div>
            <div style={{ color: "#475569", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>LIVE DEMO</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage === "animating" ? "#34d399" : stage === "done" ? "#6c63ff" : "#475569", animation: stage === "animating" ? "pulse 1s infinite" : "none" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.06em" }}>
            {stage === "idle" ? "READY" : stage === "animating" ? "PROCESSING" : "COMPLETE"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px" }}>

        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  background: activeStep > i ? "linear-gradient(135deg,#6c63ff,#a78bfa)" : activeStep === i && stage === "animating" ? "rgba(108,99,255,.2)" : "rgba(255,255,255,.05)",
                  border: `2px solid ${activeStep >= i ? "#6c63ff" : "rgba(255,255,255,.1)"}`,
                  transition: "all .4s",
                  animation: activeStep === i && stage === "animating" ? "pulse 1s infinite" : "none"
                }}>
                  {activeStep > i ? "✓" : s.icon}
                </div>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: activeStep >= i ? "#a78bfa" : "#475569", letterSpacing: "0.06em", fontWeight: 700 }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: activeStep > i ? "linear-gradient(90deg,#6c63ff,#a78bfa)" : "rgba(255,255,255,.08)", margin: "0 6px", marginBottom: 22, transition: "all .4s" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: extracted ? "340px 1fr" : "1fr", gap: 20, justifyContent: "center" }}>

          {/* LEFT */}
          <div>
            {/* Sample Invoice Card */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ background: "rgba(255,255,255,.04)", padding: "10px 16px", fontSize: 10, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#ef4444" }}>●</span><span style={{ color: "#fbbf24" }}>●</span><span style={{ color: "#34d399" }}>●</span>
                <span style={{ marginLeft: 4 }}>ABC_Textiles_Invoice.pdf</span>
              </div>

              {/* Fake Invoice Preview */}
              <div style={{ padding: 16, background: "#fff", position: "relative", overflow: "hidden" }}>
                {stage === "animating" && activeStep <= 1 && (
                  <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#6c63ff,transparent)", animation: "scanLine 1.2s ease-in-out infinite", zIndex: 10, opacity: 0.8 }} />
                )}
                {/* Invoice content mockup */}
                <div style={{ color: "#0f172a", fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#1e40af" }}>ABC Textiles Pvt. Ltd.</div>
                      <div style={{ color: "#64748b", fontSize: 10, lineHeight: 1.6 }}>Plot No. 14, MIDC Industrial Area<br/>Bhiwandi, Maharashtra - 421302<br/>GSTIN: 27AABCT1234M1Z5</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#dc2626" }}>TAX INVOICE</div>
                      <div style={{ color: "#64748b", fontSize: 10, lineHeight: 1.6 }}>No: INV-2025-0042<br/>Date: 10/03/2025<br/>Due: 25/03/2025</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "#e2e8f0", marginBottom: 8 }} />
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 8 }}>
                    <strong>Bill To:</strong> Sharma Garments Pvt. Ltd., Ulhasnagar
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                    <thead>
                      <tr style={{ background: "#1e40af" }}>
                        {["Item","Qty","Rate","Tax","Amt"].map(h => <th key={h} style={{ padding: "4px 5px", color: "#fff", textAlign: "right", fontWeight: 700 }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[["Cotton Fabric 40s","50m","₹180","5%","₹9,450"],["Polyester Blend","30m","₹220","12%","₹7,012"],["Denim Fabric","20m","₹350","12%","₹7,840"],["Lining Material","40m","₹95","5%","₹3,990"]].map((row, i) => (
                        <tr key={i} style={{ background: i % 2 ? "#f8faff" : "#fff" }}>
                          {row.map((cell, j) => <td key={j} style={{ padding: "4px 5px", textAlign: j === 0 ? "left" : "right", color: "#374151" }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ height: 1, background: "#e2e8f0", margin: "8px 0 6px" }} />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 10, color: "#374151", textAlign: "right", lineHeight: 1.8 }}>
                      <div>Subtotal: <strong>₹28,292</strong></div>
                      <div>CGST: <strong>₹1,247</strong></div>
                      <div>SGST: <strong>₹1,247</strong></div>
                      <div style={{ fontWeight: 800, fontSize: 12, color: "#1e40af", borderTop: "1px solid #e2e8f0", paddingTop: 4 }}>TOTAL: ₹30,456</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Log Terminal */}
            <div style={{ background: "#0a0a1a", border: "1px solid rgba(108,99,255,.3)", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ background: "rgba(108,99,255,.1)", padding: "8px 14px", fontSize: 10, fontFamily: "monospace", color: "#6c63ff", letterSpacing: "0.1em", fontWeight: 700, borderBottom: "1px solid rgba(108,99,255,.2)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6c63ff", animation: stage === "animating" ? "pulse 1s infinite" : "none" }} />
                AI PROCESSING LOG
              </div>
              <div style={{ padding: 12, minHeight: 120, maxHeight: 160, overflowY: "auto", fontFamily: "monospace", fontSize: 11 }}>
                {logs.length === 0 && stage === "idle" && (
                  <div style={{ color: "#334155", textAlign: "center", paddingTop: 30 }}>Click "Run Demo" to start...</div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="log-entry" style={{ color: log.color, marginBottom: 5, lineHeight: 1.5 }}>
                    <span style={{ color: "#334155" }}>[{new Date().toLocaleTimeString()}] </span>{log.msg}
                  </div>
                ))}
                {stage === "animating" && (
                  <div style={{ color: "#475569", display: "flex", gap: 3, alignItems: "center", marginTop: 4 }}>
                    <span>Processing</span>
                    {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#6c63ff", display: "inline-block", animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="hov" onClick={startDemo} disabled={stage === "animating"}
                style={{ flex: 2, padding: "13px 10px", background: stage === "animating" ? "rgba(108,99,255,.3)" : "linear-gradient(135deg,#6c63ff,#a78bfa)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 800, fontFamily: "monospace", border: "none", cursor: stage === "animating" ? "not-allowed" : "pointer", letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {stage === "animating"
                  ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" }} />RUNNING…</>
                  : stage === "done" ? "▶ RUN AGAIN" : "▶ RUN DEMO"
                }
              </button>
              {stage === "done" && (
                <button className="hov" onClick={reset}
                  style={{ flex: 1, padding: "13px 10px", background: "rgba(255,255,255,.07)", color: "#94a3b8", borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: "monospace", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer" }}>
                  ↺ Reset
                </button>
              )}
            </div>

            {/* Stats */}
            {stage === "done" && (
              <div className="fade" style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["⚡ Time Saved","~28 min"],["🎯 Accuracy","99.2%"],["📦 Fields","23 extracted"],["🔵 Provider","Gemini Flash"]].map(([l, v]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#a78bfa" }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Results */}
          {extracted && (
            <div className="fade">
              <div style={{ display: "flex", gap: 5, marginBottom: 12, background: "rgba(255,255,255,.05)", borderRadius: 10, padding: 4 }}>
                {[["structured","📋 Structured View"],["raw","{ } Raw JSON"]].map(([id, label]) => (
                  <button key={id} className="hov" onClick={() => setTab(id)}
                    style={{ flex: 1, padding: "9px", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: "monospace", background: tab === id ? "linear-gradient(135deg,#6c63ff,#a78bfa)" : "transparent", color: tab === id ? "#fff" : "#64748b", border: "none", cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button className="hov" onClick={copy} style={{ flex: 1, padding: "9px", background: copied ? "#064e3b" : "rgba(255,255,255,.07)", color: copied ? "#34d399" : "#94a3b8", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer" }}>
                  {copied ? "✓ COPIED!" : "⎘ COPY JSON"}
                </button>
                <button className="hov" onClick={download} style={{ flex: 1, padding: "9px", background: "linear-gradient(135deg,#6c63ff,#a78bfa)", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: "none", cursor: "pointer" }}>
                  ↓ DOWNLOAD JSON
                </button>
              </div>

              {tab === "structured" ? (
                <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: 4 }}>
                  {/* Summary Banner */}
                  <div style={{ background: "linear-gradient(135deg,rgba(108,99,255,.2),rgba(167,139,250,.1))", border: "1px solid rgba(108,99,255,.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>INVOICE NUMBER</div>
                      <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{extracted.invoice_number}</div>
                      <div style={{ color: "#6c63ff", fontSize: 11, fontFamily: "monospace", marginTop: 3 }}>🔵 via Gemini Flash</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>GRAND TOTAL</div>
                      <div style={{ color: "#a78bfa", fontSize: 28, fontWeight: 800 }}>₹{extracted.grand_total?.toLocaleString("en-IN")}</div>
                      <div style={{ color: "#34d399", fontSize: 11, fontFamily: "monospace" }}>✓ Verified</div>
                    </div>
                  </div>

                  <Sec title="Supplier Details">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                      <Field label="Company Name" value={extracted.supplier?.name} />
                      <Field label="Phone" value={extracted.supplier?.phone} />
                      <Field label="GSTIN" value={extracted.supplier?.gstin} />
                      <Field label="PAN" value={extracted.supplier?.pan} />
                    </div>
                    <Field label="Address" value={extracted.supplier?.address} />
                    <Field label="Email" value={extracted.supplier?.email} />
                  </Sec>

                  <Sec title="Bill To">
                    <Field label="Company" value={extracted.bill_to?.name} />
                    <Field label="Address" value={extracted.bill_to?.address} />
                    <Field label="GSTIN" value={extracted.bill_to?.gstin} />
                  </Sec>

                  <Sec title="Invoice Info">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                      <Field label="Invoice No." value={extracted.invoice_number} />
                      <Field label="Invoice Date" value={extracted.invoice_date} />
                      <Field label="Due Date" value={extracted.due_date} />
                      <Field label="Payment Terms" value={extracted.payment_terms} />
                    </div>
                  </Sec>

                  <Sec title={`Line Items (${extracted.line_items?.length})`}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
                        <thead>
                          <tr style={{ background: "#e8eaf6" }}>
                            {["Description","Qty","Rate","Tax","Amount"].map(h => (
                              <th key={h} style={{ padding: "7px 8px", textAlign: h === "Description" ? "left" : "right", color: "#64748b", fontWeight: 700, fontSize: 10, letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {extracted.line_items?.map((it, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#f8faff" }}>
                              <td style={{ padding: "7px 8px", color: "#0f172a", fontSize: 12 }}>{it.description}</td>
                              <td style={{ padding: "7px 8px", textAlign: "right", color: "#334155" }}>{it.quantity} {it.unit}</td>
                              <td style={{ padding: "7px 8px", textAlign: "right", color: "#334155" }}>₹{it.unit_price}</td>
                              <td style={{ padding: "7px 8px", textAlign: "right", color: "#334155" }}>{it.tax_rate}%</td>
                              <td style={{ padding: "7px 8px", textAlign: "right", color: "#6c63ff", fontWeight: 800 }}>₹{it.amount?.toLocaleString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Sec>

                  <Sec title="Tax Breakdown & Totals">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[["Subtotal", extracted.subtotal], ["Discount", extracted.discount_total], ["CGST", extracted.tax_details?.cgst], ["SGST", extracted.tax_details?.sgst], ["Total Tax", extracted.total_tax]].filter(([,v]) => v != null).map(([l, v]) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>
                          <span>{l}</span><span>₹{v?.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: "2px solid #0f172a", paddingTop: 8, marginTop: 3, display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "monospace" }}>
                        <span style={{ color: "#0f172a", fontSize: 13 }}>GRAND TOTAL</span>
                        <span style={{ color: "#6c63ff", fontSize: 17 }}>₹{extracted.grand_total?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </Sec>

                  <Sec title="Bank Details">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                      <Field label="Bank" value={extracted.bank_details?.bank_name} />
                      <Field label="IFSC" value={extracted.bank_details?.ifsc} />
                    </div>
                    <Field label="Account Number" value={extracted.bank_details?.account_number} />
                  </Sec>

                  <Sec title="Notes"><div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace", lineHeight: 1.7 }}>{extracted.notes}</div></Sec>
                </div>
              ) : (
                <div style={{ background: "#080818", border: "1px solid rgba(108,99,255,.2)", borderRadius: 12, padding: 18, maxHeight: "68vh", overflowY: "auto" }}>
                  <pre style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {rawJson.split("\n").map((line, i) => {
                      const isKey  = /^\s*"[^"]+":\s/.test(line);
                      const isNull = line.includes(": null");
                      const isNum  = /:\s*[\d.]+/.test(line) && !/:\s*"/.test(line);
                      const isStr  = /:\s*"[^"]*"/.test(line) && !isKey;
                      let color = "#e2e8f0";
                      if (isKey)  color = "#fbbf24";
                      if (isNull) color = "#475569";
                      if (isNum && !isKey)  color = "#86efac";
                      return <span key={i} style={{ color, display: "block" }}>{line}</span>;
                    })}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
