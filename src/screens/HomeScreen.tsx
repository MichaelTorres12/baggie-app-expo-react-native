import { StyleSheet, Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface Props extends NativeStackScreenProps<RootStackParamList, 'Home'> {}

export default function HomeScreen({ navigation }: Props) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'Not set';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pack trips quickly</Text>
      <Text style={styles.subtitle}>Smart planning with your assistant</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Lists')}>
        <Text style={styles.buttonText}>My Lists</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('CreateDestination')}>
        <Text style={styles.buttonText}>Create Trip</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('VisitedMap')}>
        <Text style={styles.buttonText}>World Map</Text>
      </Pressable>
      <Text style={styles.env}>API URL: {apiUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  env: {
    marginTop: 24,
    fontSize: 12,
    color: '#666',
  },
});
