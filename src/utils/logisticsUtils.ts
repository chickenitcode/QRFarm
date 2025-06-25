/**
 * Utility functions for logistics data processing and formatting
 */

import { BatchLogistics, LogisticsInsights, ShipmentLog } from '@/services/api';

export interface ProcessedLogistics {
  totalTransitTime: number;
  averageTransitTime: number;
  totalStops: number;
  efficiency: 'High' | 'Medium' | 'Low';
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Unknown';
}

/**
 * Process batch logistics data to extract useful metrics
 */
export const processBatchLogistics = (logistics: BatchLogistics): ProcessedLogistics => {
  const { shipmentLogs, regions, timestamps } = logistics;
  
  // Calculate transit time
  let totalTransitTime = 0;
  if (shipmentLogs.length > 1) {
    const firstLog = shipmentLogs[0];
    const lastLog = shipmentLogs[shipmentLogs.length - 1];
    totalTransitTime = (new Date(lastLog.timestamp).getTime() - new Date(firstLog.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  }
  
  const averageTransitTime = totalTransitTime / Math.max(shipmentLogs.length - 1, 1);
  const totalStops = regions.path.length;
  
  // Determine efficiency based on stops and time
  let efficiency: 'High' | 'Medium' | 'Low' = 'Medium';
  if (totalStops <= 3 && averageTransitTime <= 2) {
    efficiency = 'High';
  } else if (totalStops > 5 || averageTransitTime > 5) {
    efficiency = 'Low';
  }
  
  // Determine status
  let status: 'In Transit' | 'Delivered' | 'Pending' | 'Unknown' = 'Unknown';
  if (shipmentLogs.length === 0) {
    status = 'Pending';
  } else if (regions.origin !== regions.currentLocation) {
    status = 'In Transit';
  } else {
    // Check if there are recent delivery actions
    const recentActions = timestamps
      .filter(t => t.action.toLowerCase().includes('deliver') || t.action.toLowerCase().includes('complete'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (recentActions.length > 0) {
      status = 'Delivered';
    } else {
      status = 'In Transit';
    }
  }
  
  return {
    totalTransitTime,
    averageTransitTime,
    totalStops,
    efficiency,
    status,
  };
};

/**
 * Format logistics insights for mobile display
 */
export const formatInsightsForMobile = (insights: LogisticsInsights) => {
  const { summary, region_performance } = insights;
  
  return {
    keyMetrics: [
      { label: 'Total Batches', value: summary.total_batches.toString(), icon: '📦' },
      { label: 'Regions', value: summary.unique_regions.toString(), icon: '🌍' },
      { label: 'Product Types', value: summary.product_types.toString(), icon: '🏷️' },
      { label: 'Top Product', value: summary.most_common_product, icon: '⭐' },
    ],
    topRegions: region_performance.slice(0, 3).map(region => ({
      name: region.name,
      score: Math.round(region.score * 100) / 100,
      batches: region.batches_processed,
      performance: region.score > 8 ? 'Excellent' : region.score > 5 ? 'Good' : 'Average',
    })),
    summary: {
      shortInsights: insights.insights.split('.')[0] + '.',
      recommendation: insights.strategic_recommendation.split('.')[0] + '.',
      prediction: insights.region_prediction.top_region_next_quarter,
    },
  };
};

/**
 * Get color for region performance score
 */
export const getPerformanceColor = (score: number): string => {
  if (score >= 8) return '#4CAF50'; // Green
  if (score >= 5) return '#FF9500'; // Orange
  return '#FF6B6B'; // Red
};

/**
 * Get color for logistics efficiency
 */
export const getEfficiencyColor = (efficiency: 'High' | 'Medium' | 'Low'): string => {
  switch (efficiency) {
    case 'High': return '#4CAF50';
    case 'Medium': return '#FF9500';
    case 'Low': return '#FF6B6B';
    default: return '#999999';
  }
};

/**
 * Get color for batch status
 */
export const getStatusColor = (status: 'In Transit' | 'Delivered' | 'Pending' | 'Unknown'): string => {
  switch (status) {
    case 'Delivered': return '#4CAF50';
    case 'In Transit': return '#007AFF';
    case 'Pending': return '#FF9500';
    case 'Unknown': return '#999999';
    default: return '#999999';
  }
};

/**
 * Format duration in a human-readable way
 */
export const formatDuration = (days: number): string => {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days < 7) {
    const roundedDays = Math.round(days * 10) / 10;
    return `${roundedDays} day${roundedDays !== 1 ? 's' : ''}`;
  } else {
    const weeks = Math.round(days / 7 * 10) / 10;
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
};

/**
 * Sort shipment logs chronologically
 */
export const sortShipmentLogs = (logs: ShipmentLog[]): ShipmentLog[] => {
  return [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

/**
 * Get the most recent location from shipment logs
 */
export const getMostRecentLocation = (logs: ShipmentLog[]): string | null => {
  if (logs.length === 0) return null;
  const sorted = sortShipmentLogs(logs);
  return sorted[sorted.length - 1].location;
};

/**
 * Calculate the total distance traveled (simplified - just count unique locations)
 */
export const calculateTotalStops = (regions: string[]): number => {
  return new Set(regions).size;
};

/**
 * Get logistics summary for quick view
 */
export const getLogisticsSummary = (logistics: BatchLogistics) => {
  const processed = processBatchLogistics(logistics);
  const recentLocation = getMostRecentLocation(logistics.shipmentLogs);
  
  return {
    batchId: logistics.batchId,
    productType: logistics.productType,
    status: processed.status,
    efficiency: processed.efficiency,
    currentLocation: recentLocation || logistics.regions.currentLocation,
    totalStops: processed.totalStops,
    transitTime: formatDuration(processed.totalTransitTime),
    lastUpdate: logistics.shipmentLogs.length > 0 
      ? new Date(logistics.shipmentLogs[logistics.shipmentLogs.length - 1].timestamp).toLocaleDateString()
      : 'N/A',
  };
};
