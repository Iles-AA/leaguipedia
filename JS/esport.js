

const ESPORT_KEY  = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const ESPORT_BASE = 'https://esports-api.lolesports.com/persisted/gw';
const ESPORT_HDR  = { 'x-api-key': ESPORT_KEY };

let currentStatus  = 'live';
let currentLeague  = 'all';
let allEvents      = [];
let refreshTimer   = null;
let leagueMap      = {};  
let leagueColorMap = {};   

const DEFAULT_COLORS = {
    LEC: '#0bc4e3', LCS: '#e84057', LCK: '#1ea75a',
    LPL: '#f0a30a', Worlds: '#c8aa6e', MSI: '#9b59b6'
};

async function init() {
    bindLeagueTabs();

    leagueColorMap = { ...DEFAULT_COLORS };

    try {
        const leagues = await LP.Leagues.getAll();
        leagues.forEach(l => {
            leagueMap[l.id]        = l;
            leagueColorMap[l.name] = l.color;
        });
    } catch {}

    loadEvents();
}

function bindLeagueTabs() {
    document.querySelectorAll('.league-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.league-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLeague = btn.dataset.league;
            loadEvents();
        });
    });
}

async function fetchEsport(endpoint, params = {}) {
    const url = new URL(`${ESPORT_BASE}/${endpoint}`);
    url.searchParams.set('hl', 'fr-FR');
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url.toString(), { headers: ESPORT_HDR });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function fetchLive() {
    const data = await fetchEsport('getLive');
    return data?.data?.schedule?.events || [];
}

async function fetchSchedule(leagueIds, pageToken = null) {
    const params = { leagueId: leagueIds.join(',') };
    if (pageToken) params.pageToken = pageToken;
    const data = await fetchEsport('getSchedule', params);
    return {
        events:    data?.data?.schedule?.events || [],
        prevToken: data?.data?.schedule?.pages?.older || null,
        nextToken: data?.data?.schedule?.pages?.newer || null,
    };
}

async function loadEvents() {
    showLoading();
    try {
        const leagueIds = currentLeague === 'all'
            ? ['98767991299243165','98767991302996019','98767991310872058','98767991314006698']
            : [currentLeague];

        if (currentStatus === 'completed') {
            const current  = await fetchSchedule(leagueIds);
            const prevToken = current.prevToken;
            const prev     = prevToken ? await fetchSchedule(leagueIds, prevToken) : { events: [] };

            const seen = new Set();
            allEvents  = [];
            for (const e of [...prev.events, ...current.events]) {
                if (e.type !== 'match') continue;
                const id = e.match?.id || e.id;
                if (!seen.has(id)) { seen.add(id); allEvents.push(e); }
            }
        } else {
            const [liveEvents, schedule] = await Promise.all([
                fetchLive(),
                fetchSchedule(leagueIds)
            ]);
            const seen = new Set();
            allEvents  = [];
            for (const e of [...liveEvents, ...schedule.events]) {
                if (e.type !== 'match') continue;
                const id = e.match?.id || e.id;
                if (!seen.has(id)) { seen.add(id); allEvents.push(e); }
            }
        }

        render();

        clearInterval(refreshTimer);
        if (currentStatus === 'live') refreshTimer = setInterval(loadEvents, 60000);

    } catch (e) {
        showError(e);
    }
}

function render() {
    const filtered = allEvents.filter(e => {
        if (currentStatus === 'live')      return e.state === 'inProgress';
        if (currentStatus === 'upcoming')  return e.state === 'unstarted';
        if (currentStatus === 'completed') return e.state === 'completed';
        return true;
    }).filter(e => currentLeague === 'all' || String(e.league?.id) === String(currentLeague));

    const content = document.getElementById('esport-content');
    if (!filtered.length) { content.innerHTML = renderEmpty(); return; }

    const grouped = {};
    for (const e of filtered) {
        const name = e.league?.name || 'Autre';
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(e);
    }

    content.innerHTML = Object.entries(grouped)
        .map(([league, events]) => renderGroup(league, events))
        .join('');
}

