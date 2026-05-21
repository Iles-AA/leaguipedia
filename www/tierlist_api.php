<?php

session_start();
include __DIR__ . '/connexion.php';

/** @var PDO $bdd */

header('Content-Type: application/json; charset=utf-8');

// rep JSON
function respond(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Auth obligatoire
if (!isset($_SESSION['user_id'])) {
    respond(401, ['error' => 'Non connecté.']);
}

$userId = (int) $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

if ($method === 'GET' && $id === null) {
    $req = $bdd->prepare('SELECT id, title, layout_json, created_at FROM user_tierlists WHERE user_id = ? ORDER BY created_at DESC');
    $req->execute([$userId]);
    $rows = $req->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['layout'] = json_decode($row['layout_json'], true);
        unset($row['layout_json']);
    }

    respond(200, ['tierlists' => $rows]);
}

if ($method === 'GET' && $id) {
    $req = $bdd->prepare('SELECT id, user_id, title, layout_json, created_at FROM user_tierlists WHERE id = ?');
    $req->execute([$id]);
    $row = $req->fetch(PDO::FETCH_ASSOC);

    if (!$row) respond(404, ['error' => 'Tierlist introuvable.']);

    // Seul le propriétaire peut lire sa tierlist (à adapter si public)
    if ((int)$row['user_id'] !== $userId) respond(403, ['error' => 'Accès refusé.']);

    $row['layout'] = json_decode($row['layout_json'], true);
    unset($row['layout_json']);
    unset($row['user_id']);

    respond(200, ['tierlist' => $row]);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $title  = trim($body['title'] ?? '');
    $layout = $body['layout'] ?? null;

    if (!$title)  respond(400, ['error' => 'Titre requis.']);
    if (!$layout) respond(400, ['error' => 'Layout requis.']);
    if (strlen($title) > 100) respond(400, ['error' => 'Titre trop long (max 100).']);

    $validTiers = ['S', 'A', 'B', 'C', 'D'];
    foreach ($layout as $tier => $champs) {
        if (!in_array($tier, $validTiers)) respond(400, ['error' => "Tier invalide : $tier"]);
        if (!is_array($champs))           respond(400, ['error' => "Format invalide pour le tier $tier"]);
    }

    $req = $bdd->prepare('INSERT INTO user_tierlists (user_id, title, layout_json) VALUES (?, ?, ?)');
    $req->execute([$userId, $title, json_encode($layout)]);
    $newId = (int) $bdd->lastInsertId();

    respond(201, ['message' => 'Tierlist créée.', 'id' => $newId]);
}

if ($method === 'PUT' && $id) {
    // Vérif propriété
    $req = $bdd->prepare('SELECT user_id FROM user_tierlists WHERE id = ?');
    $req->execute([$id]);
    $row = $req->fetch(PDO::FETCH_ASSOC);

    if (!$row)                            respond(404, ['error' => 'Tierlist introuvable.']);
    if ((int)$row['user_id'] !== $userId) respond(403, ['error' => 'Accès refusé.']);

    $body   = json_decode(file_get_contents('php://input'), true);
    $title  = isset($body['title'])  ? trim($body['title'])  : null;
    $layout = isset($body['layout']) ? $body['layout']       : null;

    if ($title !== null && strlen($title) > 100) respond(400, ['error' => 'Titre trop long.']);
    if ($title !== null && !$title)              respond(400, ['error' => 'Titre vide.']);

    $sets   = [];
    $params = [];

    if ($title !== null)  { $sets[] = 'title = ?';       $params[] = $title; }
    if ($layout !== null) { $sets[] = 'layout_json = ?'; $params[] = json_encode($layout); }

    if (empty($sets)) respond(400, ['error' => 'Rien à modifier.']);

    $params[] = $id;
    $req = $bdd->prepare('UPDATE user_tierlists SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $req->execute($params);

    respond(200, ['message' => 'Tierlist mise à jour.']);
}

if ($method === 'DELETE' && $id) {
    $req = $bdd->prepare('SELECT user_id FROM user_tierlists WHERE id = ?');
    $req->execute([$id]);
    $row = $req->fetch(PDO::FETCH_ASSOC);

    if (!$row)                            respond(404, ['error' => 'Tierlist introuvable.']);
    if ((int)$row['user_id'] !== $userId) respond(403, ['error' => 'Accès refusé.']);

    $bdd->prepare('DELETE FROM user_tierlists WHERE id = ?')->execute([$id]);

    respond(200, ['message' => 'Tierlist supprimée.']);
}

respond(405, ['error' => 'Méthode non autorisée.']);
