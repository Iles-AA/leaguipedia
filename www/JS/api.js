

const API_URL = 'http://localhost:3000/api';

const Session = {
    get()        { return localStorage.getItem('lp_token') || sessionStorage.getItem('lp_token'); },
    set(token, remember) {
        (remember ? localStorage : sessionStorage).setItem('lp_token', token);
    },
    clear()      { localStorage.removeItem('lp_token'); sessionStorage.removeItem('lp_token'); },
    isLoggedIn() { return !!this.get(); }
};

async function apiRequest(method, endpoint, body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = Session.get();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body)  opts.body = JSON.stringify(body);
    const res  = await fetch(`${API_URL}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data;
}

const Auth = {
    async register(username, email, password) {
        return apiRequest('POST', '/auth/register', { username, email, password });
    },
    async login(email, password, remember = false) {
        const data = await apiRequest('POST', '/auth/login', { email, password, remember });
        Session.set(data.token, remember);
        return data.user;
    },
    async logout() {
        try { await apiRequest('POST', '/auth/logout'); } catch {}
        Session.clear();
        window.location.href = 'auth.html';
    },
    async me() {
        return apiRequest('GET', '/auth/me');
    }
};
const Users = {
    async getProfile()              { return apiRequest('GET',    '/users/profile'); },
    async updateProfile(data)       { return apiRequest('PUT',    '/users/profile', data); },
    async changePassword(cur, nw)   { return apiRequest('PUT',    '/users/password', { currentPassword: cur, newPassword: nw }); },
    async deleteAccount(password)   { return apiRequest('DELETE', '/users/account', { password }); }
};


const Tierlist = {
    async get()                          { return apiRequest('GET',    '/tierlist'); },
    async set(championId, tier, note='') { return apiRequest('PUT',    `/tierlist/${championId}`, { tier, note }); },
    async remove(championId)             { return apiRequest('DELETE', `/tierlist/${championId}`); }
};

const Favorites = {
    async get()              { return apiRequest('GET',    '/favorites'); },
    async add(championId)    { return apiRequest('POST',   `/favorites/${championId}`); },
    async remove(championId) { return apiRequest('DELETE', `/favorites/${championId}`); }
};


const Champions = {
    async getLanes() { return apiRequest('GET', '/champions/lanes'); }
};


const Leagues = {
    async getAll() { return apiRequest('GET', '/leagues'); }
};

window.LP = { Session, Auth, Users, Tierlist, Favorites, Champions, Leagues };
