// ==========================================
// PLOMBERIE EXPERT - JAVASCRIPT v6.0
// 🔒 ULTRA SECURE + ANALYTICS + FUN 🔒
// ==========================================

// ===== HASH SHA-256 =====
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== CONFIGURATION =====
const _$SALT = 'plomberie_secure_2025';
const _$AUTH = {
    _a: { _u: '', _p: '', _r: 'admin', _n: 'Administrateur', _t: 15 * 60 * 1000 },
    _d: { _u: '', _p: '', _r: 'dev', _n: 'Développeur', _t: 30 * 60 * 1000 }
};

(async function initAuth() {
    _$AUTH._a._u = await sha256('admin' + _$SALT);
    _$AUTH._a._p = await sha256('plombier2025' + _$SALT);
    _$AUTH._d._u = await sha256('dev' + _$SALT);
    _$AUTH._d._p = await sha256('Etiennegab1n&' + _$SALT);
})();

// ===== WEBHOOKS DISCORD/TELEGRAM =====
// IMPORTANT: Remplace ces URLs par tes vrais webhooks!
const _$WEBHOOKS = {
    discord: '', // Exemple: 'https://discord.com/api/webhooks/xxxxx/xxxxx'
    telegram: '', // Exemple: 'https://api.telegram.org/botXXXXX/sendMessage?chat_id=XXXXX'
    enabled: false // Mettre à true quand tu as configuré les webhooks
};

async function sendDiscordAlert(title, message, color = 0xff6b35) {
    if (!_$WEBHOOKS.discord || !_$WEBHOOKS.enabled) return;
    try {
        await fetch(_$WEBHOOKS.discord, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: title,
                    description: message,
                    color: color,
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Plomberie Expert Security' }
                }]
            })
        });
    } catch (e) { console.log('Discord webhook error:', e); }
}

async function sendTelegramAlert(message) {
    if (!_$WEBHOOKS.telegram || !_$WEBHOOKS.enabled) return;
    try {
        await fetch(_$WEBHOOKS.telegram + '&text=' + encodeURIComponent(message));
    } catch (e) { console.log('Telegram webhook error:', e); }
}

// Fonction unifiée pour envoyer des alertes
async function sendSecurityAlert(type, details) {
    const timestamp = new Date().toLocaleString('fr-FR');
    const ip = _$visitorIP || 'Inconnu';
    
    let title, message, color;
    
    switch(type) {
        case 'login_success':
            title = '✅ Connexion réussie';
            message = `**Terminal:** ${details.terminal}\n**IP:** ${ip}\n**Lieu:** ${_$visitorGeo?.city || '?'}, ${_$visitorGeo?.country || '?'}`;
            color = 0x00ff00;
            break;
        case 'login_failed':
            title = '❌ Tentative de connexion échouée';
            message = `**Terminal:** ${details.terminal}\n**User tenté:** ${details.username}\n**IP:** ${ip}\n**Lieu:** ${_$visitorGeo?.city || '?'}`;
            color = 0xff0000;
            break;
        case 'honeypot':
            title = '🚨 HONEYPOT DÉCLENCHÉ - IP BANNIE';
            message = `**Login piégé:** ${details.username}\n**IP BANNIE:** ${ip}\n**Lieu:** ${_$visitorGeo?.city || '?'}`;
            color = 0xff0000;
            break;
        case 'paranoia':
            title = '🔒 MODE PARANOÏA ACTIVÉ';
            message = `**Raison:** Trop de tentatives échouées\n**Durée:** 1 heure\n**IP:** ${ip}`;
            color = 0xff0000;
            break;
        case 'urgence':
            title = '🚨 NOUVELLE URGENCE CLIENT';
            message = `**Nom:** ${details.nom}\n**Tél:** ${details.tel}\n**Message:** ${details.message}`;
            color = 0xff6b35;
            break;
        case 'new_form':
            title = '📬 Nouvelle demande';
            message = `**Nom:** ${details.nom}\n**Type:** ${details.urgence}\n**Tél:** ${details.tel}`;
            color = 0x3498db;
            break;
    }
    
    // Envoyer à Discord
    await sendDiscordAlert(title, message, color);
    
    // Envoyer à Telegram
    await sendTelegramAlert(`${title}\n${message.replace(/\*\*/g, '')}\n🕐 ${timestamp}`);
    
    // Afficher dans la console (simulation email)
    console.log('%c╔══════════════════════════════════════════════════════════════╗', 'color: #ff6b35;');
    console.log(`%c║  📧 ALERTE: ${title.padEnd(43)} ║`, 'color: #ff6b35;');
    console.log('%c╠══════════════════════════════════════════════════════════════╣', 'color: #ff6b35;');
    console.log(`%c║  ${message.replace(/\*\*/g, '').replace(/\n/g, '\n║  ').padEnd(60)} ║`, 'color: #ffff00;');
    console.log(`%c║  🕐 ${timestamp.padEnd(55)} ║`, 'color: #888;');
    console.log('%c╚══════════════════════════════════════════════════════════════╝', 'color: #ff6b35;');
}

// ===== MODE PARANOÏA =====
const _$PARANOIA = {
    threshold: 10, // 10 échecs en 1h = lockdown
    timeWindow: 60 * 60 * 1000, // 1 heure
    lockdownDuration: 60 * 60 * 1000 // 1 heure de lockdown
};

function checkParanoiaMode() {
    const history = getConnectionHistory();
    const oneHourAgo = Date.now() - _$PARANOIA.timeWindow;
    const recentFailures = history.filter(h => !h.success && h.timestamp > oneHourAgo);
    
    if (recentFailures.length >= _$PARANOIA.threshold) {
        activateParanoiaMode();
        return true;
    }
    return isParanoiaModeActive();
}

function activateParanoiaMode() {
    const lockdownData = {
        active: true,
        activatedAt: Date.now(),
        expiresAt: Date.now() + _$PARANOIA.lockdownDuration
    };
    localStorage.setItem('_$paranoia', JSON.stringify(lockdownData));
    addLog('SÉCURITÉ', '🔒 MODE PARANOÏA ACTIVÉ - Lockdown 1h');
    sendSecurityAlert('paranoia', {});
}

function isParanoiaModeActive() {
    const data = JSON.parse(localStorage.getItem('_$paranoia') || '{"active": false}');
    if (data.active && Date.now() > data.expiresAt) {
        localStorage.setItem('_$paranoia', JSON.stringify({ active: false }));
        addLog('SÉCURITÉ', '🔓 Mode paranoïa désactivé');
        return false;
    }
    return data.active;
}

function getParanoiaStatus() {
    const data = JSON.parse(localStorage.getItem('_$paranoia') || '{"active": false}');
    if (!data.active) return { active: false };
    const remaining = Math.max(0, data.expiresAt - Date.now());
    return { 
        active: true, 
        remaining: remaining,
        remainingMinutes: Math.ceil(remaining / 60000)
    };
}

function deactivateParanoiaMode() {
    localStorage.setItem('_$paranoia', JSON.stringify({ active: false }));
    addLog('SÉCURITÉ', '🔓 Mode paranoïa désactivé manuellement');
}

// ===== SONS & NOTIFICATIONS =====
const _$SOUNDS = {
    enabled: true,
    volume: 0.5
};

// Créer les sons avec l'API Web Audio
function playSound(type) {
    if (!_$SOUNDS.enabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = _$SOUNDS.volume;
    
    switch(type) {
        case 'success':
            // Son de succès (deux bips aigus)
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'error':
            // Son d'erreur (bip grave)
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
            
        case 'notification':
            // Son de notification (ding)
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
            
        case 'urgence':
            // Son d'urgence (alarme)
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.6);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + 0.8);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
            break;
            
        case 'alert':
            // Son d'alerte sécurité
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.2);
            oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
    }
}

// ===== HONEYPOT =====
const _$HONEYPOT = ['root', 'administrator', 'superuser', 'test', 'admin1', 'user', 'guest', 'default', 'system', 'oracle', 'mysql', 'postgres', 'ftp', 'ssh', 'www', 'web', 'backup', 'temp', 'anonymous'];

// ===== VARIABLES GLOBALES =====
let _$adminLoggedIn = false;
let _$devLoggedIn = false;
let _$adminLoginStep = 'username';
let _$devLoginStep = 'username';
let _$adminTempUser = '';
let _$devTempUser = '';
let _$adminSession = null;
let _$devSession = null;
let _$lastActivity = Date.now();
let _$currentTerminal = null;
let _$2FACode = null;
let _$2FAExpiry = null;
let _$tabId = Math.random().toString(36).substr(2, 9);
let _$fingerprint = null;

const _$VERSION = '6.0.0';
const _$BUILD = '2025-01-16';
const _$MAX_ATTEMPTS = 3;
const _$BASE_LOCKOUT = 15 * 60 * 1000;
const _$ATTEMPT_DELAYS = [2000, 5000, 10000];

// ===== FINGERPRINT =====
function generateFingerprint() {
    const data = [navigator.userAgent, navigator.language, screen.width + 'x' + screen.height, screen.colorDepth, new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 'unknown', navigator.platform].join('|');
    let hash = 0;
    for (let i = 0; i < data.length; i++) { const char = data.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash; }
    return Math.abs(hash).toString(16);
}
_$fingerprint = generateFingerprint();

// ===== MULTI-ONGLETS =====
const _$CHANNEL = new BroadcastChannel('plomberie_terminal');
_$CHANNEL.onmessage = (e) => {
    if (e.data.type === 'terminal_open' && e.data.tabId !== _$tabId) {
        addLog('SÉCURITÉ', '⚠️ Terminal ouvert dans plusieurs onglets');
        playSound('alert');
    }
};

// ===== IP & GÉO =====
let _$visitorIP = null;
let _$visitorGeo = null;


async function getVisitorInfo() {
    const apis = [
        {
            url: "https://ip-api.com/json/?fields=status,country,countryCode,region,city,lat,lon,isp,org,query",
            parse: (data) => ({ ip: data.query, geo: { city: data.city || "Inconnu", region: data.region || "", country: data.country || "Inconnu", country_code: data.countryCode || "", latitude: data.lat, longitude: data.lon, isp: data.isp || data.org || "Inconnu", isVPN: (data.org || "").toLowerCase().includes("vpn") || (data.org || "").toLowerCase().includes("proxy") || (data.org || "").toLowerCase().includes("hosting") } })
        },
        {
            url: "https://ipapi.co/json/",
            parse: (data) => ({ ip: data.ip, geo: { city: data.city || "Inconnu", region: data.region || "", country: data.country_name || "Inconnu", country_code: data.country_code || "", latitude: data.latitude, longitude: data.longitude, isp: data.org || "Inconnu", isVPN: (data.org || "").toLowerCase().includes("vpn") || (data.org || "").toLowerCase().includes("proxy") } })
        },
        {
            url: "https://ipwho.is/",
            parse: (data) => ({ ip: data.ip, geo: { city: data.city || "Inconnu", region: data.region || "", country: data.country || "Inconnu", country_code: data.country_code || "", latitude: data.latitude, longitude: data.longitude, isp: data.connection?.isp || "Inconnu", isVPN: data.security?.vpn || data.security?.proxy || false } })
        }
    ];
    for (const api of apis) {
        try {
            const response = await fetch(api.url);
            const data = await response.json();
            if (data && (data.query || data.ip)) {
                const result = api.parse(data);
                _$visitorIP = result.ip;
                _$visitorGeo = result.geo;
                recordVisitor();
                return result;
            }
        } catch (e) { continue; }
    }
    _$visitorIP = "Inconnu";
    _$visitorGeo = { city: "Inconnu", country: "Inconnu", isp: "Inconnu", isVPN: false };
    return null;
}
getVisitorInfo();

// ===== TRACKING VISITEURS =====
function recordVisitor() {
    let visitors = JSON.parse(localStorage.getItem('_$visitors') || '[]');
    visitors.unshift({
        ip: _$visitorIP,
        geo: _$visitorGeo,
        date: new Date().toLocaleString('fr-FR'),
        timestamp: Date.now(),
        page: window.location.pathname,
        fingerprint: _$fingerprint,
        userAgent: navigator.userAgent.split(' ').slice(-2).join(' '),
        referrer: document.referrer || 'Direct',
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : /Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : 'Desktop',
        screenSize: screen.width + 'x' + screen.height
    });
    if (visitors.length > 500) visitors = visitors.slice(0, 500);
    localStorage.setItem('_$visitors', JSON.stringify(visitors));
}

function getVisitors() { return JSON.parse(localStorage.getItem('_$visitors') || '[]'); }

// ===== HISTORIQUE CONNEXIONS =====
function recordConnectionAttempt(terminal, success, username = '') {
    let history = JSON.parse(localStorage.getItem('_$connHistory') || '[]');
    history.unshift({
        terminal, success, username,
        ip: _$visitorIP || 'Inconnu',
        geo: _$visitorGeo || {},
        date: new Date().toLocaleString('fr-FR'),
        timestamp: Date.now(),
        fingerprint: _$fingerprint,
        isVPN: _$visitorGeo?.isVPN || false
    });
    if (history.length > 200) history = history.slice(0, 200);
    localStorage.setItem('_$connHistory', JSON.stringify(history));
    
    // Vérifier mode paranoïa après chaque tentative échouée
    if (!success) checkParanoiaMode();
}

function getConnectionHistory() { return JSON.parse(localStorage.getItem('_$connHistory') || '[]'); }

// ===== BANS =====
function getBannedIPs() { return JSON.parse(localStorage.getItem('_$banned') || '[]'); }

function banIP(ip, reason) {
    let banned = getBannedIPs();
    if (!banned.find(b => b.ip === ip)) {
        banned.push({ ip, reason, date: new Date().toLocaleString('fr-FR'), timestamp: Date.now(), fingerprint: _$fingerprint });
        localStorage.setItem('_$banned', JSON.stringify(banned));
        addLog('SÉCURITÉ', `🚫 IP BANNIE: ${ip} - ${reason}`);
        playSound('alert');
        sendSecurityAlert('honeypot', { username: reason.split('"')[1] || 'unknown' });
    }
}

