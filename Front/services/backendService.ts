import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const identifyPlant = async (imageUri: string) => {
  try {
    // Récupérer l'IP du serveur depuis AsyncStorage
    const savedIP = await AsyncStorage.getItem("server_ip");
    if (!savedIP) {
      console.warn("Aucune adresse IP enregistrée.");
      return null;
    }

    const API_URL = `http://${savedIP}:5000/identify_plant`;
    const HISTORIQUE_API_URL = `http://${savedIP}:5000/add_historique`; 

    // Demander la permission de localisation
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Permission de localisation refusée.");
      return null;
    }

    let latitude = null;
    let longitude = null;

    try {
      const location = await Location.getCurrentPositionAsync({});
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
      console.log(`Localisation récupérée: ${latitude}, ${longitude}`);
    } catch (error) {
      console.warn("Impossible de récupérer la localisation:", error);
    }

    // Convertir l'image en base64
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Envoyer l'image et la localisation au back-end
    const response = await axios.post(API_URL, {
      image: imageBase64,
      latitude,
      longitude,
    });
    
    console.log("Identification result:", response.data);

    // Vérifier si c'est une plante
    const isPlant = response.data?.result?.is_plant?.binary ?? false;

    // Déterminer la meilleure correspondance
    let planteNom = "Plante inconnue";
    let predictionScore = 0;
    let imageUrl = null;
    const suggestions = response.data?.result?.classification?.suggestions || [];

    if (suggestions.length > 0) {
      const bestMatch = suggestions[0]; // Toujours prendre la meilleure correspondance

      planteNom = bestMatch.name || "Plante inconnue"; // Utiliser 'name' au lieu de 'plant_name'
      predictionScore = typeof bestMatch.probability === "number" ? bestMatch.probability : 0;
      imageUrl = bestMatch?.similar_images?.[0]?.url || null;
    }
    // Sauvegarder dans la base de données seulement si le score de prédiction est supérieur à 45%
    if (predictionScore > 0.45) {
        try {
          const userId = await AsyncStorage.getItem("user_id");
          if (!userId) {
            console.error("Aucun ID utilisateur trouvé.");
            return;
          }
          await axios.post(HISTORIQUE_API_URL, {
            plante_nom: planteNom,
            latitude,
            longitude,
            prediction_score: predictionScore,
            image: imageBase64,
            url: imageUrl,
            user_id: parseInt(userId, 10), // Inclure l'ID de l'utilisateur
          });
  
          console.log("Successfully added to history.");
        } catch (historyError) {
          console.error("Error adding to history:", historyError);
        }
      } else {
        console.log("Prediction score too low to save to history.");
      }

    console.log("Résultat de l'identification:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'identification de la plante:", error);
    return null;
  }
};