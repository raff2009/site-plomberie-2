<?php
// ============================================
// RÉCEPTION DES FORMULAIRES - PLOMBERIE EXPERT
// ============================================

require_once 'config.php';

setCorsHeaders();
initDB();

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

// Récupérer les données JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Si pas de JSON, essayer les données POST classiques
if (!$data) {
    $data = $_POST;
}

// Validation des champs requis
$required = ['nom', 'tel', 'email', 'message', 'urgence'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Le champ '$field' est requis"]);
        exit();
    }
}

// Nettoyer les données
$nom = htmlspecialchars(trim($data['nom']));
$tel = htmlspecialchars(trim($data['tel']));
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$ville = htmlspecialchars(trim($data['ville'] ?? ''));
$urgence = htmlspecialchars(trim($data['urgence']));
$message = htmlspecialchars(trim($data['message']));

// Valider l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalide']);
    exit();
}

try {
    $pdo = getDB();
    
    // Insérer dans la base de données
    $stmt = $pdo->prepare("
        INSERT INTO contact_submissions (nom, tel, email, ville, urgence, message)
        VALUES (:nom, :tel, :email, :ville, :urgence, :message)
    ");
    
    $stmt->execute([
        ':nom' => $nom,
        ':tel' => $tel,
        ':email' => $email,
        ':ville' => $ville,
        ':urgence' => $urgence,
        ':message' => $message
    ]);
    
    $insertId = $pdo->lastInsertId();
    
    // Envoyer l'email de notification
    $urgenceLabel = [
        'devis' => 'Demande de devis',
        'urgence' => '🚨 URGENCE 🚨',
        'rdv' => 'Prise de rendez-vous',
        'info' => 'Demande d\'information'
    ];
    
    $typeLabel = $urgenceLabel[$urgence] ?? $urgence;
    $isUrgent = ($urgence === 'urgence');
    
    $subject = $isUrgent 
        ? "🚨 URGENCE - Nouvelle demande de $nom"
        : "Nouvelle demande de contact - $nom";
    
    $emailBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: " . ($isUrgent ? '#ff4444' : '#ff6b35') . "; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #ff6b35; }
        .value { margin-top: 5px; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #ff6b35; margin-top: 10px; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .urgent-badge { background: #ff4444; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>" . SITE_NAME . "</h1>
            <p>Nouvelle demande de contact</p>
            " . ($isUrgent ? "<span class='urgent-badge'>URGENCE</span>" : "") . "
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Type de demande</div>
                <div class='value'>$typeLabel</div>
            </div>
            <div class='field'>
                <div class='label'>Nom</div>
                <div class='value'>$nom</div>
            </div>
            <div class='field'>
                <div class='label'>Téléphone</div>
                <div class='value'><a href='tel:$tel'>$tel</a></div>
            </div>
            <div class='field'>
                <div class='label'>Email</div>
                <div class='value'><a href='mailto:$email'>$email</a></div>
            </div>
            <div class='field'>
                <div class='label'>Ville</div>
                <div class='value'>" . ($ville ?: 'Non renseignée') . "</div>
            </div>
            <div class='field'>
                <div class='label'>Message</div>
                <div class='message-box'>$message</div>
            </div>
        </div>
        <div class='footer'>
            <p>Demande #$insertId - Reçue le " . date('d/m/Y à H:i') . "</p>
            <p>Connectez-vous au terminal admin pour gérer vos demandes.</p>
        </div>
    </div>
</body>
</html>
";

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: ' . SITE_NAME . ' <noreply@' . $_SERVER['HTTP_HOST'] . '>',
        'Reply-To: ' . $email,
        'X-Priority: ' . ($isUrgent ? '1' : '3')
    ];
    
    // Envoyer l'email
    $emailSent = mail(ADMIN_EMAIL, $subject, $emailBody, implode("\r\n", $headers));
    
    // Réponse succès
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande a été envoyée avec succès !',
        'id' => $insertId,
        'emailSent' => $emailSent
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l\'enregistrement']);
}
?>