import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import ListsScreen from './src/screens/ListsScreen';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import CreateDestinationScreen from './src/screens/CreateDestinationScreen';
import CreateAccommodationScreen from './src/screens/CreateAccommodationScreen';
import VisitedMapScreen from './src/screens/VisitedMapScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Baggie' }} />
        <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'My Lists' }} />
        <Stack.Screen
          name="TripDetails"
          component={TripDetailsScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen
          name="CreateDestination"
          component={CreateDestinationScreen}
          options={{ title: 'Create Trip' }}
        />
        <Stack.Screen
          name="CreateAccommodation"
          component={CreateAccommodationScreen}
          options={{ title: 'Accommodation' }}
        />
        <Stack.Screen
          name="VisitedMap"
          component={VisitedMapScreen}
          options={{ title: 'World Map' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
