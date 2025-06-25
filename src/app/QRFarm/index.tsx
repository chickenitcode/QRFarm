import { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getProductLocation } from '@/services/api';

type ChartData = {
  labels: string[];
  datasets: { data: number[] }[];
};

export default function HomeScreen() {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }]
  });

  useEffect(() => {
  getProductLocation()
    .then(data => {
      const sorted = [...data].sort((a, b) => a.count - b.count);
      const labels = sorted.map((item: any) =>
        Array.isArray(item.location)
          ? (item.location[0] || 'Unknown')
          : (item.location || 'Unknown')
      );
      const values = sorted.map((item: any) => item.count);
      setChartData({
        labels,
        datasets: [{ data: values }]
      });
    })
    .catch(error => {
      console.error('Failed to fetch product location :', error);
    });
}, []);



  // Tính chiều rộng động cho biểu đồ (mỗi cột ~60px, tối thiểu là chiều rộng màn hình)
  const chartWidth = Math.max(chartData.labels.length * 80, Dimensions.get('window').width - 32);

  return (
    <SafeAreaView style={styles.container}>
      
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Welcome to QRFarm
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Generate and scan QR codes with ease
          </ThemedText>
          <ThemedText type="title" style={{ fontSize: 20 ,marginTop: 24, marginBottom: 8 }}>
            Thống kê sản phẩm theo khu vực trong năm 2024
          </ThemedText>
          {chartData.labels.length > 0 && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={220}
                  fromZero={true}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={{ marginVertical: 8, borderRadius: 8 }}
                  horizontalLabelRotation={20}
                />
              </ScrollView>
            </>
          )}
        </ThemedView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
});