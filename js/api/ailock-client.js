/**
 * AilockClient - client for interacting with AI assistant service
 */
export class AilockClient {
  constructor(baseUrl, token = '') {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async sendMessage(sessionId, message) {
    const url = `${this.baseUrl}/api/v1/assistant/query`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
    const body = JSON.stringify({ sessionId, message });
    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ailock request failed');
    }
    return await response.json();
  }
}
