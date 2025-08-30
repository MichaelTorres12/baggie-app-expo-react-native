import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface Props extends NativeStackScreenProps<RootStackParamList, 'CreateDestination'> {}

export default function CreateDestinationScreen({ navigation }: Props) {
  const [destination, setDestination] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us where you're headed next</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Dubai"
        value={destination}
        onChangeText={setDestination}
      />
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('CreateAccommodation')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
