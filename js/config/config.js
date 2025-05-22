// API configuration file for escrow and other services
// Adjust API_URL as needed for your environment
// Determine environment: use remote API for development, relative API path for production
const isProd = !['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_CONFIG = {
  API_URL: isProd
    ? 'https://ateira.online/api'
    : 'http://api.ateira.online/api'
};

export default {
  API_URL: API_CONFIG.API_URL,
  ESCROW_API_URL: API_CONFIG.API_URL,
  AILOCK_API_URL: isProd
    ? 'https://ai.ateira.online'
    : window.location.origin,
  ESCROW_TOKEN: localStorage.getItem('escrowToken') || '',
  AILOCK_TOKEN: localStorage.getItem('ailockToken') || ''
};
