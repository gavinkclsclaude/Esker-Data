// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;

export const API_URL = `${API_BASE_URL}/api`;

export default {
  API_URL,
  API_BASE_URL
};