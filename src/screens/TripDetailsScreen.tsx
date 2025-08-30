import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface Props extends NativeStackScreenProps<RootStackParamList, 'TripDetails'> {}

const sampleItems = [
  { id: '1', name: 'iPad' },
  { id: '2', name: 'T-Shirt x5' },
  { id: '3', name: 'Socks x5' },
  { id: '4', name: 'Sleepwear' },
];

export default function TripDetailsScreen({ route }: Props) {
  const { name } = route.params;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <FlatList
        data={sampleItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Switch
              value={!!checked[item.id]}
              onValueChange={(value) =>
                setChecked((prev) => ({ ...prev, [item.id]: value }))
              }
            />
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        )}
      />
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
