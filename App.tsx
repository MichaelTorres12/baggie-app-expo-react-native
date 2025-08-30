import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'Not set';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Baggie!</Text>
      <Text>API URL: {apiUrl}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
