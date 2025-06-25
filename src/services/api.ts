import axios from 'axios';

// Base URL - Replace with your actual backend URL
const API_BASE_URL = 'https://qrfarm-db.onrender.com'; // Use your computer's local IP for local testing
//const API_BASE_URL = 'http://192.168.1.75:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
export const getProductLocation = async () => {
  try {
    const response = await api.get('/api/products/location');
    return response.data; // [{ location: 'Tiền Giang', count: 5 }, ...]
  } catch (error) {
    console.error('Error fetching product location stats:', error);
    throw error;
  }
};
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

// Logistics operations
export const getBatchLogistics = async (batchId: string) => {
  try {
    const response = await api.get(`/api/logistics/batch/${batchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching batch logistics:', error);
    throw error;
  }
};

export const getLogisticsInsightsSummary = async () => {
  try {
    const response = await api.get('/api/logistics/insights/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching logistics insights summary:', error);
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

// Types for logistics data
export interface ShipmentLog {
  blockId: string;
  actor: string;
  location: string;
  timestamp: string;
  details: any;
}

export interface Timestamp {
  blockId: string;
  timestamp: string;
  action: string;
}

export interface RegionData {
  origin: string;
  currentLocation: string;
  path: string[];
}

export interface BatchLogistics {
  batchId: string;
  productType: string;
  shipmentLogs: ShipmentLog[];
  timestamps: Timestamp[];
  regions: RegionData;
}

export interface RegionPerformance {
  name: string;
  score: number;
  batches_processed: number;
}

export interface LogisticsInsights {
  summary: {
    total_batches: number;
    unique_regions: number;
    product_types: number;
    most_common_product: string;
  };
  insights: string;
  trend_analysis: string;
  region_prediction: {
    top_region_next_quarter: string;
    reason: string;
  };
  strategic_recommendation: string;
  region_performance: RegionPerformance[];
}
