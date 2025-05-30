import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDatabaseName } from '../utils/formatters';

const TableDataViewer = ({ tableName, onBack }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({});
  const pageSize = 50;

  useEffect(() => {
    fetchTableSchema();
    fetchTableData();
  }, [tableName, currentPage]);

  useEffect(() => {
    // Apply filters whenever data or filters change
    applyFilters();
  }, [data, filters]);

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
    } catch (error) {
      console.error('Error fetching table schema:', error);
    }
  };

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/tables/${tableName}/data`, {
        params: {
          limit: pageSize,
          offset: currentPage * pageSize
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

  const applyFilters = () => {
    let filtered = [...data];
    
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => {
          const cellValue = row[column];
          if (cellValue === null || cellValue === undefined) return false;
          
          // Convert to string for comparison
          const cellStr = String(cellValue).toLowerCase();
          const filterStr = filterValue.toLowerCase();
          
          // Use includes for partial matching
          return cellStr.includes(filterStr);
        });
      }
    });
    
    setFilteredData(filtered);
  };

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
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
          <span className="record-count">{filteredData.length}</span>
          <span> records shown (of {totalRecords} total)</span>
        </div>
        <div>Page {currentPage + 1} of {totalPages}</div>
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
                    value={filters[column.column_name] || ''}
                    onChange={(e) => handleFilterChange(column.column_name, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {schema.map((column) => (
                  <td key={column.column_name}>
                    {row[column.column_name] !== null ? String(row[column.column_name]) : ''}
                  </td>
                ))}
              </tr>
            ))}
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
        <span>Page {currentPage + 1} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableDataViewer;