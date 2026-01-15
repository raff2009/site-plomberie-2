<?php
// ============================================
// CONFIGURATION - PLOMBERIE EXPERT
// ============================================
// À MODIFIER avec vos vrais identifiants IONOS

// === BASE DE DONNÉES ===
// Vous trouverez ces infos dans votre panel IONOS > Base de données
define('DB_HOST', 'db12345678.hosting-data.io');  // Serveur MySQL IONOS
define('DB_NAME', 'dbs12345678');                  // Nom de la base
define('DB_USER', 'dbu12345678');                  // Utilisateur
define('DB_PASS', 'votre_mot_de_passe_bdd');       // Mot de passe BDD

// === EMAIL ===
// Email qui recevra les notifications de formulaire
define('ADMIN_EMAIL', 'Contact@croixroussegaz.fr');
define('SITE_NAME', 'Plomberie Expert Lyon');

// === ADMIN ===
// Mot de passe pour accéder au terminal admin
define('ADMIN_PASSWORD', 'plombier2025');

// === NE PAS MODIFIER EN DESSOUS ===

// Connexion à la base de données
function getDB() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Erreur de connexion à la base de données']));
    }
}

// Créer la table si elle n'existe pas
function initDB() {
    $pdo = getDB();
    $sql = "CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        tel VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        ville VARCHAR(255),
        urgence VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
}

// Headers CORS pour les requêtes AJAX
function setCorsHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
?>