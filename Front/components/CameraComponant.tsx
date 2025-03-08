import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import * as FileSystem from 'expo-file-system';
import { identifyPlant } from "../services/backendService";

export default function CameraComponent() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);  // State to store the photo URI
  const [plantData, setPlantData] = useState<any>(null);  // State to store API data
  const cameraRef = useRef<CameraView>(null);

  // Check permissions
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Function to save the image in an "imgs" folder
  const savePicture = async (uri: string) => {
    try {
      const imgsDirectory = FileSystem.documentDirectory + 'imgs/';
      const directoryInfo = await FileSystem.getInfoAsync(imgsDirectory);

      if (!directoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(imgsDirectory);
      }

      const fileName = `photo_${Date.now()}.jpg`;
      const fileUri = imgsDirectory + fileName;

      await FileSystem.copyAsync({ from: uri, to: fileUri });
      console.log('Photo saved at:', fileUri);
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  // Function to take a picture and send it to the API
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const pictureData = await cameraRef.current.takePictureAsync();

        if (!pictureData || !pictureData.uri) {
          console.error("No photo was taken.");
          return;
        }

        console.log("Photo taken:", pictureData.uri);
        setPhotoUri(pictureData.uri);  // Update the photo URI

        // Save locally
        await savePicture(pictureData.uri);

        // Identification with PlantID
        const result = await identifyPlant(pictureData.uri);
        console.log("Identification result:", result);

        // Update plant data
        setPlantData(result);
      } catch (error) {
        console.error("Error taking photo:", error);
      }
    }
  };

  // Function to toggle camera (front/back)
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Camera display */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleCameraFacing} style={styles.button}>
          <Text style={styles.text}>Retourner caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePicture} style={styles.button}>
          <Text style={styles.text}>Prendre photo</Text>
        </TouchableOpacity>
      </View>

      {/* Display the taken photo */}
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.photo} />
      )}

      {/* Display plant data if available */}
      {plantData && (
        <View style={styles.plantInfo}>
          {plantData.result?.classification?.suggestions?.length > 0 &&
          plantData.result.classification.suggestions[0].probability > 0.45 ? (
            <>
              <Text style={styles.plantName}>
                Nom: {plantData.result.classification.suggestions[0].name}
              </Text>
              <Text>
                Confiance: {Math.round(plantData.result.classification.suggestions[0].probability * 100)}%
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.plantName}>Plante: non-reconnue</Text>
              <Text style={styles.plantName}>Confiance: n/a</Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,  // Allows ScrollView to expand to cover the screen
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20, // Add padding if necessary
  },
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { width: 300, height: 300 }, // Adjust size to properly display the camera
  controls: { flexDirection: "row", justifyContent: "space-around", width: "100%", padding: 20 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5 },
  text: { fontSize: 18, color: "white" },
  photo: {
    marginTop: 20, // Small space between the camera and the image
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  plantInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  plantName: {
    fontWeight: "bold",
    fontSize: 16,
  },
});