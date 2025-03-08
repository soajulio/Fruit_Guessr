# ANCLIN Ethan SOARES Julio SAE6
## Sujet Alternant - Partie Back-end

## Configuration du Projet

### Fichier `.env`

Créez un fichier `.env` à la racine du projet avec les variables d'environnement suivantes :

```plaintext
FLASK_ENV=development
POSTGRES_USER=utilisateur_bdd
POSTGRES_PASSWORD=mot_de_passe_bdd
POSTGRES_DB=nom_de_la_base_de_donnees
POSTGRES_HOST=db  # Nom du service défini dans le docker-compose.yml
POSTGRES_PORT=5432  # Port défini dans le docker-compose.yml
PLANT_ID_API_KEY=votre_api_key_plant_id
``` 

### Instructions pour l'API et lancer/initialiser la base de données

Notre API est définie dans le fichier `app.py`. Pour lancer l'API, utilisez la commande suivante :

```bash
docker compose up -d
```

*Note :*
- L'API est accessible sur le port **5000**. Ce port est fixe car il est codé en dur dans la partie Front pour les requêtes vers notre API.

- Pour recommencer l'initialisation de la base de données, supprimer le dossier *postgres-data*.