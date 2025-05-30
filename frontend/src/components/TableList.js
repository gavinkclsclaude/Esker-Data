import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDatabaseName } from '../utils/formatters';
import { API_URL } from '../config';

const TableList = ({ onSelectTable }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      console.log('Fetching tables from API...');
      const response = await axios.get(`${API_URL}/tables`);
      console.log('API Response:', response.data);
      setTables(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tables:', error);
      console.error('Error details:', error.response || error.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading tables...</div>;

  console.log('Rendering TableList with tables:', tables);
  console.log('Tables length:', tables.length);

  return (
    <div className="table-list">
      <h2>Available Tables in Esker Schema</h2>
      {tables.length === 0 && <p>No tables found. Check console for errors.</p>}
      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.table_name}
            className="table-card"
            onClick={() => onSelectTable(table.table_name)}
          >
            <h3>{formatDatabaseName(table.table_name)}</h3>
            <p>Click to view data</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableList;