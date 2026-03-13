import { useState } from 'react';
import { getApiUrl } from '../config/api';

export default function InvoiceUploadExtractor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [confidenceScores, setConfidenceScores] = useState(null);
  const [rawJSON, setRawJSON] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('ui'); // 'ui', 'json', or 'evaluation'
  const [imageZoom, setImageZoom] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [fraudDetection, setFraudDetection] = useState(null);
  const [anomalyDetection, setAnomalyDetection] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
      setRawJSON('');
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl('/api/invoice/extract'), {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ API Response:', data);
        console.log('📊 Confidence Scores:', data.confidenceScores);
        
        setExtractedData(data.data);
        setEditableData(JSON.parse(JSON.stringify(data.data))); // Deep copy for editing
        setConfidenceScores(data.confidenceScores || calculateConfidenceScores(data.data));
        setRawJSON(JSON.stringify(data.data, null, 2));
        
        // Evaluate extraction quality
        const evalResult = evaluateExtraction(data.data, data.confidenceScores);
        setEvaluation(evalResult);
        
        // Set fraud detection results
        setFraudDetection(data.fraudDetection || null);
        
        // Set anomaly detection results
        setAnomalyDetection(data.anomalyDetection || null);
      } else {
        setError(data.error || 'Extraction failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = () => {
    const jsonToCopy = isEditing ? JSON.stringify(editableData, null, 2) : rawJSON;
    navigator.clipboard.writeText(jsonToCopy);
    alert('JSON copied to clipboard!');
  };

  const handleDownloadJSON = () => {
    const jsonToDownload = isEditing ? JSON.stringify(editableData, null, 2) : rawJSON;
    const blob = new Blob([jsonToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const dataToExport = isEditing ? editableData : extractedData;
    const csv = convertToCSV(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    let csv = '';
    
    // Supplier Info
    csv += 'SUPPLIER INFORMATION\n';
    if (data.supplier) {
      csv += `Name,${data.supplier.name || ''}\n`;
      csv += `GSTIN,${data.supplier.gstin || ''}\n`;
      csv += `Address,${data.supplier.address || ''}\n`;
      csv += `Phone,${data.supplier.phone || ''}\n`;
      csv += `Email,${data.supplier.email || ''}\n`;
    }
    csv += '\n';
    
    // Invoice Info
    csv += 'INVOICE INFORMATION\n';
    if (data.invoice) {
      csv += `Invoice Number,${data.invoice.invoice_number || ''}\n`;
      csv += `Invoice Date,${data.invoice.invoice_date || ''}\n`;
      csv += `Due Date,${data.invoice.due_date || ''}\n`;
      csv += `Place of Supply,${data.invoice.place_of_supply || ''}\n`;
      csv += `Payment Terms,${data.invoice.payment_terms || ''}\n`;
    }
    csv += '\n';
    
    // Bill To
    csv += 'BILL TO\n';
    if (data.bill_to) {
      csv += `Name,${data.bill_to.name || ''}\n`;
      csv += `Address,${data.bill_to.address || ''}\n`;
      csv += `GSTIN,${data.bill_to.gstin || ''}\n`;
    }
    csv += '\n';
    
    // Line Items
    csv += 'LINE ITEMS\n';
    csv += 'Name,HSN,Quantity,UOM,Rate,Amount\n';
    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        csv += `"${item.name || ''}",${item.hsn || ''},${item.qty || 0},${item.uom || ''},${item.rate || 0},${item.amount || 0}\n`;
      });
    }
    csv += '\n';
    
    // Tax
    csv += 'TAX DETAILS\n';
    if (data.tax) {
      csv += `CGST,${data.tax.cgst || 0}\n`;
      csv += `SGST,${data.tax.sgst || 0}\n`;
      csv += `IGST,${data.tax.igst || 0}\n`;
    }
    csv += '\n';
    
    // Totals
    csv += 'TOTALS\n';
    if (data.totals) {
      csv += `Sub Total,${data.totals.sub_total || 0}\n`;
      csv += `Tax Total,${data.totals.tax_total || 0}\n`;
      csv += `Discount,${data.totals.discount || 0}\n`;
      csv += `Grand Total,${data.totals.grand_total || 0}\n`;
    }
    
    return csv;
  };

  const calculateConfidenceScores = (data) => {
    const scores = {};
    
    const getScore = (value) => {
      if (!value || value === '' || value === null || value === undefined) return 0;
      if (typeof value === 'string' && value.trim().length < 3) return 50;
      if (typeof value === 'number' && value === 0) return 50;
      if (typeof value === 'number' && value > 0) return 95;
      if (typeof value === 'string' && value.trim().length >= 3) return 90;
      return 75;
    };
    
    if (data.supplier) {
      scores.supplier = {};
      Object.keys(data.supplier).forEach(key => {
        scores.supplier[key] = getScore(data.supplier[key]);
      });
    }
    
    if (data.invoice) {
      scores.invoice = {};
      Object.keys(data.invoice).forEach(key => {
        scores.invoice[key] = getScore(data.invoice[key]);
      });
    }
    
    if (data.bill_to) {
      scores.bill_to = {};
      Object.keys(data.bill_to).forEach(key => {
        scores.bill_to[key] = getScore(data.bill_to[key]);
      });
    }
    
    if (data.items && data.items.length > 0) {
      const itemScores = data.items.map(item => {
        const avg = (getScore(item.name) + getScore(item.qty) + getScore(item.rate) + getScore(item.amount)) / 4;
        return avg;
      });
      scores.items = Math.round(itemScores.reduce((a, b) => a + b, 0) / itemScores.length);
    }
    
    if (data.tax) {
      const taxScores = Object.values(data.tax).map(getScore).filter(s => s > 0);
      scores.tax = taxScores.length > 0 ? Math.round(taxScores.reduce((a, b) => a + b, 0) / taxScores.length) : 50;
    }
    
    if (data.totals) {
      scores.totals = {};
      Object.keys(data.totals).forEach(key => {
        scores.totals[key] = getScore(data.totals[key]);
      });
    }
    
    return scores;
  };

  const updateEditableData = (path, value) => {
    const newData = JSON.parse(JSON.stringify(editableData));
    const keys = path.split('.');
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setEditableData(newData);
    setRawJSON(JSON.stringify(newData, null, 2));
  };

  const handleSaveEdits = () => {
    setExtractedData(JSON.parse(JSON.stringify(editableData)));
    setRawJSON(JSON.stringify(editableData, null, 2));
    setIsEditing(false);
    alert('Changes saved successfully!');
  };

  const handleCancelEdits = () => {
    setEditableData(JSON.parse(JSON.stringify(extractedData)));
    setRawJSON(JSON.stringify(extractedData, null, 2));
    setIsEditing(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setEditableData(null);
    setConfidenceScores(null);
    setRawJSON('');
    setError(null);
    setActiveView('ui');
    setImageZoom(false);
    setIsEditing(false);
    setEvaluation(null);
    setFraudDetection(null);
    setAnomalyDetection(null);
  };

  // Evaluate extraction quality
  const evaluateExtraction = (data, scores) => {
    const issues = [];
    const warnings = [];
    let accuracyScore = 100;

    // 1. Check tax calculation accuracy
    if (data.items && data.items.length > 0 && data.tax && data.totals) {
      const calculatedSubTotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const extractedSubTotal = data.totals.sub_total || 0;
      
      if (Math.abs(calculatedSubTotal - extractedSubTotal) > 1) {
        issues.push({
          type: 'error',
          field: 'Sub Total',
          message: `Mismatch: Calculated ₹${calculatedSubTotal.toLocaleString('en-IN')} vs Extracted ₹${extractedSubTotal.toLocaleString('en-IN')}`,
          impact: 10
        });
        accuracyScore -= 10;
      }

      // Check tax calculation
      const calculatedTaxTotal = (data.tax.cgst || 0) + (data.tax.sgst || 0) + (data.tax.igst || 0);
      const extractedTaxTotal = data.totals.tax_total || 0;
      
      if (Math.abs(calculatedTaxTotal - extractedTaxTotal) > 1) {
        issues.push({
          type: 'error',
          field: 'Tax Total',
          message: `Mismatch: Calculated ₹${calculatedTaxTotal.toLocaleString('en-IN')} vs Extracted ₹${extractedTaxTotal.toLocaleString('en-IN')}`,
          impact: 10
        });
        accuracyScore -= 10;
      }

      // Check grand total
      const calculatedGrandTotal = extractedSubTotal + extractedTaxTotal - (data.totals.discount || 0);
      const extractedGrandTotal = data.totals.grand_total || 0;
      
      if (Math.abs(calculatedGrandTotal - extractedGrandTotal) > 1) {
        issues.push({
          type: 'error',
          field: 'Grand Total',
          message: `Mismatch: Calculated ₹${calculatedGrandTotal.toLocaleString('en-IN')} vs Extracted ₹${extractedGrandTotal.toLocaleString('en-IN')}`,
          impact: 15
        });
        accuracyScore -= 15;
      }
    }

    // 2. Check for missing critical fields
    const criticalFields = [
      { path: 'supplier.name', label: 'Supplier Name' },
      { path: 'invoice.invoice_number', label: 'Invoice Number' },
      { path: 'invoice.invoice_date', label: 'Invoice Date' },
      { path: 'totals.grand_total', label: 'Grand Total' }
    ];

    criticalFields.forEach(field => {
      const value = field.path.split('.').reduce((obj, key) => obj?.[key], data);
      if (!value && value !== 0) {
        issues.push({
          type: 'error',
          field: field.label,
          message: 'Missing critical field',
          impact: 10
        });
        accuracyScore -= 10;
      }
    });

    // 3. Check confidence scores
    if (scores) {
      const allScores = [];
      const collectScores = (obj) => {
        Object.values(obj).forEach(val => {
          if (typeof val === 'number') allScores.push(val);
          else if (typeof val === 'object' && val !== null) collectScores(val);
        });
      };
      collectScores(scores);

      const avgConfidence = allScores.length > 0 
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      if (avgConfidence < 70) {
        warnings.push({
          type: 'warning',
          field: 'Overall Confidence',
          message: `Low average confidence: ${avgConfidence}%`,
          impact: 5
        });
        accuracyScore -= 5;
      }

      // Check for low confidence fields
      const lowConfidenceFields = allScores.filter(s => s < 60).length;
      if (lowConfidenceFields > 0) {
        warnings.push({
          type: 'warning',
          field: 'Field Confidence',
          message: `${lowConfidenceFields} field(s) with low confidence (<60%)`,
          impact: 3
        });
        accuracyScore -= 3;
      }
    }

    // 4. Check JSON format consistency
    const hasConsistentKeys = 
      data.supplier && 
      data.invoice && 
      data.items && 
      data.tax && 
      data.totals;

    if (!hasConsistentKeys) {
      issues.push({
        type: 'error',
        field: 'JSON Structure',
        message: 'Inconsistent or missing top-level keys',
        impact: 15
      });
      accuracyScore -= 15;
    }

    // 5. Check for empty items array
    if (!data.items || data.items.length === 0) {
      issues.push({
        type: 'error',
        field: 'Line Items',
        message: 'No line items extracted',
        impact: 20
      });
      accuracyScore -= 20;
    }

    accuracyScore = Math.max(0, Math.min(100, accuracyScore));

    return {
      score: accuracyScore,
      grade: accuracyScore >= 90 ? 'A' : accuracyScore >= 80 ? 'B' : accuracyScore >= 70 ? 'C' : accuracyScore >= 60 ? 'D' : 'F',
      issues: [...issues, ...warnings],
      summary: {
        totalIssues: issues.length,
        totalWarnings: warnings.length,
        criticalErrors: issues.filter(i => i.impact >= 10).length
      }
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F2FE', padding: 40 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(171, 81, 242, 0.4)'
          }}>
            <span style={{ fontSize: 40 }}>🤖</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#242226', marginBottom: 12 }}>
            AI Invoice Extractor
          </h1>
          <p style={{ fontSize: 16, color: '#79758C', marginBottom: 8 }}>
            Upload invoice (PDF/JPG/PNG) → AI extracts data → View structured JSON
          </p>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: 8,
            fontSize: 13,
            color: '#34d399',
            fontWeight: 600,
            marginTop: 8
          }}>
            ✨ Powered by Google Gemini Flash AI
          </div>
        </div>

        {/* Upload Section */}
        {!extractedData && (
          <div style={{
            background: 'rgba(255,255,255,.7)',
            border: '2px dashed rgba(171, 81, 242, 0.3)',
            borderRadius: 20,
            padding: 60,
            textAlign: 'center',
            marginBottom: 32,
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onClick={() => document.getElementById('file-input').click()}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.6)';
            e.currentTarget.style.background = 'rgba(171, 81, 242, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(171, 81, 242, 0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,.7)';
          }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {preview ? (
              <div>
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 16, marginBottom: 24 }} />
                <div style={{ fontSize: 16, color: '#242226', fontWeight: 700, marginBottom: 8 }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 14, color: '#79758C' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            ) : file ? (
              <div>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 18, color: '#242226', fontWeight: 700, marginBottom: 8 }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 14, color: '#79758C' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 64, marginBottom: 24 }}>📤</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#242226', marginBottom: 12 }}>
                  Click to upload invoice
                </div>
                <div style={{ fontSize: 15, color: '#79758C' }}>
                  Supports PDF, JPG, PNG formats
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px 24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 16,
            color: '#ef4444',
            fontSize: 15,
            marginBottom: 32,
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        {!extractedData && file && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                flex: 1,
                padding: '20px',
                background: loading 
                  ? 'rgba(171, 81, 242, 0.5)' 
                  : 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
                border: 'none',
                borderRadius: 16,
                color: '#fff',
                fontSize: 18,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transition: 'transform 0.2s',
                boxShadow: '0 10px 40px rgba(171, 81, 242, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 20,
                    height: 20,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Extracting with AI...
                </>
              ) : (
                <>
                  <span style={{ fontSize: 24 }}>🤖</span>
                  Extract Data with AI
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                padding: '20px 32px',
                background: 'rgba(201,180,224,.3)',
                border: '1px solid rgba(171,81,242,.2)',
                borderRadius: 16,
                color: '#79758C',
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div>
            {/* Success Notice */}
            <div style={{
              padding: '16px 24px',
              background: 'rgba(52, 211, 153, 0.1)',
              border: '2px solid rgba(52, 211, 153, 0.3)',
              borderRadius: 16,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <span style={{ fontSize: 32 }}>✅</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                  AI Extraction Complete
                </div>
                <div style={{ fontSize: 13, color: '#79758C' }}>
                  Data extracted using OCR + Gemini AI. Review and edit if needed.
                </div>
              </div>
            </div>

            {/* Fraud Detection Alert */}
            {fraudDetection && (
              <FraudDetectionBanner fraudDetection={fraudDetection} />
            )}

            {/* Anomaly Detection Alert */}
            {anomalyDetection && (
              <AnomalyDetectionBanner anomalyDetection={anomalyDetection} />
            )}

            {/* View Toggle */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                <button
                  onClick={() => setActiveView('ui')}
                  style={{
                    padding: '14px 28px',
                    background: activeView === 'ui' 
                      ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' 
                      : 'rgba(255,255,255,.7)',
                    border: 'none',
                    borderRadius: 12,
                    color: activeView === 'ui' ? '#fff' : '#79758C',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📊 Structured View
                </button>
                <button
                  onClick={() => setActiveView('json')}
                  style={{
                    padding: '14px 28px',
                    background: activeView === 'json' 
                      ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' 
                      : 'rgba(255,255,255,.7)',
                    border: 'none',
                    borderRadius: 12,
                    color: activeView === 'json' ? '#fff' : '#79758C',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📝 Raw JSON
                </button>
                <button
                  onClick={() => setActiveView('evaluation')}
                  style={{
                    padding: '14px 28px',
                    background: activeView === 'evaluation' 
                      ? 'linear-gradient(135deg, #AB51F2, #C9B4E0)' 
                      : 'rgba(255,255,255,.7)',
                    border: 'none',
                    borderRadius: 12,
                    color: activeView === 'evaluation' ? '#fff' : '#79758C',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  🎯 Evaluation
                  {evaluation && (
                    <span style={{
                      padding: '2px 8px',
                      background: evaluation.grade === 'A' ? '#34d399' : evaluation.grade === 'B' ? '#fbbf24' : '#ef4444',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 800
                    }}>
                      {evaluation.grade}
                    </span>
                  )}
                </button>
              </div>
              
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdits}
                    style={{
                      padding: '14px 24px',
                      background: 'linear-gradient(135deg, #34d399, #10b981)',
                      border: 'none',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdits}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 12,
                      color: '#ef4444',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✗ Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '2px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: 12,
                      color: '#fbbf24',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    ✏️ Edit Data
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '2px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 12,
                      color: '#22c55e',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    📊 Export CSV
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(52, 211, 153, 0.1)',
                      border: '2px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: 12,
                      color: '#34d399',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    📋 Copy JSON
                  </button>
                  <button
                    onClick={handleDownloadJSON}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(171, 81, 242, 0.1)',
                      border: '2px solid rgba(171, 81, 242, 0.3)',
                      borderRadius: 12,
                      color: '#C9B4E0',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    💾 Download JSON
                  </button>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 12,
                      color: '#ef4444',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🔄 New Upload
                  </button>
                </>
              )}
            </div>

            {/* Content Display - Split View */}
            <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: 24 }}>
              {/* Invoice Image Preview */}
              {preview && (
                <div style={{
                  background: 'rgba(255,255,255,.7)',
                  border: '1px solid rgba(171,81,242,.15)',
                  borderRadius: 16,
                  padding: 24,
                  position: 'sticky',
                  top: 24,
                  alignSelf: 'start',
                  maxHeight: 'calc(100vh - 100px)',
                  overflow: 'auto'
                }}>
                  <div style={{ 
                    fontSize: 18, 
                    fontWeight: 800, 
                    color: '#242226', 
                    marginBottom: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>📄</span>
                      Original Invoice
                    </div>
                    <button
                      onClick={() => setImageZoom(!imageZoom)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(171, 81, 242, 0.1)',
                        border: '1px solid rgba(171, 81, 242, 0.3)',
                        borderRadius: 8,
                        color: '#C9B4E0',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {imageZoom ? '🔍 Fit' : '🔍 Zoom'}
                    </button>
                  </div>
                  <div style={{ 
                    overflow: imageZoom ? 'auto' : 'hidden',
                    borderRadius: 12,
                    border: '1px solid rgba(171,81,242,.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    cursor: imageZoom ? 'move' : 'pointer'
                  }}
                  onClick={() => !imageZoom && setImageZoom(true)}
                  >
                    <img 
                      src={preview} 
                      alt="Invoice" 
                      style={{ 
                        width: imageZoom ? 'auto' : '100%',
                        maxWidth: imageZoom ? 'none' : '100%',
                        display: 'block'
                      }} 
                    />
                  </div>
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(171, 81, 242, 0.1)', border: '1px solid rgba(171, 81, 242, 0.2)', borderRadius: 10 }}>
                    <div style={{ fontSize: 13, color: '#79758C', fontWeight: 600 }}>
                      {file?.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#79758C', marginTop: 4 }}>
                      {file && (file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Data */}
              <div>
                {activeView === 'ui' ? (
                  <StructuredDataView 
                    data={isEditing ? editableData : extractedData} 
                    confidenceScores={confidenceScores}
                    isEditing={isEditing}
                    onUpdate={updateEditableData}
                  />
                ) : activeView === 'json' ? (
                  <div style={{
                    background: 'rgba(248, 242, 254, 0.8)',
                    border: '1px solid rgba(171,81,242,.2)',
                    borderRadius: 16,
                    padding: 32,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: '#242226',
                    overflow: 'auto',
                    maxHeight: '70vh'
                  }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {isEditing ? JSON.stringify(editableData, null, 2) : rawJSON}
                    </pre>
                  </div>
                ) : (
                  <EvaluationView 
                    evaluation={evaluation} 
                    data={extractedData}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StructuredDataView({ data, confidenceScores, isEditing, onUpdate }) {
  const getConfidenceLevel = (score) => {
    if (score >= 85) return { label: 'High', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.3)' };
    if (score >= 60) return { label: 'Medium', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' };
    return { label: 'Low', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Supplier Info */}
      {data.supplier && (
        <DataCard title="📦 Supplier Information" icon="📦">
          <EditableDataRow 
            label="Name" 
            value={data.supplier.name} 
            path="supplier.name"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.supplier?.name}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="GSTIN" 
            value={data.supplier.gstin} 
            path="supplier.gstin"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.supplier?.gstin}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Address" 
            value={data.supplier.address} 
            path="supplier.address"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.supplier?.address}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Phone" 
            value={data.supplier.phone} 
            path="supplier.phone"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.supplier?.phone}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Email" 
            value={data.supplier.email} 
            path="supplier.email"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.supplier?.email}
            getConfidenceLevel={getConfidenceLevel}
          />
        </DataCard>
      )}

      {/* Invoice Details */}
      {data.invoice && (
        <DataCard title="📄 Invoice Details" icon="📄">
          <EditableDataRow 
            label="Invoice Number" 
            value={data.invoice.invoice_number} 
            path="invoice.invoice_number"
            isEditing={isEditing}
            onUpdate={onUpdate}
            highlight
            confidence={confidenceScores?.invoice?.invoice_number}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Invoice Date" 
            value={data.invoice.invoice_date} 
            path="invoice.invoice_date"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.invoice?.invoice_date}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Due Date" 
            value={data.invoice.due_date} 
            path="invoice.due_date"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.invoice?.due_date}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Place of Supply" 
            value={data.invoice.place_of_supply} 
            path="invoice.place_of_supply"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.invoice?.place_of_supply}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Payment Terms" 
            value={data.invoice.payment_terms} 
            path="invoice.payment_terms"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.invoice?.payment_terms}
            getConfidenceLevel={getConfidenceLevel}
          />
        </DataCard>
      )}

      {/* Bill To */}
      {data.bill_to && (
        <DataCard title="👤 Bill To" icon="👤">
          <EditableDataRow 
            label="Name" 
            value={data.bill_to.name} 
            path="bill_to.name"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.bill_to?.name}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Address" 
            value={data.bill_to.address} 
            path="bill_to.address"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.bill_to?.address}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="GSTIN" 
            value={data.bill_to.gstin} 
            path="bill_to.gstin"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.bill_to?.gstin}
            getConfidenceLevel={getConfidenceLevel}
          />
          <EditableDataRow 
            label="Phone" 
            value={data.bill_to.phone} 
            path="bill_to.phone"
            isEditing={isEditing}
            onUpdate={onUpdate}
            confidence={confidenceScores?.bill_to?.phone}
            getConfidenceLevel={getConfidenceLevel}
          />
        </DataCard>
      )}

      {/* Line Items */}
      {data.items && data.items.length > 0 && (
        <DataCard title="📋 Line Items" icon="📋">
          {confidenceScores?.items && (
            <div style={{ 
              marginBottom: 16, 
              padding: '8px 16px', 
              background: confidenceScores.items >= 85 ? 'rgba(52, 211, 153, 0.1)' : confidenceScores.items >= 60 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${confidenceScores.items >= 85 ? 'rgba(52, 211, 153, 0.3)' : confidenceScores.items >= 60 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 8,
              display: 'inline-block'
            }}>
              <span style={{ 
                fontSize: 12, 
                fontWeight: 700,
                color: confidenceScores.items >= 85 ? '#34d399' : confidenceScores.items >= 60 ? '#fbbf24' : '#ef4444'
              }}>
                Items Confidence: {confidenceScores.items >= 85 ? 'High' : confidenceScores.items >= 60 ? 'Medium' : 'Low'} ({confidenceScores.items}%)
              </span>
            </div>
          )}
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(171,81,242,.2)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#79758C', fontSize: 12, fontWeight: 700 }}>ITEM</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#79758C', fontSize: 12, fontWeight: 700 }}>HSN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: '#79758C', fontSize: 12, fontWeight: 700 }}>QTY</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#79758C', fontSize: 12, fontWeight: 700 }}>UOM</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: '#79758C', fontSize: 12, fontWeight: 700 }}>RATE</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: '#79758C', fontSize: 12, fontWeight: 700 }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(201,180,224,.3)' }}>
                    <td style={{ padding: '16px', color: '#242226', fontWeight: 600 }}>
                      <div>{item.name}</div>
                      {item.description && item.description !== item.name && (
                        <div style={{ fontSize: 12, color: '#79758C', marginTop: 4 }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#79758C', fontFamily: 'monospace', fontSize: 13 }}>{item.hsn || '-'}</td>
                    <td style={{ padding: '16px', color: '#242226', textAlign: 'right', fontWeight: 600 }}>{item.qty}</td>
                    <td style={{ padding: '16px', color: '#79758C', fontSize: 13 }}>{item.uom || '-'}</td>
                    <td style={{ padding: '16px', color: '#242226', textAlign: 'right', fontWeight: 600 }}>₹{item.rate?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '16px', color: '#34d399', textAlign: 'right', fontWeight: 700, fontSize: 15 }}>₹{item.amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>
      )}

      {/* Tax & Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {data.tax && (
          <DataCard title="💰 Tax Details" icon="💰">
            <EditableDataRow 
              label="CGST" 
              value={`₹${data.tax.cgst?.toLocaleString('en-IN') || 0}`} 
              path="tax.cgst"
              isEditing={false}
              confidence={confidenceScores?.tax}
              getConfidenceLevel={getConfidenceLevel}
            />
            <EditableDataRow 
              label="SGST" 
              value={`₹${data.tax.sgst?.toLocaleString('en-IN') || 0}`} 
              path="tax.sgst"
              isEditing={false}
              confidence={confidenceScores?.tax}
              getConfidenceLevel={getConfidenceLevel}
            />
            <EditableDataRow 
              label="IGST" 
              value={`₹${data.tax.igst?.toLocaleString('en-IN') || 0}`} 
              path="tax.igst"
              isEditing={false}
              confidence={confidenceScores?.tax}
              getConfidenceLevel={getConfidenceLevel}
            />
          </DataCard>
        )}

        {data.totals && (
          <DataCard title="💵 Totals" icon="💵">
            <EditableDataRow 
              label="Sub Total" 
              value={`₹${data.totals.sub_total?.toLocaleString('en-IN') || 0}`} 
              path="totals.sub_total"
              isEditing={false}
              confidence={confidenceScores?.totals?.sub_total}
              getConfidenceLevel={getConfidenceLevel}
            />
            <EditableDataRow 
              label="Tax Total" 
              value={`₹${data.totals.tax_total?.toLocaleString('en-IN') || 0}`} 
              path="totals.tax_total"
              isEditing={false}
              confidence={confidenceScores?.totals?.tax_total}
              getConfidenceLevel={getConfidenceLevel}
            />
            {data.totals.discount > 0 && (
              <EditableDataRow 
                label="Discount" 
                value={`₹${data.totals.discount?.toLocaleString('en-IN')}`} 
                path="totals.discount"
                isEditing={false}
              />
            )}
            <EditableDataRow 
              label="Grand Total" 
              value={`₹${data.totals.grand_total?.toLocaleString('en-IN') || 0}`} 
              path="totals.grand_total"
              isEditing={false}
              highlight 
              large
              confidence={confidenceScores?.totals?.grand_total}
              getConfidenceLevel={getConfidenceLevel}
            />
          </DataCard>
        )}
      </div>

      {/* Bank Details */}
      {data.bank_details && (
        <DataCard title="🏦 Bank Details" icon="🏦">
          <DataRow label="Bank Name" value={data.bank_details.bank_name} />
          <DataRow label="Account Number" value={data.bank_details.account_number} />
          <DataRow label="IFSC Code" value={data.bank_details.ifsc} />
          <DataRow label="Branch" value={data.bank_details.branch} />
        </DataCard>
      )}

      {/* Notes */}
      {data.notes && (
        <DataCard title="📝 Notes" icon="📝">
          <div style={{ color: '#79758C', fontSize: 14, lineHeight: 1.6 }}>
            {data.notes}
          </div>
        </DataCard>
      )}
    </div>
  );
}

function DataCard({ title, icon, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.7)',
      border: '1px solid rgba(171,81,242,.15)',
      borderRadius: 16,
      padding: 28,
      transition: 'all 0.2s'
    }}>
      <div style={{ 
        fontSize: 20, 
        fontWeight: 800, 
        color: '#242226', 
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function EditableDataRow({ label, value, path, isEditing, onUpdate, highlight, large, confidence, getConfidenceLevel }) {
  if (!value && value !== 0 && !isEditing) return null;
  
  const confidenceInfo = confidence ? getConfidenceLevel(confidence) : null;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(201,180,224,.3)',
      gap: 12
    }}>
      <div style={{ 
        fontSize: large ? 16 : 14, 
        color: '#79758C', 
        fontWeight: 600,
        minWidth: 150
      }}>
        {label}
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        {isEditing ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onUpdate(path, e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'rgba(201,180,224,.3)',
              border: '1px solid rgba(171, 81, 242, 0.3)',
              borderRadius: 8,
              color: '#242226',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none'
            }}
          />
        ) : (
          <div style={{ 
            fontSize: large ? 24 : 15, 
            color: highlight ? '#34d399' : '#242226', 
            fontWeight: highlight ? 800 : 600,
            textAlign: 'right',
            flex: 1
          }}>
            {value}
          </div>
        )}
        
        {confidenceInfo && (
          <div style={{
            padding: '4px 12px',
            background: confidenceInfo.bg,
            border: `1px solid ${confidenceInfo.border}`,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            color: confidenceInfo.color,
            whiteSpace: 'nowrap'
          }}>
            {confidenceInfo.label} {confidence}%
          </div>
        )}
      </div>
    </div>
  );
}

function DataRow({ label, value }) {
  if (!value && value !== 0) return null;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(201,180,224,.3)',
      gap: 12
    }}>
      <div style={{ 
        fontSize: 14, 
        color: '#79758C', 
        fontWeight: 600,
        minWidth: 150
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 15, 
        color: '#242226', 
        fontWeight: 600,
        textAlign: 'right',
        flex: 1
      }}>
        {value}
      </div>
    </div>
  );
}

function EvaluationView({ evaluation, data }) {
  if (!evaluation) {
    return (
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 48,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 18, color: '#79758C' }}>
          No evaluation data available
        </div>
      </div>
    );
  }

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.3)', color: '#34d399' };
      case 'B': return { bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.3)', color: '#60a5fa' };
      case 'C': return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' };
      case 'D': return { bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)', color: '#fb923c' };
      default: return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' };
    }
  };

  const gradeStyle = getGradeColor(evaluation.grade);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Overall Score Card */}
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 32,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 32,
        alignItems: 'center'
      }}>
        <div style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: gradeStyle.bg,
          border: `4px solid ${gradeStyle.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4
        }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: gradeStyle.color }}>
            {evaluation.grade}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: gradeStyle.color }}>
            {evaluation.score}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#242226', marginBottom: 16 }}>
            Extraction Quality Report
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10
            }}>
              <div style={{ fontSize: 12, color: '#79758C', marginBottom: 4 }}>Critical Errors</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>
                {evaluation.summary.criticalErrors}
              </div>
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 10
            }}>
              <div style={{ fontSize: 12, color: '#79758C', marginBottom: 4 }}>Warnings</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>
                {evaluation.summary.totalWarnings}
              </div>
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: 10
            }}>
              <div style={{ fontSize: 12, color: '#79758C', marginBottom: 4 }}>Total Issues</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#60a5fa' }}>
                {evaluation.summary.totalIssues}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {evaluation.issues.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,.7)',
          border: '1px solid rgba(171,81,242,.15)',
          borderRadius: 16,
          padding: 28
        }}>
          <div style={{ 
            fontSize: 20, 
            fontWeight: 800, 
            color: '#242226', 
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            Issues & Warnings
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {evaluation.issues.map((issue, idx) => (
              <div key={idx} style={{
                padding: '16px 20px',
                background: issue.type === 'error' 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'rgba(251, 191, 36, 0.1)',
                border: `2px solid ${issue.type === 'error' 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : 'rgba(251, 191, 36, 0.3)'}`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  fontSize: 24,
                  flexShrink: 0
                }}>
                  {issue.type === 'error' ? '❌' : '⚠️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: 15, 
                    fontWeight: 700, 
                    color: issue.type === 'error' ? '#ef4444' : '#fbbf24',
                    marginBottom: 4
                  }}>
                    {issue.field}
                  </div>
                  <div style={{ fontSize: 14, color: '#79758C' }}>
                    {issue.message}
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: issue.type === 'error' 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : 'rgba(251, 191, 36, 0.2)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: issue.type === 'error' ? '#ef4444' : '#fbbf24',
                  flexShrink: 0
                }}>
                  -{issue.impact}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {evaluation.issues.length === 0 && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.1)',
          border: '2px solid rgba(52, 211, 153, 0.3)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginBottom: 8 }}>
            Perfect Extraction!
          </div>
          <div style={{ fontSize: 15, color: '#79758C' }}>
            No issues found. All fields extracted accurately with proper calculations.
          </div>
        </div>
      )}

      {/* Evaluation Criteria */}
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 28
      }}>
        <div style={{ 
          fontSize: 20, 
          fontWeight: 800, 
          color: '#242226', 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 24 }}>📋</span>
          Evaluation Criteria
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <EvalCriteriaRow 
            icon="🧮" 
            title="Tax Calculation Accuracy" 
            description="Validates sub-total, tax total, and grand total calculations"
            weight="High Impact"
          />
          <EvalCriteriaRow 
            icon="📝" 
            title="Critical Fields Completeness" 
            description="Checks for supplier name, invoice number, date, and grand total"
            weight="High Impact"
          />
          <EvalCriteriaRow 
            icon="🎯" 
            title="Confidence Scores" 
            description="Evaluates average confidence and identifies low-confidence fields"
            weight="Medium Impact"
          />
          <EvalCriteriaRow 
            icon="🔧" 
            title="JSON Format Consistency" 
            description="Ensures all required top-level keys are present and properly structured"
            weight="High Impact"
          />
          <EvalCriteriaRow 
            icon="📦" 
            title="Line Items Extraction" 
            description="Verifies that invoice line items are properly extracted"
            weight="Critical"
          />
        </div>
      </div>
    </div>
  );
}

function EvalCriteriaRow({ icon, title, description, weight }) {
  const getWeightColor = (w) => {
    if (w === 'Critical' || w === 'High Impact') return '#ef4444';
    if (w === 'Medium Impact') return '#fbbf24';
    return '#60a5fa';
  };

  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(255,255,255,.02)',
      border: '1px solid rgba(201,180,224,.3)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#242226', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#79758C' }}>
          {description}
        </div>
      </div>
      <div style={{
        padding: '6px 12px',
        background: 'rgba(171, 81, 242, 0.1)',
        border: '1px solid rgba(171, 81, 242, 0.3)',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        color: getWeightColor(weight),
        flexShrink: 0
      }}>
        {weight}
      </div>
    </div>
  );
}

function FraudDetectionBanner({ fraudDetection }) {
  if (!fraudDetection) return null;

  const getRiskStyle = (status, riskLevel) => {
    if (status === 'Duplicate Invoice' || riskLevel === 'critical') {
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.4)',
        color: '#ef4444',
        icon: '🚨'
      };
    }
    if (status === 'Possible Duplicate' || riskLevel === 'high') {
      return {
        bg: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.4)',
        color: '#fbbf24',
        icon: '⚠️'
      };
    }
    if (status === 'Suspicious Pattern' || riskLevel === 'medium') {
      return {
        bg: 'rgba(251, 146, 60, 0.1)',
        border: 'rgba(251, 146, 60, 0.4)',
        color: '#fb923c',
        icon: '🔍'
      };
    }
    return {
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.3)',
      color: '#34d399',
      icon: '✅'
    };
  };

  const style = getRiskStyle(fraudDetection.fraud_status, fraudDetection.risk_level);

  return (
    <div style={{
      padding: '20px 24px',
      background: style.bg,
      border: `2px solid ${style.border}`,
      borderRadius: 16,
      marginBottom: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <span style={{ fontSize: 36, flexShrink: 0 }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 800, 
            color: style.color, 
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            {fraudDetection.fraud_status}
            {fraudDetection.confidence && (
              <span style={{
                padding: '4px 12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700
              }}>
                {fraudDetection.confidence}% confidence
              </span>
            )}
          </div>
          
          <div style={{ fontSize: 14, color: '#242226', marginBottom: 12, lineHeight: 1.6 }}>
            {fraudDetection.reason}
          </div>

          {fraudDetection.action_required && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 10,
              fontSize: 13,
              color: '#242226',
              marginBottom: 12
            }}>
              <strong style={{ color: style.color }}>Action Required:</strong> {fraudDetection.action_required}
            </div>
          )}

          {fraudDetection.matched_invoice && (
            <div style={{
              padding: '16px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 12,
              marginTop: 12
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#79758C', marginBottom: 8 }}>
                Matched Invoice Details:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Supplier</div>
                  <div style={{ fontSize: 14, color: '#242226', fontWeight: 600 }}>
                    {fraudDetection.matched_invoice.supplier}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Invoice Number</div>
                  <div style={{ fontSize: 14, color: '#242226', fontWeight: 600, fontFamily: 'monospace' }}>
                    {fraudDetection.matched_invoice.invoice_number}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 14, color: '#242226', fontWeight: 600 }}>
                    {fraudDetection.matched_invoice.date}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Amount</div>
                  <div style={{ fontSize: 14, color: '#242226', fontWeight: 600 }}>
                    ₹{fraudDetection.matched_invoice.amount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              {fraudDetection.matched_invoice.uploaded_at && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#79758C' }}>
                  Previously uploaded: {new Date(fraudDetection.matched_invoice.uploaded_at).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {fraudDetection.all_matches && fraudDetection.all_matches.length > 1 && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#79758C' }}>
              + {fraudDetection.all_matches.length - 1} more similar invoice(s) found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnomalyDetectionBanner({ anomalyDetection }) {
  if (!anomalyDetection) return null;

  const getRiskStyle = (status, riskLevel) => {
    if (status === 'High Risk Expense' || riskLevel === 'critical') {
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.4)',
        color: '#ef4444',
        icon: '🚨'
      };
    }
    if (status === 'Unusual Expense' || riskLevel === 'high') {
      return {
        bg: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.4)',
        color: '#fbbf24',
        icon: '⚠️'
      };
    }
    if (status === 'Elevated Expense' || status === 'Unusually Low' || riskLevel === 'medium') {
      return {
        bg: 'rgba(96, 165, 250, 0.1)',
        border: 'rgba(96, 165, 250, 0.4)',
        color: '#60a5fa',
        icon: '📊'
      };
    }
    if (status === 'First Invoice' || status === 'Insufficient Data') {
      return {
        bg: 'rgba(168, 85, 247, 0.1)',
        border: 'rgba(168, 85, 247, 0.3)',
        color: '#a855f7',
        icon: 'ℹ️'
      };
    }
    return {
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.3)',
      color: '#34d399',
      icon: '✅'
    };
  };

  const style = getRiskStyle(anomalyDetection.status, anomalyDetection.risk_level);

  return (
    <div style={{
      padding: '20px 24px',
      background: style.bg,
      border: `2px solid ${style.border}`,
      borderRadius: 16,
      marginBottom: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <span style={{ fontSize: 36, flexShrink: 0 }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 800, 
            color: style.color, 
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            {anomalyDetection.status}
            {anomalyDetection.analysis && (
              <span style={{
                padding: '4px 12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700
              }}>
                {anomalyDetection.analysis.ratio_to_average}x average
              </span>
            )}
          </div>
          
          <div style={{ 
            fontSize: 15, 
            color: '#242226', 
            marginBottom: 12, 
            fontWeight: 600,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
            display: 'inline-block'
          }}>
            {anomalyDetection.alert_message}
          </div>

          <div style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 16, lineHeight: 1.6 }}>
            {anomalyDetection.reason}
          </div>

          {/* Statistics Card */}
          {anomalyDetection.statistics && (
            <div style={{
              padding: '16px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 12,
              marginTop: 12
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 700, 
                color: '#79758C', 
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 18 }}>📈</span>
                Historical Spending Analysis for {anomalyDetection.statistics.supplier}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Current Amount</div>
                  <div style={{ fontSize: 16, color: style.color, fontWeight: 800 }}>
                    ₹{anomalyDetection.current_amount?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Average Amount</div>
                  <div style={{ fontSize: 16, color: '#242226', fontWeight: 700 }}>
                    ₹{anomalyDetection.statistics.average_amount?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Typical Range</div>
                  <div style={{ fontSize: 14, color: '#242226', fontWeight: 600 }}>
                    ₹{anomalyDetection.statistics.typical_range.lower?.toLocaleString('en-IN')} - 
                    ₹{anomalyDetection.statistics.typical_range.upper?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Historical Invoices</div>
                  <div style={{ fontSize: 16, color: '#242226', fontWeight: 700 }}>
                    {anomalyDetection.statistics.historical_count}
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              {anomalyDetection.analysis && (
                <div style={{ 
                  marginTop: 12, 
                  paddingTop: 12, 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Difference</div>
                    <div style={{ 
                      fontSize: 14, 
                      color: anomalyDetection.analysis.percentage_difference > 0 ? '#ef4444' : '#34d399',
                      fontWeight: 700 
                    }}>
                      {anomalyDetection.analysis.percentage_difference > 0 ? '+' : ''}
                      {anomalyDetection.analysis.percentage_difference}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Deviation</div>
                    <div style={{ fontSize: 14, color: '#242226', fontWeight: 700 }}>
                      ₹{anomalyDetection.analysis.deviation_amount?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#79758C', marginBottom: 4 }}>Z-Score</div>
                    <div style={{ fontSize: 14, color: '#242226', fontWeight: 700 }}>
                      {anomalyDetection.analysis.z_score}σ
                    </div>
                  </div>
                </div>
              )}

              {/* Min/Max Range */}
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: 12,
                color: '#79758C'
              }}>
                Historical range: ₹{anomalyDetection.statistics.min_amount?.toLocaleString('en-IN')} (min) 
                to ₹{anomalyDetection.statistics.max_amount?.toLocaleString('en-IN')} (max)
              </div>
            </div>
          )}

          {/* Recommendations */}
          {(anomalyDetection.status === 'High Risk Expense' || anomalyDetection.status === 'Unusual Expense') && (
            <div style={{
              marginTop: 12,
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              fontSize: 13,
              color: '#242226'
            }}>
              <strong style={{ color: '#ef4444' }}>⚠️ Recommended Actions:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                <li>Verify invoice details with supplier</li>
                <li>Check for additional line items or bulk orders</li>
                <li>Confirm pricing and quantities are correct</li>
                <li>Obtain approval from finance team before processing</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
