import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import World from '@svg-maps/world';

const world: any = World;

// TODO: Replace with real user data
const visited = ['US', 'CA', 'MX'];

const { width } = Dimensions.get('window');
const height = width / 2;

export default function VisitedMapScreen() {
  const visitedSet = new Set(visited);
  const totalCountries = world.paths.length;
  const visitedCount = visitedSet.size;
  const percentage = ((visitedCount / totalCountries) * 100).toFixed(1);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={world.viewBox}>
        {world.paths.map((country: any) => (
          <Path
            key={country.id}
            d={country.d}
            fill={visitedSet.has(country.id) ? '#FFB300' : '#ECEFF1'}
            stroke="#FFFFFF"
            strokeWidth={0.5}
          />
        ))}
      </Svg>
      <Text style={styles.info}>
        {visitedCount} / {totalCountries} countries visited ({percentage}%)
      </Text>
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
  info: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
