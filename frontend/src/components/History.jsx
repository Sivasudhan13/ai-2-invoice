import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [historyDocs, setHistoryDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryDocs(res.data);
    } catch (err) {
      setError('Failed to fetch invoice history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevents opening the modal when clicking delete
    if (!window.confirm('Are you sure you want to delete this invoice record?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally show a success toast here
      fetchHistory(); // Refresh the list
      if (selectedDoc && selectedDoc._id === id) {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete history record.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Archives...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="glass p-8 rounded-2xl border border-red-500/30 text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <div className="text-slate-200 font-medium">{error}</div>
        <button onClick={fetchHistory} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-mono text-xs uppercase tracking-widest">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="text-indigo-400">❖</span> Document Archive
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono tracking-wider">
            {historyDocs.length} PREVIOUSLY EXTRACTED {historyDocs.length === 1 ? 'INVOICE' : 'INVOICES'}
          </p>
        </div>
      </div>

      {historyDocs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border-dashed border-2 border-white/10 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-6xl mb-4 opacity-50 grayscale">📭</div>
          <p className="text-slate-400 font-medium text-lg">Your archive is empty.</p>
          <p className="text-slate-500 text-sm mt-2">Process an invoice on the dashboard to see it here.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold uppercase tracking-widest text-xs transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {historyDocs.map((doc) => (
            <div 
              key={doc._id} 
              className={`group glass rounded-2xl p-5 cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.4)] relative overflow-hidden ${selectedDoc?._id === doc._id ? 'ring-2 ring-indigo-500 bg-white/10' : ''}`}
              onClick={() => setSelectedDoc(doc)}
            >
              {/* Highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                  📄
                </div>
                <button 
                  onClick={(e) => handleDelete(e, doc._id)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20 border border-slate-700/50 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Record"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>

              <h3 className="font-bold text-slate-200 truncate pr-2 text-lg" title={doc.originalFilename}>
                {doc.originalFilename}
              </h3>
              
              <div className="flex items-center gap-2 mt-3 text-xs font-mono text-slate-500 bg-slate-950/50 py-1.5 px-3 rounded-lg w-fit">
                <span>📅</span>
                {new Date(doc.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>

              <div className="mt-auto pt-5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                  View Data <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                {doc.extractedData?.grand_total && (
                  <span className="text-sm font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    {doc.extractedData.currency || '₹'}{doc.extractedData.grand_total.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail View */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
          <div className="absolute inset-0 bg-[#0f0f23]/80 backdrop-blur-sm" onClick={() => setSelectedDoc(null)}></div>
          
          <div className="relative w-full max-w-6xl glass border border-indigo-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">📄</div>
                <div>
                  <h3 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md" title={selectedDoc.originalFilename}>
                    {selectedDoc.originalFilename}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Processed: {new Date(selectedDoc.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleDelete(e, selectedDoc._id)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden bg-[#0f0f23]">
              
              {/* Left side: Original Image/PDF */}
              <div className="lg:w-1/2 p-6 flex items-center justify-center bg-black/40 border-r border-white/10 overflow-auto relative group">
                {selectedDoc.fileUrl ? (
                  selectedDoc.fileUrl.endsWith('.pdf') ? (
                    <iframe 
                      src={`http://localhost:5000${selectedDoc.fileUrl}`} 
                      className="w-full h-full min-h-[500px] border border-white/5 rounded-xl bg-white"
                      title={selectedDoc.originalFilename}
                    />
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                      <img 
                        src={`http://localhost:5000${selectedDoc.fileUrl}`} 
                        alt={selectedDoc.originalFilename} 
                        className="max-w-full max-h-[70vh] object-contain" 
                      />
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-30">❌</div>
                    <p className="text-slate-500 font-medium">Source file unavailable</p>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  Source Document
                </div>
              </div>

              {/* Right side: JSON Data */}
              <div className="lg:w-1/2 flex flex-col">
                <div className="bg-slate-900/80 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Extracted JSON Node
                  </h4>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedDoc.extractedData, null, 2));
                      // Could add a toast here
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    ⎘ Copy JSON
                  </button>
                </div>
                <div className="p-6 overflow-auto flex-1 custom-scrollbar bg-[#0a0a1a]">
                   <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                     {JSON.stringify(selectedDoc.extractedData, null, 2).split('\n').map((line, i) => {
                       const isKey = /^\s*"[^"]+":/.test(line);
                       const isString = /:\s*"[^"]*"/.test(line);
                       const isNum = /:\s*[\d.]+/.test(line);
                       let color = 'text-slate-300';
                       if (isKey) color = 'text-indigo-300 font-semibold';
                       else if (isString) color = 'text-emerald-300';
                       else if (isNum) color = 'text-amber-300';
                       
                       return (
                         <span key={i} className={`block ${color}`}>
                           {line}
                         </span>
                       );
                     })}
                   </pre>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
