import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { AppNavigationProp } from './types';
import { styles } from '../styles/styles';
import { useAuth } from '../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface Props {
  navigation: AppNavigationProp;
}

const Connexion: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [serverIp, setServerIp] = useState<string | null>(null);

  const { setIsConnected } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const chargerIP = async () => {
        try {
          const savedIP = await AsyncStorage.getItem("server_ip");
          if (savedIP) {
            setServerIp(savedIP);
            console.log("IP mise à jour :", savedIP);
          }
        } catch (error) {
          console.error("Erreur lors du chargement de l'IP :", error);
        }
      };
      chargerIP();
    }, [])
  );

  const getServerUrl = (endpoint: string) => {
    if (!serverIp) {
      setAlertMessage("Adresse IP du serveur non définie.");
      return null;
    }
    return `http://${serverIp}:5000${endpoint}`;
  };

  const handleLogin = async () => {
    if (username === '' || password === '') {
      setAlertMessage('Veuillez remplir tous les champs.');
      return;
    }
    const url = getServerUrl("/check_credentials");
    if (!url) return;

    setLoading(true);
    setAlertMessage('');

    try {
      const response = await axios.post(url, { username, password });
      if (response.status === 200) {
        setAlertMessage('Connexion réussie !');
        setIsConnected(true);
        // Stocker l'ID de l'utilisateur
        const userId = response.data.user_id;
        await AsyncStorage.setItem("user_id", userId.toString());
        navigation.navigate('Historique');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setAlertMessage("Nom d'utilisateur ou mot de passe incorrect");
        } else {
          setAlertMessage('Erreur lors de la connexion. Veuillez réessayer.');
        }
      } else {
        setAlertMessage('Erreur inattendue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (username === '' || password === '' || email === '') {
      setAlertMessage('Veuillez remplir tous les champs.');
      return;
    }
    const url = getServerUrl("/add_user");
    if (!url) return;

    setLoading(true);
    setAlertMessage('');

    try {
      const response = await axios.post(url, { username, password, email });
      if (response.status === 201) {
        Alert.alert("Succès", "Utilisateur créé avec succès !");
        setTimeout(() => {
          setIsSignup(false);
          setUsername('');
          setPassword('');
          setEmail('');
          setAlertMessage('');
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data.error || error.message;
        setAlertMessage(`Erreur lors de l'inscription : ${errorMessage}`);
      } else {
        setAlertMessage('Erreur inattendue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.containerCH}>
      <Text style={styles.title}>{isSignup ? 'Créer un compte' : 'Connexion'}</Text>
      {/* <Text>IP du serveur : {serverIp || "Non définie"}</Text> */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          accessible
          accessibilityLabel="Nom d'utilisateur"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessible
          accessibilityLabel="Mot de passe"
        />
        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            accessible
            accessibilityLabel="Email"
          />
        )}
        <Button title={isSignup ? "S'inscrire" : "Se connecter"} onPress={isSignup ? handleSignup : handleLogin} disabled={loading} />
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
      {alertMessage ? <Text style={styles.alertText}>{alertMessage}</Text> : null}
      <Button
        title={isSignup ? 'Déjà un compte ? Connexion' : 'Pas de compte ? Créer un compte'}
        onPress={() => setIsSignup(!isSignup)}
      />
    </View>
  );
};

export default Connexion;