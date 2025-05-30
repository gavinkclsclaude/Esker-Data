import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDatabaseName } from '../utils/formatters';
import useDebounce from '../hooks/useDebounce';
import { API_URL } from '../config';
import RowDetailModal from './RowDetailModal';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';

const TableDataViewer = ({ tableName, onBack }) => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({});
  const [filterInputs, setFilterInputs] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Debounce filter inputs by 1000ms (1 second)
  const debouncedFilters = useDebounce(filterInputs, 1000);
  
  const pageSize = 30;

  useEffect(() => {
    fetchTableSchema();
  }, [tableName]);

  useEffect(() => {
    // Update actual filters when debounced values change
    setFilters(debouncedFilters);
  }, [debouncedFilters]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(0);
  }, [filters]);

  useEffect(() => {
    fetchTableData();
  }, [tableName, currentPage, filters]);

  const fetchTableSchema = async () => {
    try {
      const response = await axios.get(`${API_URL}/tables/${tableName}/schema`);
      setSchema(response.data);
      // Initialize filters for each column
      const initialFilters = {};
      response.data.forEach(column => {
        initialFilters[column.column_name] = '';
      });
      setFilters(initialFilters);
      setFilterInputs(initialFilters);
    } catch (error) {
      console.error('Error fetching table schema:', error);
    }
  };

  const fetchTableData = async () => {
    try {
      setLoading(true);
      
      // Build filter params - only include non-empty filters
      const activeFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          activeFilters[key] = value;
        }
      });
      
      const response = await axios.get(`${API_URL}/tables/${tableName}/data`, {
        params: {
          limit: pageSize,
          offset: currentPage * pageSize,
          filters: JSON.stringify(activeFilters)
        }
      });
      
      setData(response.data.data);
      setTotalRecords(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterInputs(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    schema.forEach(column => {
      clearedFilters[column.column_name] = '';
    });
    setFilterInputs(clearedFilters);
    setFilters(clearedFilters);
  };

  const handleExport = async (format) => {
    try {
      // Show loading or disable buttons
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Fetch all data with current filters
      const response = await axios.get(`${API_URL}/tables/${tableName}/export`, {
        params: {
          filters: JSON.stringify(activeFilters)
        }
      });

      const exportData = response.data.data;
      const filename = `${tableName}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        exportToCSV(exportData, schema, filename);
      } else if (format === 'excel') {
        exportToExcel(exportData, schema, filename);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="table-data-viewer">
      <div className="header">
        <button onClick={onBack}>← Back to Tables</button>
        <h2>{formatDatabaseName(tableName)}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleExport('csv')} 
            style={{ background: '#2e7d32', color: 'white', border: 'none' }}
            title="Export to CSV"
          >
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('excel')} 
            style={{ background: '#1976d2', color: 'white', border: 'none' }}
            title="Export to Excel"
          >
            Export Excel
          </button>
          <button onClick={clearAllFilters} className="clear-filters-btn">Clear Filters</button>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-info">
          <div>
            <span className="record-count">{totalRecords}</span>
            <span> records found</span>
          </div>
        </div>
        <div className="pagination top-pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span>Page {currentPage + 1} of {totalPages || 1}</span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Actions</th>
              {schema.map((column) => (
                <th key={column.column_name}>{formatDatabaseName(column.column_name)}</th>
              ))}
            </tr>
            <tr className="filter-row">
              <th></th>
              {schema.map((column) => (
                <th key={`filter-${column.column_name}`}>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Filter..."
                    value={filterInputs[column.column_name] || ''}
                    onChange={(e) => handleFilterChange(column.column_name, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>
                  <button
                    className="detail-btn"
                    onClick={() => setSelectedRow(row)}
                    title="View details"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
                {schema.map((column) => (
                  <td key={column.column_name}>
                    {row[column.column_name] !== null ? String(row[column.column_name]) : ''}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={schema.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span>Page {currentPage + 1} of {totalPages || 1}</span>
        <button 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
        >
          Next
        </button>
      </div>
      
      {selectedRow && (
        <RowDetailModal
          row={selectedRow}
          columns={schema}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
};

export default TableDataViewer;