function isIPBanned(ip) {
    const banned = getBannedIPs();
    return banned.some(b => b.ip === ip || b.fingerprint === _$fingerprint);
}

function unbanIP(ip) {
    let banned = getBannedIPs().filter(b => b.ip !== ip);
    localStorage.setItem('_$banned', JSON.stringify(banned));
}

// ===== RATE LIMITING =====
function getLoginAttempts(terminal) {
    const key = `_$attempts_${terminal}`;
    const data = JSON.parse(localStorage.getItem(key) || '{"count": 0, "locked": false, "lockTime": 0, "lockLevel": 0}');
    const lockoutTime = _$BASE_LOCKOUT * Math.pow(2, data.lockLevel);
    if (data.locked && Date.now() - data.lockTime > lockoutTime) {
        data.locked = false; data.count = 0;
        localStorage.setItem(key, JSON.stringify(data));
    }
    return data;
}

function addFailedAttempt(terminal) {
    const key = `_$attempts_${terminal}`;
    const data = getLoginAttempts(terminal);
    data.count++;
    data.lastAttempt = Date.now();
    if (data.count >= _$MAX_ATTEMPTS) {
        data.locked = true;
        data.lockTime = Date.now();
        data.lockLevel = Math.min(data.lockLevel + 1, 4);
        playSound('alert');
    }
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

function resetLoginAttempts(terminal) {
    const key = `_$attempts_${terminal}`;
    const data = getLoginAttempts(terminal);
    data.count = 0; data.locked = false;
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== DÉLAI ANTI BRUTE-FORCE =====
let _$inputDisabled = false;

function enforceAttemptDelay(terminal, input) {
    const data = getLoginAttempts(terminal);
    if (data.count > 0 && data.count <= _$ATTEMPT_DELAYS.length) {
        const delay = _$ATTEMPT_DELAYS[data.count - 1];
        _$inputDisabled = true;
        input.disabled = true;
        input.placeholder = `Attendez ${delay/1000}s...`;
        setTimeout(() => { _$inputDisabled = false; input.disabled = false; input.placeholder = ''; input.focus(); }, delay);
    }
}

// ===== 2FA =====
function generate2FACode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    _$2FACode = code;
    _$2FAExpiry = Date.now() + 60000;
    console.log('%c╔══════════════════════════════════════╗', 'color: #00ff41; font-size: 14px;');
    console.log('%c║     🔐 CODE DE VÉRIFICATION 2FA      ║', 'color: #00ff41; font-size: 14px;');
    console.log('%c╠══════════════════════════════════════╣', 'color: #00ff41; font-size: 14px;');
    console.log(`%c║           ${code}                   ║`, 'color: #ffff00; font-size: 20px; font-weight: bold;');
    console.log('%c╠══════════════════════════════════════╣', 'color: #00ff41; font-size: 14px;');
    console.log('%c║      ⏱️  Expire dans 60 secondes      ║', 'color: #ff6b35; font-size: 12px;');
    console.log('%c╚══════════════════════════════════════╝', 'color: #00ff41; font-size: 14px;');
    playSound('notification');
    return code;
}

function verify2FACode(code) {
    if (!_$2FACode || !_$2FAExpiry) return false;
    if (Date.now() > _$2FAExpiry) { _$2FACode = null; _$2FAExpiry = null; return 'expired'; }
    if (code === _$2FACode) { _$2FACode = null; _$2FAExpiry = null; return true; }
    return false;
}

// ===== SESSION TIMEOUT =====
function checkSessionTimeout() {
    if (_$adminLoggedIn && Date.now() - _$lastActivity > _$AUTH._a._t) {
        addLog('SÉCURITÉ', 'Déconnexion auto ADMIN');
        forceLogoutAdmin('Session expirée (15 min)');
    }
    if (_$devLoggedIn && Date.now() - _$lastActivity > _$AUTH._d._t) {
        addLog('SÉCURITÉ', 'Déconnexion auto DEV');
        forceLogoutDev('Session expirée (30 min)');
    }
}

function updateActivity() { _$lastActivity = Date.now(); }
setInterval(checkSessionTimeout, 30000);
document.addEventListener('mousemove', updateActivity);
document.addEventListener('keypress', updateActivity);
document.addEventListener('click', updateActivity);

// ===== BLOCAGE COPIER/COLLER =====
document.addEventListener('paste', (e) => {
    // Autoriser le coller si déjà connecté
    if (_$adminLoggedIn || _$devLoggedIn) return;
    const target = e.target;
    if (target.type === 'password' || target.id === 'terminalInput' || target.id === 'devTerminalInput') {
        e.preventDefault();
        addLog('SÉCURITÉ', '⚠️ Coller bloqué');
        playSound('error');
    }
});

// ===== STOCKAGE =====
function saveSubmission(data) {
    let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const newSubmission = { ...data, id: Date.now(), date: new Date().toLocaleString('fr-FR'), read: false };
    submissions.unshift(newSubmission);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    // Notification et son
    if (data.urgence === 'urgence') {
        playSound('urgence');
        sendSecurityAlert('urgence', data);
    } else {
        playSound('notification');
        sendSecurityAlert('new_form', data);
    }
}

function getSubmissions() { return JSON.parse(localStorage.getItem('contactSubmissions') || '[]'); }
function deleteSubmission(id) { let s = getSubmissions().filter(x => x.id !== id); localStorage.setItem('contactSubmissions', JSON.stringify(s)); }
function clearAllSubmissions() { localStorage.removeItem('contactSubmissions'); }
function markAsRead(id) { let s = getSubmissions().map(x => x.id === id ? {...x, read: true} : x); localStorage.setItem('contactSubmissions', JSON.stringify(s)); }

// ===== LOGS =====
function addLog(action, details = '') {
    let logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    logs.unshift({ timestamp: new Date().toLocaleString('fr-FR'), timestampRaw: Date.now(), action, details, user: _$currentTerminal ? _$currentTerminal.toUpperCase() : 'SYSTÈME', ip: _$visitorIP || 'Inconnu' });
    if (logs.length > 500) logs = logs.slice(0, 500);
    localStorage.setItem('systemLogs', JSON.stringify(logs));
}
function getLogs() { return JSON.parse(localStorage.getItem('systemLogs') || '[]'); }
function clearLogs() { localStorage.removeItem('systemLogs'); }

// ===== STATS & AUTRES =====
function recordConnection(terminal) {
    let stats = JSON.parse(localStorage.getItem('connectionStats') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const existing = stats.find(s => s.date === today && s.terminal === terminal);
    if (existing) existing.count++; else stats.push({ date: today, terminal, count: 1 });
    const limit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    stats = stats.filter(s => s.date >= limit);
    localStorage.setItem('connectionStats', JSON.stringify(stats));
}
function getConnectionStats() { return JSON.parse(localStorage.getItem('connectionStats') || '[]'); }

function getSales() { return JSON.parse(localStorage.getItem('salesData') || '[]'); }
function addSale(data) { let s = getSales(); s.unshift({ ...data, id: Date.now(), date: new Date().toLocaleString('fr-FR') }); localStorage.setItem('salesData', JSON.stringify(s)); }

function getNotes() { return JSON.parse(localStorage.getItem('devNotes') || '[]'); }
function addNote(text) { let n = getNotes(); n.unshift({ id: Date.now(), text, date: new Date().toLocaleString('fr-FR') }); localStorage.setItem('devNotes', JSON.stringify(n)); }
function deleteNote(id) { let n = getNotes().filter(x => x.id !== id); localStorage.setItem('devNotes', JSON.stringify(n)); }

function getConfig() { return JSON.parse(localStorage.getItem('siteConfig') || '{"maintenance": false, "maintenanceMsg": "Site en maintenance", "shopEnabled": false}'); }
function setConfig(config) { localStorage.setItem('siteConfig', JSON.stringify(config)); }

function getUrgenceLabel(type) { return { 'devis': 'Devis', 'urgence': 'URGENCE', 'rdv': 'RDV', 'info': 'Info' }[type] || type; }

// ===== NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('navLinks')?.classList.remove('active'); }
    });
});

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle) menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 100);
    document.getElementById('scrollTopBtn')?.classList.toggle('visible', window.scrollY > 500);
});
document.getElementById('scrollTopBtn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
        if (!isActive) faqItem.classList.add('active');
    });
});

// ===== FORMULAIRE =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (getConfig().maintenance) { alert('Site en maintenance.'); return; }
        saveSubmission({
            nom: document.getElementById('nom').value,
            tel: document.getElementById('tel').value,
            email: document.getElementById('email').value,
            ville: document.getElementById('ville').value,
            urgence: document.getElementById('urgence').value,
            message: document.getElementById('message').value
        });
        addLog('FORMULAIRE', 'Nouvelle demande');
        document.getElementById('successMessage').classList.add('show');
        this.reset();
        setTimeout(() => document.getElementById('successMessage').classList.remove('show'), 5000);
    });
}

// ===== ANIMATIONS =====
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } });
}, { threshold: 0.1 });
document.querySelectorAll('.service-card, .realisation-card, .temoignage-card, .avantage-item, .tarif-card').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; observer.observe(el);
});

// ===== MAINTENANCE =====
function checkMaintenanceMode() {
    const config = getConfig();
    let banner = document.getElementById('maintenanceBanner');
    if (config.maintenance && !banner) {
        banner = document.createElement('div');
        banner.id = 'maintenanceBanner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#ff6b35,#e53e3e);color:white;padding:15px;text-align:center;font-weight:bold;z-index:10000;';
        banner.innerHTML = '🔧 ' + config.maintenanceMsg + ' 🔧';
        document.body.prepend(banner);
    } else if (!config.maintenance && banner) { banner.remove(); }
}
document.addEventListener('DOMContentLoaded', checkMaintenanceMode);

// ===== GRAPHIQUES =====
function generateGraph(data, title, w = 35) {
    const lines = ['', '╔' + '═'.repeat(w + 14) + '╗', '║  ' + title.padEnd(w + 10) + '  ║', '╠' + '═'.repeat(w + 14) + '╣'];
    if (!data.length) lines.push('║  Aucune donnée' + ' '.repeat(w - 3) + '  ║');
    else { const max = Math.max(...data.map(d => d.value), 1); data.forEach(d => { const bar = '█'.repeat(Math.round(d.value / max * w)) + '░'.repeat(w - Math.round(d.value / max * w)); lines.push('║  ' + d.label.padEnd(8) + ' ' + bar + ' ' + d.value.toString().padStart(4) + '  ║'); }); }
    lines.push('╚' + '═'.repeat(w + 14) + '╝', '');
    return lines;
}

function getConnGraphData(days = 7) {
    const stats = getConnectionStats(), data = [];
    for (let i = days - 1; i >= 0; i--) { const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000), ds = d.toISOString().split('T')[0], dn = d.toLocaleDateString('fr-FR', { weekday: 'short' }), c = stats.filter(s => s.date === ds).reduce((a, b) => a + b.count, 0); data.push({ label: dn, value: c }); }
    return data;
}

// ==========================================
// TERMINAL ADMIN
// ==========================================
const adminModal = document.getElementById('adminModal');
const adminAccessBtn = document.getElementById('adminAccessBtn');
const closeTerminal = document.getElementById('closeTerminal');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

function openAdminTerminal() {
    // Mode paranoïa?
    if (isParanoiaModeActive()) {
        const status = getParanoiaStatus();
        alert(`🔒 MODE PARANOÏA ACTIF\nAccès bloqué pour ${status.remainingMinutes} minutes.`);
        return;
    }
    // IP bannie?
    if (isIPBanned(_$visitorIP)) {
        alert('🚫 Accès refusé. Votre IP a été bannie.');
        addLog('SÉCURITÉ', `🚫 IP bannie tentative: ${_$visitorIP}`);
        return;
    }
    
    _$currentTerminal = 'admin';
    adminModal.classList.add('show');
    terminalInput.focus();
    _$CHANNEL.postMessage({ type: 'terminal_open', tabId: _$tabId, terminal: 'admin' });
    
    if (!_$adminLoggedIn) {
        const attempts = getLoginAttempts('admin');
        terminalOutput.innerHTML = '';
        addLineAdmin('╔══════════════════════════════════════════════════════════════╗');
        addLineAdmin('║           PLOMBERIE EXPERT - TERMINAL ADMIN                  ║');
        addLineAdmin('║                   🔒 ACCÈS SÉCURISÉ v6.0 🔒                   ║');
        addLineAdmin('╚══════════════════════════════════════════════════════════════╝');
        addLineAdmin('');
        if (attempts.locked) {
            const lockoutTime = _$BASE_LOCKOUT * Math.pow(2, attempts.lockLevel);
            const remaining = Math.ceil((lockoutTime - (Date.now() - attempts.lockTime)) / 1000);
            addLineAdmin(`[SÉCURITÉ] 🔒 BLOQUÉ - ${Math.floor(remaining/60)}m ${remaining%60}s`, 'error');
            playSound('error');
            return;
        }
        _$adminLoginStep = 'username';
        terminalInput.type = 'text';
        updatePromptAdmin('login:~$');
        addLineAdmin(`[SYSTÈME] IP: ${_$visitorIP || 'Chargement...'}`, 'info');
        if (_$visitorGeo?.isVPN) addLineAdmin('[ALERTE] ⚠️ VPN/Proxy détecté!', 'warning');
        addLineAdmin('[SYSTÈME] Entrez votre nom d\'utilisateur.', 'info');
        addLineAdmin('');
    }
}

if (adminAccessBtn) adminAccessBtn.addEventListener('click', openAdminTerminal);
if (closeTerminal) closeTerminal.addEventListener('click', () => { adminModal.classList.remove('show'); _$currentTerminal = null; });

