import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
import sys
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from flask import make_response
from dotenv import load_dotenv

app = Flask(__name__)
cors = CORS(app)

load_dotenv()

API_KEY = os.getenv('PLANT_ID_API_KEY')
API_URL = "https://plant.id/api/v3/identification"


def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT")
        )
        return conn
    except psycopg2.Error as e:
        print(f"Erreur lors de la connexion à la base de données: {e}")
        sys.exit(1)

@app.route('/')
def hello():
    return "Backend Flask opérationnel !"


@app.route('/check_credentials', methods=['POST'])
def check_credentials():
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Les champs 'username' et 'password' sont requis."}), 400

    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT id, password FROM users WHERE username = %s;', (username,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user and check_password_hash(user[1], password):
        response = make_response(jsonify({'message': 'Connexion réussie', 'user_id': user[0]}), 200)
        return response
    else:
        response = make_response(jsonify({'error': 'Nom d\'utilisateur ou mot de passe incorrect'}), 401)
        return response

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()

    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Les champs 'username', 'email' et 'password' sont requis."}), 400

    username = data['username']
    email = data['email']
    password = generate_password_hash(data['password'])

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT 1 FROM users WHERE username = %s OR email = %s;', (username, email))
        if cur.fetchone():
            cur.close()
            conn.close()
            return make_response(jsonify({"error": "Le nom d'utilisateur ou l'email existe déjà."}), 409)

        cur.execute('INSERT INTO users (username, email, password) VALUES (%s, %s, %s);',
                    (username, email, password))
        conn.commit()

        cur.close()
        conn.close()

        response = make_response(jsonify({"message": "Utilisateur ajouté avec succès"}), 201)
        return response

    except psycopg2.Error as e:
        conn.rollback()
        cur.close()
        conn.close()
        response = make_response(jsonify({"error": f"Erreur lors de l'ajout de l'utilisateur: {e}"}), 500)
        return response
    
@app.route('/add_historique', methods=['POST'])
def add_historique():
    data = request.get_json()

    # Vérification des champs requis
    if not data or 'plante_nom' not in data or 'latitude' not in data or 'longitude' not in data or 'prediction_score' not in data or 'image' not in data or 'user_id' not in data:
        return jsonify({"error": "Tous les champs sont requis : plante_nom, latitude, longitude, prediction_score, image, user_id"}), 400

    plante_nom = data['plante_nom']
    latitude = data['latitude']
    longitude = data['longitude']
    prediction_score = data['prediction_score']
    user_id = data['user_id']
    url = data.get('url', None)  # URL facultative

    # Conversion de l'image base64 en binaire
    image_base64 = data['image']
    try:
        image_data = base64.b64decode(image_base64)
    except Exception as e:
        return jsonify({"error": "Image en base64 invalide"}), 400

    # Connexion à la base de données
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO historique (user_id, plante_nom, latitude, longitude, prediction_score, image, url, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW());
        """, (user_id, plante_nom, latitude, longitude, prediction_score, psycopg2.Binary(image_data), url))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Donnée ajoutée à l'historique avec succès"}), 201
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Erreur lors de l'ajout à l'historique : {e}"}), 500


@app.route('/get_historique/<int:user_id>', methods=['GET'])
def get_historique(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        if user_id == 1:
            # Si user_id est 1, récupérer tout l'historique
            cur.execute("""
                SELECT id, plante_nom, latitude, longitude, prediction_score, encode(image, 'base64') AS image, url, timestamp
                FROM historique
                ORDER BY timestamp DESC;
            """)
        else:
            # Sinon, récupérer seulement l'historique de l'utilisateur spécifié
            cur.execute("""
                SELECT id, plante_nom, latitude, longitude, prediction_score, encode(image, 'base64') AS image, url, timestamp
                FROM historique
                WHERE user_id = %s
                ORDER BY timestamp DESC;
            """, (user_id,))

        rows = cur.fetchall()
        historique = []
        for row in rows:
            historique.append({
                "id": row[0],
                "plante_nom": row[1],
                "latitude": row[2],
                "longitude": row[3],
                "prediction_score": row[4],
                "image": row[5],  # Image en base64
                "url": row[6],
                "timestamp": row[7]
            })

        cur.close()
        conn.close()

        return jsonify(historique), 200
    except Exception as e:
        cur.close()
        conn.close()
        return jsonify({"error": f"Erreur lors de la récupération de l'historique : {e}"}), 500

    
@app.route("/identify_plant", methods=["POST"])
def identify_plant():
    try:
        data = request.get_json()

        # Vérification des champs requis
        if not data or "image" not in data or "latitude" not in data or "longitude" not in data:
            return jsonify({"error": "Les champs 'image', 'latitude' et 'longitude' sont requis"}), 400

        image_base64 = data["image"]
        latitude = data["latitude"]
        longitude = data["longitude"]

        # Envoyer à l'API Plant ID
        response = requests.post(
            API_URL,
            json={
                "images": [f"data:image/jpeg;base64,{image_base64}"],
                "latitude": latitude,
                "longitude": longitude,
                "similar_images": True
            },
            headers={
                "Content-Type": "application/json",
                "Api-Key": API_KEY
            },
            params={"language": "fr"}
        )

        if response.status_code not in [200, 201]:
            print(f"Erreur de l'API Plant ID : Code {response.status_code}, Réponse : {response.text}")
            return jsonify({"error": "Échec de l'identification de la plante"}), response.status_code

        result = response.json()
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'identification : {str(e)}"}), 500
    
@app.route('/delete_historique/<int:id>', methods=['DELETE'])
def delete_historique(id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM historique WHERE id = %s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Entrée supprimée avec succès"}), 200
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Erreur lors de la suppression : {e}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)