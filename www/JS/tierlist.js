/**
 * Leaguipedia — tierlist.js
 * CRUD complet avec l'API tierlist.php
 */

const API = 'api/tierlist.php';
let editingId = null; // ID de la tierlist en cours d'édition

// =====================
//  SORTABLE — drag & drop
// =====================
document.querySelectorAll('.drop-zone').forEach(zone => {
    new Sortable(zone, {
        group:     'tierlist',
        animation: 150,
        ghostClass: 'sortable-ghost',
    });
});

// =====================
//  RECHERCHE DANS LE POOL
// =====================
document.getElementById('pool-search').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('#pool .champion-item').forEach(item => {
        item.style.display = item.dataset.name.toLowerCase().includes(q) ? '' : 'none';
    });
});

// =====================
//  LIRE MES TIERLISTS (READ)
// =====================
async function loadMyTierlists() {
    const list = document.getElementById('saved-tierlists-list');
    list.innerHTML = '<div class="tl-loading">Chargement...</div>';

    try {
        const res  = await fetch(API);
        const data = await res.json();

        if (!res.ok) { list.innerHTML = `<p class="tl-error">${data.error}</p>`; return; }

        const tls = data.tierlists;
        document.getElementById('tl-count').textContent = `${tls.length} tierlist${tls.length > 1 ? 's' : ''}`;

        if (tls.length === 0) {
            list.innerHTML = '<p class="tl-empty">Aucune tierlist sauvegardée. Crée-en une !</p>';
            return;
        }

        list.innerHTML = tls.map(tl => `
            <div class="tl-card" data-id="${tl.id}">
                <div class="tl-card-info">
                    <span class="tl-card-title">${escHtml(tl.title)}</span>
                    <span class="tl-card-date">${formatDate(tl.created_at)}</span>
                    <span class="tl-card-champs">${countChamps(tl.layout)} champions</span>
                </div>
                <div class="tl-card-actions">
                    <button class="btn-tl-load"  onclick="loadIntoEditor(${tl.id})">Charger</button>
                    <button class="btn-tl-delete" onclick="deleteTierlist(${tl.id})">Supprimer</button>
                </div>
            </div>
        `).join('');

    } catch (e) {
        list.innerHTML = `<p class="tl-error">Erreur réseau : ${e.message}</p>`;
    }
}

// =====================
//  CHARGER DANS L'ÉDITEUR (READ par ID)
// =====================
async function loadIntoEditor(id) {
    try {
        const res  = await fetch(`${API}?id=${id}`);
        const data = await res.json();
        if (!res.ok) { showFeedback(data.error, 'error'); return; }

        const tl = data.tierlist;
        editingId = tl.id;

        document.getElementById('tl-title').value = tl.title;

        // Remettre tous les champions dans le pool
        resetEditor(false);

        // Placer les champions dans les bons tiers
        for (const [tier, champs] of Object.entries(tl.layout)) {
            const zone = document.getElementById(`tier-${tier}`);
            if (!zone) continue;
            champs.forEach(champName => {
                const el = document.querySelector(`#pool .champion-item[data-name="${champName}"]`);
                if (el) zone.appendChild(el);
            });
        }

        showFeedback(`Tierlist "${tl.title}" chargée — modifie puis sauvegarde.`, 'success');
        document.getElementById('tierlist-editor').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        showFeedback('Erreur : ' + e.message, 'error');
    }
}

// =====================
//  SAUVEGARDER (CREATE ou UPDATE)
// =====================
document.getElementById('btn-save').addEventListener('click', async () => {
    const title  = document.getElementById('tl-title').value.trim();
    const layout = getLayout();

    if (!title) { showFeedback('Donne un titre à ta tierlist.', 'error'); return; }

    const totalPlaced = Object.values(layout).reduce((acc, arr) => acc + arr.length, 0);
    if (totalPlaced === 0) { showFeedback('Place au moins un champion dans un tier.', 'error'); return; }

    const body   = JSON.stringify({ title, layout });
    let res, data;

    try {
        if (editingId) {
            // UPDATE
            res  = await fetch(`${API}?id=${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
            data = await res.json();
        } else {
            // CREATE
            res  = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
            data = await res.json();
            if (res.ok) editingId = data.id;
        }

        if (!res.ok) { showFeedback(data.error, 'error'); return; }

        showFeedback(editingId ? 'Tierlist mise à jour !' : 'Tierlist sauvegardée !', 'success');
        loadMyTierlists();

    } catch (e) {
        showFeedback('Erreur réseau : ' + e.message, 'error');
    }
});

// =====================
//  SUPPRIMER (DELETE)
// =====================
async function deleteTierlist(id) {
    if (!confirm('Supprimer cette tierlist ?')) return;

    try {
        const res  = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) { showFeedback(data.error, 'error'); return; }

        // Si on était en train d'éditer cette tierlist, reset l'éditeur
        if (editingId === id) { editingId = null; resetEditor(true); }

        showFeedback('Tierlist supprimée.', 'success');
        loadMyTierlists();

    } catch (e) {
        showFeedback('Erreur : ' + e.message, 'error');
    }
}

// =====================
//  RÉINITIALISER L'ÉDITEUR
// =====================
document.getElementById('btn-reset-editor').addEventListener('click', () => {
    if (confirm('Remettre tous les champions dans le pool ?')) {
        resetEditor(true);
    }
});

function resetEditor(resetTitle) {
    // Remettre tous les champions dans le pool
    document.querySelectorAll('.drop-zone[data-tier] .champion-item').forEach(el => {
        document.getElementById('pool').appendChild(el);
    });
    if (resetTitle) {
        document.getElementById('tl-title').value = 'Ma Tierlist';
        editingId = null;
    }
}

// =====================
//  UTILS
// =====================
function getLayout() {
    const layout = {};
    document.querySelectorAll('.drop-zone[data-tier]').forEach(zone => {
        const tier   = zone.dataset.tier;
        const champs = [...zone.querySelectorAll('.champion-item')].map(el => el.dataset.name);
        if (champs.length > 0) layout[tier] = champs;
    });
    return layout;
}

function countChamps(layout) {
    return Object.values(layout || {}).reduce((acc, arr) => acc + arr.length, 0);
}

function showFeedback(msg, type) {
    const el = document.getElementById('feedback-tl');
    el.textContent = msg;
    el.className   = `tl-feedback ${type}`;
    setTimeout(() => { el.textContent = ''; el.className = 'tl-feedback'; }, 3500);
}

function formatDate(str) {
    return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// =====================
//  INIT
// =====================
loadMyTierlists();