function updatePromptAdmin(p) { document.querySelector('.terminal-prompt').textContent = p; }
function addLineAdmin(text, cls = '') { const line = document.createElement('p'); line.className = 'terminal-line' + (cls ? ' ' + cls : ''); line.textContent = text; terminalOutput.appendChild(line); document.getElementById('terminalBody').scrollTop = document.getElementById('terminalBody').scrollHeight; }

function forceLogoutAdmin(reason = '') {
    _$adminLoggedIn = false; _$adminLoginStep = 'username'; _$adminTempUser = ''; terminalInput.type = 'text'; updatePromptAdmin('login:~$'); terminalOutput.innerHTML = '';
    addLineAdmin('╔══════════════════════════════════════════════════════════════╗');
    addLineAdmin('║           PLOMBERIE EXPERT - TERMINAL ADMIN                  ║');
    addLineAdmin('╚══════════════════════════════════════════════════════════════╝');
    addLineAdmin('');
    if (reason) addLineAdmin(`[SYSTÈME] ${reason}`, 'warning');
    addLineAdmin('[SYSTÈME] Déconnecté.', 'success');
}

// ==========================================
// TERMINAL DEV
// ==========================================
let devModal = null, devTerminalInput = null, devTerminalOutput = null, clickCount = 0, clickTimer = null;

function createDevModal() {
    if (document.getElementById('devModal')) return;
    const modal = document.createElement('div');
    modal.id = 'devModal';
    modal.className = 'admin-modal';
    modal.innerHTML = `<div class="terminal-container" style="border-color:#00bfff;box-shadow:0 0 50px rgba(0,191,255,0.3);"><div class="terminal-header" style="border-bottom-color:#00bfff;"><div class="terminal-buttons"><span class="terminal-btn close" id="closeDevTerminal"></span><span class="terminal-btn minimize"></span><span class="terminal-btn maximize"></span></div><div class="terminal-title" style="color:#00bfff;">dev@plomberie:~ [🔒 SECURE v6.0]</div></div><div class="terminal-body" id="devTerminalBody"><div class="terminal-output" id="devTerminalOutput"></div><div class="terminal-input-line"><span class="terminal-prompt" id="devPrompt" style="color:#00bfff;">login:~$</span><input type="text" id="devTerminalInput" class="terminal-input" style="color:#00bfff;caret-color:#00bfff;" autocomplete="off"></div></div></div>`;
    document.body.appendChild(modal);
    devModal = modal;
    devTerminalInput = document.getElementById('devTerminalInput');
    devTerminalOutput = document.getElementById('devTerminalOutput');
    document.getElementById('closeDevTerminal').addEventListener('click', () => { devModal.classList.remove('show'); _$currentTerminal = null; });
    devTerminalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !_$inputDisabled) { processDevCommand(devTerminalInput.value); devTerminalInput.value = ''; } });
    devModal.addEventListener('click', (e) => { if (e.target === devModal) { devModal.classList.remove('show'); _$currentTerminal = null; } });
}

