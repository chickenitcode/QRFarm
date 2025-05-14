// URL configuration for QR codes

// Demo mode uses the demo website URLs
const DEMO_MODE = true; // Set to false for production

// Local development URLs (when testing on your computer)
const LOCAL_DEMO_BASE_URL = 'http://localhost:3000';

// Production/deployed URLs
const DEPLOYED_DEMO_BASE_URL = 'https://qrfarm-demo.netlify.app'; // Change to your actual deployed URL
const PRODUCTION_BASE_URL = 'https://yourdomain.com';

// Get the appropriate base URL based on configuration
export const getBaseUrl = () => {
  if (DEMO_MODE) {
    // Use local URL when developing, deployed demo URL in production
    return __DEV__ ? LOCAL_DEMO_BASE_URL : DEPLOYED_DEMO_BASE_URL;
  }
  
  // Use the real production URL when not in demo mode
  return PRODUCTION_BASE_URL;
};

// Generate URLs for QR codes
export const generateProductUrl = (productId: string) => `${getBaseUrl()}/product.html?id=${productId}`;
export const generateBatchUrl = (batchId: string) => `${getBaseUrl()}/batch.html?id=${batchId}`;