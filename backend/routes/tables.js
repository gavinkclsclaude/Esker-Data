const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Get list of all tables in esker schema
router.get('/tables', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'esker' 
        AND table_name NOT LIKE 'z_%'
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get table schema information
router.get('/tables/:tableName/schema', async (req, res) => {
  const { tableName } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'esker' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching table schema:', err);
    res.status(500).json({ error: 'Failed to fetch table schema' });
  }
});

// Get all records from a specific table with filtering
router.get('/tables/:tableName/data', async (req, res) => {
  const { tableName } = req.params;
  const { limit = 100, offset = 0, filters } = req.query;
  
  try {
    // Validate table name to prevent SQL injection
    const tableCheck = await db.query(
      'SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2',
      ['esker', tableName]
    );
    
    if (tableCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    // Parse filters if provided
    let filterObj = {};
    if (filters) {
      try {
        filterObj = JSON.parse(filters);
      } catch (e) {
        console.error('Invalid filters JSON:', e);
      }
    }
    
    // Build WHERE clause for filters
    let whereClause = '';
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;
    
    Object.entries(filterObj).forEach(([column, value]) => {
      if (value && value.trim() !== '') {
        whereConditions.push(`LOWER(CAST(${column} AS TEXT)) LIKE LOWER($${paramIndex})`);
        queryParams.push(`%${value}%`);
        paramIndex++;
      }
    });
    
    if (whereConditions.length > 0) {
      whereClause = ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Get filtered data
    const dataQuery = `SELECT * FROM esker.${tableName}${whereClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(dataQuery, queryParams);
    
    // Get filtered count
    const countQuery = `SELECT COUNT(*) FROM esker.${tableName}${whereClause}`;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Error fetching table data:', err);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// Create a new record in a specific table
router.post('/tables/:tableName/data', async (req, res) => {
  const { tableName } = req.params;
  const data = req.body;
  
  try {
    // Validate table exists
    const tableCheck = await db.query(
      'SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2',
      ['esker', tableName]
    );
    
    if (tableCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO esker.${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating record:', err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Update a record in a specific table
router.put('/tables/:tableName/data/:id', async (req, res) => {
  const { tableName, id } = req.params;
  const data = req.body;
  
  try {
    // Get primary key column name
    const pkResult = await db.query(`
      SELECT column_name
      FROM information_schema.key_column_usage
      WHERE table_schema = 'esker' 
        AND table_name = $1
        AND constraint_name = (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_schema = 'esker'
            AND table_name = $1
            AND constraint_type = 'PRIMARY KEY'
        )
    `, [tableName]);
    
    const pkColumn = pkResult.rows[0]?.column_name || 'id';
    
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE esker.${tableName}
      SET ${setClause}
      WHERE ${pkColumn} = $${values.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Delete a record from a specific table
router.delete('/tables/:tableName/data/:id', async (req, res) => {
  const { tableName, id } = req.params;
  
  try {
    // Get primary key column name
    const pkResult = await db.query(`
      SELECT column_name
      FROM information_schema.key_column_usage
      WHERE table_schema = 'esker' 
        AND table_name = $1
        AND constraint_name = (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_schema = 'esker'
            AND table_name = $1
            AND constraint_type = 'PRIMARY KEY'
        )
    `, [tableName]);
    
    const pkColumn = pkResult.rows[0]?.column_name || 'id';
    
    const query = `
      DELETE FROM esker.${tableName}
      WHERE ${pkColumn} = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;