function openDevTerminal() {
    if (isParanoiaModeActive()) { const status = getParanoiaStatus(); alert(`🔒 MODE PARANOÏA - Bloqué ${status.remainingMinutes} min`); return; }
    if (isIPBanned(_$visitorIP)) { alert('🚫 IP bannie.'); return; }
    createDevModal();
    _$currentTerminal = 'dev';
    devModal.classList.add('show');
    devTerminalInput.focus();
    _$CHANNEL.postMessage({ type: 'terminal_open', tabId: _$tabId, terminal: 'dev' });
    if (!_$devLoggedIn) {
        const attempts = getLoginAttempts('dev');
        devTerminalOutput.innerHTML = '';
        addLineDev('╔══════════════════════════════════════════════════════════════╗');
        addLineDev('║        PLOMBERIE EXPERT - TERMINAL DÉVELOPPEUR               ║');
        addLineDev('║            ⚠️  ACCÈS RESTREINT - 2FA REQUIS ⚠️                 ║');
        addLineDev('╚══════════════════════════════════════════════════════════════╝');
        addLineDev('');
        if (attempts.locked) { const lt = _$BASE_LOCKOUT * Math.pow(2, attempts.lockLevel), r = Math.ceil((lt - (Date.now() - attempts.lockTime)) / 1000); addLineDev(`[SÉCURITÉ] 🔒 BLOQUÉ ${Math.floor(r/60)}m ${r%60}s`, 'error'); playSound('error'); return; }
        _$devLoginStep = 'username';
        devTerminalInput.type = 'text';
        updatePromptDev('login:~$');
        addLineDev(`[SYSTÈME] IP: ${_$visitorIP || 'Chargement...'}`, 'info');
        if (_$visitorGeo?.isVPN) addLineDev('[ALERTE] ⚠️ VPN détecté - Connexion surveillée', 'warning');
        addLineDev('[SYSTÈME] Entrez vos identifiants développeur.', 'warning');
        addLineDev('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const footerLogo = document.querySelector('.footer-info .logo');
    if (footerLogo) { footerLogo.style.cursor = 'pointer'; footerLogo.style.userSelect = 'none'; footerLogo.addEventListener('click', (e) => { e.preventDefault(); clickCount++; if (clickCount === 1) clickTimer = setTimeout(() => { clickCount = 0; }, 800); if (clickCount >= 3) { clearTimeout(clickTimer); clickCount = 0; openDevTerminal(); } }); }
});

function updatePromptDev(p) { const el = document.getElementById('devPrompt'); if (el) el.textContent = p; }
function addLineDev(text, cls = '') { const line = document.createElement('p'); line.className = 'terminal-line' + (cls ? ' ' + cls : ''); if (!cls) line.style.color = '#00bfff'; line.textContent = text; devTerminalOutput.appendChild(line); document.getElementById('devTerminalBody').scrollTop = document.getElementById('devTerminalBody').scrollHeight; }

function forceLogoutDev(reason = '') {
    _$devLoggedIn = false; _$devLoginStep = 'username'; _$devTempUser = ''; devTerminalInput.type = 'text'; updatePromptDev('login:~$'); devTerminalOutput.innerHTML = '';
    addLineDev('╔══════════════════════════════════════════════════════════════╗');
    addLineDev('║        PLOMBERIE EXPERT - TERMINAL DÉVELOPPEUR               ║');
    addLineDev('╚══════════════════════════════════════════════════════════════╝');
    addLineDev('');
    if (reason) addLineDev(`[SYSTÈME] ${reason}`, 'warning');
    addLineDev('[SYSTÈME] Déconnecté.', 'success');
}

// ==========================================
// COMMANDES ADMIN
// ==========================================
const adminCommands = {
    help: () => { addLineAdmin(''); addLineAdmin('═══ COMMANDES ADMIN ═══', 'info'); addLineAdmin('  list / view [id] / delete [id] / clear-all'); addLineAdmin('  urgences / unread / search [mot] / stats'); addLineAdmin('  export / clear / logout'); addLineAdmin(''); },
    list: () => { const s = getSubmissions(); if (!s.length) { addLineAdmin('[INFO] Aucune demande.', 'info'); return; } addLineAdmin('═══ DEMANDES ═══', 'info'); s.forEach(x => addLineAdmin(`#${x.id}${x.urgence === 'urgence' ? ' [URG]' : ''}${x.read ? '' : ' ●'} | ${x.nom} | ${x.tel}`, x.urgence === 'urgence' ? 'error' : '')); addLineAdmin(`Total: ${s.length}`, 'info'); },
    view: (a) => { if (!a[0]) { addLineAdmin('[ERREUR] Usage: view [id]', 'error'); return; } const s = getSubmissions().find(x => x.id.toString() === a[0]); if (!s) { addLineAdmin('[ERREUR] Non trouvée.', 'error'); return; } markAsRead(parseInt(a[0])); addLineAdmin(`\n═══ #${s.id} ═══`, 'info'); addLineAdmin(`Date: ${s.date} | Type: ${getUrgenceLabel(s.urgence)}`); addLineAdmin(`Nom: ${s.nom} | Tél: ${s.tel}`); addLineAdmin(`Email: ${s.email} | Ville: ${s.ville || '-'}`); addLineAdmin(`Message: ${s.message}\n`); },
    delete: (a) => { if (!a[0]) { addLineAdmin('[ERREUR] Usage: delete [id]', 'error'); return; } deleteSubmission(parseInt(a[0])); addLog('SUPPRESSION', `#${a[0]}`); addLineAdmin('[OK] Supprimée.', 'success'); },
    'clear-all': () => { addLineAdmin('[!] Tapez "confirm-delete"', 'warning'); },
    'confirm-delete': () => { clearAllSubmissions(); addLineAdmin('[OK] Tout supprimé.', 'success'); },
    urgences: () => { const s = getSubmissions().filter(x => x.urgence === 'urgence'); if (!s.length) { addLineAdmin('[OK] Aucune urgence.', 'success'); return; } s.forEach(x => addLineAdmin(`#${x.id} | ${x.nom} | ${x.tel}`, 'error')); },
    unread: () => { const s = getSubmissions().filter(x => !x.read); if (!s.length) { addLineAdmin('[OK] Tout lu.', 'success'); return; } s.forEach(x => addLineAdmin(`#${x.id} | ${x.nom}`, 'warning')); },
    search: (a) => { if (!a[0]) { addLineAdmin('[ERREUR] Usage: search [mot]', 'error'); return; } const kw = a.join(' ').toLowerCase(); const r = getSubmissions().filter(s => s.nom.toLowerCase().includes(kw) || s.tel.includes(kw)); if (!r.length) { addLineAdmin('[INFO] Aucun résultat.', 'info'); return; } r.forEach(s => addLineAdmin(`#${s.id} | ${s.nom} | ${s.tel}`)); },
    stats: () => { const s = getSubmissions(); addLineAdmin(`Total: ${s.length} | Urgences: ${s.filter(x => x.urgence === 'urgence').length} | Non lues: ${s.filter(x => !x.read).length}`); },
    export: () => { addLineAdmin(JSON.stringify(getSubmissions(), null, 2)); },
    clear: () => { terminalOutput.innerHTML = ''; addLineAdmin('[ADMIN] Terminal effacé.', 'info'); },
    logout: () => { addLog('DÉCONNEXION', 'ADMIN'); forceLogoutAdmin(); }
};

// ==========================================
// COMMANDES DEV (avec nouvelles commandes)
// ==========================================
const devCommands = {
    help: () => {
        addLineDev('');
        addLineDev('╔══════════════════════════════════════════════════════════════╗');
        addLineDev('║           COMMANDES DEV v6.0 - SECURE EDITION                ║');
        addLineDev('╚══════════════════════════════════════════════════════════════╝');
        addLineDev('');
        addLineDev('═══ DEMANDES ═══', 'info');
        addLineDev('  list / view [id] / delete [id] / clear-all / urgences');
        addLineDev('  unread / search [mot] / mark-all-read / stats');
        addLineDev('');
        addLineDev('═══ GRAPHIQUES ═══', 'warning');
        addLineDev('  graph / dashboard');
        addLineDev('');
        addLineDev('═══ SÉCURITÉ 🔒 ═══', 'error');
        addLineDev('  history         - Historique connexions + IP');
        addLineDev('  visitors        - Tous les visiteurs du site');
        addLineDev('  banned          - Liste des IP bannies');
        addLineDev('  ban [ip]        - Bannir une IP');
        addLineDev('  unban [ip]      - Débannir une IP');
        addLineDev('  security        - État sécurité complet');
        addLineDev('  threats         - Menaces détectées');
        addLineDev('  paranoia        - Status mode paranoïa');
        addLineDev('  paranoia-off    - Désactiver mode paranoïa');
        addLineDev('');
        addLineDev('═══ SONS 🔊 ═══', 'info');
        addLineDev('  sound on/off    - Activer/désactiver sons');
        addLineDev('  sound test      - Tester les sons');
        addLineDev('  volume [0-100]  - Régler le volume');
        addLineDev('');
        addLineDev('═══ WEBHOOKS 🔔 ═══', 'warning');
        addLineDev('  webhook-status  - État des webhooks');
        addLineDev('  webhook-test    - Tester les notifications');
        addLineDev('');
        addLineDev('═══ SITE ═══', 'info');
        addLineDev('  maintenance on/off / shop on/off');
        addLineDev('  edit-phone [num] / hide/show [section]');
        addLineDev('');
        addLineDev('═══ SYSTÈME ═══', 'info');
        addLineDev('  status / logs [n] / notes / note [txt]');
        addLineDev('  backup / test-form / fill [n] / reload');
        addLineDev('');
        addLineDev('  clear / logout');
        addLineDev('');
    },
    
    // ═══ SÉCURITÉ ═══
    history: () => {
        const h = getConnectionHistory();
        if (!h.length) { addLineDev('[INFO] Aucun historique.', 'info'); return; }
        addLineDev('');
        addLineDev('╔══════════════════════════════════════════════════════════════╗');
        addLineDev('║              📜 HISTORIQUE CONNEXIONS                        ║');
        addLineDev('╚══════════════════════════════════════════════════════════════╝');
        addLineDev('');
        h.slice(0, 20).forEach(c => {
            const icon = c.success ? '✅' : '❌';
            const vpn = c.isVPN ? ' [VPN]' : '';
            addLineDev(`[${c.date}] ${icon} ${c.success ? 'SUCCÈS' : 'ÉCHEC'} - ${c.terminal.toUpperCase()}`, c.success ? 'success' : 'error');
            addLineDev(`   IP: ${c.ip} | ${c.geo?.city || '?'}, ${c.geo?.country || '?'}${vpn}`);
            if (c.username && !c.success) addLineDev(`   User tenté: ${c.username}`, 'warning');
        });
        addLineDev('');
        addLineDev(`Total: ${h.length} entrées`, 'info');
    },
    
    visitors: () => {
        const v = getVisitors();
        if (!v.length) { addLineDev('[INFO] Aucun visiteur.', 'info'); return; }
        addLineDev('');
        addLineDev('╔══════════════════════════════════════════════════════════════╗');
        addLineDev('║              👥 VISITEURS DU SITE                            ║');
        addLineDev('╚══════════════════════════════════════════════════════════════╝');
        addLineDev('');
        const uniqueIPs = {};
        v.forEach(visitor => { if (!uniqueIPs[visitor.ip]) uniqueIPs[visitor.ip] = { ...visitor, count: 1 }; else uniqueIPs[visitor.ip].count++; });
        Object.values(uniqueIPs).slice(0, 20).forEach(visitor => {
            const vpn = visitor.geo?.isVPN ? ' ⚠️VPN' : '';
            addLineDev(`[${visitor.date}] ${visitor.ip}${vpn}`, visitor.geo?.isVPN ? 'warning' : '');
            addLineDev(`   📍 ${visitor.geo?.city || '?'}, ${visitor.geo?.country || '?'} | 📱 ${visitor.device || '?'}`);
            addLineDev(`   Visites: ${visitor.count} | Source: ${visitor.referrer || 'Direct'}`);
        });
        addLineDev('');
        addLineDev(`Total: ${v.length} visites | ${Object.keys(uniqueIPs).length} IPs uniques`, 'info');
    },
    
    banned: () => { const b = getBannedIPs(); if (!b.length) { addLineDev('[OK] Aucune IP bannie.', 'success'); return; } addLineDev('═══ 🚫 IP BANNIES ═══', 'error'); b.forEach(ban => { addLineDev(`  ${ban.ip} - ${ban.reason}`, 'error'); addLineDev(`    Banni le: ${ban.date}`); }); },
    ban: (a) => { if (!a[0]) { addLineDev('[ERREUR] Usage: ban [ip]', 'error'); return; } banIP(a[0], 'Ban manuel DEV'); addLineDev(`[OK] IP ${a[0]} bannie.`, 'success'); },
    unban: (a) => { if (!a[0]) { addLineDev('[ERREUR] Usage: unban [ip]', 'error'); return; } unbanIP(a[0]); addLineDev(`[OK] IP ${a[0]} débannie.`, 'success'); },
    
    security: () => {
        const aa = getLoginAttempts('admin'), da = getLoginAttempts('dev'), banned = getBannedIPs(), history = getConnectionHistory();
        const threats = history.filter(h => !h.success || h.isVPN);
        const paranoia = getParanoiaStatus();
        addLineDev('');
        addLineDev('╔══════════════════════════════════════════════════════════════╗');
        addLineDev('║              🔒 ÉTAT SÉCURITÉ COMPLET                        ║');
        addLineDev('╚══════════════════════════════════════════════════════════════╝');
        addLineDev('');
        addLineDev(`  Version: ${_$VERSION} SECURE`);
        addLineDev(`  Mode Paranoïa: ${paranoia.active ? '🔴 ACTIF (' + paranoia.remainingMinutes + ' min)' : '🟢 Inactif'}`, paranoia.active ? 'error' : 'success');
        addLineDev(`  Sons: ${_$SOUNDS.enabled ? 'ON' : 'OFF'} | Volume: ${Math.round(_$SOUNDS.volume * 100)}%`);
        addLineDev('');
        addLineDev(`  Votre IP: ${_$visitorIP}`);
        addLineDev(`  VPN: ${_$visitorGeo?.isVPN ? 'OUI ⚠️' : 'Non'}`, _$visitorGeo?.isVPN ? 'warning' : 'success');
        addLineDev('');
        addLineDev('  ─── Rate Limiting ───');
        addLineDev(`  Admin: ${aa.count}/${_$MAX_ATTEMPTS} | Bloqué: ${aa.locked ? 'OUI' : 'Non'} | Niveau: ${aa.lockLevel}`);
        addLineDev(`  Dev: ${da.count}/${_$MAX_ATTEMPTS} | Bloqué: ${da.locked ? 'OUI' : 'Non'} | Niveau: ${da.lockLevel}`);
        addLineDev('');
        addLineDev('  ─── Statistiques ───');
        addLineDev(`  IPs bannies: ${banned.length}`);
        addLineDev(`  Connexions: ${history.length}`);
        addLineDev(`  Menaces: ${threats.length}`, threats.length > 0 ? 'warning' : 'success');
        addLineDev(`  Visiteurs uniques: ${new Set(getVisitors().map(v => v.ip)).size}`);
        addLineDev('');
    },
    
    threats: () => {
        const history = getConnectionHistory();
        const threats = history.filter(h => !h.success || h.isVPN);
        if (!threats.length) { addLineDev('[OK] Aucune menace.', 'success'); return; }
        addLineDev('═══ ⚠️ MENACES ═══', 'error');
        threats.slice(0, 15).forEach(t => {
            const reasons = []; if (!t.success) reasons.push('Échec'); if (t.isVPN) reasons.push('VPN');
            addLineDev(`[${t.date}] ${t.ip} - ${reasons.join(', ')}`, 'warning');
            if (t.username) addLineDev(`   User: ${t.username}`);
        });
    },
    
    paranoia: () => {
        const p = getParanoiaStatus();
        if (p.active) { addLineDev(`🔒 MODE PARANOÏA ACTIF - ${p.remainingMinutes} min restantes`, 'error'); }
        else { addLineDev('🟢 Mode paranoïa inactif', 'success'); addLineDev(`  Seuil: ${_$PARANOIA.threshold} échecs en 1h`); }
    },
    
    'paranoia-off': () => { deactivateParanoiaMode(); addLineDev('[OK] Mode paranoïa désactivé.', 'success'); },
    
    // ═══ SONS ═══
    sound: (a) => {
        if (!a[0]) { addLineDev(`Sons: ${_$SOUNDS.enabled ? 'ON' : 'OFF'} | Volume: ${Math.round(_$SOUNDS.volume * 100)}%`); return; }
        if (a[0] === 'on') { _$SOUNDS.enabled = true; addLineDev('[OK] Sons activés.', 'success'); playSound('success'); }
        else if (a[0] === 'off') { _$SOUNDS.enabled = false; addLineDev('[OK] Sons désactivés.', 'success'); }
        else if (a[0] === 'test') {
            addLineDev('[TEST] Lecture des sons...', 'info');
            setTimeout(() => { playSound('success'); addLineDev('  ✅ Son succès', 'success'); }, 500);
            setTimeout(() => { playSound('error'); addLineDev('  ❌ Son erreur', 'error'); }, 1500);
            setTimeout(() => { playSound('notification'); addLineDev('  🔔 Son notification'); }, 2500);
            setTimeout(() => { playSound('urgence'); addLineDev('  🚨 Son urgence', 'warning'); }, 3500);
            setTimeout(() => { playSound('alert'); addLineDev('  ⚠️ Son alerte sécurité', 'error'); }, 4500);
        }
    },
    
    volume: (a) => {
        if (!a[0]) { addLineDev(`Volume: ${Math.round(_$SOUNDS.volume * 100)}%`); return; }
        const vol = parseInt(a[0]);
        if (isNaN(vol) || vol < 0 || vol > 100) { addLineDev('[ERREUR] Volume: 0-100', 'error'); return; }
        _$SOUNDS.volume = vol / 100;
        addLineDev(`[OK] Volume: ${vol}%`, 'success');
        playSound('notification');
    },
    
    // ═══ WEBHOOKS ═══
    'webhook-status': () => {
        addLineDev('');
        addLineDev('═══ 🔔 WEBHOOKS ═══', 'info');
        addLineDev(`  Activés: ${_$WEBHOOKS.enabled ? 'OUI' : 'NON'}`, _$WEBHOOKS.enabled ? 'success' : 'warning');
        addLineDev(`  Discord: ${_$WEBHOOKS.discord ? '✅ Configuré' : '❌ Non configuré'}`);
        addLineDev(`  Telegram: ${_$WEBHOOKS.telegram ? '✅ Configuré' : '❌ Non configuré'}`);
        addLineDev('');
        if (!_$WEBHOOKS.enabled) addLineDev('  💡 Modifie _$WEBHOOKS dans le code pour activer', 'info');
    },
    
    'webhook-test': () => {
        addLineDev('[TEST] Envoi notification test...', 'info');
        sendSecurityAlert('login_success', { terminal: 'TEST' });
        addLineDev('[OK] Notification envoyée (check Discord/Telegram)', 'success');
    },
    
    // ═══ DEMANDES ═══
    list: () => { const s = getSubmissions(); if (!s.length) { addLineDev('[INFO] Aucune demande.', 'info'); return; } s.forEach(x => addLineDev(`#${x.id}${x.urgence === 'urgence' ? ' [URG]' : ''}${x.read ? '' : ' ●'} | ${x.nom} | ${x.tel}`, x.urgence === 'urgence' ? 'error' : '')); addLineDev(`Total: ${s.length}`, 'info'); },
    view: (a) => { if (!a[0]) return; const s = getSubmissions().find(x => x.id.toString() === a[0]); if (!s) { addLineDev('[ERREUR] Non trouvée.', 'error'); return; } markAsRead(parseInt(a[0])); addLineDev(`#${s.id} | ${s.date} | ${getUrgenceLabel(s.urgence)}`); addLineDev(`${s.nom} | ${s.tel} | ${s.email}`); addLineDev(`Ville: ${s.ville || '-'} | Msg: ${s.message}`); },
    delete: (a) => { if (!a[0]) return; deleteSubmission(parseInt(a[0])); addLineDev('[OK] Supprimée.', 'success'); },
    'clear-all': () => { addLineDev('[!] Tapez "confirm-delete"', 'warning'); },
    'confirm-delete': () => { clearAllSubmissions(); addLineDev('[OK] Supprimé.', 'success'); },
    urgences: () => { const s = getSubmissions().filter(x => x.urgence === 'urgence'); if (!s.length) { addLineDev('[OK] Aucune.', 'success'); return; } s.forEach(x => addLineDev(`#${x.id} | ${x.nom} | ${x.tel}`, 'error')); },
    unread: () => { const s = getSubmissions().filter(x => !x.read); if (!s.length) { addLineDev('[OK] Tout lu.', 'success'); return; } s.forEach(x => addLineDev(`#${x.id} | ${x.nom}`, 'warning')); },
    search: (a) => { if (!a[0]) return; const kw = a.join(' ').toLowerCase(), r = getSubmissions().filter(s => s.nom.toLowerCase().includes(kw) || s.tel.includes(kw)); if (!r.length) { addLineDev('[INFO] Aucun.', 'info'); return; } r.forEach(s => addLineDev(`#${s.id} | ${s.nom}`)); },
    'mark-all-read': () => { let s = getSubmissions().map(x => ({ ...x, read: true })); localStorage.setItem('contactSubmissions', JSON.stringify(s)); addLineDev('[OK] Tout lu.', 'success'); },
    stats: () => { const s = getSubmissions(), sales = getSales(); addLineDev(`Demandes: ${s.length} | Urgences: ${s.filter(x => x.urgence === 'urgence').length} | Ventes: ${sales.length}`); },
    
    // ═══ GRAPHIQUES ═══
    graph: () => { generateGraph(getConnGraphData(7), '📊 CONNEXIONS (7j)', 30).forEach(l => addLineDev(l)); },
    dashboard: () => {
        const s = getSubmissions(), history = getConnectionHistory(), banned = getBannedIPs(), c = getConfig(), paranoia = getParanoiaStatus();
        addLineDev('');
        addLineDev('╔══════════════════════════════════════════════════════════════╗');
        addLineDev('║              📊 DASHBOARD DEV SECURE v6.0                    ║');
        addLineDev('╚══════════════════════════════════════════════════════════════╝');
        addLineDev('');
        addLineDev(`  🔒 Paranoïa: ${paranoia.active ? '🔴 ACTIF' : '🟢 Off'} | 🔊 Sons: ${_$SOUNDS.enabled ? 'ON' : 'OFF'}`);
        addLineDev(`  📬 Demandes: ${s.length} | 🚨 Urgences: ${s.filter(x => x.urgence === 'urgence').length} | ● Non lues: ${s.filter(x => !x.read).length}`);
        addLineDev(`  👥 Visiteurs: ${new Set(getVisitors().map(v => v.ip)).size} | 🚫 Bans: ${banned.length} | ⚠️ Menaces: ${history.filter(h => !h.success).length}`);
        addLineDev('');
    },
    
    // ═══ SITE ═══
    maintenance: (a) => { const c = getConfig(); if (!a[0]) { addLineDev(`Maintenance: ${c.maintenance ? 'ON' : 'OFF'}`, c.maintenance ? 'warning' : 'success'); return; } c.maintenance = a[0] === 'on'; setConfig(c); checkMaintenanceMode(); addLineDev(`[OK] Maintenance ${c.maintenance ? 'ON' : 'OFF'}`, 'success'); },
    shop: (a) => { const c = getConfig(); if (!a[0]) { addLineDev(`Shop: ${c.shopEnabled ? 'ON' : 'OFF'}`); return; } c.shopEnabled = a[0] === 'on'; setConfig(c); addLineDev(`[OK] Shop ${c.shopEnabled ? 'ON' : 'OFF'}`, 'success'); },
    'edit-phone': (a) => { if (!a[0]) return; document.querySelectorAll('a[href^="tel:"]').forEach(el => { el.href = 'tel:' + a.join('').replace(/\s/g, ''); }); addLineDev('[OK] Téléphone modifié.', 'success'); },
    hide: (a) => { if (!a[0]) return; const el = document.querySelector('.' + a[0] + ',#' + a[0]); if (el) { el.style.display = 'none'; addLineDev('[OK] Caché.', 'success'); } },
    show: (a) => { if (!a[0]) return; const el = document.querySelector('.' + a[0] + ',#' + a[0]); if (el) { el.style.display = ''; addLineDev('[OK] Affiché.', 'success'); } },
    
    // ═══ SYSTÈME ═══
    status: () => { const c = getConfig(), s = getSubmissions(); addLineDev(`v${_$VERSION} | Maintenance: ${c.maintenance ? 'ON' : 'OFF'} | Demandes: ${s.length}`); },
    logs: (a) => { const l = getLogs().slice(0, parseInt(a[0]) || 15); if (!l.length) { addLineDev('[INFO] Aucun log.', 'info'); return; } l.forEach(x => addLineDev(`${x.timestamp} | ${x.action}`)); },
    notes: () => { const n = getNotes(); if (!n.length) { addLineDev('[INFO] Aucune note.', 'info'); return; } n.forEach(x => addLineDev(`#${x.id} | ${x.text}`)); },
    note: (a) => { if (!a[0]) return; addNote(a.join(' ')); addLineDev('[OK] Note ajoutée.', 'success'); },
    backup: () => { addLineDev(JSON.stringify({ v: _$VERSION, subs: getSubmissions(), banned: getBannedIPs(), history: getConnectionHistory() })); },
    'test-form': () => { saveSubmission({ nom: 'Test', tel: '0600000000', email: 'test@test.fr', ville: 'Lyon', urgence: 'devis', message: 'Test' }); addLineDev('[OK] Créé.', 'success'); },
    'test-urgence': () => { saveSubmission({ nom: 'URGENCE TEST', tel: '0611223344', email: 'urg@test.fr', ville: 'Lyon', urgence: 'urgence', message: 'TEST URGENCE' }); addLineDev('[OK] Urgence créée.', 'success'); },
    fill: (a) => { const n = parseInt(a[0]) || 5; for (let i = 0; i < n; i++) saveSubmission({ nom: 'Client ' + i, tel: '060000000' + i, email: 'c' + i + '@test.fr', ville: 'Lyon', urgence: ['devis', 'urgence', 'rdv', 'info'][i % 4], message: 'Msg ' + i }); addLineDev(`[OK] ${n} créées.`, 'success'); },
    reload: () => { addLineDev('[INFO] Rechargement...', 'warning'); setTimeout(() => location.reload(), 1000); },
    'reset-all': () => { addLineDev('[DANGER] Tapez "confirm-reset"', 'error'); },
    'confirm-reset': () => { localStorage.clear(); addLineDev('[OK] Reset.', 'success'); },
    clear: () => { devTerminalOutput.innerHTML = ''; addLineDev('[DEV] Effacé.', 'info'); },
    logout: () => { addLog('DÉCONNEXION', 'DEV'); forceLogoutDev(); }
};

// ==========================================
// TRAITEMENT LOGIN ADMIN (avec 2FA)
// ==========================================
async function processAdminLogin(input) {
    const trimmed = input.trim();
    const attempts = getLoginAttempts('admin');
    if (attempts.locked) { const lt = _$BASE_LOCKOUT * Math.pow(2, attempts.lockLevel), r = Math.ceil((lt - (Date.now() - attempts.lockTime)) / 1000); addLineAdmin(`[BLOQUÉ] ${Math.floor(r/60)}m ${r%60}s`, 'error'); return; }
    
    if (_$adminLoginStep === 'username') {
        if (_$HONEYPOT.includes(trimmed.toLowerCase())) {
            banIP(_$visitorIP, `Honeypot: "${trimmed}"`);
            recordConnectionAttempt('admin', false, trimmed);
            addLineAdmin('🚫🚫🚫 IP BANNIE DÉFINITIVEMENT 🚫🚫🚫', 'error');
            playSound('alert');
            setTimeout(() => adminModal.classList.remove('show'), 3000);
            return;
        }
        const hashedInput = await sha256(trimmed + _$SALT);
        if (hashedInput === _$AUTH._a._u) {
            _$adminTempUser = trimmed;
            _$adminLoginStep = 'password';
            terminalInput.type = 'password';
            updatePromptAdmin('password:~$');
            addLineAdmin(`[USER] ${trimmed}`, 'info');
        } else {
            addFailedAttempt('admin');
            recordConnectionAttempt('admin', false, trimmed);
            sendSecurityAlert('login_failed', { terminal: 'admin', username: trimmed });
            addLineAdmin('[ERREUR] Utilisateur inconnu.', 'error');
            playSound('error');
            enforceAttemptDelay('admin', terminalInput);
        }
    } else if (_$adminLoginStep === 'password') {
        const hashedInput = await sha256(trimmed + _$SALT);
        if (hashedInput === _$AUTH._a._p) {
            _$adminLoginStep = '2fa';
            terminalInput.type = 'text';
            updatePromptAdmin('2FA:~$');
            generate2FACode();
            addLineAdmin('');
            addLineAdmin('[2FA] 🔐 Code généré! Ouvrez F12 (console)', 'warning');
            addLineAdmin('[2FA] ⏱️ 60 secondes pour entrer le code', 'info');
        } else {
            addFailedAttempt('admin');
            recordConnectionAttempt('admin', false, _$adminTempUser);
            sendSecurityAlert('login_failed', { terminal: 'admin', username: _$adminTempUser });
            addLineAdmin('[ERREUR] Mot de passe incorrect.', 'error');
            playSound('error');
            enforceAttemptDelay('admin', terminalInput);
            const data = getLoginAttempts('admin');
            if (data.count >= 2 && !data.locked) addLineAdmin(`[!] ${_$MAX_ATTEMPTS - data.count} tentative(s) restante(s)`, 'warning');
        }
    } else if (_$adminLoginStep === '2fa') {
        const result = verify2FACode(trimmed);
        if (result === true) {
            resetLoginAttempts('admin');
            _$adminLoggedIn = true;
            _$adminSession = Date.now();
            _$lastActivity = Date.now();
            terminalInput.type = 'text';
            updatePromptAdmin('admin@plomberie:~$');
            recordConnection('admin');
            recordConnectionAttempt('admin', true, 'admin');
            sendSecurityAlert('login_success', { terminal: 'ADMIN' });
            addLog('CONNEXION', 'Admin + 2FA');
            playSound('success');
            addLineAdmin('');
            addLineAdmin('✅ Authentification 2FA réussie!', 'success');
            addLineAdmin(`Session: 15 min | IP: ${_$visitorIP}`, 'info');
            const subs = getSubmissions();
            if (subs.filter(s => s.urgence === 'urgence').length > 0) { addLineAdmin(`🚨 ${subs.filter(s => s.urgence === 'urgence').length} urgence(s)!`, 'error'); playSound('urgence'); }
            if (subs.filter(s => !s.read).length > 0) addLineAdmin(`📬 ${subs.filter(s => !s.read).length} non lue(s)`, 'warning');
        } else if (result === 'expired') { addLineAdmin('[ERREUR] Code expiré!', 'error'); playSound('error'); _$adminLoginStep = 'username'; terminalInput.type = 'text'; updatePromptAdmin('login:~$'); }
        else { addLineAdmin('[ERREUR] Code incorrect.', 'error'); playSound('error'); }
    }
}

function processAdminCommand(input) {
    const trimmed = input.trim();
    if (!_$adminLoggedIn) { processAdminLogin(trimmed); return; }
    updateActivity();
    const parts = trimmed.split(' '), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    addLineAdmin(`admin@plomberie:~$ ${trimmed}`);
    if (adminCommands[cmd]) adminCommands[cmd](args);
    else if (trimmed !== '') addLineAdmin(`[ERREUR] Commande inconnue: ${cmd}`, 'error');
}

// ==========================================
// TRAITEMENT LOGIN DEV (avec 2FA)
// ==========================================
async function processDevLogin(input) {
    const trimmed = input.trim();
    const attempts = getLoginAttempts('dev');
    if (attempts.locked) { const lt = _$BASE_LOCKOUT * Math.pow(2, attempts.lockLevel), r = Math.ceil((lt - (Date.now() - attempts.lockTime)) / 1000); addLineDev(`[BLOQUÉ] ${Math.floor(r/60)}m ${r%60}s`, 'error'); return; }
    
    if (_$devLoginStep === 'username') {
        if (_$HONEYPOT.includes(trimmed.toLowerCase())) {
            banIP(_$visitorIP, `Honeypot DEV: "${trimmed}"`);
            recordConnectionAttempt('dev', false, trimmed);
            addLineDev('🚫🚫🚫 IP BANNIE DÉFINITIVEMENT 🚫🚫🚫', 'error');
            playSound('alert');
            setTimeout(() => devModal.classList.remove('show'), 3000);
            return;
        }
        const hashedInput = await sha256(trimmed + _$SALT);
        if (hashedInput === _$AUTH._d._u) {
            _$devTempUser = trimmed;
            _$devLoginStep = 'password';
            devTerminalInput.type = 'password';
            updatePromptDev('password:~$');
            addLineDev(`[USER] ${trimmed}`, 'info');
        } else {
            addFailedAttempt('dev');
            recordConnectionAttempt('dev', false, trimmed);
            sendSecurityAlert('login_failed', { terminal: 'dev', username: trimmed });
            addLineDev('[ERREUR] Accès refusé.', 'error');
            playSound('error');
            enforceAttemptDelay('dev', devTerminalInput);
        }
    } else if (_$devLoginStep === 'password') {
        const hashedInput = await sha256(trimmed + _$SALT);
        if (hashedInput === _$AUTH._d._p) {
            _$devLoginStep = '2fa';
            devTerminalInput.type = 'text';
            updatePromptDev('2FA:~$');
            generate2FACode();
            addLineDev('');
            addLineDev('[2FA] 🔐 Code généré! Ouvrez F12', 'warning');
            addLineDev('[2FA] ⏱️ 60 secondes', 'info');
        } else {
            addFailedAttempt('dev');
            recordConnectionAttempt('dev', false, _$devTempUser);
            sendSecurityAlert('login_failed', { terminal: 'dev', username: _$devTempUser });
            addLineDev('[ERREUR] Mot de passe incorrect.', 'error');
            playSound('error');
            enforceAttemptDelay('dev', devTerminalInput);
            const data = getLoginAttempts('dev');
            if (data.count >= 2 && !data.locked) addLineDev(`[!] ${_$MAX_ATTEMPTS - data.count} tentative(s)`, 'warning');
        }
    } else if (_$devLoginStep === '2fa') {
        const result = verify2FACode(trimmed);
        if (result === true) {
            resetLoginAttempts('dev');
            _$devLoggedIn = true;
            _$devSession = Date.now();
            _$lastActivity = Date.now();
            devTerminalInput.type = 'text';
            updatePromptDev('dev@plomberie:~$');
            recordConnection('dev');
            recordConnectionAttempt('dev', true, 'dev');
            sendSecurityAlert('login_success', { terminal: 'DEV' });
            addLog('CONNEXION', 'Dev + 2FA');
            playSound('success');
            addLineDev('');
            addLineDev('✅ Authentification 2FA réussie!', 'success');
            addLineDev(`v${_$VERSION} SECURE | Session: 30 min`, 'info');
            const history = getConnectionHistory(), threats = history.filter(h => !h.success).length, banned = getBannedIPs().length;
            addLineDev(`📊 ${getSubmissions().length} demandes | ⚠️ ${threats} menaces | 🚫 ${banned} bans`, 'warning');
        } else if (result === 'expired') { addLineDev('[ERREUR] Code expiré!', 'error'); playSound('error'); _$devLoginStep = 'username'; devTerminalInput.type = 'text'; updatePromptDev('login:~$'); }
        else { addLineDev('[ERREUR] Code incorrect.', 'error'); playSound('error'); }
    }
}

function processDevCommand(input) {
    const trimmed = input.trim();
    if (!_$devLoggedIn) { processDevLogin(trimmed); return; }
    updateActivity();
    const parts = trimmed.split(' '), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    addLineDev(`dev@plomberie:~$ ${trimmed}`);
    if (devCommands[cmd]) devCommands[cmd](args);
    else if (trimmed !== '') addLineDev(`[ERREUR] Commande inconnue: ${cmd}`, 'error');
}

// ==========================================
// EVENT LISTENERS
// ==========================================
if (terminalInput) {
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !_$inputDisabled) { processAdminCommand(terminalInput.value); terminalInput.value = ''; }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (adminModal?.classList.contains('show')) { adminModal.classList.remove('show'); _$currentTerminal = null; }
        if (devModal?.classList.contains('show')) { devModal.classList.remove('show'); _$currentTerminal = null; }
    }
});

