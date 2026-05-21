<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
if (!isset($_SESSION['user_id'])) { header('Location: auth.php'); exit; }

include 'header.php'; 
include 'connexion.php';
$userId = $_SESSION['user_id'];

// Traitement des données
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_general') {
    $req = $bdd->prepare('UPDATE users SET username = ?, email = ?, rank = ?, role = ?, bio = ? WHERE id = ?');
    $req->execute([$_POST['username'], $_POST['email'], $_POST['rank'], $_POST['role'], $_POST['bio'], $userId]);
}

$query = $bdd->prepare('SELECT * FROM users WHERE id = ?');
$query->execute([$userId]);
$user = $query->fetch();
$avatarUrl = !empty($user['avatar']) ? $user['avatar'] : 'CSS/default-avatar.png';
?>

<main class="profile-main">
    <div class="profile-banner">
        <div class="profile-banner-bg" id="banner-bg"></div>
        <div class="profile-identity">
            <img src="<?php echo $avatarUrl; ?>" alt="Avatar" class="avatar-img">
            <div class="profile-info">
                <h1><?php echo htmlspecialchars($user['username']); ?></h1>
            </div>
        </div>
    </div>

    <div class="profile-body">
        <aside class="profile-sidebar">
            <button class="sidebar-btn active" data-section="general">Informations</button>
            <button class="sidebar-btn" data-section="password">Mot de passe</button>
            <button class="sidebar-btn" data-section="appearance">Apparence</button>
            <button class="sidebar-btn" data-section="posts">Publications</button>
            <a href="logout.php" class="sidebar-btn danger">Déconnexion</a>
        </aside>

        <div class="profile-content">
            <section class="profile-section active" id="section-general">
                <h2 class="section-title">Informations générales</h2>
                <form method="POST" action="profile.php">
                    <input type="hidden" name="action" value="save_general">
                    <div class="form-group"><label>Nom</label><input type="text" name="username" value="<?php echo htmlspecialchars($user['username']); ?>"></div>
                    <div class="form-group"><label>Email</label><input type="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>"></div>
                    <div class="form-group"><label>Rang</label><select name="rank">
                        <option value="iron" <?php if($user['rank']=='iron') echo 'selected'; ?>>Fer</option>
                        <option value="diamond" <?php if($user['rank']=='diamond') echo 'selected'; ?>>Diamant</option>
                    </select></div>
                    <div class="form-group"><label>Bio</label><textarea name="bio"><?php echo htmlspecialchars($user['bio'] ?? ''); ?></textarea></div>
                    <button type="submit" class="btn-auth">SAUVEGARDER</button>
                </form>
            </section>

            <section class="profile-section" id="section-posts" style="display:none;">
                <h2 class="section-title">Mes Publications</h2>
                <?php
                $req = $bdd->prepare("SELECT * FROM user_tierlists WHERE user_id = ? ORDER BY created_at DESC");
                $req->execute([$userId]);
                if($req->rowCount() > 0) {
                    while($tl = $req->fetch()) {
                        echo "<div class='tl-card' style='border:1px solid #c8aa6e; padding:15px; margin-bottom:10px;'>
                                <h3>" . htmlspecialchars($tl['title']) . "</h3>
                                <a href='view_tierlist.php?id=" . $tl['id'] . "' class='btn-auth'>Voir la Tierlist</a>
                              </div>";
                    }
                } else {
                    echo "<p>Aucune publication.</p>";
                }
                ?>
            </section>
        </div>
    </div>
</main>


<?php include 'footer.php'; ?>