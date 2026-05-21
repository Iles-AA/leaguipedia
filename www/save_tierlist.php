<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
include 'connexion.php';

// bloque acces si pas co
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Accès refusé']);
    exit;
}

$userId = $_SESSION['user_id'];

$title = "Tierlist de " . $_SESSION['username'];

try {
    $req = $bdd->prepare("INSERT INTO user_tierlists (user_id, title, created_at) VALUES (?, ?, NOW())");
    $success = $req->execute([$userId, $title]);

    if ($success) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'enregistrement en base de données']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>