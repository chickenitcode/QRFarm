// API client for web pages

// Base URL - Replace with your actual backend URL
const API_BASE_URL = 'http://192.168.1.182:5000'; 
// For production: const API_BASE_URL = 'https://your-api-domain.com';

// Batch operations
export const getBatch = async (batchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching batch:', error);
    throw error;
  }
};

export const getBatchProducts = async (batchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/products`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching batch products:', error);
    throw error;
  }
};

// Product operations
export const getProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Get all batches
export const getAllBatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/batches`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all batches:', error);
    throw error;
  }
};