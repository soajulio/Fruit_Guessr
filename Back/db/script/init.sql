DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR NOT NULL
);

INSERT INTO users (username, password, email) VALUES ('admin', 'scrypt:32768:8:1$6xL58chXNfRQZm7B$3ae7d35760aa403b98d6d17a9182e8c0bcce8dc841ebba023eb1d1ff8084e758b77e9c101f366ba95cbd95feeb05587d047630c339143ecb519e7bff52f59da6', 'admin@example.com'); 
INSERT INTO users (username, password, email) VALUES ('Utilisateur Inconnu', 'scrypt:32768:8:1$gAgeRy9nR8yIQr9F$419d497b975f9ccc009b0de326305e6e56e94413f2ca5c0163ca78cc4a71efc96c0ce766215764d0d4d1f70db548444d8f13892841edf0b23266f0d277b09557', '-'); 

DROP TABLE IF EXISTS historique;

DROP TABLE IF EXISTS historique;

CREATE TABLE historique (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plante_nom TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    prediction_score REAL,
    image BYTEA,
    url TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);