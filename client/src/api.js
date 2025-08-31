const API_URL = "http://localhost:5000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status);
  }
  return response.json();
};

export const api = {
  generate: async (prompt) => {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    return handleResponse(response);
  },

  deploy: async (html) => {
    const response = await fetch(`${API_URL}/api/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });
    return handleResponse(response);
  },

  createComponent: async (content) => {
    const response = await fetch(`${API_URL}/api/component`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  updateComponent: async (componentId, content) => {
    const response = await fetch(`${API_URL}/api/component/${componentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  getComponent: async (componentId) => {
    const response = await fetch(`${API_URL}/api/component/${componentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  getPreview: async (componentId) => {
    const response = await fetch(`${API_URL}/api/preview/${componentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }
};

export default api;