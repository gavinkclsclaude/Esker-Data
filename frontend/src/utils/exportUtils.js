import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDatabaseName } from './formatters';

export const exportToCSV = (data, columns, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => formatDatabaseName(col.column_name));
  const csvHeader = headers.join(',');

  // Create CSV rows
  const csvRows = data.map(row => {
    return columns.map(col => {
      const value = row[col.column_name];
      // Escape values that contain commas, quotes, or newlines
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const exportToExcel = (data, columns, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Format data for Excel
  const excelData = data.map(row => {
    const formattedRow = {};
    columns.forEach(col => {
      formattedRow[formatDatabaseName(col.column_name)] = row[col.column_name];
    });
    return formattedRow;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const maxWidths = {};
  columns.forEach(col => {
    const header = formatDatabaseName(col.column_name);
    maxWidths[header] = header.length;
  });

  data.forEach(row => {
    columns.forEach(col => {
      const header = formatDatabaseName(col.column_name);
      const value = row[col.column_name];
      if (value) {
        const length = String(value).length;
        if (length > maxWidths[header]) {
          maxWidths[header] = Math.min(length, 50); // Cap at 50 characters
        }
      }
    });
  });

  ws['!cols'] = Object.values(maxWidths).map(width => ({ wch: width + 2 }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};