function renderGroup(leagueName, events) {
    const color = leagueColorMap[leagueName] || '#c8aa6e';
    return `
        <div class="match-group">
            <div class="list-category" style="border-left-color:${color}">
                ${leagueName}
                <span class="match-count">${events.length} match${events.length > 1 ? 's' : ''}</span>
            </div>
            ${events.map(renderMatch).join('')}
        </div>`;
}

function renderMatch(event) {
    const match  = event.match;
    const teams  = match?.teams || [];
    const t1     = teams[0] || {};
    const t2     = teams[1] || {};
    const bo     = match?.strategy?.count || 1;
    const isLive = event.state === 'inProgress';
    const isDone = event.state === 'completed';
    const w1     = t1.result?.outcome === 'win';
    const w2     = t2.result?.outcome === 'win';
    const s1     = t1.result?.gameWins ?? '';
    const s2     = t2.result?.gameWins ?? '';

    return `
        <div class="match-row ${isLive ? 'live' : ''} ${isDone ? 'finished' : ''}">
            ${isLive
                ? `<div class="match-time live-badge">LIVE</div>`
                : `<div class="match-time">${formatTime(event.startTime)}</div>`}
            <div class="match-team left ${w1 ? 'winner' : isDone ? 'loser' : ''}">
                <span class="team-name">${t1.code || t1.name || '?'}</span>
                ${t1.image ? `<img src="${t1.image}" alt="${t1.name}" class="team-logo" onerror="this.style.display='none'">` : '<div class="team-logo-placeholder"></div>'}
            </div>
            ${isDone || isLive
                ? `<div class="match-score">${s1} <span class="score-sep">—</span> ${s2}</div>`
                : `<div class="match-score vs">VS</div>`}
            <div class="match-team right ${w2 ? 'winner' : isDone ? 'loser' : ''}">
                ${t2.image ? `<img src="${t2.image}" alt="${t2.name}" class="team-logo" onerror="this.style.display='none'">` : '<div class="team-logo-placeholder"></div>'}
                <span class="team-name">${t2.code || t2.name || '?'}</span>
            </div>
            <div class="match-meta">
                <span class="match-bo">Bo${bo}</span>
                ${event.league?.name ? `<span class="match-league-badge">${event.league.name}</span>` : ''}
            </div>
        </div>`;
}

function renderEmpty() {
    const icons  = { live: '📡', upcoming: '📅', completed: '🏆' };
    const labels = { live: 'Aucun match en direct', upcoming: 'Aucun match à venir', completed: 'Aucun résultat disponible' };
    return `
        <div class="empty-state">
            <div class="empty-icon">${icons[currentStatus]}</div>
            <p>${labels[currentStatus]}</p>
            ${currentStatus === 'live' ? '<p class="empty-sub">Il n\'y a peut-être pas de matchs aujourd\'hui.</p>' : ''}
        </div>`;
}

function formatTime(iso) {
    if (!iso) return '—';
    const d   = new Date(iso);
    const now = new Date();
    const tom = new Date(now); tom.setDate(now.getDate() + 1);
    const t   = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return t;
    if (d.toDateString() === tom.toDateString()) return `Dem. ${t}`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' + t;
}

function showLoading() {
    document.getElementById('esport-content').innerHTML = `
        <div class="loading-screen">
            <div class="loading-spin"></div>
            <div class="loading-text">Chargement des matchs...</div>
        </div>`;
}

function showError(e) {
    document.getElementById('esport-content').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <p>Impossible de contacter l'API LoL Esports.</p>
            <p class="empty-sub">Si tu es en local (file://), le CORS bloque les appels. Lance le back-end Node.js.</p>
            <p class="empty-sub" style="font-size:0.7rem;color:#5c5b57">${e.message}</p>
            <button class="retry-btn" onclick="loadEvents()">Réessayer</button>
        </div>`;
}

document.querySelectorAll('.status-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.status-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatus = btn.dataset.status;
        clearInterval(refreshTimer);
        loadEvents();
    });
});

init();
