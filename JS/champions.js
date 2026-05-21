const DD = 'https://ddragon.leagueoflegends.com';
let allChampions  = [];
let laneMap       = {};
let currentLane   = 'all';
let currentSearch = '';
let patchVersion  = '';

const LANE_LABELS = { top:'Top Lane', jungle:'Jungle', mid:'Mid Lane', adc:'ADC', support:'Support' };

const LANES_FALLBACK = {
    top:     ['Aatrox','Akali','Ambessa','Camille','ChoGath','Darius','DrMundo','Fiora','Gangplank','Garen','Gnar','Gragas','Gwen','Illaoi','Irelia','Jax','Jayce','Kayle','KSante','Kennen','Kled','Malphite','Maokai','Mordekaiser','Nasus','Olaf','Ornn','Pantheon','Poppy','Quinn','Renekton','Riven','Rumble','Ryze','Sett','Shen','Singed','Sion','Teemo','Trundle','Tryndamere','Urgot','Vayne','Volibear','Warwick','Wukong','Yorick','Heimerdinger','Akshan','Cassiopeia','Lissandra','Smolder'],
    jungle:  ['Amumu','Belveth','Briar','Diana','Ekko','Elise','Evelynn','Fiddlesticks','Gragas','Graves','Hecarim','Ivern','JarvanIV','Karthus','Kayn','Khazix','Kindred','LeeSin','Lillia','MasterYi','Mordekaiser','Naafiri','Nidalee','Nocturne','Nunu','Olaf','Pantheon','Rammus','RekSai','Rengar','Sejuani','Shaco','Shyvana','Skarner','Taliyah','Trundle','Udyr','Vi','Viego','Volibear','Warwick','Wukong','XinZhao','Zac'],
    mid:     ['Ahri','Akali','Akshan','Anivia','Annie','AurelionSol','Aurora','Azir','Cassiopeia','Corki','Diana','Ekko','Fizz','Galio','Gragas','Heimerdinger','Hwei','Irelia','Jayce','Kassadin','Katarina','Leblanc','Lissandra','Lux','Malzahar','Neeko','Orianna','Pantheon','Qiyana','Ryze','Seraphine','Sylas','Syndra','Taliyah','Talon','TwistedFate','Veigar','Velkoz','Vex','Viktor','Vladimir','Xerath','Yasuo','Yone','Zed','Ziggs','Zoe'],
    adc:     ['Aphelios','Ashe','Caitlyn','Corki','Draven','Ezreal','Jhin','Jinx','Kaisa','Kalista','KogMaw','Lucian','MissFortune','Nilah','Quinn','Samira','Seraphine','Sivir','Smolder','Tristana','Twitch','Varus','Vayne','Xayah','Zeri','Mel'],
    support: ['Alistar','Bard','Blitzcrank','Brand','Braum','Galio','Heimerdinger','Janna','Karma','Leona','Lulu','Lux','Milio','Morgana','Nami','Nautilus','Neeko','Pyke','Rakan','Rell','Renata','Seraphine','Senna','Sona','Soraka','Swain','TahmKench','Taric','Thresh','Velkoz','Xerath','Yuumi','Zilean','Zyra','Mel']
};

function normName(name) {
    return name.toLowerCase().replace(/['\s\-\.]/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildLaneMapFromFallback() {
    laneMap = {};
    for (const [lane, champs] of Object.entries(LANES_FALLBACK)) {
        champs.forEach(id => {
            const key = normName(id);
            if (!laneMap[key]) laneMap[key] = [];
            laneMap[key].push(lane);
        });
    }
}

async function init() {
    try {

        try {
            const lanesData = await LP.Champions.getLanes();
            laneMap = {};
            lanesData.forEach(({ champion_id, lane }) => {
                const key = normName(champion_id);
                if (!laneMap[key]) laneMap[key] = [];
                laneMap[key].push(lane);
            });
        } catch {
            buildLaneMapFromFallback();
        }

        const versions = await fetch(`${DD}/api/versions.json`).then(r => r.json());
        patchVersion   = versions[0];
        const data     = await fetch(`${DD}/cdn/${patchVersion}/data/fr_FR/champion.json`).then(r => r.json());

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

function getLanes(champ) {
    return laneMap[normName(champ.id)] || laneMap[normName(champ.name)] || [];
}

function render() {
    const list = allChampions.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(currentSearch) ||
                            c.title.toLowerCase().includes(currentSearch);
        const lanes       = getLanes(c);
        const matchLane   = currentLane === 'all' || lanes.includes(currentLane);
        return matchSearch && matchLane;
    });

    const count = list.length;
    document.getElementById('count-display').textContent = `${count} champion${count > 1 ? 's' : ''}`;

    document.getElementById('champions-grid').innerHTML = count === 0
        ? `<div style="grid-column:1/-1;text-align:center;padding:80px;color:#a09b8c;letter-spacing:2px;text-transform:uppercase">Aucun champion trouvé</div>`
        : list.map(c => {
            const lanes   = getLanes(c);
            const badges  = lanes.map(l => `<span class="tag-badge">${LANE_LABELS[l] || l}</span>`).join('');
            const diffLvl = Math.round((c.difficulty / 10) * 3);
            const dots    = [1,2,3].map(i => `<div class="diff-dot${i <= diffLvl ? ' filled' : ''}"></div>`).join('');
            return `
                <a href="detail.php?id=${c.id}&v=${patchVersion}" class="champion-link">
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
