// API configuration file for escrow and other services
// Adjust API_URL as needed for your environment
// Determine environment: use localhost in development, production URL otherwise
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_CONFIG = {
  API_URL: isLocal
    ? 'http://localhost:8000'
    : 'https://cointent.ateira.online'
};

export default API_CONFIG;
