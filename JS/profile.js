
if (!LP.Session.isLoggedIn()) window.location.href = 'auth.html';

const DD = 'https://ddragon.leagueoflegends.com';
let currentUser = null;


async function init() {
    try {
        currentUser = await LP.Users.getProfile();
        // Les champions pour la bannière viennent de la BDD
        const lanes = await LP.Champions.getLanes();
        // On extrait les champions uniques pour le picker
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
    avatarEl.src   = currentUser.avatar ||
        `${DD}/cdn/img/champion/splash/${bannerChamp}_0.jpg`;

    document.getElementById('display-username').textContent = currentUser.username;
    document.getElementById('display-email').textContent    = currentUser.email;
    document.getElementById('display-since').textContent    = currentUser.createdAt
        ? 'Invocateur depuis ' + new Date(currentUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : '';

    document.getElementById('edit-username').value = currentUser.username || '';
    document.getElementById('edit-email').value    = currentUser.email    || '';
    document.getElementById('edit-rank').value     = currentUser.rank     || '';
    document.getElementById('edit-role').value     = currentUser.role     || '';
    document.getElementById('edit-bio').value      = currentUser.bio      || '';
    updateBioCount();

    if (currentUser.accentColor) {
        applyAccent(currentUser.accentColor);
        document.querySelectorAll('.color-swatch').forEach(s =>
            s.classList.toggle('active', s.dataset.color === currentUser.accentColor)
        );
    }
}

document.querySelectorAll('.sidebar-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('section-' + btn.dataset.section).classList.add('active');
    });
});

document.getElementById('avatar-edit-btn').addEventListener('click', () =>
    document.getElementById('avatar-input').click()
);

document.getElementById('avatar-input').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image trop lourde (max 2 Mo).'); return; }
    const reader = new FileReader();
    reader.onload = async e => {
        const data = e.target.result;
        document.getElementById('avatar-preview').src = data;
        await LP.Users.updateProfile({ avatar: data });
    };
    reader.readAsDataURL(file);
});

function updateBioCount() {
    document.getElementById('bio-count').textContent =
        `${document.getElementById('edit-bio').value.length} / 200`;
}
document.getElementById('edit-bio').addEventListener('input', updateBioCount);

document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        input.type  = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
});

const P_RULES = {
    'p-rule-length':  pw => pw.length >= 8,
    'p-rule-upper':   pw => /[A-Z]/.test(pw),
    'p-rule-lower':   pw => /[a-z]/.test(pw),
    'p-rule-number':  pw => /[0-9]/.test(pw),
    'p-rule-special': pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
};

document.getElementById('pw-new').addEventListener('input', function () {
    const pw = this.value;
    let score = 0;
    for (const [id, test] of Object.entries(P_RULES)) {
        const ok = test(pw); document.getElementById(id).classList.toggle('ok', ok); if (ok) score++;
    }
    const colors = ['transparent','#e84057','#e84057','#f0a30a','#5a8a3c','#1ea75a'];
    const labels = ['','Très faible','Faible','Moyen','Fort','Très fort'];
    const fill  = document.getElementById('p-pw-fill');
    const label = document.getElementById('p-pw-label');
    fill.style.width      = pw.length ? (score / 5 * 100) + '%' : '0%';
    fill.style.background = colors[pw.length ? score : 0];
    label.textContent     = labels[pw.length ? score : 0];
    label.style.color     = colors[pw.length ? score : 0];
});

