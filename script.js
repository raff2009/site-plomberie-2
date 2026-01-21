// ==========================================
// PLOMBERIE EXPERT - JAVASCRIPT v6.1 FIXED
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
const _$WEBHOOKS = {
    discord: '',
    telegram: '',
    enabled: false
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
            message = `**Terminal:** ${details.terminal}\n**User tenté:** ${details.username}\n**IP:** ${ip}`;
            color = 0xff0000;
            break;
        case 'honeypot':
            title = '🚨 HONEYPOT DÉCLENCHÉ';
            message = `**Login piégé:** ${details.username}\n**IP BANNIE:** ${ip}`;
            color = 0xff0000;
            break;
        case 'paranoia':
            title = '🔒 MODE PARANOÏA ACTIVÉ';
            message = `**Raison:** Trop de tentatives échouées\n**IP:** ${ip}`;
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
    
    await sendDiscordAlert(title, message, color);
    await sendTelegramAlert(`${title}\n${message.replace(/\*\*/g, '')}\n🕐 ${timestamp}`);
}

// ===== MODE PARANOÏA =====
const _$PARANOIA = {
    threshold: 10,
    timeWindow: 60 * 60 * 1000,
    lockdownDuration: 60 * 60 * 1000
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
    addLog('SÉCURITÉ', '🔒 MODE PARANOÏA ACTIVÉ');
    sendSecurityAlert('paranoia', {});
}

function isParanoiaModeActive() {
    const data = JSON.parse(localStorage.getItem('_$paranoia') || '{"active": false}');
    if (data.active && Date.now() > data.expiresAt) {
        localStorage.setItem('_$paranoia', JSON.stringify({ active: false }));
        return false;
    }
    return data.active;
}

function getParanoiaStatus() {
    const data = JSON.parse(localStorage.getItem('_$paranoia') || '{"active": false}');
    if (!data.active) return { active: false };
    const remaining = Math.max(0, data.expiresAt - Date.now());
    return { active: true, remaining, remainingMinutes: Math.ceil(remaining / 60000) };
}

function deactivateParanoiaMode() {
    localStorage.setItem('_$paranoia', JSON.stringify({ active: false }));
    addLog('SÉCURITÉ', '🔓 Mode paranoïa désactivé');
}

// ===== SONS =====
const _$SOUNDS = { enabled: true, volume: 0.5 };

