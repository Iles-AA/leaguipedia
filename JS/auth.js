
if (LP.Session.isLoggedIn()) window.location.href = 'index.html';

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        clearAllErrors();
    });
});

document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        input.type  = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
});

const RULES = {
    'rule-length':  pw => pw.length >= 8,
    'rule-upper':   pw => /[A-Z]/.test(pw),
    'rule-lower':   pw => /[a-z]/.test(pw),
    'rule-number':  pw => /[0-9]/.test(pw),
    'rule-special': pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
};

const STRENGTH = [
    { label: '',            color: 'transparent' },
    { label: 'Très faible', color: '#e84057' },
    { label: 'Faible',      color: '#e84057' },
    { label: 'Moyen',       color: '#f0a30a' },
    { label: 'Fort',        color: '#5a8a3c' },
    { label: 'Très fort',   color: '#1ea75a' },
];

document.getElementById('reg-password').addEventListener('input', function () {
    const pw = this.value;
    let score = 0;
    for (const [id, test] of Object.entries(RULES)) {
        const ok = test(pw);
        document.getElementById(id).classList.toggle('ok', ok);
        if (ok) score++;
    }
    const lvl   = pw.length ? score : 0;
    const fill  = document.getElementById('pw-strength-fill');
    const label = document.getElementById('pw-strength-label');
    fill.style.width      = pw.length ? (score / 5 * 100) + '%' : '0%';
    fill.style.background = STRENGTH[lvl].color;
    label.textContent     = STRENGTH[lvl].label;
    label.style.color     = STRENGTH[lvl].color;
});

function showError(id, msg) {
    document.getElementById(id).textContent = msg;
    const input = document.getElementById(id.replace('-err', ''));
    if (input) input.classList.add('error');
}

function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('error', 'valid'));
    document.querySelectorAll('.auth-feedback').forEach(el => { el.textContent = ''; el.className = 'auth-feedback'; });
}

function setFeedback(id, msg, type) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.className   = 'auth-feedback ' + type;
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isPasswordValid(pw) { return Object.values(RULES).every(t => t(pw)); }

document.getElementById('btn-login').addEventListener('click', async () => {
    clearAllErrors();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;
    let valid = true;

    if (!email)                    { showError('login-email-err',    'L\'e-mail est requis.');       valid = false; }
    else if (!isValidEmail(email)) { showError('login-email-err',    'Format d\'e-mail invalide.');  valid = false; }
    if (!password)                 { showError('login-password-err', 'Le mot de passe est requis.'); valid = false; }
    if (!valid) return;

    try {
        const user = await LP.Auth.login(email, password, remember);
        setFeedback('login-feedback', `Bienvenue, ${user.username} !`, 'success');
        setTimeout(() => window.location.href = 'index.html', 1200);
    } catch (e) {
        setFeedback('login-feedback', e.message, 'error');
    }
});

document.getElementById('btn-register').addEventListener('click', async () => {
    clearAllErrors();
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;
    const terms    = document.getElementById('reg-terms').checked;
    let valid = true;

    if (!username || username.length < 3)        { showError('reg-username-err', 'Minimum 3 caractères.');                  valid = false; }
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) { showError('reg-username-err', 'Lettres, chiffres et _ uniquement.');      valid = false; }
    if (!email || !isValidEmail(email))          { showError('reg-email-err',    'E-mail invalide.');                        valid = false; }
    if (!password || !isPasswordValid(password)) { showError('reg-password-err', 'Conditions non respectées.');              valid = false; }
    if (!confirm)                                { showError('reg-confirm-err',  'Confirmez votre mot de passe.');           valid = false; }
    else if (password !== confirm)               { showError('reg-confirm-err',  'Les mots de passe ne correspondent pas.'); valid = false; }
    if (!terms)                                  { showError('reg-terms-err',    'Acceptez les conditions.');                valid = false; }
    if (!valid) return;

    try {
        await LP.Auth.register(username, email, password);
        setFeedback('register-feedback', 'Compte créé ! Connexion...', 'success');
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
            document.getElementById('login-email').value = email;
        }, 1200);
    } catch (e) {
        setFeedback('register-feedback', e.message, 'error');
    }
});
