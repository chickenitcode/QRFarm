import axios from 'axios';

// Base URL - Replace with your actual backend URL
const API_BASE_URL = 'https://qrfarm-db.onrender.com'; // Use your computer's local IP for local testing
// For production, use your deployed URL: const API_BASE_URL = 'https://your-api-domain.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Batch operations
export const saveBatch = async (batchData: any) => {
  try {
    const response = await api.post('/api/batches', batchData);
    return response.data;
  } catch (error) {
    console.error('Error saving batch:', error);
    throw error;
  }
};

export const getBatch = async (batchId: string) => {
  try {
    const response = await api.get(`/api/batches/${batchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching batch:', error);
    throw error;
  }
};

export const addBatchBlock = async (batchId: string, blockData: any) => {
  try {
    const response = await api.post(`/api/batches/${batchId}/blocks`, blockData);
    return response.data;
  } catch (error) {
    console.error('Error adding batch block:', error);
    throw error;
  }
};

export const getBatchProducts = async (batchId: string) => {
  try {
    const response = await api.get(`/api/batches/${batchId}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching batch products:', error);
    throw error;
  }
};

// Product operations
export const saveChildProduct = async (productData: any) => {
  try {
    const response = await api.post('/api/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const getProduct = async (productId: string) => {
  try {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const addProductBlock = async (productId: string, blockData: any) => {
  try {
    const response = await api.post(`/api/products/${productId}/blocks`, blockData);
    return response.data;
  } catch (error) {
    console.error('Error adding product block:', error);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    const response = await api.get('/ping');
    console.log('API connection test:', response.data);
    return response.data;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
};