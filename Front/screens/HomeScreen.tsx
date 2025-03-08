import React, { useEffect } from "react";
import { Button, Text, View, TouchableOpacity, Image } from "react-native";
import { AppNavigationProp } from "./types";
import { styles } from "../styles/styles";
import CameraComponent from "../components/CameraComponant";
import { useAuth } from "../components/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    navigation: AppNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        const setUserId = async () => {
            await AsyncStorage.setItem("user_id", "2"); 
        };

        setUserId(); 
    }, []); 
    const { isConnected, setIsConnected } = useAuth();

    const handleLogout = async () => {
        setIsConnected(false);
        await AsyncStorage.setItem("user_id", "2"); 
    };

    return (
        <View style={styles.container}>
            {/* Display the logo */}
            <Image
                source={require('../assets/logo.png')} 
                style={{ width: 100, height: 100 }} 
            />

            {isConnected && (
                <TouchableOpacity onPress={handleLogout} style={styles.redButton}>
                    <Text style={styles.redButtonText}>Se déconnecter</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>
                {isConnected ? "Vous êtes connecté(e)" : "Vous n'êtes pas connecté(e)"}
            </Text>
            <CameraComponent />
        </View>
    );
}

export default HomeScreen;