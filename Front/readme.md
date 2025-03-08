# ANCLIN Ethan SOARES Julio SAE6

## Sujet Alternant - Partie Front-end

## Configuration du Projet

### Fichier `.env`

Pas besoin d'un fichier `.env` à la racine du projet.

## Commandes d'installation pour lancer correctement le projet


#### installer les dépendances nécessaires
```bash
  npm install
```
#### Installer la carte pour l'historique
```bash
  npm install react-native-maps
```

## Instructions pour Lancer l'Application
### Installer Expo Go et Lancer le Serveur
1. **Télécharger Expo GO** :
   - **Android** : [Télécharger sur Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=fr&pli=1)
   - **iOS** : [Télécharger sur l'App Store](https://apps.apple.com/fr/app/expo-go/id982107779)

2. **Lancer le Serveur Expo** :
   - Ouvrez un terminal et exécutez la commande suivante :
     ```bash
     npx expo start
     ```

3. **Scanner le QR Code** :
   - Une fois le QR code affiché dans le terminal, scannez-le avec votre téléphone.
   - L'application Expo Go s'ouvrira automatiquement et lancera notre projet.


### Récupérer l'accès à notre api
1. **Ouvrir un Terminal sur l'Ordinateur** :
   - Exécutez la commande suivante pour obtenir votre adresse IP :
     ```bash
     ipconfig
     ```
   - Notez l'adresse IP sous *Carte réseau sans fil Wi-Fi* puis *Adresse IPv4*.

2. **Configurer l'Application pour se connecter à l'API** :
   - Ouvrez l'application Expo Go sur votre téléphone.
   - Si ce n'est pas déjà fais, entrer dans notre projet.
   - Naviguez vers les *Paramètres*.
   - Entrez manuellement l'adresse IP que vous avez récupérée.

## Visualiser l'historique
Pour visualiser l'historique :
- Naviguer dans l'onglet *Historique*.
- Cliquer sur "*Pas de compte ? Créer un compte*".
- Entrer un nom d'utilisateur, un mot de passe ainsi qu'un email.
- Ensuite, se reconnecter avec l'utilisateur crée.