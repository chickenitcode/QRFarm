import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the first tab (Home)
  return <Redirect href="/QRFarm/create-qr" />;
}
