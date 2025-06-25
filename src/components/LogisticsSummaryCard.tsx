import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  getStatusColor, 
  getEfficiencyColor, 
  getLogisticsSummary
} from '@/utils/logisticsUtils';
import { BatchLogistics } from '@/services/api';

interface LogisticsSummaryCardProps {
  logistics: BatchLogistics;
  onPress?: () => void;
  compact?: boolean;
}

export default function LogisticsSummaryCard({ 
  logistics, 
  onPress, 
  compact = false 
}: LogisticsSummaryCardProps) {
  const colorScheme = useColorScheme();
  const summary = getLogisticsSummary(logistics);

  const renderCompactView = () => (
    <View style={styles.compactContainer}>
      <View style={styles.compactHeader}>
        <ThemedText style={styles.compactBatchId} numberOfLines={1}>
          {summary.batchId}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(summary.status) }]}>
          <ThemedText style={styles.statusText}>{summary.status}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.compactLocation} numberOfLines={1}>
        📍 {summary.currentLocation}
      </ThemedText>
      <View style={styles.compactStats}>
        <ThemedText style={styles.compactStat}>
          🚚 {summary.totalStops} stops
        </ThemedText>
        <ThemedText style={styles.compactStat}>
          ⏱️ {summary.transitTime}
        </ThemedText>
      </View>
    </View>
  );

  const renderFullView = () => (
    <View style={styles.fullContainer}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.batchId}>{summary.batchId}</ThemedText>
          <ThemedText style={styles.productType}>{summary.productType}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(summary.status) }]}>
          <ThemedText style={styles.statusText}>{summary.status}</ThemedText>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <ThemedText style={styles.locationLabel}>Current Location:</ThemedText>
        <ThemedText style={styles.locationValue}>{summary.currentLocation}</ThemedText>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Efficiency</ThemedText>
          <View style={[styles.efficiencyBadge, { backgroundColor: getEfficiencyColor(summary.efficiency) }]}>
            <ThemedText style={styles.efficiencyText}>{summary.efficiency}</ThemedText>
          </View>
        </View>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Total Stops</ThemedText>
          <ThemedText style={styles.metricValue}>{summary.totalStops}</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Transit Time</ThemedText>
          <ThemedText style={styles.metricValue}>{summary.transitTime}</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Last Update</ThemedText>
          <ThemedText style={styles.metricValue}>{summary.lastUpdate}</ThemedText>
        </View>
      </View>
    </View>
  );

  const cardContent = compact ? renderCompactView() : renderFullView();

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <ThemedView style={[
          styles.card, 
          compact ? styles.compactCard : styles.fullCard,
          { backgroundColor: Colors[colorScheme ?? 'light'].background }
        ]}>
          {cardContent}
        </ThemedView>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={[
      styles.card, 
      compact ? styles.compactCard : styles.fullCard,
      { backgroundColor: Colors[colorScheme ?? 'light'].background }
    ]}>
      {cardContent}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
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
  compactCard: {
    padding: 12,
    margin: 8,
  },
  fullCard: {
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  compactContainer: {
    minHeight: 80,
  },
  fullContainer: {},
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactBatchId: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  compactLocation: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactStat: {
    fontSize: 11,
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  batchId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  efficiencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  efficiencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
