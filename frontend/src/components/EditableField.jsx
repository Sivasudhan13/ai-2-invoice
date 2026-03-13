import { useState } from 'react';
import { getConfidenceColor, getConfidenceIcon } from '../utils/confidenceScore';

export default function EditableField({ label, value, onChange, confidence = 'High', type = 'text' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!value && value !== 0) return null;

  return (
    <div style={{ marginBottom: 12, position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 4
      }}>
        <div style={{ 
          fontSize: 9, 
          fontWeight: 700, 
          letterSpacing: '0.12em', 
          color: '#79758C', 
          textTransform: 'uppercase', 
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {label}
          <span style={{ 
            fontSize: 10,
            color: getConfidenceColor(confidence),
            fontWeight: 800
          }}>
            {getConfidenceIcon(confidence)} {confidence}
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '4px 8px',
              background: 'rgba(171, 81, 242, 0.1)',
              border: '1px solid rgba(171, 81, 242, 0.3)',
              borderRadius: 4,
              color: '#AB51F2',
              fontSize: 10,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ✏️ Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div>
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid #AB51F2',
              borderRadius: 6,
              fontSize: 13,
              color: '#0f172a',
              outline: 'none',
              marginBottom: 6
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '6px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✓ Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 4,
                color: '#ef4444',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✗ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ 
          fontSize: 13, 
          color: '#0f172a', 
          lineHeight: 1.5,
          padding: '8px 10px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 6,
          border: `1px solid ${getConfidenceColor(confidence)}20`
        }}>
          {String(value)}
        </div>
      )}
    </div>
  );
}
