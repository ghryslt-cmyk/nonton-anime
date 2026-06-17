const API_BASE_URL = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// Get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// Remove user from localStorage
const removeUser = () => localStorage.removeItem('user');

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const data = await apiCall('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  login: async (email, password) => {
    const data = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  logout: () => {
    removeToken();
    removeUser();
  },

  isAuthenticated: () => !!getToken(),
  getCurrentUser: getUser,
};

// Anime API
export const animeAPI = {
  getAll: async () => {
    return apiCall('/anime');
  },

  getById: async (id) => {
    return apiCall(`/anime/${id}`);
  },

  create: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/anime`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create anime');
    }

    return response.json();
  },

  update: async (id, formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/anime/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update anime');
    }

    return response.json();
  },

  delete: async (id) => {
    return apiCall(`/anime/${id}`, { method: 'DELETE' });
  },

  getEpisodes: async (animeId) => {
    return apiCall(`/anime/${animeId}/episodes`);
  },

  createEpisode: async (animeId, data) => {
    return apiCall(`/anime/${animeId}/episodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getReviews: async (animeId) => {
    return apiCall(`/anime/${animeId}/reviews`);
  },

  createReview: async (animeId, rating, comment) => {
    return apiCall(`/anime/${animeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};

// Favorites API
export const favoritesAPI = {
  getAll: async () => {
    return apiCall('/favorites');
  },

  add: async (animeId) => {
    return apiCall(`/favorites/${animeId}`, { method: 'POST' });
  },

  remove: async (animeId) => {
    return apiCall(`/favorites/${animeId}`, { method: 'DELETE' });
  },
};

// User API
export const userAPI = {
  getAll: async () => {
    return apiCall('/users');
  },

  getProfile: async () => {
    return apiCall('/profile');
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    return apiCall('/settings');
  },

  update: async (settings) => {
    return apiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
