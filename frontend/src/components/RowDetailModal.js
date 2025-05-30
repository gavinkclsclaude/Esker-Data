import React from 'react';
import { formatDatabaseName } from '../utils/formatters';

const RowDetailModal = ({ row, columns, onClose }) => {
  if (!row) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Row Details</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {columns.map((column) => (
            <div key={column.column_name} className="detail-field">
              <div className="detail-label">{formatDatabaseName(column.column_name)}</div>
              <div className="detail-value">
                {row[column.column_name] !== null && row[column.column_name] !== undefined
                  ? String(row[column.column_name])
                  : <span style={{ color: '#999', fontStyle: 'italic' }}>null</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RowDetailModal;