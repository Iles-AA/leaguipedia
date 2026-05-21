if (!LP.Session.isLoggedIn()) window.location.href = 'auth.html';

const DD = 'https://ddragon.leagueoflegends.com';
let currentUser = null;

async function init() {
    try {
        currentUser = await LP.Users.getProfile();
        const lanes = await LP.Champions.getLanes();
        const bannerChamps = [...new Set(lanes.map(r => r.champion_id))].slice(0, 18);
        loadProfile();
        loadBannerPicker(bannerChamps);
    } catch (e) {
        window.location.href = 'auth.html';
    }
}

function loadProfile() {
    const bannerChamp = currentUser.bannerChamp || 'Ahri';
    document.getElementById('banner-bg').style.backgroundImage =
        `url('${DD}/cdn/img/champion/splash/${bannerChamp}_0.jpg')`;

    const avatarEl = document.getElementById('avatar-preview');
    avatarEl.src = currentUser.avatar || `${DD}/cdn/img/champion/splash/${bannerChamp}_0.jpg`;

    document.getElementById('display-username').textContent = currentUser.username;
    document.getElementById('display-email').textContent = currentUser.email;
    document.getElementById('display-since').textContent = currentUser.createdAt
        ? 'Invocateur depuis ' + new Date(currentUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : '';

    document.getElementById('edit-username').value = currentUser.username || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-rank').value = currentUser.rank || '';
    document.getElementById('edit-role').value = currentUser.role || '';
    document.getElementById('edit-bio').value = currentUser.bio || '';
    updateBioCount();

    if (currentUser.accentColor) {
        applyAccent(currentUser.accentColor);
        document.querySelectorAll('.color-swatch').forEach(s =>
            s.classList.toggle('active', s.dataset.color === currentUser.accentColor)
        );
    }
}
// nav onglets
document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // 1. Nettoyer les classes actives
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
        
        // 2. clear section
        document.querySelectorAll('.profile-section').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none'; // Force mask
        });

        // 3. Activer la cible
        btn.classList.add('active');
        const target = document.getElementById('section-' + btn.dataset.section);
        
        if (target) {
            target.classList.add('active');
            target.style.display = 'block'; // Force l'affichage
        }
        
        // 4. Charger les posts si nécessaire
        if (btn.dataset.section === 'posts') {
            loadUserPublications();
        }
    });
});

// load posts
async function loadUserPublications() {
    const container = document.getElementById('section-posts');
    try {
        const posts = await LP.Tierlists.getByUser(currentUser.id);
        let html = '<h2 class="section-title">Mes Publications</h2>';
        if (posts.length > 0) {
            posts.forEach(post => {
                html += `<div class="post-item" style="border:1px solid #c8aa6e; padding:15px; margin-bottom:10px;">
                            <h3>${post.title}</h3>
                            <a href="view_tierlist.html?id=${post.id}" class="btn-auth">Voir et commenter</a>
                         </div>`;
            });
        } else {
            html += '<p>Aucune publication pour le moment.</p>';
        }
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<h2 class="section-title">Mes Publications</h2><p>Erreur de chargement.</p>';
    }
}

// pp
document.getElementById('avatar-edit-btn').addEventListener('click', () => document.getElementById('avatar-input').click());
document.getElementById('avatar-input').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
        document.getElementById('avatar-preview').src = e.target.result;
        await LP.Users.updateProfile({ avatar: e.target.result });
    };
    reader.readAsDataURL(file);
});

// bio , mdp , accents
function updateBioCount() { document.getElementById('bio-count').textContent = `${document.getElementById('edit-bio').value.length} / 200`; }
document.getElementById('edit-bio').addEventListener('input', updateBioCount);

document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});

function applyAccent(color) {
    document.querySelectorAll('.profile-username, .section-title').forEach(el => el.style.color = color);
    document.querySelectorAll('.btn-auth').forEach(el => el.style.background = color);
}

// save and quit
document.getElementById('btn-save-general').addEventListener('click', async () => {
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;
    await LP.Users.updateProfile({ username, email });
    alert('Profil mis à jour !');
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    if (confirm('Se déconnecter ?')) await LP.Auth.logout();
});

init();