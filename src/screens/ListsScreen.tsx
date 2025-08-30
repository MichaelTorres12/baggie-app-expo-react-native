import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface Props extends NativeStackScreenProps<RootStackParamList, 'Lists'> {}

const sampleLists = [
  { id: '1', name: 'Business', dates: 'Sep 10 - Sep 12' },
  { id: '2', name: 'Camping', dates: 'Oct 5 - Oct 8' },
  { id: '3', name: 'Mallorca', dates: 'Nov 20 - Nov 27' },
  { id: '4', name: 'Dubai', dates: 'Dec 1 - Dec 5' },
];

export default function ListsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Lists</Text>
      <FlatList
        data={sampleLists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.listItem}
            onPress={() => navigation.navigate('TripDetails', { name: item.name })}
          >
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.listDates}>{item.dates}</Text>
          </Pressable>
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
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listName: {
    fontSize: 18,
    fontWeight: '500',
  },
  listDates: {
    fontSize: 14,
    color: '#666',
  },
});
