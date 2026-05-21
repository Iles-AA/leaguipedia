<?php
include 'header.php'; 
include 'connexion.php';

if (isset($_SESSION['user_id'])) {
    echo "<script>window.location.href='profile.php';</script>";
    exit;
}

$login_error = '';
$register_error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. CONNEXION
    if (isset($_POST['action']) && $_POST['action'] === 'login') {
        $email = trim($_POST['login_email']);
        $password = $_POST['login_password'];

        $req = $bdd->prepare('SELECT * FROM users WHERE email = ?');
        $req->execute([$email]);
        $user = $req->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            echo "<script>window.location.href='profile.php';</script>";
            exit;
        } else {
            $login_error = "Adresse e-mail ou mot de passe incorrect.";
        }
    }

    // 2. INSCRIPTION
    if (isset($_POST['action']) && $_POST['action'] === 'register') {
        $username = trim($_POST['reg_username']);
        $email = trim($_POST['reg_email']);
        $password = $_POST['reg_password'];
        $confirm = $_POST['reg_confirm'];

        if ($password !== $confirm) {
            $register_error = "Les mots de passe ne correspondent pas.";
        } else {
            $check = $bdd->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
            $check->execute([$email, $username]);
            
            if ($check->fetch()) {
                $register_error = "Cet e-mail ou ce nom d'invocateur est déjà utilisé.";
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $insert = $bdd->prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
                if ($insert->execute([$username, $email, $hash])) {
                    $_SESSION['user_id'] = $bdd->lastInsertId();
                    echo "<script>window.location.href='profile.php';</script>";
                    exit;
                }
            }
        }
    }
}
?>

<main class="auth-main">
    <div class="auth-card">
        
        <div class="auth-tabs">
            <button class="tab-btn active" data-tab="login">Connexion</button>
            <button class="tab-btn" data-tab="register">Inscription</button>
        </div>

        <div class="tab-pane active" id="tab-login">
            <h2 class="auth-title">Bon retour, <span class="gold">Invocateur</span></h2>
            
            <?php if(!empty($login_error)): ?>
                <div style="color: #e84057; text-align: center; margin-bottom: 15px;"><?php echo $login_error; ?></div>
            <?php endif; ?>

            <form method="POST" action="auth.php">
                <input type="hidden" name="action" value="login">
                
                <div class="form-group">
                    <label for="login-email">Adresse e-mail</label>
                    <input type="email" name="login_email" id="login-email" placeholder="ton@email.com" autocomplete="email" required>
                    <span class="field-error" id="login-email-err"></span>
                </div>
                
                <div class="form-group">
                    <label for="login-password">Mot de passe</label>
                    <div class="input-wrap">
                        <input type="password" name="login_password" id="login-password" placeholder="••••••••" autocomplete="current-password" required>
                        <button class="toggle-pw" data-target="login-password" type="button">👁</button>
                    </div>
                    <span class="field-error" id="login-password-err"></span>
                </div>
                
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="remember-me"> Se souvenir de moi
                    </label>
                    <a href="#" class="forgot-link">Mot de passe oublié ?</a>
                </div>
                
                <button type="submit" class="btn-auth" id="btn-login">SE CONNECTER</button>
                <div class="auth-feedback" id="login-feedback"></div>
            </form>
        </div>

        <div class="tab-pane" id="tab-register">
            <h2 class="auth-title">Rejoins la <span class="gold">Faille</span></h2>
            
            <?php if(!empty($register_error)): ?>
                <div style="color: #e84057; text-align: center; margin-bottom: 15px;"><?php echo $register_error; ?></div>
            <?php endif; ?>

            <form method="POST" action="auth.php">
                <input type="hidden" name="action" value="register">
                
                <div class="form-group">
                    <label for="reg-username">Nom d'invocateur</label>
                    <input type="text" name="reg_username" id="reg-username" placeholder="MonPseudo123" maxlength="20" required>
                    <span class="field-error" id="reg-username-err"></span>
                </div>
                
                <div class="form-group">
                    <label for="reg-email">Adresse e-mail</label>
                    <input type="email" name="reg_email" id="reg-email" placeholder="ton@email.com" autocomplete="email" required>
                    <span class="field-error" id="reg-email-err"></span>
                </div>
                
                <div class="form-group">
                    <label for="reg-password">Mot de passe</label>
                    <div class="input-wrap">
                        <input type="password" name="reg_password" id="reg-password" placeholder="••••••••" autocomplete="new-password" required>
                        <button class="toggle-pw" data-target="reg-password" type="button">👁</button>
                    </div>
                    <span class="field-error" id="reg-password-err"></span>
                    <ul class="pw-rules">
                        <li class="rule" id="rule-length">Au moins 8 caractères</li>
                        <li class="rule" id="rule-upper">Une majuscule</li>
                        <li class="rule" id="rule-lower">Une minuscule</li>
                        <li class="rule" id="rule-number">Un chiffre</li>
                        <li class="rule" id="rule-special">Un caractère spécial (!@#$...)</li>
                    </ul>
                    <div class="pw-strength-bar">
                        <div class="pw-strength-fill" id="pw-strength-fill"></div>
                    </div>
                    <span class="pw-strength-label" id="pw-strength-label"></span>
                </div>
                
                <div class="form-group">
                    <label for="reg-confirm">Confirmer le mot de passe</label>
                    <div class="input-wrap">
                        <input type="password" name="reg_confirm" id="reg-confirm" placeholder="••••••••" autocomplete="new-password" required>
                        <button class="toggle-pw" data-target="reg-confirm" type="button">👁</button>
                    </div>
                    <span class="field-error" id="reg-confirm-err"></span>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="reg-terms" required>
                        J'accepte les <a href="#" class="gold">conditions d'utilisation</a>
                    </label>
                    <span class="field-error" id="reg-terms-err"></span>
                </div>
                
                <button type="submit" class="btn-auth" id="btn-register">CRÉER MON COMPTE</button>
                <div class="auth-feedback" id="register-feedback"></div>
            </form>
        </div>
        
    </div>
</main>

<script src="JS/api.js"></script>
<script src="JS/auth.js"></script>

<?php include 'footer.php'; ?>