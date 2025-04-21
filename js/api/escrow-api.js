
/**
 * Escrow API configuration and initialization module
 * Provides access to the configured EscrowClient instance
 */

import { EscrowClient } from './escrow-client.js';
import API_CONFIG from '../config/config.js';

// Для единообразия с остальным кодом
const API_KEY = 'api-key-for-validation';

/**
 * Get API configuration based on current environment
 * @returns {Object} API configuration object with baseUrl and apiKey
 */
function getApiConfig() {
  return {
    apiBaseUrl: API_CONFIG.API_URL,
    apiKey: API_KEY
  };
}

// Initialize the API client with appropriate configuration
const config = getApiConfig();
export const escrowApi = new EscrowClient(config.apiBaseUrl, config.apiKey);

// Export the getApiConfig function for reuse if needed
export { getApiConfig };