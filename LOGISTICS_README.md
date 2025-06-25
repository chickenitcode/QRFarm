# QRFarm Mobile Logistics Features

This document describes the logistics features added to the QRFarm mobile application based on the backend `logistic.js` functionality.

## Overview

The mobile app now includes comprehensive logistics tracking and analysis features that provide users with:

- **Supply Chain Analysis**: Consolidated insights across all batches
- **Batch-specific Logistics**: Detailed tracking for individual batches
- **Real-time Updates**: Refresh capabilities for latest data
- **Performance Metrics**: Region performance and efficiency indicators

## Components

### 1. Analysis Screen (`src/app/QRFarm/analysis.tsx`)

The main analytics dashboard providing:

- **Supply Chain Overview**: Key metrics summary (total batches, regions, product types)
- **Key Insights**: AI-generated or algorithm-based insights about supply chain performance
- **Trend Analysis**: Analysis of shipping patterns and product performance
- **Regional Prediction**: Forecasts for optimal regions in upcoming quarters
- **Region Performance**: Ranked list of regions with performance scores
- **Strategic Recommendations**: Actionable insights for supply chain optimization

**Features:**
- Expandable/collapsible sections for better mobile UX
- Pull-to-refresh functionality
- Loading states and error handling
- Responsive design with proper theming

### 2. Batch Logistics Screen (`src/components/BatchLogisticsScreen.tsx`)

Detailed logistics view for individual batches:

- **Basic Information**: Product type, origin, current location, shipment events
- **Timeline**: Chronological view of all batch events
- **Shipment Logs**: Detailed shipping information with actors and locations
- **Region Path**: Visual representation of the batch journey

**Features:**
- Interactive timeline with visual indicators
- Expandable sections for detailed information
- Back navigation support
- Real-time status updates

### 3. Logistics Summary Card (`src/components/LogisticsSummaryCard.tsx`)

Reusable component for displaying logistics summaries:

- **Compact View**: Space-efficient display for lists
- **Full View**: Detailed information display
- **Status Indicators**: Color-coded efficiency and status badges
- **Interactive**: Optional onPress handler for navigation

### 4. API Integration (`src/services/api.ts`)

Enhanced API functions matching the backend logistics endpoints:

```typescript
// Get logistics information for a specific batch
getBatchLogistics(batchId: string): Promise<BatchLogistics>

// Get consolidated supply chain insights
getLogisticsInsightsSummary(): Promise<LogisticsInsights>
```

**TypeScript Interfaces:**
- `BatchLogistics`: Complete batch logistics data
- `LogisticsInsights`: Consolidated analytics and insights
- `ShipmentLog`: Individual shipment event data
- `RegionPerformance`: Regional performance metrics

### 5. Logistics Utilities (`src/utils/logisticsUtils.ts`)

Helper functions for data processing:

- `processBatchLogistics()`: Extract metrics from raw logistics data
- `formatInsightsForMobile()`: Format insights for mobile display
- `getLogisticsSummary()`: Generate summary information
- Color coding functions for status, efficiency, and performance
- Date/time formatting utilities

## Usage Examples

### Adding Analytics to Your App

```tsx
import AnalysisScreen from '@/app/QRFarm/analysis';

// Use as a standalone screen
<AnalysisScreen />
```

### Displaying Batch Logistics

```tsx
import { BatchLogisticsScreen } from '@/components/BatchLogisticsScreen';

// Show logistics for a specific batch
<BatchLogisticsScreen 
  batchId="batch123" 
  onBack={() => navigation.goBack()} 
/>
```

### Using Summary Cards

```tsx
import LogisticsSummaryCard from '@/components/LogisticsSummaryCard';
import { getBatchLogistics } from '@/services/api';

// In your component
const [logistics, setLogistics] = useState<BatchLogistics | null>(null);

// Fetch logistics data
useEffect(() => {
  getBatchLogistics(batchId).then(setLogistics);
}, [batchId]);

// Render compact card
{logistics && (
  <LogisticsSummaryCard 
    logistics={logistics}
    compact={true}
    onPress={() => navigateToDetails(batchId)}
  />
)}
```

## API Requirements

The mobile app expects the following backend endpoints to be available:

1. `GET /api/logistics/batch/:batchId` - Individual batch logistics
2. `GET /api/logistics/insights/summary` - Consolidated insights

Make sure your backend implements these endpoints as defined in `logistic.js`.

## Styling and Theming

All components use the app's theming system:

- Supports light/dark mode automatically
- Uses `Colors` constants for consistent styling
- Responsive design for various screen sizes
- Follows Material Design principles for mobile UX

## Error Handling

All components include comprehensive error handling:

- Network error recovery
- Loading states with spinners
- User-friendly error messages
- Retry functionality
- Offline state considerations

## Future Enhancements

Potential improvements to consider:

1. **Offline Support**: Cache logistics data for offline viewing
2. **Push Notifications**: Real-time updates for batch status changes
3. **Map Integration**: Visual representation of logistics routes
4. **Export Features**: PDF/CSV export of logistics reports
5. **Predictive Analytics**: ML-based predictions for delivery times
6. **Multi-language Support**: Internationalization for global use

## Performance Considerations

- Components use React.memo where appropriate
- Large datasets are paginated or virtualized
- Images and heavy content are lazy-loaded
- API calls are debounced to prevent excessive requests

## Testing

Components can be tested using React Native Testing Library:

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AnalysisScreen from '@/app/QRFarm/analysis';

test('displays loading state initially', () => {
  const { getByText } = render(<AnalysisScreen />);
  expect(getByText('Loading logistics insights...')).toBeTruthy();
});
```

## Contributing

When adding new logistics features:

1. Follow existing TypeScript patterns
2. Add proper error handling and loading states
3. Include accessibility features (screen reader support)
4. Update this documentation
5. Add unit tests for utility functions
6. Test on both iOS and Android platforms
