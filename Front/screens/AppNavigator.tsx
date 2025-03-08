import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./HomeScreen";
import ConnectionScreen from "./ConnectionScreen";
import HistoriqueScreen from "./HistoriqueScreen";
import ParametreScreen from "./ParametreScreen";
import { useAuth } from "../components/AuthContext"; 

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  const { isConnected } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Historique"
        component={isConnected ? HistoriqueScreen : ConnectionScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Paramètres"
        component={ParametreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;