adminModal?.addEventListener('click', (e) => { if (e.target === adminModal) { adminModal.classList.remove('show'); _$currentTerminal = null; } });

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let c = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 200) c = s.getAttribute('id'); });
    document.querySelectorAll('.nav-link').forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === '#' + c) l.classList.add('active'); });
});

// ==========================================
// INIT
// ==========================================
console.log('%c🔧 Plomberie Expert v' + _$VERSION + ' SECURE', 'font-size: 20px; font-weight: bold; color: #ff6b35;');
console.log('%c🔒 Sécurité: 2FA + Paranoïa + Sons', 'color: #00ff41;');
console.log('%c🔔 Alertes: Discord/Telegram prêt', 'color: #ffff00;');
console.log('%c👆 Admin: ⚙ | Dev: triple-clic logo', 'color: gray;');

// ==========================================
// 🤖 CHATBOT INTÉGRÉ
// ==========================================
let _$chatbotMode = false;

const _$CHATBOT = {
    name: 'PlomBot',
    
    // Patterns de reconnaissance
    patterns: [
        // Salutations
        { regex: /^(salut|hello|yo|coucou|bonjour|hey|wesh)/i, response: 'greet' },
        { regex: /^(ça va|ca va|comment vas|comment tu vas)/i, response: 'how_are_you' },
        { regex: /^(merci|thanks|thx)/i, response: 'thanks' },
        { regex: /^(au revoir|bye|ciao|a\+|a plus)/i, response: 'bye' },
        
        // Questions sur les demandes
        { regex: /(combien|nombre).*(demande|message|formulaire)/i, response: 'count_demands' },
        { regex: /(y'?a|ya|il y a|as?-?tu).*(urgence|urgent)/i, response: 'check_urgences' },
        { regex: /(non lue|pas lu|nouveau|nouvelle)/i, response: 'check_unread' },
        { regex: /(liste|montre|affiche|voir).*(demande|message|tout)/i, response: 'list_demands' },
        { regex: /(liste|montre|affiche|voir).*(urgence|urgent)/i, response: 'show_urgences' },
        { regex: /(dernière|dernier|récent).*(demande|message)/i, response: 'last_demand' },
        
        // Questions sur la sécurité
        { regex: /(sécurité|secu|securité|menace|threat|hack)/i, response: 'security_status' },
        { regex: /(qui|combien).*(connect|visit|venu|passé)/i, response: 'visitors_info' },
        { regex: /(ban|banni|bloqué).*(ip|adresse)/i, response: 'banned_info' },
        { regex: /(mon|ma|quelle).*(ip|adresse)/i, response: 'my_ip' },
        { regex: /(paranoïa|paranoia|lockdown)/i, response: 'paranoia_status' },
        { regex: /(historique|history|connexion|log)/i, response: 'connection_history' },
        
        // Questions sur le site
        { regex: /(status|état|etat|comment va).*(site|tout)/i, response: 'site_status' },
        { regex: /(maintenance)/i, response: 'maintenance_status' },
        { regex: /(version|quelle version)/i, response: 'version_info' },
        
        // Commandes naturelles
        { regex: /(efface|clear|nettoie|vide).*(écran|terminal|console)/i, response: 'cmd_clear' },
        { regex: /(déconnect|logout|déco|quitter)/i, response: 'cmd_logout' },
        { regex: /(aide|help|comment|explique)/i, response: 'help' },
        { regex: /(test|teste).*(son|sound|audio)/i, response: 'cmd_test_sound' },
        
        // Fun
        { regex: /(qui es[- ]?tu|tu es qui|c'?est quoi ton nom)/i, response: 'who_am_i' },
        { regex: /(blague|joke|rigole|marrant|drôle)/i, response: 'joke' },
        { regex: /(heure|quelle heure|time)/i, response: 'time' },
        { regex: /(date|quel jour|aujourd)/i, response: 'date' },
    ],
    
    // Réponses
    getResponse: function(input, terminal) {
        const addLine = terminal === 'dev' ? addLineDev : addLineAdmin;
        const trimmed = input.trim().toLowerCase();
        
        // Chercher un pattern qui match
        for (const pattern of this.patterns) {
            if (pattern.regex.test(trimmed)) {
                return this.executeResponse(pattern.response, terminal);
            }
        }
        
        // Pas de match trouvé
        return this.defaultResponse(terminal);
    },
    
    executeResponse: function(responseType, terminal) {
        const addLine = terminal === 'dev' ? addLineDev : addLineAdmin;
        const subs = getSubmissions();
        const urgences = subs.filter(s => s.urgence === 'urgence');
        const unread = subs.filter(s => !s.read);
        const visitors = getVisitors();
        const history = getConnectionHistory();
        const banned = getBannedIPs();
        const paranoia = getParanoiaStatus();
        
        switch(responseType) {
            // Salutations
            case 'greet':
                const greets = [
                    `Salut chef ! 👋 Comment je peux t'aider ?`,
                    `Hey ! 🔧 Qu'est-ce qu'on fait aujourd'hui ?`,
                    `Yo ! Je suis là, dis-moi tout !`,
                    `Bonjour ! PlomBot à ton service 🤖`
                ];
                addLine(`🤖 ${greets[Math.floor(Math.random() * greets.length)]}`);
                break;
                
            case 'how_are_you':
                addLine(`🤖 Ça roule ! Le site tourne bien, ${subs.length} demandes au compteur.`);
                if (urgences.length > 0) addLine(`   ⚠️ Par contre, t'as ${urgences.length} urgence(s) à checker !`, 'warning');
                break;
                
            case 'thanks':
                addLine(`🤖 De rien ! C'est mon taf 😎`);
                break;
                
            case 'bye':
                addLine(`🤖 À plus ! Tape "exit" si tu veux quitter le mode chat.`);
                break;
            
            // Demandes
            case 'count_demands':
                addLine(`🤖 T'as ${subs.length} demande(s) au total.`);
                if (unread.length > 0) addLine(`   📬 Dont ${unread.length} non lue(s)`, 'warning');
                if (urgences.length > 0) addLine(`   🚨 Et ${urgences.length} urgence(s) !`, 'error');
                break;
                
            case 'check_urgences':
                if (urgences.length === 0) {
                    addLine(`🤖 Non, aucune urgence ! Tout est calme 😌`, 'success');
                } else {
                    addLine(`🤖 OUI ! ${urgences.length} urgence(s) en attente ! 🚨`, 'error');
                    urgences.slice(0, 3).forEach(u => {
                        addLine(`   → ${u.nom} - ${u.tel}`, 'warning');
                    });
                    addLine(`   Tape "urgences" pour tout voir.`);
                }
                break;
                
            case 'check_unread':
                if (unread.length === 0) {
                    addLine(`🤖 Tout est lu ! T'es à jour 👍`, 'success');
                } else {
                    addLine(`🤖 T'as ${unread.length} message(s) non lu(s) 📬`, 'warning');
                    addLine(`   Tape "unread" pour les voir.`);
                }
                break;
                
            case 'list_demands':
                addLine(`🤖 OK, voilà les demandes :`);
                if (subs.length === 0) {
                    addLine(`   Aucune demande pour l'instant.`, 'info');
                } else {
                    subs.slice(0, 5).forEach(s => {
                        addLine(`   #${s.id} | ${s.nom} | ${s.tel}${s.urgence === 'urgence' ? ' 🚨' : ''}${s.read ? '' : ' ●'}`);
                    });
                    if (subs.length > 5) addLine(`   ... et ${subs.length - 5} autres. Tape "list" pour tout voir.`);
                }
                break;
                
            case 'show_urgences':
                if (urgences.length === 0) {
                    addLine(`🤖 Aucune urgence ! 🎉`, 'success');
                } else {
                    addLine(`🤖 ${urgences.length} urgence(s) :`, 'error');
                    urgences.forEach(u => {
                        addLine(`   🚨 #${u.id} | ${u.nom} | ${u.tel}`, 'warning');
                    });
                }
                break;
                
            case 'last_demand':
                if (subs.length === 0) {
                    addLine(`🤖 Aucune demande reçue.`, 'info');
                } else {
                    const last = subs[0];
                    addLine(`🤖 Dernière demande :`);
                    addLine(`   #${last.id} | ${last.date}`);
                    addLine(`   ${last.nom} | ${last.tel}`);
                    addLine(`   Type: ${getUrgenceLabel(last.urgence)} | Msg: ${last.message.substring(0, 50)}...`);
                }
                break;
            
            // Sécurité
            case 'security_status':
                addLine(`🤖 État sécurité :`);
                addLine(`   🔒 Mode Paranoïa: ${paranoia.active ? 'ACTIF ⚠️' : 'Inactif ✅'}`);
                addLine(`   🚫 IPs bannies: ${banned.length}`);
                addLine(`   ⚠️ Menaces détectées: ${history.filter(h => !h.success).length}`);
                addLine(`   👥 Visiteurs uniques: ${new Set(visitors.map(v => v.ip)).size}`);
                if (history.filter(h => !h.success).length > 5) {
                    addLine(`   💡 Conseil: Check "threats" pour voir les détails`, 'warning');
                }
                break;
                
            case 'visitors_info':
                const uniqueVisitors = new Set(visitors.map(v => v.ip)).size;
                addLine(`🤖 Stats visiteurs :`);
                addLine(`   👥 ${uniqueVisitors} visiteur(s) unique(s)`);
                addLine(`   📊 ${visitors.length} visite(s) totale(s)`);
                addLine(`   📍 Dernier: ${visitors[0]?.geo?.city || '?'}, ${visitors[0]?.geo?.country || '?'}`);
                addLine(`   Tape "visitors" pour la liste complète.`);
                break;
                
            case 'banned_info':
                if (banned.length === 0) {
                    addLine(`🤖 Aucune IP bannie ! 👍`, 'success');
                } else {
                    addLine(`🤖 ${banned.length} IP(s) bannie(s) :`, 'warning');
                    banned.slice(0, 3).forEach(b => {
                        addLine(`   🚫 ${b.ip} - ${b.reason}`);
                    });
                    if (banned.length > 3) addLine(`   Tape "banned" pour tout voir.`);
                }
                break;
                
            case 'my_ip':
                addLine(`🤖 Ton IP : ${_$visitorIP || 'Chargement...'}`);
                if (_$visitorGeo) {
                    addLine(`   📍 ${_$visitorGeo.city}, ${_$visitorGeo.country}`);
                    addLine(`   🌐 ${_$visitorGeo.isp}`);
                    if (_$visitorGeo.isVPN) addLine(`   ⚠️ VPN/Proxy détecté !`, 'warning');
                }
                break;
                
            case 'paranoia_status':
                if (paranoia.active) {
                    addLine(`🤖 🔒 MODE PARANOÏA ACTIF !`, 'error');
                    addLine(`   ⏱️ Temps restant: ${paranoia.remainingMinutes} min`);
                    addLine(`   💡 Tape "paranoia-off" pour désactiver.`);
                } else {
                    addLine(`🤖 Mode Paranoïa inactif 🟢`, 'success');
                    addLine(`   Se déclenche après 10 échecs en 1h.`);
                }
                break;
                
            case 'connection_history':
                addLine(`🤖 Dernières connexions :`);
                history.slice(0, 5).forEach(h => {
                    const icon = h.success ? '✅' : '❌';
                    addLine(`   ${icon} ${h.date} | ${h.terminal} | ${h.ip}`);
                });
                addLine(`   Tape "history" pour tout voir.`);
                break;
            
            // Site
            case 'site_status':
                const config = getConfig();
                addLine(`🤖 Status du site :`);
                addLine(`   🌐 Version: ${_$VERSION}`);
                addLine(`   🔧 Maintenance: ${config.maintenance ? 'ON ⚠️' : 'OFF ✅'}`);
                addLine(`   🛒 Boutique: ${config.shopEnabled ? 'ON' : 'OFF'}`);
                addLine(`   📬 Demandes: ${subs.length} (${unread.length} non lues)`);
                addLine(`   🚨 Urgences: ${urgences.length}`);
                break;
                
            case 'maintenance_status':
                const conf = getConfig();
                if (conf.maintenance) {
                    addLine(`🤖 Maintenance ACTIVÉE ⚠️`, 'warning');
                    addLine(`   Message: "${conf.maintenanceMsg}"`);
                    addLine(`   💡 Tape "maintenance off" pour désactiver.`);
                } else {
                    addLine(`🤖 Maintenance désactivée ✅`, 'success');
                }
                break;
                
            case 'version_info':
                addLine(`🤖 Plomberie Expert v${_$VERSION}`);
                addLine(`   Build: ${_$BUILD}`);
                addLine(`   Mode: SECURE 🔒`);
                break;
            
            // Commandes
            case 'cmd_clear':
                addLine(`🤖 OK, j'efface !`);
                setTimeout(() => {
                    if (terminal === 'dev') devCommands.clear();
                    else adminCommands.clear();
                }, 500);
                break;
                
            case 'cmd_logout':
                addLine(`🤖 À plus ! Je te déconnecte...`);
                setTimeout(() => {
                    if (terminal === 'dev') devCommands.logout();
                    else adminCommands.logout();
                }, 1000);
                break;
                
            case 'cmd_test_sound':
                addLine(`🤖 OK, je teste les sons !`);
                if (terminal === 'dev') devCommands.sound(['test']);
                break;
                
            case 'help':
                addLine(`🤖 Voilà ce que je peux faire :`);
                addLine(`   📬 "combien de demandes ?" - Stats demandes`);
                addLine(`   🚨 "y'a des urgences ?" - Check urgences`);
                addLine(`   🔒 "sécurité ?" - État sécurité`);
                addLine(`   👥 "qui s'est connecté ?" - Historique`);
                addLine(`   📊 "status du site ?" - État général`);
                addLine(`   🧹 "efface l'écran" - Clear`);
                addLine(`   👋 "déconnecte moi" - Logout`);
                addLine(`   ... et plein d'autres trucs ! Pose ta question 😉`);
                break;
            
            // Fun
            case 'who_am_i':
                addLine(`🤖 Je suis PlomBot, ton assistant plomberie !`);
                addLine(`   🔧 Je t'aide à gérer le site`);
                addLine(`   🔒 Je surveille la sécurité`);
                addLine(`   💬 Et je réponds à tes questions !`);
                break;
                
            case 'joke':
                const jokes = [
                    "Pourquoi les plombiers sont toujours calmes ? Parce qu'ils laissent couler ! 😂",
                    "C'est l'histoire d'un tuyau... ah non elle est trop longue 🤣",
                    "Un plombier rentre chez lui : 'Chérie, je suis JOINT !' 💨😂",
                    "Quel est le comble pour un plombier ? De ne pas être dans le coup ! 🔧"
                ];
                addLine(`🤖 ${jokes[Math.floor(Math.random() * jokes.length)]}`);
                break;
                
            case 'time':
                addLine(`🤖 Il est ${new Date().toLocaleTimeString('fr-FR')} ⏰`);
                break;
                
            case 'date':
                addLine(`🤖 On est le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 📅`);
                break;
        }
    },
    
    defaultResponse: function(terminal) {
        const addLine = terminal === 'dev' ? addLineDev : addLineAdmin;
        const defaults = [
            "Hmm, j'ai pas compris 🤔 Essaie de reformuler ?",
            "Je suis pas sûr de comprendre... Tape 'aide' pour voir ce que je sais faire !",
            "Euh... tu peux répéter ? 😅",
            "J'ai pas cette info. Pose-moi une question sur les demandes, la sécu, ou le site !"
        ];
        addLine(`🤖 ${defaults[Math.floor(Math.random() * defaults.length)]}`);
    }
};

// Commande chat pour le terminal DEV
devCommands.chat = (args) => {
    if (!args.length) {
        addLineDev('[ERREUR] Usage: chat [message] ou "chatbot" pour le mode conversation', 'error');
        return;
    }
    const message = args.join(' ');
    addLineDev(`💬 Toi: ${message}`);
    _$CHATBOT.getResponse(message, 'dev');
};

devCommands.chatbot = () => {
    _$chatbotMode = true;
    addLineDev('');
    addLineDev('╔══════════════════════════════════════════════════════════════╗');
    addLineDev('║              🤖 MODE CHATBOT ACTIVÉ                          ║');
    addLineDev('╚══════════════════════════════════════════════════════════════╝');
    addLineDev('');
    addLineDev('🤖 Salut ! Je suis PlomBot, ton assistant.');
    addLineDev('   Parle-moi directement, pas besoin de taper "chat".');
    addLineDev('   Tape "exit" pour quitter le mode chatbot.');
    addLineDev('');
    updatePromptDev('plombot:~$');
};

devCommands.exit = () => {
    if (_$chatbotMode) {
        _$chatbotMode = false;
        addLineDev('🤖 À plus ! Mode chatbot désactivé.');
        addLineDev('');
        updatePromptDev('dev@plomberie:~$');
    } else {
        addLineDev('[INFO] Tu n\'es pas en mode chatbot.', 'info');
    }
};

// Commande chat pour le terminal ADMIN (plus simple)
adminCommands.chat = (args) => {
    if (!args.length) {
        addLineAdmin('[ERREUR] Usage: chat [message]', 'error');
        return;
    }
    const message = args.join(' ');
    addLineAdmin(`💬 Toi: ${message}`);
    _$CHATBOT.getResponse(message, 'admin');
};

// Modifier processDevCommand pour le mode chatbot
const _originalProcessDevCommand = processDevCommand;
processDevCommand = function(input) {
    const trimmed = input.trim();
    
    // Si on est en mode chatbot
    if (_$chatbotMode && _$devLoggedIn) {
        if (trimmed.toLowerCase() === 'exit') {
            devCommands.exit();
            return;
        }
        addLineDev(`💬 Toi: ${trimmed}`);
        _$CHATBOT.getResponse(trimmed, 'dev');
        return;
    }
    
    // Sinon, traitement normal
    if (!_$devLoggedIn) { processDevLogin(trimmed); return; }
    updateActivity();
    const parts = trimmed.split(' '), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    addLineDev(`dev@plomberie:~$ ${trimmed}`);
    if (devCommands[cmd]) devCommands[cmd](args);
    else if (trimmed !== '') addLineDev(`[ERREUR] Commande inconnue: ${cmd}`, 'error');
};

// Ajouter les commandes au help
const _originalDevHelp = devCommands.help;
devCommands.help = () => {
    _originalDevHelp();
    addLineDev('═══ CHATBOT 🤖 ═══', 'warning');
    addLineDev('  chat [msg]      - Parler au chatbot');
    addLineDev('  chatbot         - Mode conversation');
    addLineDev('  exit            - Quitter mode chatbot');
    addLineDev('');
};

console.log('%c🤖 PlomBot chargé !', 'color: #00bfff;');

// ==========================================
// 🎨 THEME SWITCHER + ESTHÉTIQUE
// ==========================================

const _$THEMES = {
    default: {
        name: 'Défaut',
        primary: '#ff6b35',
        secondary: '#1a1a2e',
        accent: '#00ff41',
        bg: '#0f0f1a',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #ff6b35, #ff8c42)'
    },
    violet: {
        name: 'Violet Nuit',
        primary: '#8b5cf6',
        secondary: '#1e1b4b',
        accent: '#a78bfa',
        bg: '#0f0a1f',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    },
    ocean: {
        name: 'Océan',
        primary: '#0ea5e9',
        secondary: '#0c4a6e',
        accent: '#38bdf8',
        bg: '#0a1929',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
    },
    emerald: {
        name: 'Émeraude',
        primary: '#10b981',
        secondary: '#064e3b',
        accent: '#34d399',
        bg: '#0a1f1a',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    rose: {
        name: 'Rose Gold',
        primary: '#f43f5e',
        secondary: '#4c0519',
        accent: '#fb7185',
        bg: '#1a0a10',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)'
    },
    sunset: {
        name: 'Coucher de soleil',
        primary: '#f59e0b',
        secondary: '#78350f',
        accent: '#fbbf24',
        bg: '#1a1207',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #f59e0b, #f97316)'
    },
    cyberpunk: {
        name: 'Cyberpunk',
        primary: '#f0e130',
        secondary: '#1a1a2e',
        accent: '#00fff5',
        bg: '#0a0a0f',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #f0e130, #00fff5)'
    },
    matrix: {
        name: 'Matrix',
        primary: '#00ff41',
        secondary: '#0a1f0a',
        accent: '#00ff41',
        bg: '#000000',
        text: '#00ff41',
        gradient: 'linear-gradient(135deg, #00ff41, #003300)'
    },
    blood: {
        name: 'Sang',
        primary: '#dc2626',
        secondary: '#450a0a',
        accent: '#ef4444',
        bg: '#0f0505',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #dc2626, #7f1d1d)'
    },
    ice: {
        name: 'Glace',
        primary: '#06b6d4',
        secondary: '#164e63',
        accent: '#67e8f9',
        bg: '#0a1419',
        text: '#ffffff',
        gradient: 'linear-gradient(135deg, #06b6d4, #67e8f9)'
    }
};

let _$currentTheme = localStorage.getItem('_$theme') || 'default';

function applyTheme(themeName) {
    const theme = _$THEMES[themeName];
    if (!theme) return false;
    
    _$currentTheme = themeName;
    localStorage.setItem('_$theme', themeName);
    
    // Appliquer les variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--primary-gradient', theme.gradient);
    
    // Modifier les éléments directement si les variables CSS ne sont pas utilisées
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    
    // Header
    const header = document.getElementById('header');
    if (header) {
        header.style.background = theme.bg + 'ee';
    }
    
    // Boutons CTA
    document.querySelectorAll('.cta-button, .btn-primary, .submit-btn').forEach(btn => {
        btn.style.background = theme.gradient;
    });
    
    // Titres avec gradient
    document.querySelectorAll('.section-title, .hero-title').forEach(el => {
        el.style.background = theme.gradient;
        el.style.webkitBackgroundClip = 'text';
        el.style.webkitTextFillColor = 'transparent';
        el.style.backgroundClip = 'text';
    });
    
    // Cards
    document.querySelectorAll('.service-card, .realisation-card, .temoignage-card, .tarif-card').forEach(card => {
        card.style.borderColor = theme.primary + '33';
        card.style.background = theme.secondary + '88';
    });
    
    // Liens nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.style.color = theme.text;
    });
    
    // Footer
    const footer = document.querySelector('.footer');
    if (footer) footer.style.background = theme.secondary;
    
    // Icônes et accents
    document.querySelectorAll('.service-icon, .feature-icon').forEach(icon => {
        icon.style.color = theme.primary;
    });
    
    addLog('THEME', `Thème changé: ${theme.name}`);
    return true;
}

// Appliquer le thème sauvegardé au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (_$currentTheme !== 'default') {
        applyTheme(_$currentTheme);
    }
});

