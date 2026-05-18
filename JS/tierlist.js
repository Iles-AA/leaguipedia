

const DD = 'https://ddragon.leagueoflegends.com';
const TIERS = ['S', 'A', 'B', 'C', 'D'];
const TIER_COLORS = { S:'#f0a30a', A:'#5a8a3c', B:'#0bc4e3', C:'#9b59b6', D:'#e84057' };

let allChampions = [];
let tierData     = {};   // { championId: tier }
let patchVersion = '';

async function init() {
    try {
        const versions = await fetch(`${DD}/api/versions.json`).then(r => r.json());
        patchVersion   = versions[0];
        const data     = await fetch(`${DD}/cdn/${patchVersion}/data/fr_FR/champion.json`).then(r => r.json());
        allChampions   = Object.values(data.data).map(c => ({
            id:   c.id,
            name: c.name,
            img:  `${DD}/cdn/${patchVersion}/img/champion/${c.image.full}`
        })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

        // Charger tierlist depuis BDD si connecté
        if (LP.Session.isLoggedIn()) {
            const rows = await LP.Tierlist.get();
            rows.forEach(r => { tierData[r.champion_id] = r.tier; });
        }

        render();
    } catch (e) {
        document.getElementById('tierlist-container').innerHTML =
            `<p style="text-align:center;color:#a09b8c;padding:60px">${e.message}</p>`;
    }
}

function render() {
    const container = document.getElementById('tierlist-container');
    const pool      = document.getElementById('champion-pool');

    container.innerHTML = TIERS.map(tier => `
        <div class="tier-row" data-tier="${tier}">
            <div class="tier-label" style="background:${TIER_COLORS[tier]}">${tier}</div>
            <div class="tier-slots" id="tier-${tier}">
                ${allChampions
                    .filter(c => tierData[c.id] === tier)
                    .map(c => champCard(c))
                    .join('')}
            </div>
        </div>
    `).join('');

    pool.innerHTML = allChampions
        .filter(c => !tierData[c.id])
        .map(c => champCard(c))
        .join('');

    initDragDrop();
}

function champCard(c) {
    return `
        <div class="champ-card" draggable="true" data-id="${c.id}" title="${c.name}">
            <img src="${c.img}" alt="${c.name}">
            <span class="champ-card-name">${c.name}</span>
        </div>`;
}

function initDragDrop() {
    let dragged = null;

    document.querySelectorAll('.champ-card').forEach(card => {
        card.addEventListener('dragstart', () => { dragged = card; card.classList.add('dragging'); });
        card.addEventListener('dragend',   () => { dragged = null; card.classList.remove('dragging'); });
    });

    const dropZones = [...document.querySelectorAll('.tier-slots'), document.getElementById('champion-pool')];
    dropZones.forEach(zone => {
        zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', async e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (!dragged) return;

            const champId  = dragged.dataset.id;
            const tierRow  = zone.closest('.tier-row');
            const newTier  = tierRow ? tierRow.dataset.tier : null;

            zone.appendChild(dragged);

            if (LP.Session.isLoggedIn()) {
                try {
                    if (newTier) {
                        await LP.Tierlist.set(champId, newTier);
                        tierData[champId] = newTier;
                    } else {
                        await LP.Tierlist.remove(champId);
                        delete tierData[champId];
                    }
                } catch {}
            } else {
                // Sans compte : juste en mémoire
                if (newTier) tierData[champId] = newTier;
                else delete tierData[champId];
            }
        });
    });
}

document.getElementById('btn-reset')?.addEventListener('click', async () => {
    if (!confirm('Remettre tous les champions dans le pool ?')) return;
    if (LP.Session.isLoggedIn()) {
        await Promise.all(Object.keys(tierData).map(id => LP.Tierlist.remove(id)));
    }
    tierData = {};
    render();
});

init();
