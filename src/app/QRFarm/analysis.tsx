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
import { getLogisticsInsightsSummary, LogisticsInsights } from '@/services/api';

interface LogisticsSummary {
  insights: LogisticsInsights | null;
  loading: boolean;
  error: string | null;
}

export default function AnalysisScreen() {
  const colorScheme = useColorScheme();
  const [summary, setSummary] = useState<LogisticsSummary>({
    insights: null,
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const loadLogisticsInsights = async () => {
    try {
      setSummary(prev => ({ ...prev, loading: true, error: null }));
      const data = await getLogisticsInsightsSummary();
      setSummary({
        insights: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading logistics insights:', error);
      setSummary({
        insights: null,
        loading: false,
        error: 'Failed to load logistics insights. Please try again.',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogisticsInsights();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLogisticsInsights();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSummaryCard = () => {
    if (!summary.insights) return null;

    const { summary: summaryData } = summary.insights;
    
    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ThemedText style={styles.cardTitle}>Supply Chain Overview</ThemedText>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber}>{summaryData.total_batches}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Batches</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber}>{summaryData.unique_regions}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Unique Regions</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber}>{summaryData.product_types}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Product Types</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber} numberOfLines={2} adjustsFontSizeToFit>
              {summaryData.most_common_product}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Top Product</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  const renderInsightsCard = () => {
    if (!summary.insights) return null;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('insights')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Key Insights</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'insights' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'insights' && (
          <ThemedText style={styles.cardContent}>{summary.insights.insights}</ThemedText>
        )}
      </ThemedView>
    );
  };

  const renderTrendAnalysis = () => {
    if (!summary.insights) return null;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('trends')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Trend Analysis</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'trends' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'trends' && (
          <ThemedText style={styles.cardContent}>{summary.insights.trend_analysis}</ThemedText>
        )}
      </ThemedView>
    );
  };

  const renderRegionPrediction = () => {
    if (!summary.insights) return null;

    const { region_prediction } = summary.insights;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('prediction')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Regional Prediction</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'prediction' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'prediction' && (
          <View>
            <View style={styles.predictionHeader}>
              <ThemedText style={styles.predictionTitle}>Top Region Next Quarter:</ThemedText>
              <ThemedText style={styles.predictionRegion}>{region_prediction.top_region_next_quarter}</ThemedText>
            </View>
            <ThemedText style={styles.cardContent}>{region_prediction.reason}</ThemedText>
          </View>
        )}
      </ThemedView>
    );
  };

  const renderRegionPerformance = () => {
    if (!summary.insights) return null;

    const { region_performance } = summary.insights;

    return (
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('performance')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Region Performance</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'performance' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'performance' && (
          <View style={styles.performanceList}>
            {region_performance.map((region, index) => (
              <View key={region.name} style={styles.performanceItem}>
                <View style={styles.performanceRank}>
                  <ThemedText style={styles.rankNumber}>{index + 1}</ThemedText>
                </View>
                <View style={styles.performanceDetails}>
                  <ThemedText style={styles.regionName}>{region.name}</ThemedText>
                  <ThemedText style={styles.regionStats}>
                    Score: {region.score} • Batches: {region.batches_processed}
                  </ThemedText>
                </View>
                <View style={styles.scoreBar}>
                  <View 
                    style={[
                      styles.scoreBarFill, 
                      { width: `${Math.min(region.score * 10, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    );
  };

  const renderStrategicRecommendation = () => {
    if (!summary.insights) return null;

    return (
      <ThemedView style={[styles.card, styles.recommendationCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity onPress={() => toggleSection('recommendation')}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Strategic Recommendation</ThemedText>
            <ThemedText style={styles.expandIcon}>
              {expandedSection === 'recommendation' ? '−' : '+'}
            </ThemedText>
          </View>
        </TouchableOpacity>
        {expandedSection === 'recommendation' && (
          <ThemedText style={styles.cardContent}>{summary.insights.strategic_recommendation}</ThemedText>
        )}
      </ThemedView>
    );
  };

  if (summary.loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading logistics insights...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (summary.error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{summary.error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadLogisticsInsights}>
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
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Supply Chain Analysis</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Comprehensive logistics insights and performance metrics
          </ThemedText>
        </View>

        {renderSummaryCard()}
        {renderInsightsCard()}
        {renderTrendAnalysis()}
        {renderRegionPrediction()}
        {renderRegionPerformance()}
        {renderStrategicRecommendation()}

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
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  predictionRegion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  performanceList: {
    marginTop: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  performanceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  performanceDetails: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  regionStats: {
    fontSize: 14,
    opacity: 0.7,
  },
  scoreBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginLeft: 12,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  recommendationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
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
