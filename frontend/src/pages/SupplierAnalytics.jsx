import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SupplierAnalytics({ invoices }) {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      processAnalytics();
    }
  }, [invoices]);

  const processAnalytics = () => {
    // Monthly upload trend (last 6 months)
    const months = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[monthKey] = { month: monthKey, count: 0, amount: 0 };
    }

    invoices.forEach(invoice => {
      const date = new Date(invoice.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (months[monthKey]) {
        months[monthKey].count += 1;
        const amount = invoice.extractedData?.totals?.grand_total || 
                      invoice.extractedData?.grandTotal || 
                      invoice.extractedData?.grand_total || 0;
        months[monthKey].amount += typeof amount === 'string' 
          ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0
          : amount;
      }
    });

    setMonthlyData(Object.values(months));

    // Confidence score distribution
    const confidenceBuckets = {
      'Excellent (90-100%)': 0,
      'Good (70-89%)': 0,
      'Fair (50-69%)': 0,
      'Poor (<50%)': 0
    };

    invoices.forEach(invoice => {
      if (invoice.confidenceScores) {
        const scores = Object.values(invoice.confidenceScores).flat();
        let totalScore = 0;
        let count = 0;

        scores.forEach(score => {
          if (typeof score === 'number') {
            totalScore += score;
            count++;
          } else if (typeof score === 'object') {
            Object.values(score).forEach(s => {
              if (typeof s === 'number') {
                totalScore += s;
                count++;
              }
            });
          }
        });

        const avgScore = count > 0 ? totalScore / count : 0;
        
        if (avgScore >= 90) confidenceBuckets['Excellent (90-100%)']++;
        else if (avgScore >= 70) confidenceBuckets['Good (70-89%)']++;
        else if (avgScore >= 50) confidenceBuckets['Fair (50-69%)']++;
        else confidenceBuckets['Poor (<50%)']++;
      }
    });

    setConfidenceData(
      Object.entries(confidenceBuckets).map(([name, value]) => ({ name, value }))
    );
  };

  const COLORS = ['#34d399', '#AB51F2', '#fbbf24', '#ef4444'];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Monthly Upload Trend */}
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 32
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#242226', marginBottom: 24 }}>
          📈 Monthly Upload Trend
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#79758C" style={{ fontSize: 12 }} />
            <YAxis stroke="#79758C" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(248, 242, 254, 0.95)',
                border: '1px solid rgba(171, 81, 242, 0.3)',
                borderRadius: 10,
                color: '#242226'
              }}
            />
            <Legend wrapperStyle={{ color: '#79758C' }} />
            <Line type="monotone" dataKey="count" stroke="#AB51F2" strokeWidth={3} name="Invoices" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Amount Trend */}
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 32
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#242226', marginBottom: 24 }}>
          💰 Monthly Invoice Value
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#79758C" style={{ fontSize: 12 }} />
            <YAxis stroke="#79758C" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(248, 242, 254, 0.95)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: 10,
                color: '#242226'
              }}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Legend wrapperStyle={{ color: '#79758C' }} />
            <Bar dataKey="amount" fill="#34d399" name="Total Amount (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Score Distribution */}
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 32
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#242226', marginBottom: 24 }}>
          🎯 Data Quality Distribution
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={confidenceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {confidenceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(248, 242, 254, 0.95)',
                border: '1px solid rgba(171, 81, 242, 0.3)',
                borderRadius: 10,
                color: '#242226'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Location Map Placeholder */}
      <div style={{
        background: 'rgba(255,255,255,.7)',
        border: '1px solid rgba(171,81,242,.15)',
        borderRadius: 16,
        padding: 32
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#242226', marginBottom: 24 }}>
          🗺️ Delivery Locations
        </div>
        <div style={{
          height: 400,
          background: 'rgba(255,255,255,.02)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          border: '1px solid rgba(201,180,224,.3)'
        }}>
          <div style={{ fontSize: 48 }}>🗺️</div>
          <div style={{ fontSize: 16, color: '#79758C', fontWeight: 600 }}>
            Interactive Map View
          </div>
          <div style={{ fontSize: 13, color: '#79758C', textAlign: 'center', maxWidth: 400 }}>
            Map visualization showing delivery locations from invoice addresses will be displayed here.
            Requires Google Maps API or Mapbox integration.
          </div>
        </div>
      </div>
    </div>
  );
}
