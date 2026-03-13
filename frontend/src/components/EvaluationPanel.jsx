import { getGradeColor } from '../utils/validation';

export default function EvaluationPanel({ validation, onClose }) {
  if (!validation) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20,
      animation: 'fadeIn 0.3s ease'
    }}
    onClick={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'linear-gradient(135deg, rgba(248, 242, 254, 0.95), rgba(30, 30, 50, 0.95))',
          border: '2px solid rgba(171, 81, 242, 0.5)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(171, 81, 242, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(171, 81, 242, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(171, 81, 242, 0.1)'
        }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#242226', marginBottom: 4 }}>
              📊 Extraction Evaluation
            </h3>
            <p style={{ fontSize: 13, color: '#79758C' }}>
              Quality assessment and validation report
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              background: 'rgba(171, 81, 242, 0.2)',
              border: 'none',
              borderRadius: 10,
              color: '#79758C',
              fontSize: 24,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(171, 81, 242, 0.2)'}>
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Score Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(171, 81, 242, 0.2), rgba(201, 180, 224, 0.1))',
            border: '2px solid rgba(171, 81, 242, 0.4)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, color: '#79758C', marginBottom: 8, fontWeight: 600, letterSpacing: '0.1em' }}>
              ACCURACY SCORE
            </div>
            <div style={{
              fontSize: 72,
              fontWeight: 900,
              background: `linear-gradient(135deg, ${getGradeColor(validation.grade)}, #C9B4E0)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 8
            }}>
              {validation.score}%
            </div>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: getGradeColor(validation.grade) + '20',
              border: `2px solid ${getGradeColor(validation.grade)}`,
              borderRadius: 20,
              color: getGradeColor(validation.grade),
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              GRADE: {validation.grade}
            </div>
          </div>

          {/* Status */}
          <div style={{
            background: validation.isValid ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${validation.isValid ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ fontSize: 32 }}>
              {validation.isValid ? '✅' : '⚠️'}
            </div>
            <div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: validation.isValid ? '#34d399' : '#ef4444',
                marginBottom: 4
              }}>
                {validation.isValid ? 'Validation Passed' : 'Validation Issues Found'}
              </div>
              <div style={{ fontSize: 13, color: '#79758C' }}>
                {validation.isValid 
                  ? 'All required fields extracted successfully'
                  : `${validation.errors.length} error(s), ${validation.warnings.length} warning(s)`
                }
              </div>
            </div>
          </div>

          {/* Errors */}
          {validation.errors.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#ef4444',
                marginBottom: 8,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                ❌ Errors ({validation.errors.length})
              </div>
              {validation.errors.map((error, i) => (
                <div key={i} style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 8,
                  fontSize: 13,
                  color: '#fca5a5',
                  fontFamily: 'monospace'
                }}>
                  • {error}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#fbbf24',
                marginBottom: 8,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                ⚠️ Warnings ({validation.warnings.length})
              </div>
              {validation.warnings.map((warning, i) => (
                <div key={i} style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 8,
                  fontSize: 13,
                  color: '#fcd34d',
                  fontFamily: 'monospace'
                }}>
                  • {warning}
                </div>
              ))}
            </div>
          )}

          {/* Quality Metrics */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(171, 81, 242, 0.2)',
            borderRadius: 12,
            padding: 16
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#C9B4E0',
              marginBottom: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              📈 Quality Metrics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['JSON Format', validation.isValid ? 'Clean ✓' : 'Issues ✗'],
                ['Key Consistency', validation.warnings.some(w => w.includes('structure')) ? 'Inconsistent' : 'Consistent ✓'],
                ['Data Completeness', `${validation.score >= 80 ? 'High' : validation.score >= 60 ? 'Medium' : 'Low'}`],
                ['Error Handling', validation.errors.length === 0 ? 'Passed ✓' : 'Failed ✗']
              ].map(([label, value]) => (
                <div key={label} style={{
                  background: 'rgba(201, 180, 224, 0.3)',
                  borderRadius: 8,
                  padding: 12
                }}>
                  <div style={{ fontSize: 10, color: '#79758C', marginBottom: 4, fontWeight: 600 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: '#242226', fontWeight: 700 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(171, 81, 242, 0.2)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