function showErr(id, msg)  { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearErr(id)      { const el = document.getElementById(id); if (el) el.textContent = ''; }
function setFeedback(id, msg, type) {
    const el = document.getElementById(id);
    el.textContent = msg; el.className = 'auth-feedback ' + type;
    setTimeout(() => { el.textContent = ''; el.className = 'auth-feedback'; }, 3000);
}
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function applyAccent(color) {
    document.querySelectorAll('.gold, .profile-username, .section-title')
        .forEach(el => el.style.color = color);
    document.querySelectorAll('.avatar-img').forEach(el => el.style.borderColor = color);
    document.querySelectorAll('.profile-banner').forEach(el => el.style.borderBottomColor = color);
    document.querySelectorAll('.btn-auth').forEach(el => el.style.background = color);
}

document.getElementById('btn-save-general').addEventListener('click', async () => {
    clearErr('edit-username-err'); clearErr('edit-email-err');
    const username = document.getElementById('edit-username').value.trim();
    const email    = document.getElementById('edit-email').value.trim();
    const rank     = document.getElementById('edit-rank').value;
    const role     = document.getElementById('edit-role').value;
    const bio      = document.getElementById('edit-bio').value.trim();
    let valid = true;

    if (!username || username.length < 3)        { showErr('edit-username-err', 'Minimum 3 caractères.'); valid = false; }
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) { showErr('edit-username-err', 'Lettres, chiffres et _ uniquement.'); valid = false; }
    if (!email || !isValidEmail(email))          { showErr('edit-email-err', 'E-mail invalide.'); valid = false; }
    if (!valid) return;

    try {
        await LP.Users.updateProfile({ username, email, rank, role, bio });
        document.getElementById('display-username').textContent = username;
        document.getElementById('display-email').textContent    = email;
        setFeedback('feedback-general', 'Profil mis à jour !', 'success');
    } catch (e) {
        setFeedback('feedback-general', e.message, 'error');
    }
});


document.getElementById('btn-save-password').addEventListener('click', async () => {
    clearErr('pw-current-err'); clearErr('pw-new-err'); clearErr('pw-confirm-err');
    const current = document.getElementById('pw-current').value;
    const newPw   = document.getElementById('pw-new').value;
    const confirm = document.getElementById('pw-confirm').value;
    let valid = true;

    if (!current) { showErr('pw-current-err', 'Requis.'); valid = false; }
    if (!newPw || !Object.values(P_RULES).every(t => t(newPw))) { showErr('pw-new-err', 'Conditions non respectées.'); valid = false; }
    if (!confirm) { showErr('pw-confirm-err', 'Requis.'); valid = false; }
    else if (newPw !== confirm) { showErr('pw-confirm-err', 'Les mots de passe ne correspondent pas.'); valid = false; }
    if (!valid) return;

    try {
        await LP.Users.changePassword(current, newPw);
        ['pw-current','pw-new','pw-confirm'].forEach(id => document.getElementById(id).value = '');
        setFeedback('feedback-password', 'Mot de passe changé !', 'success');
    } catch (e) {
        setFeedback('feedback-password', e.message, 'error');
    }
});

function loadBannerPicker(champions) {
    const picker = document.getElementById('banner-picker');
    champions.forEach(champId => {
        const div = document.createElement('div');
        div.className = 'banner-option' + (currentUser.bannerChamp === champId ? ' selected' : '');
        div.style.backgroundImage = `url('${DD}/cdn/img/champion/splash/${champId}_0.jpg')`;
        div.title = champId;
        div.addEventListener('click', () => {
            document.querySelectorAll('.banner-option').forEach(b => b.classList.remove('selected'));
            div.classList.add('selected');
            document.getElementById('banner-bg').style.backgroundImage =
                `url('${DD}/cdn/img/champion/splash/${champId}_0.jpg')`;
            if (!currentUser.avatar) {
                document.getElementById('avatar-preview').src =
                    `${DD}/cdn/img/champion/splash/${champId}_0.jpg`;
            }
            currentUser.bannerChamp = champId;
        });
        picker.appendChild(div);
    });
}

document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        applyAccent(swatch.dataset.color);
        currentUser.accentColor = swatch.dataset.color;
    });
});

document.getElementById('btn-save-appearance').addEventListener('click', async () => {
    try {
        await LP.Users.updateProfile({
            bannerChamp: currentUser.bannerChamp,
            accentColor: currentUser.accentColor
        });
        setFeedback('feedback-appearance', 'Apparence sauvegardée !', 'success');
    } catch (e) {
        setFeedback('feedback-appearance', e.message, 'error');
    }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    if (confirm('Se déconnecter ?')) await LP.Auth.logout();
});

init();
