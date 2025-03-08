import React, { useState, useEffect } from "react";
import {
  Text, View, ScrollView, Image, TouchableOpacity, LayoutAnimation, Linking, RefreshControl, Alert
} from "react-native";
import { styles } from "../styles/styles";
import axios from "axios";
import Collapsible from 'react-native-collapsible';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";

const Historique: React.FC = () => {
  const [dataHistorique, setDataHistorique] = useState<any[]>([]);
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [serverIp, setServerIp] = useState<string | null>(null);

  useEffect(() => {
    const chargerIP = async () => {
      try {
        const savedIP = await AsyncStorage.getItem("server_ip");
        if (savedIP) {
          setServerIp(savedIP);
        } else {
          Alert.alert("Erreur", "Aucune adresse IP enregistrée.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'IP :", error);
      }
    };
    chargerIP();
  }, []);

  useEffect(() => {
    if (serverIp) {
      chargerHistorique();
    }
  }, [serverIp]);

  const chargerHistorique = async () => {
    if (!serverIp) return;
    setRefreshing(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        console.error("Aucun ID utilisateur trouvé.");
        setRefreshing(false);
        return;
      }
  
      const response = await axios.get(`http://${serverIp}:5000/get_historique/${userId}`);
      if (response.status === 200) {
        setDataHistorique(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique : ", error);
    } finally {
      setRefreshing(false);
    }
  };  

  const toggleSection = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSections((prevSections) =>
      prevSections.includes(index)
        ? prevSections.filter((i) => i !== index)
        : [...prevSections, index]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} à ${hours}:${minutes}`;
  };

  const handleUrlPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Erreur lors de l'ouverture de l'URL : ", err));
  };

  const supprimerHistorique = async (id: number) => {
    if (!serverIp) return;
    try {
      const response = await axios.delete(`http://${serverIp}:5000/delete_historique/${id}`);
      if (response.status === 200) {
        setDataHistorique((prevData) => prevData.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'historique : ", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#e0ebeb' }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={chargerHistorique} />
        }
        collapsable={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Historique des identifications</Text>
        </View>

        {dataHistorique.map((item, index) => {
          const imageUri = item.image
            ? item.image.startsWith("/9j/")
              ? `data:image/jpeg;base64,${item.image}`
              : `data:image/png;base64,${item.image}`
            : null;

          const scorePercentage = (item.prediction_score * 100).toFixed(1);

          return (
            <View key={index} style={styles.itemContainer}>
              <TouchableOpacity onPress={() => toggleSection(index)}>
                <Text style={styles.dateHeure}>{formatDate(item.timestamp)}</Text>
                <Text style={styles.nomPlante}>{item.plante_nom}</Text>
              </TouchableOpacity>

              <Collapsible collapsed={!activeSections.includes(index)}>
                {item.latitude && item.longitude && (
                  <View style={{ height: 200, width: "100%", marginVertical: 10 }}>
                    <MapView
                      style={{ flex: 1, height: 200, width: "100%", borderRadius: 15 }}
                      scrollEnabled={false}  // Désactive le déplacement
                      zoomEnabled={false}    // Désactive le zoom
                      rotateEnabled={false}  // Désactive la rotation
                      initialRegion={{
                        latitude: parseFloat(item.latitude),
                        longitude: parseFloat(item.longitude),
                        latitudeDelta: 0.07,  // Augmente la zone affichée (plus reculé)
                        longitudeDelta: 0.05, 
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: parseFloat(item.latitude),
                          longitude: parseFloat(item.longitude),
                        }}
                        title={item.plante_nom}
                        description={`Score : ${scorePercentage}%`}
                      />
                    </MapView>
                  </View>
                )}

                <Text style={styles.details}>Score : {scorePercentage}%</Text>

                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.alertText}>Image non disponible</Text>
                )}

                {item.url && item.url !== "None" && (
                  <TouchableOpacity style={styles.blueButton} onPress={() => handleUrlPress(item.url)}>
                    <Text style={styles.blueButtonText}>
                      Voir l'image de la fleur prédite
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.redButton} onPress={() => supprimerHistorique(item.id)}>
                  <Text style={styles.redButtonText}>
                    Supprimer
                  </Text>
                </TouchableOpacity>

              </Collapsible>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Historique;