// Créer le bouton Theme Switcher flottant
function createThemeSwitcher() {
    if (document.getElementById('themeSwitcher')) return;
    
    const switcher = document.createElement('div');
    switcher.id = 'themeSwitcher';
    switcher.innerHTML = `
        <button id="themeToggleBtn" title="Changer le thème">🎨</button>
        <div id="themePanel" class="theme-panel hidden">
            <h4>🎨 Thèmes</h4>
            <div class="theme-grid">
                ${Object.entries(_$THEMES).map(([key, theme]) => `
                    <button class="theme-btn ${key === _$currentTheme ? 'active' : ''}" data-theme="${key}" style="background: ${theme.gradient}">
                        ${theme.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Styles
    const styles = document.createElement('style');
    styles.textContent = `
        #themeSwitcher {
            position: fixed;
            bottom: 100px;
            right: 20px;
            z-index: 9999;
        }
        #themeToggleBtn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #ff6b35, #8b5cf6, #0ea5e9, #10b981);
            background-size: 300% 300%;
            animation: gradientShift 5s ease infinite;
            cursor: pointer;
            font-size: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        #themeToggleBtn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(0,0,0,0.4);
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .theme-panel {
            position: absolute;
            bottom: 60px;
            right: 0;
            width: 280px;
            background: #1a1a2e;
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
            transition: opacity 0.3s, transform 0.3s;
        }
        .theme-panel.hidden {
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        }
        .theme-panel h4 {
            margin: 0 0 15px 0;
            color: white;
            text-align: center;
        }
        .theme-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .theme-btn {
            padding: 10px;
            border: 2px solid transparent;
            border-radius: 8px;
            color: white;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
        .theme-btn:hover {
            transform: scale(1.05);
            border-color: white;
        }
        .theme-btn.active {
            border-color: white;
            box-shadow: 0 0 15px rgba(255,255,255,0.3);
        }
    `;
    document.head.appendChild(styles);
    document.body.appendChild(switcher);
    
    // Events
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        document.getElementById('themePanel').classList.toggle('hidden');
    });
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playSound('notification');
        });
    });
    
    // Fermer si clic dehors
    document.addEventListener('click', (e) => {
        if (!switcher.contains(e.target)) {
            document.getElementById('themePanel')?.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', createThemeSwitcher);

// Commandes terminal pour les thèmes
devCommands.theme = (args) => {
    if (!args[0]) {
        addLineDev(`🎨 Thème actuel: ${_$THEMES[_$currentTheme].name}`);
        addLineDev('');
        addLineDev('Thèmes disponibles:', 'info');
        Object.entries(_$THEMES).forEach(([key, theme]) => {
            const active = key === _$currentTheme ? ' ← actif' : '';
            addLineDev(`  ${key.padEnd(12)} - ${theme.name}${active}`);
        });
        addLineDev('');
        addLineDev('Usage: theme [nom]', 'info');
        return;
    }
    
    const themeName = args[0].toLowerCase();
    if (_$THEMES[themeName]) {
        applyTheme(themeName);
        addLineDev(`✅ Thème "${_$THEMES[themeName].name}" appliqué!`, 'success');
        playSound('success');
    } else {
        addLineDev(`[ERREUR] Thème "${themeName}" inconnu.`, 'error');
    }
};

devCommands.themes = () => devCommands.theme([]);

// ==========================================
// ☔ MATRIX EFFECT
// ==========================================
let _$matrixActive = false;
let _$matrixCanvas = null;
let _$matrixInterval = null;

function startMatrixEffect() {
    if (_$matrixActive) return;
    _$matrixActive = true;
    
    // Créer le canvas
    _$matrixCanvas = document.createElement('canvas');
    _$matrixCanvas.id = 'matrixCanvas';
    _$matrixCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9998;
        pointer-events: none;
        opacity: 0.15;
    `;
    document.body.appendChild(_$matrixCanvas);
    
    const ctx = _$matrixCanvas.getContext('2d');
    _$matrixCanvas.width = window.innerWidth;
    _$matrixCanvas.height = window.innerHeight;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソ';
    const fontSize = 14;
    const columns = _$matrixCanvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, _$matrixCanvas.width, _$matrixCanvas.height);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > _$matrixCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    _$matrixInterval = setInterval(draw, 50);
    
    // Resize handler
    window.addEventListener('resize', () => {
        if (_$matrixCanvas) {
            _$matrixCanvas.width = window.innerWidth;
            _$matrixCanvas.height = window.innerHeight;
        }
    });
}

function stopMatrixEffect() {
    if (!_$matrixActive) return;
    _$matrixActive = false;
    
    if (_$matrixInterval) {
        clearInterval(_$matrixInterval);
        _$matrixInterval = null;
    }
    if (_$matrixCanvas) {
        _$matrixCanvas.remove();
        _$matrixCanvas = null;
    }
}

devCommands.matrix = (args) => {
    if (args[0] === 'off' || _$matrixActive) {
        stopMatrixEffect();
        addLineDev('☔ Matrix effect désactivé.', 'info');
    } else {
        startMatrixEffect();
        applyTheme('matrix');
        addLineDev('☔ Matrix effect activé!', 'success');
        addLineDev('   Tape "matrix off" pour désactiver.');
    }
};

// ==========================================
// 📊 ANALYTICS AVANCÉS
// ==========================================

// Tracking du temps passé sur le site
let _$pageLoadTime = Date.now();
let _$lastActivityTime = Date.now();

function trackTimeSpent() {
    const timeSpent = Math.floor((Date.now() - _$pageLoadTime) / 1000);
    let sessions = JSON.parse(localStorage.getItem('_$sessions') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const existingSession = sessions.find(s => s.date === today && s.fingerprint === _$fingerprint);
    
    if (existingSession) {
        existingSession.duration += timeSpent;
        existingSession.pages++;
    } else {
        sessions.push({
            date: today,
            duration: timeSpent,
            pages: 1,
            fingerprint: _$fingerprint,
            device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        });
    }
    
    // Garder 30 jours
    const limit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    sessions = sessions.filter(s => s.date >= limit);
    localStorage.setItem('_$sessions', JSON.stringify(sessions));
}

// Sauvegarder avant de quitter
window.addEventListener('beforeunload', trackTimeSpent);

// Tracking des clics (heatmap simplifié)
let _$clickData = JSON.parse(localStorage.getItem('_$clicks') || '[]');

document.addEventListener('click', (e) => {
    const x = Math.round(e.clientX / window.innerWidth * 100);
    const y = Math.round(e.clientY / window.innerHeight * 100);
    const target = e.target.tagName + (e.target.className ? '.' + e.target.className.split(' ')[0] : '');
    
    _$clickData.push({
        x, y, target,
        timestamp: Date.now(),
        page: window.location.pathname
    });
    
    // Garder les 1000 derniers clics
    if (_$clickData.length > 1000) _$clickData = _$clickData.slice(-1000);
    localStorage.setItem('_$clicks', JSON.stringify(_$clickData));
});

// Stats appareils
function getDeviceStats() {
    const visitors = getVisitors();
    const stats = { Mobile: 0, Desktop: 0, Tablet: 0 };
    visitors.forEach(v => {
        if (v.device && stats[v.device] !== undefined) {
            stats[v.device]++;
        }
    });
    return stats;
}

// Stats sources de trafic
function getTrafficSources() {
    const visitors = getVisitors();
    const sources = {};
    visitors.forEach(v => {
        const ref = v.referrer || 'Direct';
        let source = 'Direct';
        if (ref.includes('google')) source = 'Google';
        else if (ref.includes('facebook') || ref.includes('fb.')) source = 'Facebook';
        else if (ref.includes('instagram')) source = 'Instagram';
        else if (ref.includes('twitter') || ref.includes('x.com')) source = 'Twitter/X';
        else if (ref.includes('linkedin')) source = 'LinkedIn';
        else if (ref !== 'Direct') source = 'Autre';
        
        sources[source] = (sources[source] || 0) + 1;
    });
    return sources;
}

// Commandes Analytics
devCommands.analytics = () => {
    const visitors = getVisitors();
    const devices = getDeviceStats();
    const sources = getTrafficSources();
    const sessions = JSON.parse(localStorage.getItem('_$sessions') || '[]');
    const clicks = JSON.parse(localStorage.getItem('_$clicks') || '[]');
    
    // Calcul temps moyen
    const totalTime = sessions.reduce((a, b) => a + b.duration, 0);
    const avgTime = sessions.length > 0 ? Math.round(totalTime / sessions.length) : 0;
    const avgMins = Math.floor(avgTime / 60);
    const avgSecs = avgTime % 60;
    
    addLineDev('');
    addLineDev('╔══════════════════════════════════════════════════════════════╗');
    addLineDev('║              📊 ANALYTICS COMPLET                            ║');
    addLineDev('╚══════════════════════════════════════════════════════════════╝');
    addLineDev('');
    
    addLineDev('═══ 👥 VISITEURS ═══', 'info');
    addLineDev(`  Total visites: ${visitors.length}`);
    addLineDev(`  Visiteurs uniques: ${new Set(visitors.map(v => v.ip)).size}`);
    addLineDev(`  Aujourd'hui: ${visitors.filter(v => v.date?.includes(new Date().toLocaleDateString('fr-FR'))).length}`);
    addLineDev('');
    
    addLineDev('═══ 📱 APPAREILS ═══', 'info');
    Object.entries(devices).forEach(([device, count]) => {
        const pct = visitors.length > 0 ? Math.round(count / visitors.length * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
        addLineDev(`  ${device.padEnd(8)} ${bar} ${pct}% (${count})`);
    });
    addLineDev('');
    
    addLineDev('═══ 🔗 SOURCES ═══', 'info');
    Object.entries(sources).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
        const pct = visitors.length > 0 ? Math.round(count / visitors.length * 100) : 0;
        addLineDev(`  ${source.padEnd(10)} - ${count} (${pct}%)`);
    });
    addLineDev('');
    
    addLineDev('═══ ⏱️ TEMPS PASSÉ ═══', 'info');
    addLineDev(`  Sessions: ${sessions.length}`);
    addLineDev(`  Temps moyen: ${avgMins}m ${avgSecs}s`);
    addLineDev(`  Temps total: ${Math.round(totalTime / 60)}min`);
    addLineDev('');
    
    addLineDev('═══ 🖱️ CLICS ═══', 'info');
    addLineDev(`  Total clics enregistrés: ${clicks.length}`);
    addLineDev(`  Tape "heatmap" pour voir les zones chaudes.`);
    addLineDev('');
};

devCommands.devices = () => {
    const devices = getDeviceStats();
    const total = Object.values(devices).reduce((a, b) => a + b, 0);
    
    addLineDev('');
    addLineDev('═══ 📱 STATS APPAREILS ═══', 'info');
    Object.entries(devices).forEach(([device, count]) => {
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 2.5)) + '░'.repeat(40 - Math.round(pct / 2.5));
        addLineDev(`  ${device.padEnd(8)} ${bar} ${pct}%`);
    });
    addLineDev('');
};

