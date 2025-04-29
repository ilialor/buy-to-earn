// API configuration file for escrow and other services
// Adjust API_URL as needed for your environment
// Determine environment: use remote API for development, relative API path for production
const isProd = !['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_CONFIG = {
  API_URL: isProd
    ? '/api'
    : 'http://api.ateira.online/api'
};

export default API_CONFIG;
export const ESCROW_API_URL = API_CONFIG.API_URL;
export const AILOCK_API_URL = import.meta.env.PROD
  ? 'https://ai.ateira.online'
  : window.location.origin;
export const ESCROW_TOKEN = localStorage.getItem('escrowToken') || '';
export const AILOCK_TOKEN = localStorage.getItem('ailockToken') || '';
