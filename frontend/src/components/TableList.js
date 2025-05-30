import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDatabaseName } from '../utils/formatters';

const TableList = ({ onSelectTable }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tables');
      setTables(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading tables...</div>;

  return (
    <div className="table-list">
      <h2>Available Tables in Esker Schema</h2>
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