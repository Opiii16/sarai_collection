import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://saraicollection.pythonanywhere.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;
    
    // Handle unauthorized (401) errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return Promise.reject(error);
    }
    
    // Handle other errors
    return Promise.reject(error);

  }
);

// Product API methods
export const productApi = {
  getFeatured: async () => {
    const response = await api.get('/api/products?featured=true&limit=8');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  create: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },
  update: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  }
};
export const getFeaturedProducts = async () => {
  const response = await api.get('/api/products?featured=true&limit=8');
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/api/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/api/orders');
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/api/orders/${id}/status`, { status });
  return response.data;
};
export const getUsers = async () => {
  try {
    const response = await axios.get('https://saraicollection.pythonanywhere.com/api/users')
    return response.data;
  } catch (err) {
    console.error('Error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    throw err;
  }
};
export const updateUser  = async (id, userData) => {
  const response = await api.put(`/api/users/${id}`, userData);
  return response.data;
};
export const getCurrentUser = async () => {

};




// Order API methods
export const orderApi = {
  getAll: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },
  create: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  }
};

// User API methods
export const userApi = {
  getAll: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (err) {
      console.error('Error fetching users:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      throw err;
    }
  },
  update: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  getCurrent: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  }
};

// Cart API methods
export const cartApi = {
  getCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },
  addItem: async (productId, quantity = 1) => {
    const response = await api.post('/api/cart/items', { productId, quantity });
    return response.data;
  },
  updateItem: async (itemId, quantity) => {
    const response = await api.put(`/api/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  removeItem: async (itemId) => {
    const response = await api.delete(`/api/cart/items/${itemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/api/cart');
    return response.data;
  }
};

// Dashboard API methods
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  }
};

export default api;