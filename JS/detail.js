/**
 * Leaguipedia — detail.js
 * Page de détail d'un champion — données via Riot Data Dragon
 * Favoris et tierlist sauvegardés en BDD via api.js
 */

const DD     = 'https://ddragon.leagueoflegends.com';
const params = new URLSearchParams(location.search);
const champId   = params.get('id');
const vParam    = params.get('v');

if (!champId) window.location.href = 'champions.html';

// =====================
//  INIT
// =====================
async function init() {
    try {
        const version = vParam || (await fetch(`${DD}/api/versions.json`).then(r => r.json()))[0];
        const data    = await fetch(`${DD}/cdn/${version}/data/fr_FR/champion/${champId}.json`).then(r => r.json());
        const champ   = data.data[champId];

        render(champ, version);

        // Charger favoris + tierlist si connecté
        if (LP.Session.isLoggedIn()) {
            loadUserData(champId);
        }
    } catch (e) {
        document.getElementById('app').innerHTML = `
            <div style="text-align:center;padding:80px;color:#a09b8c">
                <p style="color:#c8aa6e;font-size:1.1rem;letter-spacing:2px;margin-bottom:10px">CHAMPION INTROUVABLE</p>
                <p>${e.message}</p>
                <a href="champions.html" style="color:#c8aa6e;display:inline-block;margin-top:20px">← Retour</a>
            </div>`;
    }
}

// =====================
//  CHARGER FAVORIS & TIERLIST
// =====================
async function loadUserData(champId) {
    try {
        const [favs, tiers] = await Promise.all([
            LP.Favorites.get(),
            LP.Tierlist.get()
        ]);

        const isFav  = favs.some(f => f.champion_id === champId);
        const myTier = tiers.find(t => t.champion_id === champId);

        renderUserActions(champId, isFav, myTier?.tier || null);
    } catch {}
}

// =====================
//  ACTIONS UTILISATEUR (favori + tierlist)
// =====================
function renderUserActions(champId, isFav, currentTier) {
    const container = document.getElementById('user-actions');
    if (!container) return;

    container.innerHTML = `
        <button class="action-btn ${isFav ? 'active' : ''}" id="btn-fav">
            ${isFav ? '★ En favoris' : '☆ Ajouter aux favoris'}
        </button>
        <div class="tier-select-wrap">
            <label>Ma tier :</label>
            <select id="tier-select">
                <option value="">—</option>
                ${['S','A','B','C','D'].map(t =>
                    `<option value="${t}" ${currentTier === t ? 'selected' : ''}>${t}</option>`
                ).join('')}
            </select>
        </div>
    `;

    document.getElementById('btn-fav').addEventListener('click', async () => {
        const btn = document.getElementById('btn-fav');
        try {
            if (isFav) {
                await LP.Favorites.remove(champId);
                isFav = false;
                btn.textContent = '☆ Ajouter aux favoris';
                btn.classList.remove('active');
            } else {
                await LP.Favorites.add(champId);
                isFav = true;
                btn.textContent = '★ En favoris';
                btn.classList.add('active');
            }
        } catch {}
    });

    document.getElementById('tier-select').addEventListener('change', async function () {
        const tier = this.value;
        try {
            if (tier) await LP.Tierlist.set(champId, tier);
            else      await LP.Tierlist.remove(champId);
        } catch {}
    });
}

