<?php 
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaguipedia</title>
    <link rel="stylesheet" href="CSS/index.css">
    <link rel="stylesheet" href="CSS/auth.css">
    <link rel="stylesheet" href="CSS/champions.css">
    <link rel="stylesheet" href="CSS/profile.css">
    <link rel="stylesheet" href="CSS/esport.css">
    <link rel="stylesheet" href="CSS/detail.css">
</head>
<body>
<header class="main-header">
    <div class="logo">LEAGUI<span class="gold">PEDIA</span></div>
    <nav>
        <ul class="nav-links">
            <li><a href="index.php">ACCUEIL</a></li>
            <li><a href="champions.php">CHAMPIONS</a></li>
            <li><a href="tierlist.php">TIERLIST</a></li>
            <li><a href="esport.php">E-SPORT</a></li>
            
            <li class="nav-profile-item">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="profile.php" class="nav-profile-link" id="nav-profile-btn">
                        <span class="nav-avatar" id="nav-avatar-wrap">
                            <img src="" alt="" class="nav-avatar-img" id="nav-avatar-img">
                            <span class="nav-avatar-placeholder" id="nav-avatar-placeholder">👤</span>
                        </span>
                        <span id="nav-profile-label">PROFIL</span>
                    </a>
                <?php else: ?>
                    <a href="auth.php" class="nav-profile-link">
                        <span class="nav-avatar">
                            <span class="nav-avatar-placeholder">🔒</span>
                        </span>
                        <span>CONNEXION</span>
                    </a>
                <?php endif; ?>
            </li>
        </ul>
    </nav>
</header>