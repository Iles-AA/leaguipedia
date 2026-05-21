<?php include 'header.php'; ?>

<section class="hero">
    <div class="hero-content">
        <h1>BIENVENUE SUR <span class="gold">LEAGUIPEDIA</span></h1>
        <p>La base de données ultime pour les joueurs de League of Legends</p>
        <a href="champions.php" class="btn-main">VOIR LES CHAMPIONS</a>
    </div>
</section>

<section class="patch-note">
    <div class="patch-box">
        <h2>DERNIER PATCH</h2>
        <p>Voici les futurs changements qui arriveront dès la prochaine mise à jour :</p>
        <ul>
            <li>Buff de Heimerdinger (Dégâts des tourelles augmentés)</li>
            <li>Ajustement sur les runes de précision</li>
            <li>Nouveau skin pour Aurora : Sorcière Stellaire</li>
        </ul>
    </div>
</section>

<script src="JS/api.js"></script>
<script>
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
        .then(r => r.json())
        .then(versions => {
            document.querySelector('.patch-box h2').innerText = 'DERNIER PATCH : ' + versions[0];
        })
        .catch(() => {});
    (function () {
        const label       = document.getElementById('nav-profile-label');
        const avatarImg   = document.getElementById('nav-avatar-img');
        const placeholder = document.getElementById('nav-avatar-placeholder');

        if (window.LP && LP.Session.isLoggedIn()) {
            LP.Auth.me()
                .then(user => {
                    label.textContent = user.username.toUpperCase();
                    if (user.avatar) {
                        avatarImg.src             = user.avatar;
                        avatarImg.style.display   = 'block';
                        placeholder.style.display = 'none';
                    } else if (user.bannerChamp) {
                        avatarImg.src             = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${user.bannerChamp}_0.jpg`;
                        avatarImg.style.display   = 'block';
                        placeholder.style.display = 'none';
                    }
                })
                .catch(() => {});
        }
    })();
</script>

<?php include 'footer.php'; ?>