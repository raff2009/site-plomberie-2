<?php
// ============================================
// API ADMIN - PLOMBERIE EXPERT
// ============================================

require_once 'config.php';

setCorsHeaders();
initDB();

// Récupérer l'action demandée
$action = $_GET['action'] ?? '';
$password = $_GET['password'] ?? $_POST['password'] ?? '';

// Vérifier le mot de passe admin (sauf pour login)
if ($action !== 'login' && $password !== ADMIN_PASSWORD) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorisé']);
    exit();
}

$pdo = getDB();

switch ($action) {
    
    // === VÉRIFIER LE MOT DE PASSE ===
    case 'login':
        if ($password === ADMIN_PASSWORD) {
            echo json_encode(['success' => true, 'message' => 'Authentification réussie']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Mot de passe incorrect']);
        }
        break;
    
    // === LISTER TOUTES LES DEMANDES ===
    case 'list':
        $stmt = $pdo->query("SELECT * FROM contact_submissions ORDER BY date_created DESC");
        $submissions = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $submissions]);
        break;
    
    // === COMPTER LES DEMANDES ===
    case 'count':
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM contact_submissions");
        $total = $stmt->fetch()['total'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as urgences FROM contact_submissions WHERE urgence = 'urgence'");
        $urgences = $stmt->fetch()['urgences'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as unread FROM contact_submissions WHERE is_read = 0");
        $unread = $stmt->fetch()['unread'];
        
        echo json_encode([
            'success' => true,
            'total' => (int)$total,
            'urgences' => (int)$urgences,
            'unread' => (int)$unread
        ]);
        break;
    
    // === VOIR UNE DEMANDE ===
    case 'view':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requis']);
            exit();
        }
        
        $stmt = $pdo->prepare("SELECT * FROM contact_submissions WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $submission = $stmt->fetch();
        
        if (!$submission) {
            http_response_code(404);
            echo json_encode(['error' => 'Demande non trouvée']);
            exit();
        }
        
        // Marquer comme lu
        $pdo->prepare("UPDATE contact_submissions SET is_read = 1 WHERE id = :id")->execute([':id' => $id]);
        
        echo json_encode(['success' => true, 'data' => $submission]);
        break;
    
    // === SUPPRIMER UNE DEMANDE ===
    case 'delete':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requis']);
            exit();
        }
        
        $stmt = $pdo->prepare("DELETE FROM contact_submissions WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Demande supprimée']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Demande non trouvée']);
        }
        break;
    
    // === SUPPRIMER TOUTES LES DEMANDES ===
    case 'clear-all':
        $pdo->exec("DELETE FROM contact_submissions");
        echo json_encode(['success' => true, 'message' => 'Toutes les demandes ont été supprimées']);
        break;
    
    // === LISTER LES URGENCES ===
    case 'urgences':
        $stmt = $pdo->query("SELECT * FROM contact_submissions WHERE urgence = 'urgence' ORDER BY date_created DESC");
        $submissions = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $submissions]);
        break;
    
    // === RECHERCHER ===
    case 'search':
        $keyword = $_GET['keyword'] ?? '';
        if (!$keyword) {
            http_response_code(400);
            echo json_encode(['error' => 'Mot-clé requis']);
            exit();
        }
        
        $keyword = "%$keyword%";
        $stmt = $pdo->prepare("
            SELECT * FROM contact_submissions 
            WHERE nom LIKE :k1 OR email LIKE :k2 OR message LIKE :k3 OR ville LIKE :k4 OR tel LIKE :k5
            ORDER BY date_created DESC
        ");
        $stmt->execute([':k1' => $keyword, ':k2' => $keyword, ':k3' => $keyword, ':k4' => $keyword, ':k5' => $keyword]);
        $submissions = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $submissions]);
        break;
    
    // === STATISTIQUES ===
    case 'stats':
        $stats = [];
        
        // Total
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_submissions");
        $stats['total'] = (int)$stmt->fetch()['count'];
        
        // Par type
        $stmt = $pdo->query("SELECT urgence, COUNT(*) as count FROM contact_submissions GROUP BY urgence");
        $stats['by_type'] = $stmt->fetchAll();
        
        // Non lus
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_submissions WHERE is_read = 0");
        $stats['unread'] = (int)$stmt->fetch()['count'];
        
        // Dernière demande
        $stmt = $pdo->query("SELECT * FROM contact_submissions ORDER BY date_created DESC LIMIT 1");
        $stats['latest'] = $stmt->fetch();
        
        // Demandes aujourd'hui
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_submissions WHERE DATE(date_created) = CURDATE()");
        $stats['today'] = (int)$stmt->fetch()['count'];
        
        // Demandes cette semaine
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_submissions WHERE date_created >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $stats['this_week'] = (int)$stmt->fetch()['count'];
        
        echo json_encode(['success' => true, 'data' => $stats]);
        break;
    
    // === EXPORTER EN JSON ===
    case 'export':
        $stmt = $pdo->query("SELECT * FROM contact_submissions ORDER BY date_created DESC");
        $submissions = $stmt->fetchAll();
        
        header('Content-Disposition: attachment; filename="export_' . date('Y-m-d') . '.json"');
        echo json_encode($submissions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        break;
    
    // === MARQUER COMME LU ===
    case 'mark-read':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requis']);
            exit();
        }
        
        $stmt = $pdo->prepare("UPDATE contact_submissions SET is_read = 1 WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        echo json_encode(['success' => true, 'message' => 'Marqué comme lu']);
        break;
    
    // === ACTION INCONNUE ===
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Action non reconnue']);
        break;
}
?>