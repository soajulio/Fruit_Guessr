import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppNavigator from './screens/AppNavigator';
import ConnectionScreen from './screens/ConnectionScreen';
import HistoriqueScreen from './screens/HistoriqueScreen';
import ParametreScreen from './screens/ParametreScreen';
import { AuthProvider } from './components/AuthContext';   
import { ServerIpProvider } from './context/ServerIpContext'; // Assure-toi que l'import est correct !

export default function App() {
  const Stack = createStackNavigator();

  return (
    <ServerIpProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AppNavigator"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="AppNavigator" component={AppNavigator} />
            <Stack.Screen name="Connexion" component={ConnectionScreen} />
            <Stack.Screen name="Historique" component={HistoriqueScreen} />
            <Stack.Screen name="Parametre" component={ParametreScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ServerIpProvider>
  );
}