devCommands.sources = () => {
    const sources = getTrafficSources();
    const total = Object.values(sources).reduce((a, b) => a + b, 0);
    
    addLineDev('');
    addLineDev('═══ 🔗 SOURCES DE TRAFIC ═══', 'info');
    Object.entries(sources).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 2.5)) + '░'.repeat(40 - Math.round(pct / 2.5));
        addLineDev(`  ${source.padEnd(10)} ${bar} ${pct}%`);
    });
    addLineDev('');
};

devCommands.heatmap = () => {
    const clicks = JSON.parse(localStorage.getItem('_$clicks') || '[]');
    
    if (clicks.length < 10) {
        addLineDev('[INFO] Pas assez de données (min 10 clics).', 'info');
        return;
    }
    
    // Créer une grille 10x10
    const grid = Array(10).fill(null).map(() => Array(10).fill(0));
    clicks.forEach(c => {
        const gx = Math.min(Math.floor(c.x / 10), 9);
        const gy = Math.min(Math.floor(c.y / 10), 9);
        grid[gy][gx]++;
    });
    
    const max = Math.max(...grid.flat(), 1);
    
    addLineDev('');
    addLineDev('═══ 🌡️ HEATMAP CLICS ═══', 'info');
    addLineDev('   (Rouge = beaucoup de clics)');
    addLineDev('');
    
    const heatChars = ['░', '▒', '▓', '█'];
    grid.forEach(row => {
        let line = '  ';
        row.forEach(cell => {
            const intensity = Math.floor((cell / max) * 3);
            line += heatChars[intensity] + heatChars[intensity];
        });
        addLineDev(line);
    });
    
    addLineDev('');
    addLineDev(`  Total clics: ${clicks.length}`, 'info');
    
    // Top zones cliquées
    const topTargets = {};
    clicks.forEach(c => {
        topTargets[c.target] = (topTargets[c.target] || 0) + 1;
    });
    
    addLineDev('');
    addLineDev('═══ TOP ÉLÉMENTS CLIQUÉS ═══', 'info');
    Object.entries(topTargets)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([target, count]) => {
            addLineDev(`  ${target.substring(0, 30).padEnd(30)} - ${count} clics`);
        });
    addLineDev('');
};

