import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDatabaseName } from '../utils/formatters';
import useDebounce from '../hooks/useDebounce';

const TableDataViewer = ({ tableName, onBack }) => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({});
  const [filterInputs, setFilterInputs] = useState({});
  
  // Debounce filter inputs by 500ms
  const debouncedFilters = useDebounce(filterInputs, 500);
  
  const pageSize = 50;

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
      const response = await axios.get(`http://localhost:5000/api/tables/${tableName}/schema`);
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
      
      const response = await axios.get(`http://localhost:5000/api/tables/${tableName}/data`, {
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

  const totalPages = Math.ceil(totalRecords / pageSize);

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="table-data-viewer">
      <div className="header">
        <button onClick={onBack}>← Back to Tables</button>
        <h2>{formatDatabaseName(tableName)}</h2>
      </div>

      <div className="table-info">
        <div>
          <span className="record-count">{totalRecords}</span>
          <span> records found</span>
        </div>
        <div>Page {currentPage + 1} of {totalPages || 1}</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {schema.map((column) => (
                <th key={column.column_name}>{formatDatabaseName(column.column_name)}</th>
              ))}
            </tr>
            <tr className="filter-row">
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
                {schema.map((column) => (
                  <td key={column.column_name}>
                    {row[column.column_name] !== null ? String(row[column.column_name]) : ''}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={schema.length} style={{ textAlign: 'center', padding: '20px' }}>
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
    </div>
  );
};

export default TableDataViewer;