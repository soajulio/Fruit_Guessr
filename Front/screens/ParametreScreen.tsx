import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { styles } from "../styles/styles";
import { useServerIp } from "../context/ServerIpContext";

const ParametreScreen: React.FC = () => {
  const { serverIp, setServerIp } = useServerIp();
  const [ipAdresse, setIpAdresse] = useState(serverIp);

  const sauvegarderIP = () => {
    if (ipAdresse.trim() === "") {
      Alert.alert("Erreur", "Veuillez entrer une adresse IP valide.");
      return;
    }
    setServerIp(ipAdresse);
    Alert.alert("Succès", "Adresse IP sauvegardée !");
  };

  return (
    <View style={styles.containerCH}>
      <Text style={styles.title}>Paramètres</Text>
      <Text style={styles.subtitle}>Adresse IP du serveur :</Text>
      <TextInput
        style={styles.input}
        value={ipAdresse}
        onChangeText={setIpAdresse}
        placeholder="Entrez l'adresse IP"
        keyboardType="numbers-and-punctuation"
      />
      <Button title="Sauvegarder" onPress={sauvegarderIP} />
    </View>
  );
};

export default ParametreScreen;