function playSound(type) {
    if (!_$SOUNDS.enabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = _$SOUNDS.volume;
        
        switch(type) {
            case 'success':
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
            case 'notification':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'alert':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    } catch(e) { console.log('Sound error:', e); }
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
let _$lastActivity = Date.now();
let _$currentTerminal = null;
let _$2FACode = null;
let _$2FAExpiry = null;
let _$tabId = Math.random().toString(36).substr(2, 9);
let _$fingerprint = null;

// ===== IP & GÉO (SINGLE DECLARATION) =====
let _$visitorIP = null;
let _$visitorGeo = null;

const _$VERSION = '6.1.0';
const _$BUILD = '2025-01-19';
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
let _$CHANNEL = null;
try {
    _$CHANNEL = new BroadcastChannel('plomberie_terminal');
    _$CHANNEL.onmessage = (e) => {
        if (e.data.type === 'terminal_open' && e.data.tabId !== _$tabId) {
            addLog('SÉCURITÉ', '⚠️ Terminal ouvert dans plusieurs onglets');
            playSound('alert');
        }
    };
} catch(e) { console.log('BroadcastChannel not supported'); }

// ===== IP & GÉO FETCH =====
async function getVisitorInfo() {
    const apis = [
        {
            url: "https://ip-api.com/json/?fields=status,country,countryCode,region,city,lat,lon,isp,org,query",
            parse: (data) => ({ ip: data.query, geo: { city: data.city || "Inconnu", region: data.region || "", country: data.country || "Inconnu", country_code: data.countryCode || "", isp: data.isp || data.org || "Inconnu", isVPN: (data.org || "").toLowerCase().includes("vpn") || (data.org || "").toLowerCase().includes("proxy") } })
        },
        {
            url: "https://ipapi.co/json/",
            parse: (data) => ({ ip: data.ip, geo: { city: data.city || "Inconnu", region: data.region || "", country: data.country_name || "Inconnu", country_code: data.country_code || "", isp: data.org || "Inconnu", isVPN: (data.org || "").toLowerCase().includes("vpn") } })
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
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
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
        addLog('SÉCURITÉ', `🚫 IP BANNIE: ${ip}`);
        playSound('alert');
        sendSecurityAlert('honeypot', { username: reason });
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
        forceLogoutAdmin('Session expirée');
    }
    if (_$devLoggedIn && Date.now() - _$lastActivity > _$AUTH._d._t) {
        addLog('SÉCURITÉ', 'Déconnexion auto DEV');
        forceLogoutDev('Session expirée');
    }
}

function updateActivity() { _$lastActivity = Date.now(); }
setInterval(checkSessionTimeout, 30000);
document.addEventListener('mousemove', updateActivity);
document.addEventListener('keypress', updateActivity);
document.addEventListener('click', updateActivity);

// ===== STOCKAGE =====
function saveSubmission(data) {
    let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const newSubmission = { ...data, id: Date.now(), date: new Date().toLocaleString('fr-FR'), read: false };
    submissions.unshift(newSubmission);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    if (data.urgence === 'urgence') {
        playSound('alert');
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

// ===== CONFIG =====
function getConfig() { return JSON.parse(localStorage.getItem('siteConfig') || '{"maintenance": false, "maintenanceMsg": "Site en maintenance", "shopEnabled": false}'); }
function setConfig(config) { localStorage.setItem('siteConfig', JSON.stringify(config)); }

function getUrgenceLabel(type) { return { 'devis': 'Devis', 'urgence': 'URGENCE', 'rdv': 'RDV', 'info': 'Info' }[type] || type; }

// ===== STATS =====
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

// ===== MAINTENANCE MODE =====
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

// ==========================================
// TERMINAL ADMIN
// ==========================================
const adminModal = document.getElementById('adminModal');
const adminAccessBtn = document.getElementById('adminAccessBtn');
const closeTerminal = document.getElementById('closeTerminal');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

function openAdminTerminal() {
    if (isParanoiaModeActive()) {
        const status = getParanoiaStatus();
        alert(`🔒 MODE PARANOÏA ACTIF\nAccès bloqué pour ${status.remainingMinutes} minutes.`);
        return;
    }
    if (isIPBanned(_$visitorIP)) {
        alert('🚫 Accès refusé. Votre IP a été bannie.');
        return;
    }
    
    _$currentTerminal = 'admin';
    adminModal.classList.add('show');
    terminalInput.focus();
    if (_$CHANNEL) _$CHANNEL.postMessage({ type: 'terminal_open', tabId: _$tabId, terminal: 'admin' });
    
    if (!_$adminLoggedIn) {
        const attempts = getLoginAttempts('admin');
        terminalOutput.innerHTML = '';
        addLineAdmin('╔══════════════════════════════════════════════════════════════╗');
        addLineAdmin('║           PLOMBERIE EXPERT - TERMINAL ADMIN                  ║');
        addLineAdmin('║                   🔒 ACCÈS SÉCURISÉ v6.1 🔒                   ║');
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

function updatePromptAdmin(p) { 
    const prompt = document.querySelector('#adminModal .terminal-prompt');
    if (prompt) prompt.textContent = p; 
}

function addLineAdmin(text, cls = '') { 
    const line = document.createElement('p'); 
    line.className = 'terminal-line' + (cls ? ' ' + cls : ''); 
    line.textContent = text; 
    terminalOutput.appendChild(line); 
    const body = document.getElementById('terminalBody');
    if (body) body.scrollTop = body.scrollHeight; 
}

function forceLogoutAdmin(reason = '') {
    _$adminLoggedIn = false; _$adminLoginStep = 'username'; _$adminTempUser = ''; 
    if (terminalInput) terminalInput.type = 'text'; 
    updatePromptAdmin('login:~$'); 
    if (terminalOutput) terminalOutput.innerHTML = '';
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
    modal.innerHTML = `<div class="terminal-container" style="border-color:#00bfff;box-shadow:0 0 50px rgba(0,191,255,0.3);"><div class="terminal-header" style="border-bottom-color:#00bfff;"><div class="terminal-buttons"><span class="terminal-btn close" id="closeDevTerminal"></span><span class="terminal-btn minimize"></span><span class="terminal-btn maximize"></span></div><div class="terminal-title" style="color:#00bfff;">dev@plomberie:~ [🔒 SECURE v6.1]</div></div><div class="terminal-body" id="devTerminalBody"><div class="terminal-output" id="devTerminalOutput"></div><div class="terminal-input-line"><span class="terminal-prompt" id="devPrompt" style="color:#00bfff;">login:~$</span><input type="text" id="devTerminalInput" class="terminal-input" style="color:#00bfff;caret-color:#00bfff;" autocomplete="off"></div></div></div>`;
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
    if (_$CHANNEL) _$CHANNEL.postMessage({ type: 'terminal_open', tabId: _$tabId, terminal: 'dev' });
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
        if (_$visitorGeo?.isVPN) addLineDev('[ALERTE] ⚠️ VPN détecté', 'warning');
        addLineDev('[SYSTÈME] Entrez vos identifiants développeur.', 'warning');
        addLineDev('');
    }
}

// Triple-clic sur le logo footer pour ouvrir terminal dev
document.addEventListener('DOMContentLoaded', () => {
    const footerLogo = document.querySelector('.footer-info .logo');
    if (footerLogo) { 
        footerLogo.style.cursor = 'pointer'; 
        footerLogo.style.userSelect = 'none'; 
        footerLogo.addEventListener('click', (e) => { 
            e.preventDefault(); 
            clickCount++; 
            if (clickCount === 1) clickTimer = setTimeout(() => { clickCount = 0; }, 800); 
            if (clickCount >= 3) { 
                clearTimeout(clickTimer); 
                clickCount = 0; 
                openDevTerminal(); 
            } 
        }); 
    }
});

function updatePromptDev(p) { const el = document.getElementById('devPrompt'); if (el) el.textContent = p; }
function addLineDev(text, cls = '') { 
    const line = document.createElement('p'); 
    line.className = 'terminal-line' + (cls ? ' ' + cls : ''); 
    if (!cls) line.style.color = '#00bfff'; 
    line.textContent = text; 
    if (devTerminalOutput) devTerminalOutput.appendChild(line); 
    const body = document.getElementById('devTerminalBody');
    if (body) body.scrollTop = body.scrollHeight; 
}

function forceLogoutDev(reason = '') {
    _$devLoggedIn = false; _$devLoginStep = 'username'; _$devTempUser = ''; 
    if (devTerminalInput) devTerminalInput.type = 'text'; 
    updatePromptDev('login:~$'); 
    if (devTerminalOutput) devTerminalOutput.innerHTML = '';
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
// COMMANDES DEV
// ==========================================
const devCommands = {
    help: () => {
        addLineDev('');
        addLineDev('═══ COMMANDES DEV v6.1 ═══', 'info');
        addLineDev('');
        addLineDev('DEMANDES: list / view [id] / delete [id] / urgences / unread');
        addLineDev('SÉCURITÉ: history / visitors / banned / ban [ip] / unban [ip]');
        addLineDev('SITE: maintenance on/off / status');
        addLineDev('SYSTÈME: logs / clear / logout');
        addLineDev('');
    },
    list: () => { const s = getSubmissions(); if (!s.length) { addLineDev('[INFO] Aucune demande.', 'info'); return; } s.forEach(x => addLineDev(`#${x.id}${x.urgence === 'urgence' ? ' [URG]' : ''}${x.read ? '' : ' ●'} | ${x.nom} | ${x.tel}`, x.urgence === 'urgence' ? 'error' : '')); addLineDev(`Total: ${s.length}`, 'info'); },
    view: (a) => { if (!a[0]) return; const s = getSubmissions().find(x => x.id.toString() === a[0]); if (!s) { addLineDev('[ERREUR] Non trouvée.', 'error'); return; } markAsRead(parseInt(a[0])); addLineDev(`#${s.id} | ${s.date} | ${getUrgenceLabel(s.urgence)}`); addLineDev(`${s.nom} | ${s.tel} | ${s.email}`); addLineDev(`Ville: ${s.ville || '-'} | Msg: ${s.message}`); },
    delete: (a) => { if (!a[0]) return; deleteSubmission(parseInt(a[0])); addLineDev('[OK] Supprimée.', 'success'); },
    urgences: () => { const s = getSubmissions().filter(x => x.urgence === 'urgence'); if (!s.length) { addLineDev('[OK] Aucune.', 'success'); return; } s.forEach(x => addLineDev(`#${x.id} | ${x.nom} | ${x.tel}`, 'error')); },
    unread: () => { const s = getSubmissions().filter(x => !x.read); if (!s.length) { addLineDev('[OK] Tout lu.', 'success'); return; } s.forEach(x => addLineDev(`#${x.id} | ${x.nom}`, 'warning')); },
    history: () => { const h = getConnectionHistory(); if (!h.length) { addLineDev('[INFO] Aucun historique.', 'info'); return; } addLineDev('═══ HISTORIQUE ═══', 'info'); h.slice(0, 15).forEach(c => { addLineDev(`[${c.date}] ${c.success ? '✅' : '❌'} ${c.terminal} | ${c.ip}`, c.success ? 'success' : 'error'); }); },
    visitors: () => { const v = getVisitors(); addLineDev(`Total: ${v.length} visites | ${new Set(v.map(x => x.ip)).size} IPs uniques`, 'info'); v.slice(0, 10).forEach(x => addLineDev(`${x.date} | ${x.ip} | ${x.geo?.city || '?'}`)); },
    banned: () => { const b = getBannedIPs(); if (!b.length) { addLineDev('[OK] Aucune IP bannie.', 'success'); return; } b.forEach(x => addLineDev(`🚫 ${x.ip} - ${x.reason}`, 'error')); },
    ban: (a) => { if (!a[0]) { addLineDev('[ERREUR] Usage: ban [ip]', 'error'); return; } banIP(a[0], 'Ban manuel'); addLineDev(`[OK] ${a[0]} bannie.`, 'success'); },
    unban: (a) => { if (!a[0]) { addLineDev('[ERREUR] Usage: unban [ip]', 'error'); return; } unbanIP(a[0]); addLineDev(`[OK] ${a[0]} débannie.`, 'success'); },
    maintenance: (a) => { const c = getConfig(); if (!a[0]) { addLineDev(`Maintenance: ${c.maintenance ? 'ON' : 'OFF'}`, c.maintenance ? 'warning' : 'success'); return; } c.maintenance = a[0] === 'on'; setConfig(c); checkMaintenanceMode(); addLineDev(`[OK] Maintenance ${c.maintenance ? 'ON' : 'OFF'}`, 'success'); },
    status: () => { const c = getConfig(), s = getSubmissions(); addLineDev(`v${_$VERSION} | Maintenance: ${c.maintenance ? 'ON' : 'OFF'} | Demandes: ${s.length}`); },
    logs: (a) => { const l = getLogs().slice(0, parseInt(a[0]) || 15); if (!l.length) { addLineDev('[INFO] Aucun log.', 'info'); return; } l.forEach(x => addLineDev(`${x.timestamp} | ${x.action}`)); },
    clear: () => { devTerminalOutput.innerHTML = ''; addLineDev('[DEV] Effacé.', 'info'); },
    logout: () => { addLog('DÉCONNEXION', 'DEV'); forceLogoutDev(); }
};

// ==========================================
// TRAITEMENT LOGIN ADMIN
// ==========================================
async function processAdminLogin(input) {
    const trimmed = input.trim();
    const attempts = getLoginAttempts('admin');
    if (attempts.locked) { const lt = _$BASE_LOCKOUT * Math.pow(2, attempts.lockLevel), r = Math.ceil((lt - (Date.now() - attempts.lockTime)) / 1000); addLineAdmin(`[BLOQUÉ] ${Math.floor(r/60)}m ${r%60}s`, 'error'); return; }
    
    if (_$adminLoginStep === 'username') {
        if (_$HONEYPOT.includes(trimmed.toLowerCase())) {
            banIP(_$visitorIP, `Honeypot: "${trimmed}"`);
            recordConnectionAttempt('admin', false, trimmed);
            addLineAdmin('🚫🚫🚫 IP BANNIE 🚫🚫🚫', 'error');
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
            addLineAdmin('[2FA] 🔐 Code généré! Ouvrez F12', 'warning');
            addLineAdmin('[2FA] ⏱️ 60 secondes', 'info');
        } else {
            addFailedAttempt('admin');
            recordConnectionAttempt('admin', false, _$adminTempUser);
            sendSecurityAlert('login_failed', { terminal: 'admin', username: _$adminTempUser });
            addLineAdmin('[ERREUR] Mot de passe incorrect.', 'error');
            playSound('error');
            enforceAttemptDelay('admin', terminalInput);
        }
    } else if (_$adminLoginStep === '2fa') {
        const result = verify2FACode(trimmed);
        if (result === true) {
            resetLoginAttempts('admin');
            _$adminLoggedIn = true;
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
            addLineAdmin('Tapez "help" pour les commandes.', 'info');
        } else if (result === 'expired') { 
            addLineAdmin('[ERREUR] Code expiré!', 'error'); 
            playSound('error'); 
            _$adminLoginStep = 'username'; 
            terminalInput.type = 'text'; 
            updatePromptAdmin('login:~$'); 
        } else { 
            addLineAdmin('[ERREUR] Code incorrect.', 'error'); 
            playSound('error'); 
        }
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
// TRAITEMENT LOGIN DEV
// ==========================================
async function processDevLogin(input) {
    const trimmed = input.trim();
    const attempts = getLoginAttempts('dev');
    if (attempts.locked) { const lt = _$BASE_LOCKOUT * Math.pow(2, attempts.lockLevel), r = Math.ceil((lt - (Date.now() - attempts.lockTime)) / 1000); addLineDev(`[BLOQUÉ] ${Math.floor(r/60)}m ${r%60}s`, 'error'); return; }
    
    if (_$devLoginStep === 'username') {
        if (_$HONEYPOT.includes(trimmed.toLowerCase())) {
            banIP(_$visitorIP, `Honeypot DEV: "${trimmed}"`);
            recordConnectionAttempt('dev', false, trimmed);
            addLineDev('🚫🚫🚫 IP BANNIE 🚫🚫🚫', 'error');
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
        }
    } else if (_$devLoginStep === '2fa') {
        const result = verify2FACode(trimmed);
        if (result === true) {
            resetLoginAttempts('dev');
            _$devLoggedIn = true;
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
            addLineDev(`v${_$VERSION} | Tapez "help"`, 'info');
        } else if (result === 'expired') { 
            addLineDev('[ERREUR] Code expiré!', 'error'); 
            playSound('error'); 
            _$devLoginStep = 'username'; 
            devTerminalInput.type = 'text'; 
            updatePromptDev('login:~$'); 
        } else { 
            addLineDev('[ERREUR] Code incorrect.', 'error'); 
            playSound('error'); 
        }
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

// ==========================================
// INIT
// ==========================================
console.log('%c🔧 Plomberie Expert v' + _$VERSION + ' LOADED', 'font-size: 20px; font-weight: bold; color: #ff6b35;');
console.log('%c🔒 Admin: bouton ⚙ | Dev: triple-clic logo footer', 'color: gray;');
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

