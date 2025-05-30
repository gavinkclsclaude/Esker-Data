// Utility function to format table and column names
// Converts snake_case to Proper Case with spaces
export const formatDatabaseName = (name) => {
  if (!name) return '';
  
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Example:
// 'invoice_headers' -> 'Invoice Headers'
// 'p2p_user_properties' -> 'P2p User Properties'