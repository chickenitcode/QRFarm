import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getBatchLogistics, BatchLogistics } from '@/services/api';

interface BatchLogisticsScreenProps {
  batchId: string;
  onBack?: () => void;
}

interface LogisticsState {
  data: BatchLogistics | null;
  loading: boolean;
  error: string | null;
}

export default function BatchLogisticsScreen({ batchId, onBack }: BatchLogisticsScreenProps) {
  const colorScheme = useColorScheme();
  const [logistics, setLogistics] = useState<LogisticsState>({
    data: null,
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('timeline');

  const loadBatchLogistics = async () => {
    try {
      setLogistics(prev => ({ ...prev, loading: true, error: null }));
      const data = await getBatchLogistics(batchId);
      setLogistics({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading batch logistics:', error);
      setLogistics({
        data: null,
        loading: false,
        error: 'Failed to load batch logistics. Please try again.',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBatchLogistics();
    setRefreshing(false);
  };

  useEffect(() => {
    loadBatchLogistics();
  }, [batchId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
      )}
      <ThemedText style={styles.headerTitle}>Batch Logistics</ThemedText>
      <ThemedText style={styles.headerSubtitle}>Batch ID: {batchId}</ThemedText>
    </View>
  );

  const renderBasicInfo = () => {
    if (!logistics.data) return null;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ThemedText style={styles.cardTitle}>Basic Information</ThemedText>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Product Type</ThemedText>
            <ThemedText style={styles.infoValue}>{logistics.data.productType}</ThemedText>
          </View>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Origin</ThemedText>
            <ThemedText style={styles.infoValue}>{logistics.data.regions.origin}</ThemedText>
          </View>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Current Location</ThemedText>
            <ThemedText style={styles.infoValue}>{logistics.data.regions.currentLocation}</ThemedText>
          </View>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Shipment Events</ThemedText>
            <ThemedText style={styles.infoValue}>{logistics.data.shipmentLogs.length}</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  const renderTimeline = () => {
    if (!logistics.data) return null;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('timeline')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Timeline</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'timeline' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'timeline' && (
          <View style={styles.timelineContainer}>
            {logistics.data.timestamps
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .map((timestamp, index) => (
                <View key={timestamp.blockId} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  {index < logistics.data!.timestamps.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <View style={styles.timelineContent}>
                    <ThemedText style={styles.timelineAction}>{timestamp.action}</ThemedText>
                    <ThemedText style={styles.timelineDate}>
                      {formatDate(timestamp.timestamp)}
                    </ThemedText>
                    <ThemedText style={styles.timelineBlockId}>
                      Block: {timestamp.blockId}
                    </ThemedText>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ThemedView>
    );
  };

  const renderShipmentLogs = () => {
    if (!logistics.data || logistics.data.shipmentLogs.length === 0) return null;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('shipments')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Shipment Logs</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'shipments' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'shipments' && (
          <View style={styles.shipmentContainer}>
            {logistics.data.shipmentLogs.map((log, index) => (
              <View key={log.blockId} style={styles.shipmentItem}>
                <View style={styles.shipmentHeader}>
                  <ThemedText style={styles.shipmentLocation}>{log.location}</ThemedText>
                  <ThemedText style={styles.shipmentDate}>{formatDate(log.timestamp)}</ThemedText>
                </View>
                <ThemedText style={styles.shipmentActor}>Actor: {log.actor}</ThemedText>
                {log.details && (
                  <View style={styles.shipmentDetails}>
                    <ThemedText style={styles.detailsLabel}>Details:</ThemedText>
                    <ThemedText style={styles.detailsText}>
                      {JSON.stringify(log.details, null, 2)}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    );
  };

  const renderRegionPath = () => {
    if (!logistics.data) return null;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('path')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Region Path</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'path' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'path' && (
          <View style={styles.pathContainer}>
            {logistics.data.regions.path.map((region, index) => (
              <View key={index} style={styles.pathItem}>
                <View style={[
                  styles.pathDot,
                  {
                    backgroundColor: region === logistics.data!.regions.currentLocation 
                      ? '#4CAF50' 
                      : '#007AFF'
                  }
                ]} />
                <ThemedText style={[
                  styles.pathRegion,
                  {
                    fontWeight: region === logistics.data!.regions.currentLocation 
                      ? 'bold' 
                      : 'normal'
                  }
                ]}>
                  {region}
                </ThemedText>
                {region === logistics.data!.regions.currentLocation && (
                  <ThemedText style={styles.currentLabel}>(Current)</ThemedText>
                )}
                {index < logistics.data!.regions.path.length - 1 && (
                  <ThemedText style={styles.pathArrow}>→</ThemedText>
                )}
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    );
  };

  if (logistics.loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading batch logistics...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (logistics.error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{logistics.error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadBatchLogistics}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderBasicInfo()}
        {renderTimeline()}
        {renderShipmentLogs()}
        {renderRegionPath()}

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B6B',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    marginTop: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginTop: 4,
    marginRight: 12,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineAction: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  timelineBlockId: {
    fontSize: 12,
    opacity: 0.5,
  },
  shipmentContainer: {
    marginTop: 12,
  },
  shipmentItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shipmentLocation: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shipmentDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  shipmentActor: {
    fontSize: 14,
    marginBottom: 8,
  },
  shipmentDetails: {
    marginTop: 8,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 4,
  },
  pathContainer: {
    marginTop: 12,
  },
  pathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pathDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  pathRegion: {
    fontSize: 16,
    marginRight: 8,
  },
  currentLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 8,
  },
  pathArrow: {
    fontSize: 16,
    opacity: 0.5,
    marginLeft: 'auto',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.5,
  },
});

// Export component for use in other screens
export { BatchLogisticsScreen };
