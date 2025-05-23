// API configuration file for escrow and other services
// Adjust API_URL as needed for your environment
// Use relative API path for both development and production to avoid CORS issues
const API_CONFIG = {
  API_URL: '/api'  // Always use relative path to current domain
};

export default {
  API_URL: API_CONFIG.API_URL,
  ESCROW_API_URL: API_CONFIG.API_URL,
  AILOCK_API_URL: '/api/v1',  // Ailock API is also served via Nginx proxy
  ESCROW_TOKEN: localStorage.getItem('escrowToken') || '',
  AILOCK_TOKEN: localStorage.getItem('ailockToken') || ''
};
