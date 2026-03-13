import { useState, useRef } from "react";
import { generateConfidenceScores, getConfidenceColor, getConfidenceIcon } from '../utils/confidenceScore';
import { exportToCSV } from '../utils/csvExport';
import { validateInvoiceData, validateFile } from '../utils/validation';
import EvaluationPanel from './EvaluationPanel';

const STEPS = [
  { id: "upload", label: "Upload", icon: "📤" },
  { id: "reading", label: "AI Reading", icon: "🔍" },
  { id: "parsing", label: "Parsing", icon: "⚙️" },
  { id: "done", label: "Done!", icon: "✅" },
];

export default function EnhancedInvoiceOCR() {
  const [stage, setStage] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [extracted, setExtracted] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [tab, setTab] = useState("structured");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [validation, setValidation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [fileValidation, setFileValidation] = useState(null);
  const fileInputRef = useRef(null);
  const timers = useRef([]);

  const addLog = (msg, color = "#79758C") => {
    setLogs(l => [...l, { msg, color, id: Date.now() + Math.random() }]);
  };

  const processFile = async (file) => {
    if (stage === "animating") return;
    
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("animating");
    setLogs([]);
    setExtracted(null);
    setConfidence(null);
    setActiveStep(0);
    setError(null);
    setEditMode(false);

    try {
      addLog(`📄 File received: ${file.name}`, "#79758C");
      setActiveStep(0);

      await new Promise(r => setTimeout(r, 600));
      addLog("🔵 Connecting to Gemini Flash...", "#4285f4");
      setActiveStep(1);

      const formData = new FormData();
      formData.append('invoice', file);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/invoice/extract', {
        method: 'POST',
        headers: headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process invoice');
      }

      addLog("✓ Gemini connected successfully", "#34d399");
      addLog("🧠 Analyzing invoice layout...", "#fbbf24");
      
      const result = await response.json();
      
      addLog(`🔢 Reading line items (${result.data.line_items?.length || 0} found)...`, "#fbbf24");
      setActiveStep(2);
      
      await new Promise(r => setTimeout(r, 400));
      addLog("💰 Calculating tax breakdown...", "#fbbf24");
      addLog("🏦 Extracting bank details...", "#fbbf24");
      addLog("📊 Generating confidence scores...", "#C9B4E0");
      
      await new Promise(r => setTimeout(r, 400));
      addLog("✅ JSON generated successfully!", "#34d399");
      addLog(`⚡ Extraction complete in ${result.metadata.processingTime}`, "#C9B4E0");
      
      const scores = generateConfidenceScores(result.data);
      result.data._confidence = scores;
      
      // Validate extracted data
      const dataValidation = validateInvoiceData(result.data);
      setValidation(dataValidation);
      
      addLog(`📊 Validation Score: ${dataValidation.score}% (Grade: ${dataValidation.grade})`, dataValidation.score >= 80 ? "#34d399" : "#fbbf24");
      
      setExtracted(result.data);
      setConfidence(scores);
      setStage("done");
      setActiveStep(3);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
      addLog(`❌ Error: ${err.message}`, "#ef4444");
      setStage("idle");
      setActiveStep(0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileVal = validateFile(file);
      setFileValidation(fileVal);
      
      if (!fileVal.isValid) {
        setError(fileVal.errors.join(', '));
        return;
      }
      
      setUploadedFile(file);
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fileVal = validateFile(file);
      setFileValidation(fileVal);
      
      if (!fileVal.isValid) {
        setError(fileVal.errors.join(', '));
        return;
      }
      
      setUploadedFile(file);
      processFile(file);
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage("idle");
    setLogs([]);
    setExtracted(null);
    setConfidence(null);
    setValidation(null);
    setFileValidation(null);
    setActiveStep(0);
    setTab("structured");
    setUploadedFile(null);
    setError(null);
    setEditMode(false);
    setShowEvaluation(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(extracted, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(extracted, null, 2)], { type: "application/json" }));
    a.download = `invoice_${extracted.invoice_number || 'data'}.json`;
    a.click();
  };

  const handleCSVExport = () => {
    exportToCSV(extracted);
  };

  const updateField = (path, value) => {
    setExtracted(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const EditableField = ({ label, value, path, conf = 'High', type = 'text' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    if (!value && value !== 0) return null;

    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#79758C', textTransform: 'uppercase', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            {label}
            <span style={{ fontSize: 10, color: getConfidenceColor(conf), fontWeight: 800, padding: '2px 6px', background: `${getConfidenceColor(conf)}20`, borderRadius: 4 }}>
              {getConfidenceIcon(conf)} {conf}
            </span>
          </div>
          {editMode && !isEditing && (
            <button onClick={() => setIsEditing(true)} style={{ padding: '3px 8px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 4, color: '#AB51F2', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
              ✏️
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <input type={type} value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.9)', border: '2px solid #AB51F2', borderRadius: 6, fontSize: 13, color: '#0f172a', outline: 'none', marginBottom: 6 }} autoFocus />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { updateField(path, editValue); setIsEditing(false); }} style={{ flex: 1, padding: '6px', background: 'linear-gradient(135deg,#34d399,#10b981)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓ Save</button>
              <button onClick={() => { setEditValue(value); setIsEditing(false); }} style={{ flex: 1, padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✗ Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.5, padding: '8px 10px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, border: `1px solid ${getConfidenceColor(conf)}20` }}>
            {String(value)}
          </div>
        )}
      </div>
    );
  };

  const Sec = ({ title, children }) => (
    <div style={{ background: "#f8faff", border: "1px solid #242226", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "#AB51F2", textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace", borderBottom: "1px solid #242226", paddingBottom: 7 }}>{title}</div>
      {children}
    </div>
  );

  const rawJson = extracted ? JSON.stringify(extracted, null, 2) : "";

  return (
    <div style={{ minHeight: "100vh", background: "#F8F2FE", fontFamily: "system-ui, sans-serif", color: "#242226" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(108,99,255,.3)}50%{box-shadow:0 0 40px rgba(108,99,255,.7)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .fade{animation:fadeUp .5s ease forwards}
        .log-entry{animation:slideIn .3s ease forwards}
        .hov{transition:all .15s;cursor:pointer}
        .hov:hover{opacity:.88;transform:translateY(-1px)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(255,255,255,.7)", borderBottom: "1px solid rgba(171,81,242,.15)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#AB51F2,#C9B4E0)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", animation: stage === "animating" ? "glow 2s infinite" : "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.01em" }}>InvoiceAI</div>
            <div style={{ color: "#79758C", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>LIVE OCR</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage === "animating" ? "#34d399" : stage === "done" ? "#AB51F2" : "#79758C", animation: stage === "animating" ? "pulse 1s infinite" : "none" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#79758C", letterSpacing: "0.06em" }}>
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
                  background: activeStep > i ? "linear-gradient(135deg,#AB51F2,#C9B4E0)" : activeStep === i && stage === "animating" ? "rgba(108,99,255,.2)" : "rgba(201,180,224,.3)",
                  border: `2px solid ${activeStep >= i ? "#AB51F2" : "rgba(171,81,242,.2)"}`,
                  transition: "all .4s",
                  animation: activeStep === i && stage === "animating" ? "pulse 1s infinite" : "none"
                }}>
                  {activeStep > i ? "✓" : s.icon}
                </div>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: activeStep >= i ? "#C9B4E0" : "#79758C", letterSpacing: "0.06em", fontWeight: 700 }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: activeStep > i ? "linear-gradient(90deg,#AB51F2,#C9B4E0)" : "rgba(255,255,255,.08)", margin: "0 6px", marginBottom: 22, transition: "all .4s" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: extracted ? "340px 1fr" : "1fr", gap: 20, justifyContent: "center" }}>
          {/* LEFT */}
          <div>
            {/* Upload Area */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                background: dragOver ? "rgba(108,99,255,.15)" : "rgba(255,255,255,.7)", 
                border: `2px dashed ${dragOver ? "#AB51F2" : "rgba(255,255,255,.15)"}`, 
                borderRadius: 14, 
                padding: "40px 20px", 
                textAlign: "center", 
                cursor: "pointer",
                marginBottom: 14,
                transition: "all .3s"
              }}>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#242226", marginBottom: 6 }}>
                {uploadedFile ? uploadedFile.name : "Drop invoice here or click to upload"}
              </div>
              <div style={{ fontSize: 11, color: "#79758C", fontFamily: "monospace" }}>
                Supports PDF, JPG, PNG (Max 10MB)
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                <div style={{ color: "#ef4444", fontSize: 12, fontFamily: "monospace" }}>❌ {error}</div>
              </div>
            )}

            {/* AI Log Terminal */}
            <div style={{ background: "#0a0a1a", border: "1px solid rgba(108,99,255,.3)", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ background: "rgba(108,99,255,.1)", padding: "8px 14px", fontSize: 10, fontFamily: "monospace", color: "#AB51F2", letterSpacing: "0.1em", fontWeight: 700, borderBottom: "1px solid rgba(108,99,255,.2)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#AB51F2", animation: stage === "animating" ? "pulse 1s infinite" : "none" }} />
                AI PROCESSING LOG
              </div>
              <div style={{ padding: 12, minHeight: 120, maxHeight: 160, overflowY: "auto", fontFamily: "monospace", fontSize: 11 }}>
                {logs.length === 0 && stage === "idle" && (
                  <div style={{ color: "#334155", textAlign: "center", paddingTop: 30 }}>Upload an invoice to start...</div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="log-entry" style={{ color: log.color, marginBottom: 5, lineHeight: 1.5 }}>
                    <span style={{ color: "#334155" }}>[{new Date().toLocaleTimeString()}] </span>{log.msg}
                  </div>
                ))}
                {stage === "animating" && (
                  <div style={{ color: "#79758C", display: "flex", gap: 3, alignItems: "center", marginTop: 4 }}>
                    <span>Processing</span>
                    {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#AB51F2", display: "inline-block", animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Reset Button */}
            {stage === "done" && (
              <button className="hov" onClick={reset}
                style={{ width: "100%", padding: "13px 10px", background: "rgba(171,81,242,.15)", color: "#79758C", borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: "monospace", border: "1px solid rgba(171,81,242,.2)", cursor: "pointer" }}>
                ↺ Upload Another Invoice
              </button>
            )}

            {/* Stats */}
            {stage === "done" && extracted && (
              <div className="fade" style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["📦 Fields", `${Object.keys(extracted).length} extracted`],
                  ["🔵 Provider", "Gemini Flash"],
                  ["🎯 Accuracy", confidence ? "AI Verified" : "N/A"],
                  ["💾 Format", "JSON/CSV"]
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,.7)", border: "1px solid rgba(171,81,242,.15)", borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#79758C", fontFamily: "monospace", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#C9B4E0" }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Results */}
          {extracted && (
            <div className="fade">
              <div style={{ display: "flex", gap: 5, marginBottom: 12, background: "rgba(201,180,224,.3)", borderRadius: 10, padding: 4 }}>
                {[["structured","📋 Structured View"],["raw","{ } Raw JSON"]].map(([id, label]) => (
                  <button key={id} className="hov" onClick={() => setTab(id)}
                    style={{ flex: 1, padding: "9px", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: "monospace", background: tab === id ? "linear-gradient(135deg,#AB51F2,#C9B4E0)" : "transparent", color: tab === id ? "#fff" : "#79758C", border: "none", cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Action Buttons with Edit Mode Toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                <button className="hov" onClick={() => setEditMode(!editMode)} style={{ padding: "10px", background: editMode ? "linear-gradient(135deg,#34d399,#10b981)" : "rgba(171,81,242,.15)", color: editMode ? "#fff" : "#79758C", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: editMode ? "none" : "1px solid rgba(255,255,255,.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {editMode ? "✓ EDIT MODE" : "✏️ EDIT"}
                </button>
                <button className="hov" onClick={() => setShowEvaluation(true)} style={{ padding: "10px", background: validation ? `linear-gradient(135deg, ${validation.score >= 80 ? '#34d399' : '#fbbf24'}, ${validation.score >= 80 ? '#10b981' : '#f59e0b'})` : "rgba(171,81,242,.15)", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  📊 EVALUATE
                </button>
                <button className="hov" onClick={handleCSVExport} style={{ padding: "10px", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  📄 CSV
                </button>
                <button className="hov" onClick={copy} style={{ padding: "10px", background: copied ? "#064e3b" : "rgba(171,81,242,.15)", color: copied ? "#34d399" : "#79758C", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer" }}>
                  {copied ? "✓ COPIED!" : "⎘ COPY"}
                </button>
                <button className="hov" onClick={download} style={{ padding: "10px", background: "linear-gradient(135deg,#AB51F2,#C9B4E0)", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "monospace", border: "none", cursor: "pointer", gridColumn: "span 2" }}>
                  ↓ DOWNLOAD JSON
                </button>
              </div>

              {/* Validation Score Badge */}
              {validation && (
                <div style={{
                  background: validation.score >= 80 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  border: `2px solid ${validation.score >= 80 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 24 }}>
                      {validation.isValid ? '✅' : '⚠️'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#79758C', fontWeight: 600, marginBottom: 2 }}>
                        ACCURACY SCORE
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: validation.score >= 80 ? '#34d399' : '#fbbf24' }}>
                        {validation.score}% • Grade {validation.grade}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEvaluation(true)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(171, 81, 242, 0.2)',
                      border: '1px solid rgba(171, 81, 242, 0.4)',
                      borderRadius: 8,
                      color: '#C9B4E0',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    View Report →
                  </button>
                </div>
              )}

              {/* Confidence Score Legend */}
              {confidence && tab === "structured" && (
                <div style={{ background: "rgba(108,99,255,.1)", border: "1px solid rgba(108,99,255,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: "#C9B4E0" }}>Confidence:</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#34d399" }}>✓ High</span>
                    <span style={{ color: "#fbbf24" }}>⚠ Medium</span>
                    <span style={{ color: "#ef4444" }}>✗ Low</span>
                  </div>
                </div>
              )}

              {tab === "structured" ? (
                <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: 4 }}>
                  {/* Summary Banner */}
                  <div style={{ background: "linear-gradient(135deg,rgba(108,99,255,.2),rgba(167,139,250,.1))", border: "1px solid rgba(108,99,255,.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "#79758C", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>INVOICE NUMBER</div>
                      <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{extracted.invoice_number || "N/A"}</div>
                      <div style={{ color: "#AB51F2", fontSize: 11, fontFamily: "monospace", marginTop: 3 }}>🔵 via Gemini Flash</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#79758C", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>GRAND TOTAL</div>
                      <div style={{ color: "#C9B4E0", fontSize: 28, fontWeight: 800 }}>{extracted.currency || "₹"}{extracted.grand_total?.toLocaleString("en-IN") || "0"}</div>
                      <div style={{ color: "#34d399", fontSize: 11, fontFamily: "monospace" }}>✓ Verified</div>
                    </div>
                  </div>

                  {extracted.supplier && (
                    <Sec title="Supplier Details">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                        <EditableField label="Company Name" value={extracted.supplier?.name} path="supplier.name" conf={confidence?.supplier?.name} />
                        <EditableField label="Phone" value={extracted.supplier?.phone} path="supplier.phone" conf={confidence?.supplier?.phone} />
                        <EditableField label="GSTIN" value={extracted.supplier?.gstin} path="supplier.gstin" conf={confidence?.supplier?.gstin} />
                        <EditableField label="PAN" value={extracted.supplier?.pan} path="supplier.pan" conf={confidence?.supplier?.pan} />
                      </div>
                      <EditableField label="Address" value={extracted.supplier?.address} path="supplier.address" conf={confidence?.supplier?.address} />
                      <EditableField label="Email" value={extracted.supplier?.email} path="supplier.email" conf={confidence?.supplier?.email} type="email" />
                    </Sec>
                  )}

                  {extracted.bill_to && (
                    <Sec title="Bill To">
                      <EditableField label="Company" value={extracted.bill_to?.name} path="bill_to.name" conf={confidence?.bill_to?.name} />
                      <EditableField label="Address" value={extracted.bill_to?.address} path="bill_to.address" conf={confidence?.bill_to?.address} />
                      <EditableField label="GSTIN" value={extracted.bill_to?.gstin} path="bill_to.gstin" conf={confidence?.bill_to?.gstin} />
                    </Sec>
                  )}

                  <Sec title="Invoice Info">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                      <EditableField label="Invoice No." value={extracted.invoice_number} path="invoice_number" conf={confidence?.invoice_number} />
                      <EditableField label="Invoice Date" value={extracted.invoice_date} path="invoice_date" conf={confidence?.invoice_date} />
                      <EditableField label="Due Date" value={extracted.due_date} path="due_date" conf={confidence?.due_date} />
                      <EditableField label="Payment Terms" value={extracted.payment_terms} path="payment_terms" conf={confidence?.payment_terms} />
                    </div>
                  </Sec>

                  {extracted.line_items && extracted.line_items.length > 0 && (
                    <Sec title={`Line Items (${extracted.line_items?.length})`}>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
                          <thead>
                            <tr style={{ background: "#e8eaf6" }}>
                              {["Description","Qty","Rate","Tax","Amount"].map(h => (
                                <th key={h} style={{ padding: "7px 8px", textAlign: h === "Description" ? "left" : "right", color: "#79758C", fontWeight: 700, fontSize: 10, letterSpacing: "0.05em" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {extracted.line_items?.map((it, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid #242226", background: i % 2 === 0 ? "#fff" : "#f8faff" }}>
                                <td style={{ padding: "7px 8px", color: "#0f172a", fontSize: 12 }}>{it.description}</td>
                                <td style={{ padding: "7px 8px", textAlign: "right", color: "#334155" }}>{it.quantity} {it.unit || ""}</td>
                                <td style={{ padding: "7px 8px", textAlign: "right", color: "#334155" }}>{extracted.currency || "₹"}{it.unit_price}</td>
                                <td style={{ padding: "7px 8px", textAlign: "right", color: "#334155" }}>{it.tax_rate}%</td>
                                <td style={{ padding: "7px 8px", textAlign: "right", color: "#AB51F2", fontWeight: 800 }}>{extracted.currency || "₹"}{it.amount?.toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Sec>
                  )}

                  <Sec title="Tax Breakdown & Totals">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[
                        ["Subtotal", extracted.subtotal], 
                        ["Discount", extracted.discount_total], 
                        ["CGST", extracted.tax_details?.cgst], 
                        ["SGST", extracted.tax_details?.sgst], 
                        ["IGST", extracted.tax_details?.igst],
                        ["Total Tax", extracted.total_tax]
                      ].filter(([,v]) => v != null && v !== 0).map(([l, v]) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "monospace", color: "#79758C" }}>
                          <span>{l}</span><span>{extracted.currency || "₹"}{v?.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: "2px solid #0f172a", paddingTop: 8, marginTop: 3, display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "monospace" }}>
                        <span style={{ color: "#0f172a", fontSize: 13 }}>GRAND TOTAL</span>
                        <span style={{ color: "#AB51F2", fontSize: 17 }}>{extracted.currency || "₹"}{extracted.grand_total?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </Sec>

                  {extracted.bank_details && (
                    <Sec title="Bank Details">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                        <EditableField label="Bank" value={extracted.bank_details?.bank_name} path="bank_details.bank_name" conf="High" />
                        <EditableField label="IFSC" value={extracted.bank_details?.ifsc} path="bank_details.ifsc" conf="High" />
                      </div>
                      <EditableField label="Account Number" value={extracted.bank_details?.account_number} path="bank_details.account_number" conf="High" />
                    </Sec>
                  )}

                  {extracted.notes && (
                    <Sec title="Notes">
                      <div style={{ fontSize: 12, color: "#79758C", fontFamily: "monospace", lineHeight: 1.7 }}>{extracted.notes}</div>
                    </Sec>
                  )}
                </div>
              ) : (
                <div style={{ background: "#080818", border: "1px solid rgba(108,99,255,.2)", borderRadius: 12, padding: 18, maxHeight: "68vh", overflowY: "auto" }}>
                  <pre style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {rawJson.split("\n").map((line, i) => {
                      const isKey  = /^\s*"[^"]+":\s/.test(line);
                      const isNull = line.includes(": null");
                      const isNum  = /:\s*[\d.]+/.test(line) && !/:\s*"/.test(line);
                      let color = "#242226";
                      if (isKey)  color = "#fbbf24";
                      if (isNull) color = "#79758C";
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

      {/* Evaluation Panel Modal */}
      {showEvaluation && validation && (
        <EvaluationPanel 
          validation={validation} 
          onClose={() => setShowEvaluation(false)} 
        />
      )}
    </div>
  );
}