devCommands['time-spent'] = () => {
    const sessions = JSON.parse(localStorage.getItem('_$sessions') || '[]');
    
    addLineDev('');
    addLineDev('═══ ⏱️ TEMPS PASSÉ SUR LE SITE ═══', 'info');
    addLineDev('');
    
    // Par jour (7 derniers jours)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const daySessions = sessions.filter(s => s.date === dateStr);
        const totalSec = daySessions.reduce((a, b) => a + b.duration, 0);
        const mins = Math.floor(totalSec / 60);
        const bar = '█'.repeat(Math.min(Math.round(mins / 2), 30)) + '░'.repeat(Math.max(30 - Math.round(mins / 2), 0));
        addLineDev(`  ${dayName.padEnd(4)} ${bar} ${mins}min`);
    }
    addLineDev('');
};

// ==========================================
// 📤 EXPORT PDF (simulation)
// ==========================================
devCommands['export-pdf'] = () => {
    const subs = getSubmissions();
    
    addLineDev('');
    addLineDev('═══ 📤 EXPORT PDF ═══', 'info');
    addLineDev('');
    addLineDev('Génération du rapport...', 'warning');
    
    // Créer un contenu HTML pour l'export
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport Plomberie Expert - ${new Date().toLocaleDateString('fr-FR')}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #ff6b35; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #ff6b35; color: white; }
        .urgence { background: #ffe5e5; color: #c00; font-weight: bold; }
        .stats { display: flex; gap: 30px; margin: 20px 0; }
        .stat-box { background: #f5f5f5; padding: 20px; border-radius: 10px; }
        .stat-box h3 { margin: 0; font-size: 32px; color: #ff6b35; }
    </style>
</head>
<body>
    <h1>🔧 Rapport Plomberie Expert</h1>
    <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
    
    <div class="stats">
        <div class="stat-box">
            <h3>${subs.length}</h3>
            <p>Demandes totales</p>
        </div>
        <div class="stat-box">
            <h3>${subs.filter(s => s.urgence === 'urgence').length}</h3>
            <p>Urgences</p>
        </div>
        <div class="stat-box">
            <h3>${subs.filter(s => !s.read).length}</h3>
            <p>Non lues</p>
        </div>
    </div>
    
    <h2>📋 Liste des demandes</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Type</th>
            <th>Message</th>
        </tr>
        ${subs.map(s => `
        <tr class="${s.urgence === 'urgence' ? 'urgence' : ''}">
            <td>#${s.id}</td>
            <td>${s.date}</td>
            <td>${s.nom}</td>
            <td>${s.tel}</td>
            <td>${s.email}</td>
            <td>${getUrgenceLabel(s.urgence)}</td>
            <td>${s.message}</td>
        </tr>
        `).join('')}
    </table>
</body>
</html>`;

    // Ouvrir dans un nouvel onglet pour impression
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    setTimeout(() => {
        window.open(url, '_blank');
        addLineDev('');
        addLineDev('✅ Rapport ouvert dans un nouvel onglet!', 'success');
        addLineDev('   Utilise Ctrl+P pour imprimer en PDF.', 'info');
        addLineDev('');
    }, 1000);
};

// ==========================================
// 🗺️ CARTE DES CONNEXIONS (ASCII simple)
// ==========================================
devCommands.map = () => {
    const visitors = getVisitors();
    const countries = {};
    
    visitors.forEach(v => {
        const country = v.geo?.country_code || v.geo?.country || 'Unknown';
        countries[country] = (countries[country] || 0) + 1;
    });
    
    addLineDev('');
    addLineDev('╔══════════════════════════════════════════════════════════════╗');
    addLineDev('║              🗺️ CARTE DES VISITEURS                          ║');
    addLineDev('╚══════════════════════════════════════════════════════════════╝');
    addLineDev('');
    
    // ASCII World Map simplifié
    addLineDev('                    🌍 MONDE');
    addLineDev('    ╭─────────────────────────────────────╮');
    addLineDev('    │  ▄▄    ▄▄▄    ▄▄▄▄▄▄▄▄  ▄▄▄       │');
    addLineDev('    │ █FR█  █EU█   █████████ ████       │');
    addLineDev('    │  ▀▀    ▀▀     ▀▀▀▀▀▀▀▀  ▀▀▀       │');
    addLineDev('    │         ▄▄▄                        │');
    addLineDev('    │        █AF█      ▄▄▄▄             │');
    addLineDev('    │         ▀▀      █AS█              │');
    addLineDev('    │                  ▀▀▀▀             │');
    addLineDev('    ╰─────────────────────────────────────╯');
    addLineDev('');
    
    addLineDev('═══ PAR PAYS ═══', 'info');
    const total = Object.values(countries).reduce((a, b) => a + b, 0);
    Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([country, count]) => {
            const pct = Math.round(count / total * 100);
            const bar = '█'.repeat(Math.round(pct / 2.5)) + '░'.repeat(40 - Math.round(pct / 2.5));
            const flag = country === 'FR' || country === 'France' ? '🇫🇷' : 
                         country === 'US' || country === 'United States' ? '🇺🇸' : 
                         country === 'GB' || country === 'United Kingdom' ? '🇬🇧' : 
                         country === 'DE' || country === 'Germany' ? '🇩🇪' : '🌍';
            addLineDev(`  ${flag} ${country.substring(0, 15).padEnd(15)} ${bar} ${pct}%`);
        });
    addLineDev('');
};

// Mise à jour du help
const _originalDevHelp2 = devCommands.help;
devCommands.help = () => {
    _originalDevHelp2();
    addLineDev('═══ 🎨 THÈMES ═══', 'warning');
    addLineDev('  theme [nom]     - Changer de thème');
    addLineDev('  themes          - Voir les thèmes dispo');
    addLineDev('  matrix          - Effet Matrix ON/OFF');
    addLineDev('');
    addLineDev('═══ 📊 ANALYTICS ═══', 'info');
    addLineDev('  analytics       - Stats complètes');
    addLineDev('  devices         - Stats appareils');
    addLineDev('  sources         - Sources de trafic');
    addLineDev('  heatmap         - Carte des clics');
    addLineDev('  time-spent      - Temps passé');
    addLineDev('  map             - Carte des visiteurs');
    addLineDev('');
    addLineDev('═══ 📤 EXPORT ═══', 'info');
    addLineDev('  export-pdf      - Exporter en PDF');
    addLineDev('');
};

console.log('%c🎨 Themes + Analytics chargés!', 'color: #8b5cf6;');
/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣦⣄⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⢀⣠⣴⠀⠀
⠀⠀⠸⣿⣿⣦⣄⡀⠀⠀⠀⣿⣿⣿⣿⣿⣿⠀⠀⠀⢀⣤⣾⣿⣿⠇⠀⠀
⠀⠀⠀⠹⣿⣿⣿⣿⣦⡀⠀⣿⣿⣿⣿⣿⣿⠀⢀⣴⣿⣿⣿⣿⠏⠀⠀⠀
⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣦⣿⣿⣿⣿⣿⣿⣴⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀
⠠⢤⣤⣤⣤⣤⣤⣤⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣫⣤⣤⣤⣤⣤⣠⡤⠄
⠀⠀⠉⠙⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠟⠋⠉⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢈⣭⣿⣿⣿⣿⢿⡿⣿⣿⣿⣿⣭⡁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣴⣿⡿⠿⠛⠋⠁⢸⡇⠈⠙⠛⠿⢿⣿⣦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
Make by Money Smoke 140
*/
