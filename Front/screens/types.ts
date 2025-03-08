import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    AppNavigator: undefined;
    BaseScreen: undefined;
    Historique: undefined;

};


export type AppNavigationProp = StackNavigationProp<RootStackParamList, 'AppNavigator'>;