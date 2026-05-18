

const DD = 'https://ddragon.leagueoflegends.com';
let allChampions  = [];
let laneMap       = {};   
let currentLane   = 'all';
let currentSearch = '';
let patchVersion  = '';

const LANE_LABELS = { top: 'Top Lane', jungle: 'Jungle', mid: 'Mid Lane', adc: 'ADC', support: 'Support' };

async function init() {
    try {
        const [lanesData, versions] = await Promise.all([
            LP.Champions.getLanes(),
            fetch(`${DD}/api/versions.json`).then(r => r.json())
        ]);

        // Construire la map { championId -> [lanes] }
        laneMap = {};
        lanesData.forEach(({ champion_id, lane }) => {
            if (!laneMap[champion_id]) laneMap[champion_id] = [];
            laneMap[champion_id].push(lane);
        });

        patchVersion = versions[0];
        const data = await fetch(`${DD}/cdn/${patchVersion}/data/fr_FR/champion.json`).then(r => r.json());
        allChampions = Object.values(data.data).map(c => ({
            id:         c.id,
            name:       c.name,
            title:      c.title,
            difficulty: c.info.difficulty,
            img:        `${DD}/cdn/img/champion/splash/${c.id}_0.jpg`
        })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

        render();
    } catch (e) {
        document.getElementById('champions-grid').innerHTML =
            `<div style="grid-column:1/-1;text-align:center;padding:80px;color:#a09b8c">
                <p style="color:#c8aa6e;font-size:1.1rem;letter-spacing:2px;margin-bottom:10px">ERREUR DE CHARGEMENT</p>
                <p>${e.message}</p>
            </div>`;
    }
}

function render() {
    const list = allChampions.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(currentSearch) ||
                            c.title.toLowerCase().includes(currentSearch);
        const lanes       = laneMap[c.id] || [];
        const matchLane   = currentLane === 'all' || lanes.includes(currentLane);
        return matchSearch && matchLane;
    });

    const count = list.length;
    document.getElementById('count-display').textContent = `${count} champion${count > 1 ? 's' : ''}`;

    document.getElementById('champions-grid').innerHTML = count === 0
        ? `<div style="grid-column:1/-1;text-align:center;padding:80px;color:#a09b8c;letter-spacing:2px;text-transform:uppercase">Aucun champion trouvé</div>`
        : list.map(c => {
            const lanes    = laneMap[c.id] || [];
            const badges   = lanes.map(l => `<span class="tag-badge">${LANE_LABELS[l] || l}</span>`).join('');
            const diffLvl  = Math.round((c.difficulty / 10) * 3);
            const dots     = [1,2,3].map(i => `<div class="diff-dot${i <= diffLvl ? ' filled' : ''}"></div>`).join('');
            return `
                <a href="detail.html?id=${c.id}&v=${patchVersion}" class="champion-link">
                    <article class="champion">
                        <img src="${c.img}" alt="${c.name}" loading="lazy">
                        <h2>${c.name}</h2>
                        <p>${c.title}</p>
                        <div class="champion-tags">${badges}</div>
                        <div class="champion-difficulty">${dots}</div>
                    </article>
                </a>`;
        }).join('');
}

document.getElementById('search-bar').addEventListener('input', e => {
    currentSearch = e.target.value.toLowerCase().trim();
    render();
});

document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLane = btn.dataset.lane;
        render();
    });
});

init();
