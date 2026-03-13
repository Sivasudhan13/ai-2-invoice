export default function VendorAnalysisPanel({ vendorAnalysis }) {
  if (!vendorAnalysis || vendorAnalysis.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 14,
        padding: 24,
        textAlign: 'center',
        color: '#79758C'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>No vendor data available</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,.7)',
      border: '1px solid rgba(171,81,242,.15)',
      borderRadius: 14,
      padding: 24
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#242226' }}>
        🔍 Vendor Invoice Analysis
      </div>
      <div style={{ fontSize: 13, color: '#79758C', marginBottom: 20 }}>
        Unusual invoice patterns detected based on historical data
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {vendorAnalysis.map((vendor, idx) => (
          <div
            key={idx}
            style={{
              background: vendor.riskLevel === 'high' 
                ? 'rgba(239, 68, 68, 0.05)' 
                : vendor.riskLevel === 'medium' 
                ? 'rgba(251, 191, 36, 0.05)' 
                : 'rgba(52, 211, 153, 0.05)',
              border: `2px solid ${
                vendor.riskLevel === 'high' 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : vendor.riskLevel === 'medium' 
                  ? 'rgba(251, 191, 36, 0.3)' 
                  : 'rgba(52, 211, 153, 0.3)'
              }`,
              borderRadius: 12,
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#242226', marginBottom: 4 }}>
                  {vendor.vendorName}
                </div>
                <div style={{ fontSize: 12, color: '#79758C', fontFamily: 'monospace' }}>
                  {vendor.totalInvoices} invoices • ₹{vendor.avgAmount.toLocaleString('en-IN')} avg
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                background: vendor.riskLevel === 'high' 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : vendor.riskLevel === 'medium' 
                  ? 'rgba(251, 191, 36, 0.2)' 
                  : 'rgba(52, 211, 153, 0.2)',
                border: `1px solid ${
                  vendor.riskLevel === 'high' 
                    ? 'rgba(239, 68, 68, 0.4)' 
                    : vendor.riskLevel === 'medium' 
                    ? 'rgba(251, 191, 36, 0.4)' 
                    : 'rgba(52, 211, 153, 0.4)'
                }`,
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: vendor.riskLevel === 'high' 
                  ? '#ef4444' 
                  : vendor.riskLevel === 'medium' 
                  ? '#fbbf24' 
                  : '#10b981'
              }}>
                {vendor.riskLevel} Risk
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#79758C', marginBottom: 2 }}>MIN</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#242226' }}>
                  ₹{vendor.minAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#79758C', marginBottom: 2 }}>MAX</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#242226' }}>
                  ₹{vendor.maxAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#79758C', marginBottom: 2 }}>FREQUENCY</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#242226' }}>
                  {vendor.invoicesPerMonth}/month
                </div>
              </div>
            </div>

            {vendor.unusualCount > 0 && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(171, 81, 242, 0.1)',
                border: '1px solid rgba(171, 81, 242, 0.2)',
                borderRadius: 8,
                fontSize: 12,
                color: '#AB51F2'
              }}>
                ⚠️ {vendor.unusualCount} unusual invoice{vendor.unusualCount > 1 ? 's' : ''} detected
                {vendor.unusualInvoices.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#79758C' }}>
                    Latest: ₹{vendor.unusualInvoices[0].amount.toLocaleString('en-IN')} 
                    ({vendor.unusualInvoices[0].deviationPercent}% above average)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
