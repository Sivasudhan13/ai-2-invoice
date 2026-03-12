import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartTest = () => {
  // Sample data for testing
  const data = [
    { name: 'Day 1', value: 10 },
    { name: 'Day 2', value: 15 },
    { name: 'Day 3', value: 12 },
    { name: 'Day 4', value: 20 },
    { name: 'Day 5', value: 18 },
  ];

  return (
    <div style={{ width: '100%', height: 300, background: '#0f0f23', padding: '20px' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Chart Library Test - Recharts</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#6c63ff" 
            strokeWidth={2}
            dot={{ fill: '#6c63ff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartTest;
