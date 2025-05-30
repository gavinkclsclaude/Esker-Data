import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDatabaseName } from '../utils/formatters';

const TableDataViewer = ({ tableName, onBack }) => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const pageSize = 50;

  useEffect(() => {
    fetchTableSchema();
    fetchTableData();
  }, [tableName, currentPage]);

  const fetchTableSchema = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tables/${tableName}/schema`);
      setSchema(response.data);
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

  const handleEdit = (row) => {
    setEditingRow({ ...row });
  };

  const handleSave = async () => {
    try {
      const primaryKey = Object.keys(editingRow)[0]; // Assume first column is primary key
      const id = editingRow[primaryKey];
      await axios.put(`http://localhost:5000/api/tables/${tableName}/data/${id}`, editingRow);
      setEditingRow(null);
      fetchTableData();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const primaryKey = Object.keys(row)[0]; // Assume first column is primary key
        const id = row[primaryKey];
        await axios.delete(`http://localhost:5000/api/tables/${tableName}/data/${id}`);
        fetchTableData();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`http://localhost:5000/api/tables/${tableName}/data`, newRow);
      setNewRow({});
      setShowAddForm(false);
      fetchTableData();
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add record');
    }
  };

  const handleInputChange = (columnName, value, isNewRow = false) => {
    if (isNewRow) {
      setNewRow({ ...newRow, [columnName]: value });
    } else {
      setEditingRow({ ...editingRow, [columnName]: value });
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="table-data-viewer">
      <div className="header">
        <button onClick={onBack}>← Back to Tables</button>
        <h2>{formatDatabaseName(tableName)}</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Record'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Add New Record</h3>
          <div className="form-grid">
            {schema.map((column) => (
              <div key={column.column_name} className="form-field">
                <label>{formatDatabaseName(column.column_name)}</label>
                <input
                  type="text"
                  value={newRow[column.column_name] || ''}
                  onChange={(e) => handleInputChange(column.column_name, e.target.value, true)}
                  placeholder={`${column.data_type}${column.is_nullable === 'NO' ? ' (required)' : ''}`}
                />
              </div>
            ))}
          </div>
          <button onClick={handleAdd}>Save New Record</button>
        </div>
      )}

      <div className="table-info">
        <div>
          <span className="record-count">{totalRecords}</span>
          <span> records found</span>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {schema.map((column) => (
                  <td key={column.column_name}>
                    {editingRow && editingRow === row ? (
                      <input
                        type="text"
                        value={editingRow[column.column_name] || ''}
                        onChange={(e) => handleInputChange(column.column_name, e.target.value)}
                      />
                    ) : (
                      <span>{row[column.column_name]}</span>
                    )}
                  </td>
                ))}
                <td>
                  {editingRow === row ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <button onClick={() => setEditingRow(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(row)}>Edit</button>
                      <button onClick={() => handleDelete(row)}>Delete</button>
                    </>
                  )}
                </td>
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