// =====================
//  RENDER PAGE
// =====================
function cleanDesc(text) {
    return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function render(c, version) {
    document.title = `${c.name} — Leaguipedia`;

    const splashUrl  = `${DD}/cdn/img/champion/splash/${c.id}_0.jpg`;
    const passiveIcon = `${DD}/cdn/${version}/img/passive/${c.passive.image.full}`;
    const spellKeys  = ['PASSIF','Q','W','E','R'];
    const spells     = [
        { key: 'PASSIF', name: c.passive.name, desc: c.passive.description, icon: passiveIcon },
        ...c.spells.map((s, i) => ({
            key:  spellKeys[i + 1],
            name: s.name,
            desc: cleanDesc(s.description),
            icon: `${DD}/cdn/${version}/img/spell/${s.image.full}`
        }))
    ];

    const maxStat = { hp:2000, mp:2000, movespeed:500, armor:100, spellblock:100, attackdamage:150, attackspeed:1.5, attackrange:800 };
    const STAT_LABELS = { hp:'PV', mp:'Mana', movespeed:'Vitesse', armor:'Armure', spellblock:'Rés. Mag.', attackdamage:'Attaque', attackspeed:'Vit. Attaque', attackrange:'Portée' };

    const statCards = [
        { label:'Points de vie',    val:c.stats.hp,           growth:`+${c.stats.hpperlevel}/niv.` },
        { label:'Mana',             val:c.stats.mp,           growth:`+${c.stats.mpperlevel}/niv.` },
        { label:'Vitesse dépl.',    val:c.stats.movespeed,    growth:'' },
        { label:'Attaque de base',  val:c.stats.attackdamage, growth:`+${c.stats.attackdamagelevel}/niv.` },
        { label:'Armure',           val:c.stats.armor,        growth:`+${c.stats.armorperlevel}/niv.` },
        { label:'Rés. Magique',     val:c.stats.spellblock,   growth:`+${c.stats.spellblocklevel}/niv.` },
    ].map(s => `
        <div class="stat-card">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value">${typeof s.val === 'number' && s.val % 1 !== 0 ? s.val.toFixed(3) : s.val}</div>
            ${s.growth ? `<div class="stat-growth">${s.growth}</div>` : ''}
        </div>`).join('');

    const statBars = Object.keys(maxStat).map(key => {
        const val = c.stats[key];
        const pct = Math.min(100, (val / maxStat[key]) * 100).toFixed(0);
        return `<div class="stat-bar-row">
            <div class="stat-bar-label">${STAT_LABELS[key]}</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
            <div class="stat-bar-num">${typeof val === 'number' && val % 1 !== 0 ? val.toFixed(3) : val}</div>
        </div>`;
    }).join('');

    const skinsHtml = c.skins.map((s, i) => `
        <div class="skin-card ${i === 0 ? 'default' : ''}">
            <img src="${DD}/cdn/img/champion/splash/${c.id}_${s.num}.jpg" alt="${s.name}" loading="lazy">
            <div class="skin-name">${i === 0 ? 'Défaut' : s.name}</div>
        </div>`).join('');

    const spellsHtml = spells.map(s => `
        <div class="spell-row">
            <img class="spell-icon" src="${s.icon}" alt="${s.name}">
            <div>
                <div class="spell-key">${s.key}</div>
                <div class="spell-name">${s.name}</div>
                <div class="spell-desc">${cleanDesc(s.desc)}</div>
            </div>
        </div>`).join('');

    document.getElementById('app').innerHTML = `
        <a class="back-link" href="champions.html">← Tous les champions</a>

        <div class="hero-banner">
            <img class="bg-splash" src="${splashUrl}" alt="${c.name}">
            <div class="hero-overlay"></div>
            <div class="hero-text">
                <h1>${c.name.toUpperCase()}</h1>
                <h3>${c.title}</h3>
                <div class="hero-tags">
                    ${c.tags.map(t => `<span class="hero-tag">${t}</span>`).join('')}
                </div>
            </div>
            <div class="patch-badge">Patch ${version}</div>
        </div>

        ${LP.Session.isLoggedIn() ? `<div class="user-actions" id="user-actions"></div>` : ''}

        <div class="tabs-nav">
            <button class="tab-btn active" data-tab="stats">Statistiques</button>
            <button class="tab-btn" data-tab="spells">Compétences</button>
            <button class="tab-btn" data-tab="lore">Histoire</button>
            <button class="tab-btn" data-tab="skins">Skins</button>
        </div>

        <div class="tab-pane active" id="tab-stats">
            <div class="stats-grid">${statCards}</div>
            <div style="margin-top:20px">${statBars}</div>
        </div>
        <div class="tab-pane" id="tab-spells">
            <div class="spells-list">${spellsHtml}</div>
        </div>
        <div class="tab-pane" id="tab-lore">
            <div class="lore-content">
                <div class="lore-divider"></div>
                <p>${c.lore}</p>
            </div>
        </div>
        <div class="tab-pane" id="tab-skins">
            <div class="skins-grid">${skinsHtml}</div>
        </div>
    `;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });
}

// =====================
//  LANCEMENT
// =====================
init();
