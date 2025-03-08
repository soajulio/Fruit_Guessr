import { Text, View } from "react-native";
import { styles } from "../styles/styles";



const BaseScreen: React.FC = () => {


    return (
        <View style={styles.container}>
            <Text>Composant exemple</Text>
        </View>
    );
}

export default BaseScreen;