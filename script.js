// ==========================================
// PLOMBERIE EXPERT - JAVASCRIPT ULTIME
// Version DEV + SÉCURITÉ RENFORCÉE
// ==========================================

// ===== CONFIGURATION ACCÈS (Base64) =====
// Pour modifier : utilise base64encode.org
// ADMIN : admin / plombier2025
// DEV : dev / CrosseRousse!Dev2025

const _0x = {
    a: atob('YWRtaW4='),
    b: atob('cGxvbWJpZXIyMDI1'),
    c: atob('ZGV2'),
    d: atob('Q3Jvc3NlUm91c3NlIURldjIwMjU='),
};

const USERS = {};
USERS[_0x.a] = { password: _0x.b, role: 'admin', name: 'Administrateur' };
USERS[_0x.c] = { password: _0x.d, role: 'dev', name: 'Développeur' };

// ===== VARIABLES GLOBALES =====
let currentUser = null;
let isLoggedIn = false;
let loginStep = 'username';
let tempUsername = '';
let sessionStart = Date.now();
let lastActivity = Date.now();

const SITE_VERSION = '3.0.0';
const SITE_BUILD = '2025-01-15';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

// ===== SÉCURITÉ : Gestion des tentatives =====
function getLoginAttempts() {
    const data = JSON.parse(localStorage.getItem('loginAttempts') || '{"count": 0, "lastAttempt": 0, "locked": false, "lockTime": 0}');
    // Vérifier si le lockout est expiré
    if (data.locked && Date.now() - data.lockTime > LOCKOUT_TIME) {
        data.locked = false;
        data.count = 0;
        localStorage.setItem('loginAttempts', JSON.stringify(data));
    }
    return data;
}

function addFailedAttempt() {
    const data = getLoginAttempts();
    data.count++;
    data.lastAttempt = Date.now();
    if (data.count >= MAX_LOGIN_ATTEMPTS) {
        data.locked = true;
        data.lockTime = Date.now();
        addLog('SÉCURITÉ', `🔒 Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives`);
    }
    localStorage.setItem('loginAttempts', JSON.stringify(data));
    return data;
}

function resetLoginAttempts() {
    localStorage.setItem('loginAttempts', JSON.stringify({ count: 0, lastAttempt: 0, locked: false, lockTime: 0 }));
}

// ===== SÉCURITÉ : Session timeout =====
function checkSessionTimeout() {
    if (isLoggedIn && Date.now() - lastActivity > SESSION_TIMEOUT) {
        addLog('SÉCURITÉ', 'Déconnexion auto (inactivité)');
        forceLogout('Session expirée (30 min d\'inactivité)');
    }
}

function updateActivity() {
    lastActivity = Date.now();
}

// Vérifier toutes les minutes
setInterval(checkSessionTimeout, 60000);

// Mettre à jour l'activité sur interaction
document.addEventListener('mousemove', updateActivity);
document.addEventListener('keypress', updateActivity);
document.addEventListener('click', updateActivity);

// ===== SÉCURITÉ : Anti DevTools (basique) =====
let devToolsOpen = false;
const threshold = 160;

function checkDevTools() {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
            devToolsOpen = true;
            addLog('SÉCURITÉ', '⚠️ DevTools détecté');
        }
    } else {
        devToolsOpen = false;
    }
}

setInterval(checkDevTools, 1000);

// ===== NAVIGATION FLUIDE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('navLinks')?.classList.remove('active');
        }
    });
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
}

// ===== HEADER SCROLL =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 100);
});

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 500);
});
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== FAQ =====
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
        if (!isActive) faqItem.classList.add('active');
    });
});

// ===== STOCKAGE LOCAL - DEMANDES =====
function saveSubmission(data) {
    let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.unshift({ ...data, id: Date.now(), date: new Date().toLocaleString('fr-FR'), read: false });
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
}
function getSubmissions() {
    return JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
}
function deleteSubmission(id) {
    let submissions = getSubmissions().filter(s => s.id !== id);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
}
function clearAllSubmissions() {
    localStorage.removeItem('contactSubmissions');
}
function markAsRead(id) {
    let submissions = getSubmissions();
    submissions = submissions.map(s => s.id === id ? {...s, read: true} : s);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
}

// ===== LOGS SYSTÈME =====
function addLog(action, details = '') {
    let logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    logs.unshift({
        timestamp: new Date().toLocaleString('fr-FR'),
        action: action,
        details: details,
        user: currentUser?.name || 'Système'
    });
    if (logs.length > 500) logs = logs.slice(0, 500);
    localStorage.setItem('systemLogs', JSON.stringify(logs));
}
function getLogs() {
    return JSON.parse(localStorage.getItem('systemLogs') || '[]');
}
function clearLogs() {
    localStorage.removeItem('systemLogs');
}

// ===== NOTES =====
function getNotes() {
    return JSON.parse(localStorage.getItem('devNotes') || '[]');
}
function addNote(text) {
    let notes = getNotes();
    notes.unshift({ id: Date.now(), text: text, date: new Date().toLocaleString('fr-FR') });
    localStorage.setItem('devNotes', JSON.stringify(notes));
}
function deleteNote(id) {
    let notes = getNotes().filter(n => n.id !== id);
    localStorage.setItem('devNotes', JSON.stringify(notes));
}

// ===== CONFIG SITE =====
function getConfig() {
    return JSON.parse(localStorage.getItem('siteConfig') || '{"maintenance": false, "maintenanceMsg": "Site en maintenance, revenez bientôt!", "primaryColor": "#ff6b35"}');
}
function setConfig(config) {
    localStorage.setItem('siteConfig', JSON.stringify(config));
}

// ===== FORMULAIRE CONTACT =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Vérifier mode maintenance
        const config = getConfig();
        if (config.maintenance) {
            alert('Le site est actuellement en maintenance. Veuillez réessayer plus tard ou appelez directement.');
            return;
        }
        
        const formData = {
            nom: document.getElementById('nom').value,
            tel: document.getElementById('tel').value,
            email: document.getElementById('email').value,
            ville: document.getElementById('ville').value,
            urgence: document.getElementById('urgence').value,
            message: document.getElementById('message').value
        };
        saveSubmission(formData);
        addLog('NOUVEAU_FORMULAIRE', `De: ${formData.nom} - Type: ${formData.urgence}`);
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('show');
        this.reset();
        setTimeout(() => successMessage.classList.remove('show'), 5000);
    });
}

// ===== ANIMATIONS SCROLL =====
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .realisation-card, .temoignage-card, .avantage-item, .tarif-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== MODE MAINTENANCE - Affichage bannière =====
function checkMaintenanceMode() {
    const config = getConfig();
    let banner = document.getElementById('maintenanceBanner');
    
    if (config.maintenance) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'maintenanceBanner';
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #ff6b35, #e53e3e);
                color: white;
                padding: 15px;
                text-align: center;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            `;
            banner.innerHTML = `🔧 ${config.maintenanceMsg} 🔧`;
            document.body.prepend(banner);
            document.body.style.paddingTop = '50px';
        }
    } else if (banner) {
        banner.remove();
        document.body.style.paddingTop = '0';
    }
}

// Vérifier au chargement
document.addEventListener('DOMContentLoaded', checkMaintenanceMode);

// ==========================================
// ACCÈS SECRET DEV - Triple clic footer
// ==========================================
let clickCount = 0;
let clickTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    const footerLogo = document.querySelector('.footer-info .logo');
    
    if (footerLogo) {
        footerLogo.style.cursor = 'pointer';
        footerLogo.style.userSelect = 'none';
        
        footerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => { clickCount = 0; }, 800);
            }
            
            if (clickCount >= 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                openTerminal(true);
            }
        });
    }
});

// ==========================================
// TERMINAL
// ==========================================
const adminModal = document.getElementById('adminModal');
const adminAccessBtn = document.getElementById('adminAccessBtn');
const closeTerminal = document.getElementById('closeTerminal');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

function openTerminal(devMode = false) {
    adminModal.classList.add('show');
    terminalInput.focus();
    
    if (!isLoggedIn) {
        loginStep = 'username';
        terminalInput.type = 'text';
        updatePrompt('login:~$');
        
        // Vérifier si bloqué
        const attempts = getLoginAttempts();
        if (attempts.locked) {
            const remaining = Math.ceil((LOCKOUT_TIME - (Date.now() - attempts.lockTime)) / 1000);
            addLine('');
            addLine('╔══════════════════════════════════════════════════════════════╗');
            addLine('║                    🔒 ACCÈS BLOQUÉ 🔒                         ║');
            addLine('╚══════════════════════════════════════════════════════════════╝');
            addLine('');
            addLine(`[SÉCURITÉ] Trop de tentatives de connexion.`, 'error');
            addLine(`[SÉCURITÉ] Réessayez dans ${remaining} secondes.`, 'warning');
            addLine('');
            return;
        }
        
        if (devMode) {
            terminalOutput.innerHTML = '';
            addLine('╔══════════════════════════════════════════════════════════════╗');
            addLine('║          PLOMBERIE EXPERT - MODE DÉVELOPPEUR                 ║');
            addLine('╚══════════════════════════════════════════════════════════════╝');
            addLine('');
            addLine('[SYSTÈME] Accès maintenance détecté.', 'info');
            addLine('[SYSTÈME] Entrez vos identifiants développeur.');
            addLine('');
        }
    }
}

if (adminAccessBtn) {
    adminAccessBtn.addEventListener('click', () => openTerminal(false));
}

if (closeTerminal) {
    closeTerminal.addEventListener('click', () => adminModal.classList.remove('show'));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal?.classList.contains('show')) {
        adminModal.classList.remove('show');
    }
});

adminModal?.addEventListener('click', (e) => {
    if (e.target === adminModal) adminModal.classList.remove('show');
});

function updatePrompt(prompt) {
    const el = document.querySelector('.terminal-prompt');
    if (el) el.textContent = prompt;
}

function addLine(text, className = '') {
    const line = document.createElement('p');
    line.className = 'terminal-line' + (className ? ' ' + className : '');
    line.textContent = text;
    terminalOutput?.appendChild(line);
    const body = document.getElementById('terminalBody');
    if (body) body.scrollTop = body.scrollHeight;
}

function getUrgenceLabel(type) {
    return { 'devis': 'Devis', 'urgence': 'URGENCE', 'rdv': 'RDV', 'info': 'Info' }[type] || type;
}

function forceLogout(reason = '') {
    isLoggedIn = false;
    currentUser = null;
    loginStep = 'username';
    tempUsername = '';
    terminalInput.type = 'text';
    updatePrompt('login:~$');
    terminalOutput.innerHTML = '';
    addLine('╔══════════════════════════════════════════════════════════════╗');
    addLine('║     PLOMBERIE EXPERT - ADMINISTRATION                        ║');
    addLine('╚══════════════════════════════════════════════════════════════╝');
    addLine('');
    if (reason) addLine(`[SYSTÈME] ${reason}`, 'warning');
    addLine('[SYSTÈME] Déconnecté.', 'success');
    addLine('[SYSTÈME] Entrez votre nom d\'utilisateur.');
    addLine('');
}

// ===== COMMANDES ADMIN =====
const adminCommands = {
    help: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    COMMANDES ADMIN                           ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('  list            - Toutes les demandes');
        addLine('  view [id]       - Détail d\'une demande');
        addLine('  delete [id]     - Supprimer une demande');
        addLine('  clear-all       - Supprimer tout');
        addLine('  urgences        - Voir les urgences');
        addLine('  unread          - Demandes non lues');
        addLine('  search [mot]    - Rechercher');
        addLine('  stats           - Statistiques');
        addLine('  export          - Exporter JSON');
        addLine('  clear           - Effacer écran');
        addLine('  logout          - Se déconnecter');
        addLine('');
    },
    
    list: () => {
        const submissions = getSubmissions();
        if (submissions.length === 0) {
            addLine(''); addLine('[INFO] Aucune demande.', 'info'); addLine('');
            return;
        }
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                   LISTE DES DEMANDES                         ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        submissions.forEach(sub => {
            const tag = sub.urgence === 'urgence' ? ' [URGENCE]' : '';
            const readTag = sub.read ? '' : ' ●';
            addLine(`┌─ #${sub.id}${tag}${readTag}`, sub.urgence === 'urgence' ? 'error' : (sub.read ? '' : 'warning'));
            addLine(`│  ${sub.date} | ${sub.nom} | ${sub.tel}`);
            addLine(`└──────────────────────────────`);
        });
        addLine('');
        addLine(`[INFO] Total: ${submissions.length}`, 'info');
    },
    
    view: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: view [id]', 'error'); return; }
        const sub = getSubmissions().find(s => s.id.toString() === args[0]);
        if (!sub) { addLine(`[ERREUR] #${args[0]} non trouvée.`, 'error'); return; }
        markAsRead(parseInt(args[0]));
        addLine('');
        addLine(`══ DEMANDE #${sub.id} ══`, 'info');
        addLine(`Date:    ${sub.date}`);
        addLine(`Type:    ${getUrgenceLabel(sub.urgence)}`, sub.urgence === 'urgence' ? 'warning' : '');
        addLine(`Nom:     ${sub.nom}`);
        addLine(`Tél:     ${sub.tel}`);
        addLine(`Email:   ${sub.email}`);
        addLine(`Ville:   ${sub.ville || '-'}`);
        addLine(`Message: ${sub.message}`);
        addLine('');
    },
    
    delete: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: delete [id]', 'error'); return; }
        const sub = getSubmissions().find(s => s.id.toString() === args[0]);
        if (!sub) { addLine(`[ERREUR] #${args[0]} non trouvée.`, 'error'); return; }
        deleteSubmission(parseInt(args[0]));
        addLog('SUPPRESSION', `#${args[0]}`);
        addLine(`[OK] #${args[0]} supprimée.`, 'success');
    },
    
    'clear-all': () => {
        const count = getSubmissions().length;
        if (count === 0) { addLine('[INFO] Rien à supprimer.', 'info'); return; }
        addLine(`[!] Supprimer ${count} demande(s)?`, 'warning');
        addLine('[!] Tapez "confirm-delete"', 'warning');
    },
    
    'confirm-delete': () => {
        const count = getSubmissions().length;
        clearAllSubmissions();
        addLog('SUPPRESSION_TOTALE', `${count} demandes`);
        addLine('[OK] Tout supprimé.', 'success');
    },
    
    urgences: () => {
        const subs = getSubmissions().filter(s => s.urgence === 'urgence');
        if (subs.length === 0) { addLine('[INFO] Aucune urgence.', 'success'); return; }
        addLine('');
        addLine('🚨 URGENCES 🚨', 'error');
        subs.forEach(s => addLine(`  #${s.id} | ${s.nom} | ${s.tel}`, 'warning'));
        addLine('');
    },
    
    unread: () => {
        const subs = getSubmissions().filter(s => !s.read);
        if (subs.length === 0) { addLine('[INFO] Tout est lu.', 'success'); return; }
        addLine(`[INFO] ${subs.length} non lue(s):`, 'warning');
        subs.forEach(s => addLine(`  #${s.id} | ${s.nom}`));
    },
    
    search: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: search [mot]', 'error'); return; }
        const kw = args.join(' ').toLowerCase();
        const results = getSubmissions().filter(s => 
            s.nom.toLowerCase().includes(kw) || s.email.toLowerCase().includes(kw) ||
            s.message.toLowerCase().includes(kw) || s.tel.includes(kw) ||
            (s.ville && s.ville.toLowerCase().includes(kw))
        );
        if (results.length === 0) { addLine(`[INFO] Aucun résultat.`, 'info'); return; }
        addLine(`[RECHERCHE] ${results.length} résultat(s):`);
        results.forEach(s => addLine(`  #${s.id} | ${s.nom} | ${s.tel}`));
    },
    
    stats: () => {
        const subs = getSubmissions();
        addLine('');
        addLine('══ STATISTIQUES ══', 'info');
        addLine(`Total:    ${subs.length}`);
        addLine(`Urgences: ${subs.filter(s => s.urgence === 'urgence').length}`, subs.filter(s => s.urgence === 'urgence').length > 0 ? 'warning' : '');
        addLine(`Non lues: ${subs.filter(s => !s.read).length}`);
        addLine(`Devis:    ${subs.filter(s => s.urgence === 'devis').length}`);
        addLine(`RDV:      ${subs.filter(s => s.urgence === 'rdv').length}`);
        addLine('');
    },
    
    export: () => {
        const subs = getSubmissions();
        if (subs.length === 0) { addLine('[INFO] Aucune donnée.', 'info'); return; }
        addLine('[EXPORT]');
        addLine(JSON.stringify(subs, null, 2));
    },
    
    clear: () => {
        terminalOutput.innerHTML = '';
        addLine(`[${currentUser.name}] Terminal effacé.`, 'info');
    },
    
    logout: () => {
        addLog('DÉCONNEXION', currentUser.name);
        forceLogout();
    }
};

// ===== COMMANDES DEV (TOUTES) =====
const devCommands = {
    ...adminCommands,
    
    help: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                COMMANDES DEV COMPLÈTES                       ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('═══ DEMANDES ═══', 'info');
        addLine('  list / view [id] / delete [id] / clear-all');
        addLine('  urgences / unread / search [mot] / mark-all-read');
        addLine('');
        addLine('═══ STATS & EXPORT ═══', 'info');
        addLine('  stats / count / export / export-csv');
        addLine('');
        addLine('═══ MODIFICATION SITE ═══', 'warning');
        addLine('  maintenance on/off    - Mode maintenance');
        addLine('  maintenance-msg [txt] - Message maintenance');
        addLine('  edit-phone [num]      - Changer téléphone');
        addLine('  edit-hero [txt]       - Changer titre hero');
        addLine('  edit-subtitle [txt]   - Changer sous-titre');
        addLine('  hide [section]        - Cacher section');
        addLine('  show [section]        - Afficher section');
        addLine('  sections              - Liste des sections');
        addLine('  color [#hex]          - Couleur principale');
        addLine('  reset-style           - Reset style par défaut');
        addLine('');
        addLine('═══ LOGS & SÉCURITÉ ═══', 'info');
        addLine('  logs [n] / errors / clear-logs');
        addLine('  security              - État sécurité');
        addLine('  unlock                - Débloquer connexions');
        addLine('  sessions              - Sessions actives');
        addLine('');
        addLine('═══ SYSTÈME ═══', 'info');
        addLine('  status / sysinfo / performance / storage');
        addLine('  backup / restore-data [json]');
        addLine('');
        addLine('═══ NOTES ═══', 'info');
        addLine('  notes / note [txt] / note-del [id] / todo');
        addLine('');
        addLine('═══ OUTILS DEV ═══', 'info');
        addLine('  test-form / test-urgence / fill [n]');
        addLine('  users / version / reload / reset-all');
        addLine('');
        addLine('═══ AUTRES ═══', 'info');
        addLine('  clear / date / whoami / uptime / logout');
        addLine('');
    },
    
    // ═══ MODIFICATION SITE ═══
    maintenance: (args) => {
        const config = getConfig();
        if (!args[0]) {
            addLine(`[INFO] Maintenance: ${config.maintenance ? 'ON' : 'OFF'}`, config.maintenance ? 'warning' : 'success');
            return;
        }
        if (args[0] === 'on') {
            config.maintenance = true;
            setConfig(config);
            checkMaintenanceMode();
            addLog('MAINTENANCE', 'Mode activé');
            addLine('[OK] Mode maintenance ACTIVÉ', 'warning');
            addLine('[INFO] Les visiteurs voient la bannière.', 'info');
        } else if (args[0] === 'off') {
            config.maintenance = false;
            setConfig(config);
            checkMaintenanceMode();
            addLog('MAINTENANCE', 'Mode désactivé');
            addLine('[OK] Mode maintenance DÉSACTIVÉ', 'success');
        } else {
            addLine('[ERREUR] Usage: maintenance on/off', 'error');
        }
    },
    
    'maintenance-msg': (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: maintenance-msg [texte]', 'error'); return; }
        const config = getConfig();
        config.maintenanceMsg = args.join(' ');
        setConfig(config);
        checkMaintenanceMode();
        addLine('[OK] Message maintenance mis à jour.', 'success');
    },
    
    'edit-phone': (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: edit-phone [numéro]', 'error'); return; }
        const newPhone = args.join(' ');
        document.querySelectorAll('a[href^="tel:"]').forEach(el => {
            el.href = `tel:${newPhone.replace(/\s/g, '')}`;
            if (el.textContent.match(/\d/)) el.textContent = newPhone;
        });
        document.querySelectorAll('.urgence-phone, .footer-contact p').forEach(el => {
            if (el.textContent.match(/\d{2}/)) el.textContent = el.textContent.replace(/[\d\s]{10,}/, newPhone);
        });
        addLog('EDIT', `Téléphone → ${newPhone}`);
        addLine(`[OK] Téléphone changé: ${newPhone}`, 'success');
        addLine('[INFO] Changement temporaire (reload = reset)', 'warning');
    },
    
    'edit-hero': (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: edit-hero [texte]', 'error'); return; }
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.textContent = args.join(' ');
            addLog('EDIT', `Hero title modifié`);
            addLine('[OK] Titre hero modifié.', 'success');
            addLine('[INFO] Temporaire (reload = reset)', 'warning');
        } else {
            addLine('[ERREUR] Élément non trouvé.', 'error');
        }
    },
    
    'edit-subtitle': (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: edit-subtitle [texte]', 'error'); return; }
        const heroSub = document.querySelector('.hero p');
        if (heroSub) {
            heroSub.textContent = args.join(' ');
            addLine('[OK] Sous-titre modifié.', 'success');
        } else {
            addLine('[ERREUR] Élément non trouvé.', 'error');
        }
    },
    
    sections: () => {
        addLine('');
        addLine('═══ SECTIONS DISPONIBLES ═══', 'info');
        const sectionsList = ['hero', 'avantages', 'urgence-banner', 'services', 'tarifs', 'realisations', 'temoignages', 'zone-intervention', 'contact', 'faq', 'footer'];
        sectionsList.forEach(s => {
            const el = document.querySelector(`.${s}, #${s}, section.${s}`);
            const status = el ? (el.style.display === 'none' ? '🔴 Caché' : '🟢 Visible') : '⚪ N/A';
            addLine(`  ${s}: ${status}`);
        });
        addLine('');
    },
    
    hide: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: hide [section]', 'error'); return; }
        const section = args[0];
        const el = document.querySelector(`.${section}, #${section}, section.${section}`);
        if (el) {
            el.style.display = 'none';
            addLog('EDIT', `Section ${section} cachée`);
            addLine(`[OK] Section "${section}" cachée.`, 'success');
        } else {
            addLine(`[ERREUR] Section "${section}" non trouvée.`, 'error');
            addLine('[INFO] Tapez "sections" pour voir la liste.', 'info');
        }
    },
    
    show: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: show [section]', 'error'); return; }
        const section = args[0];
        const el = document.querySelector(`.${section}, #${section}, section.${section}`);
        if (el) {
            el.style.display = '';
            addLog('EDIT', `Section ${section} affichée`);
            addLine(`[OK] Section "${section}" affichée.`, 'success');
        } else {
            addLine(`[ERREUR] Section "${section}" non trouvée.`, 'error');
        }
    },
    
    color: (args) => {
        if (!args[0]) { 
            const config = getConfig();
            addLine(`[INFO] Couleur actuelle: ${config.primaryColor}`, 'info');
            return; 
        }
        const newColor = args[0];
        if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
            addLine('[ERREUR] Format: #RRGGBB (ex: #ff6b35)', 'error');
            return;
        }
        document.documentElement.style.setProperty('--primary-color', newColor);
        const config = getConfig();
        config.primaryColor = newColor;
        setConfig(config);
        addLog('EDIT', `Couleur → ${newColor}`);
        addLine(`[OK] Couleur changée: ${newColor}`, 'success');
    },
    
    'reset-style': () => {
        document.documentElement.style.setProperty('--primary-color', '#ff6b35');
        const config = getConfig();
        config.primaryColor = '#ff6b35';
        setConfig(config);
        addLine('[OK] Style reset par défaut.', 'success');
    },
    
    // ═══ LOGS & SÉCURITÉ ═══
    logs: (args) => {
        const logs = getLogs();
        const limit = args[0] ? parseInt(args[0]) : 15;
        if (logs.length === 0) { addLine('[INFO] Aucun log.', 'info'); return; }
        addLine('');
        addLine('═══ LOGS ═══', 'info');
        logs.slice(0, limit).forEach(log => {
            const color = log.action.includes('ERREUR') || log.action.includes('ÉCHEC') ? 'error' : 
                         log.action.includes('CONNEXION') ? 'success' : 
                         log.action.includes('SÉCURITÉ') ? 'warning' : '';
            addLine(`[${log.timestamp}] ${log.action}`, color);
            if (log.details) addLine(`  └─ ${log.details}`);
        });
        addLine('');
        addLine(`Total: ${logs.length} | Affiché: ${Math.min(limit, logs.length)}`, 'info');
    },
    
    errors: () => {
        const logs = getLogs().filter(l => l.action.includes('ERREUR') || l.action.includes('ÉCHEC') || l.action.includes('SÉCURITÉ'));
        if (logs.length === 0) { addLine('[OK] Aucune erreur.', 'success'); return; }
        addLine(`[!] ${logs.length} événement(s):`, 'warning');
        logs.slice(0, 20).forEach(l => addLine(`  ${l.timestamp}: ${l.action}`, 'error'));
    },
    
    'clear-logs': () => {
        clearLogs();
        addLine('[OK] Logs effacés.', 'success');
    },
    
    security: () => {
        const attempts = getLoginAttempts();
        addLine('');
        addLine('═══ ÉTAT SÉCURITÉ ═══', 'info');
        addLine(`Tentatives ratées: ${attempts.count}/${MAX_LOGIN_ATTEMPTS}`);
        addLine(`Compte bloqué: ${attempts.locked ? 'OUI' : 'NON'}`, attempts.locked ? 'error' : 'success');
        addLine(`DevTools détecté: ${devToolsOpen ? 'OUI' : 'NON'}`, devToolsOpen ? 'warning' : 'success');
        addLine(`Session timeout: ${SESSION_TIMEOUT / 60000} min`);
        addLine(`Inactivité: ${Math.floor((Date.now() - lastActivity) / 1000)}s`);
        addLine('');
    },
    
    unlock: () => {
        resetLoginAttempts();
        addLog('SÉCURITÉ', 'Connexions débloquées manuellement');
        addLine('[OK] Connexions débloquées.', 'success');
    },
    
    sessions: () => {
        addLine('');
        addLine('═══ SESSION ACTIVE ═══', 'info');
        addLine(`Utilisateur: ${currentUser.name}`);
        addLine(`Rôle: ${currentUser.role}`);
        addLine(`Connecté depuis: ${Math.floor((Date.now() - sessionStart) / 1000)}s`);
        addLine(`Dernière activité: ${Math.floor((Date.now() - lastActivity) / 1000)}s`);
        addLine(`Timeout dans: ${Math.floor((SESSION_TIMEOUT - (Date.now() - lastActivity)) / 1000)}s`);
        addLine('');
    },
    
    // ═══ SYSTÈME ═══
    status: () => {
        const subs = getSubmissions();
        const config = getConfig();
        addLine('');
        addLine('═══ STATUS ═══', 'info');
        addLine(`Version: ${SITE_VERSION} (${SITE_BUILD})`);
        addLine(`Maintenance: ${config.maintenance ? 'ON' : 'OFF'}`, config.maintenance ? 'warning' : 'success');
        addLine(`Demandes: ${subs.length} (${subs.filter(s => !s.read).length} non lues)`);
        addLine(`Urgences: ${subs.filter(s => s.urgence === 'urgence').length}`);
        addLine(`Logs: ${getLogs().length}`);
        addLine(`Storage: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`);
        addLine('');
    },
    
    sysinfo: () => {
        addLine('');
        addLine('═══ SYSTÈME ═══', 'info');
        addLine(`Navigateur: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
        addLine(`Plateforme: ${navigator.platform}`);
        addLine(`Écran: ${window.screen.width}x${window.screen.height}`);
        addLine(`Fenêtre: ${window.innerWidth}x${window.innerHeight}`);
        addLine(`Online: ${navigator.onLine ? 'Oui' : 'Non'}`);
        addLine(`Cores: ${navigator.hardwareConcurrency || 'N/A'}`);
        addLine('');
    },
    
    performance: () => {
        const timing = performance.timing;
        const load = timing.loadEventEnd - timing.navigationStart;
        addLine('');
        addLine('═══ PERFORMANCE ═══', 'info');
        addLine(`Chargement: ${load}ms`, load < 2000 ? 'success' : 'warning');
        addLine(`DOM ready: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`);
        addLine('');
    },
    
    storage: () => {
        const total = JSON.stringify(localStorage).length;
        addLine('');
        addLine('═══ STOCKAGE ═══', 'info');
        addLine(`Total: ${(total / 1024).toFixed(2)} KB / 5120 KB`);
        addLine(`Demandes: ${(localStorage.getItem('contactSubmissions')?.length || 0) / 1024} KB`);
        addLine(`Logs: ${(localStorage.getItem('systemLogs')?.length || 0) / 1024} KB`);
        addLine('');
    },
    
    backup: () => {
        const backup = {
            v: SITE_VERSION,
            d: new Date().toISOString(),
            subs: getSubmissions(),
            logs: getLogs(),
            notes: getNotes(),
            config: getConfig()
        };
        addLine('[BACKUP] Copiez ce code:');
        addLine(JSON.stringify(backup));
        addLine('[INFO] Gardez-le précieusement!', 'warning');
    },
    
    'restore-data': (args) => {
        try {
            const backup = JSON.parse(args.join(' '));
            if (backup.subs) localStorage.setItem('contactSubmissions', JSON.stringify(backup.subs));
            if (backup.logs) localStorage.setItem('systemLogs', JSON.stringify(backup.logs));
            if (backup.notes) localStorage.setItem('devNotes', JSON.stringify(backup.notes));
            if (backup.config) localStorage.setItem('siteConfig', JSON.stringify(backup.config));
            addLog('RESTORE', 'Backup restauré');
            addLine('[OK] Restauré!', 'success');
        } catch (e) {
            addLine('[ERREUR] JSON invalide.', 'error');
        }
    },
    
    // ═══ NOTES ═══
    notes: () => {
        const notes = getNotes();
        if (notes.length === 0) { addLine('[INFO] Aucune note. Usage: note [texte]', 'info'); return; }
        addLine('');
        addLine('═══ NOTES ═══', 'info');
        notes.forEach(n => addLine(`  [${n.id}] ${n.date}: ${n.text}`));
        addLine('');
    },
    
    note: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: note [texte]', 'error'); return; }
        addNote(args.join(' '));
        addLine('[OK] Note ajoutée.', 'success');
    },
    
    'note-del': (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: note-del [id]', 'error'); return; }
        deleteNote(parseInt(args[0]));
        addLine('[OK] Note supprimée.', 'success');
    },
    
    todo: () => {
        addLine('');
        addLine('═══ TODO ═══', 'warning');
        addLine('  [ ] Hébergement IONOS');
        addLine('  [ ] BDD MySQL');
        addLine('  [ ] Config emails');
        addLine('  [ ] Ajouter images');
        addLine('  [ ] SEO');
        addLine('');
    },
    
    // ═══ OUTILS DEV ═══
    'test-form': () => {
        saveSubmission({ nom: 'Test Client', tel: '06 00 00 00 00', email: 'test@test.com', ville: 'Lyon', urgence: 'devis', message: 'Test automatique' });
        addLog('TEST', 'Form test créé');
        addLine('[OK] Demande test créée.', 'success');
    },
    
    'test-urgence': () => {
        saveSubmission({ nom: 'URGENCE Test', tel: '06 11 22 33 44', email: 'urg@test.com', ville: 'Lyon 6', urgence: 'urgence', message: '🚨 URGENCE TEST' });
        addLog('TEST', 'Urgence test créée');
        addLine('[OK] Urgence test créée.', 'success');
    },
    
    fill: (args) => {
        const n = parseInt(args[0]) || 5;
        const noms = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Robert'];
        const villes = ['Lyon 1', 'Lyon 3', 'Lyon 6', 'Villeurbanne'];
        const types = ['devis', 'urgence', 'rdv', 'info'];
        for (let i = 0; i < n; i++) {
            saveSubmission({
                nom: noms[i % noms.length] + ' ' + Math.floor(Math.random() * 100),
                tel: '06 ' + Math.random().toString().slice(2, 10).match(/.{2}/g).join(' '),
                email: `client${i}@test.com`,
                ville: villes[i % villes.length],
                urgence: types[i % types.length],
                message: `Message test #${i + 1}`
            });
        }
        addLog('TEST', `${n} demandes créées`);
        addLine(`[OK] ${n} demandes créées.`, 'success');
    },
    
    'mark-all-read': () => {
        let subs = getSubmissions().map(s => ({...s, read: true}));
        localStorage.setItem('contactSubmissions', JSON.stringify(subs));
        addLine('[OK] Tout marqué comme lu.', 'success');
    },
    
    'export-csv': () => {
        const subs = getSubmissions();
        if (subs.length === 0) { addLine('[INFO] Aucune donnée.', 'info'); return; }
        let csv = 'ID,Date,Nom,Tel,Email,Ville,Type,Message\n';
        subs.forEach(s => csv += `${s.id},"${s.date}","${s.nom}","${s.tel}","${s.email}","${s.ville || ''}","${s.urgence}","${s.message}"\n`);
        addLine('[CSV]');
        addLine(csv);
    },
    
    users: () => {
        addLine('');
        addLine('═══ UTILISATEURS ═══', 'info');
        Object.keys(USERS).forEach(u => {
            const user = USERS[u];
            addLine(`  ${u}: ${user.name} (${user.role})`, user.role === 'dev' ? 'warning' : '');
        });
        addLine('');
    },
    
    version: () => {
        addLine(`Version ${SITE_VERSION} | Build ${SITE_BUILD}`);
    },
    
    reload: () => {
        addLine('[INFO] Rechargement...', 'warning');
        setTimeout(() => location.reload(), 1000);
    },
    
    'reset-all': () => {
        addLine('[DANGER] TOUT supprimer?', 'error');
        addLine('[INFO] Tapez "confirm-reset"', 'warning');
    },
    
    'confirm-reset': () => {
        localStorage.clear();
        addLog('RESET', 'Reset complet');
        addLine('[OK] Reset complet.', 'success');
    },
    
    count: () => {
        const subs = getSubmissions();
        addLine(`Total: ${subs.length} | Urgences: ${subs.filter(s => s.urgence === 'urgence').length} | Non lues: ${subs.filter(s => !s.read).length}`);
    },
    
    date: () => addLine(new Date().toLocaleString('fr-FR')),
    
    whoami: () => addLine(`${currentUser.name} (${currentUser.role})`),
    
    uptime: () => addLine(`Session: ${Math.floor((Date.now() - sessionStart) / 1000)}s`),
    
    clear: () => {
        terminalOutput.innerHTML = '';
        addLine(`[DEV] v${SITE_VERSION} | ${currentUser.name}`, 'success');
        addLine('[INFO] help = commandes', 'info');
    }
};

// ===== TRAITEMENT LOGIN =====
function processLogin(input) {
    const trimmed = input.trim();
    
    // Vérifier si bloqué
    const attempts = getLoginAttempts();
    if (attempts.locked) {
        const remaining = Math.ceil((LOCKOUT_TIME - (Date.now() - attempts.lockTime)) / 1000);
        addLine(`[BLOQUÉ] Attendez ${remaining}s`, 'error');
        return;
    }
    
    if (loginStep === 'username') {
        if (USERS[trimmed]) {
            tempUsername = trimmed;
            loginStep = 'password';
            terminalInput.type = 'password';
            updatePrompt('password:~$');
            addLine(`[USER] ${trimmed}`, 'info');
        } else {
            addFailedAttempt();
            addLog('ÉCHEC_CONNEXION', `User inconnu: ${trimmed}`);
            addLine('[ERREUR] Utilisateur inconnu.', 'error');
        }
    } else if (loginStep === 'password') {
        if (USERS[tempUsername] && USERS[tempUsername].password === trimmed) {
            // Succès
            resetLoginAttempts();
            currentUser = { ...USERS[tempUsername], username: tempUsername };
            isLoggedIn = true;
            sessionStart = Date.now();
            lastActivity = Date.now();
            loginStep = 'username';
            terminalInput.type = 'text';
            
            const prompt = currentUser.role === 'dev' ? 'dev@plomberie:~$' : 'admin@plomberie:~$';
            updatePrompt(prompt);
            
            addLog('CONNEXION', `${currentUser.name} (${currentUser.role})`);
            
            addLine('');
            addLine('[OK] Connecté!', 'success');
            addLine(`Bienvenue ${currentUser.name}`, 'info');
            if (currentUser.role === 'dev') addLine('[MODE DEV ACTIVÉ]', 'warning');
            addLine('');
            
            // Alertes
            const subs = getSubmissions();
            const urg = subs.filter(s => s.urgence === 'urgence').length;
            const unread = subs.filter(s => !s.read).length;
            if (urg > 0) addLine(`🚨 ${urg} urgence(s)!`, 'error');
            if (unread > 0) addLine(`📬 ${unread} non lue(s)`, 'warning');
            addLine('');
        } else {
            // Échec
            const result = addFailedAttempt();
            addLog('ÉCHEC_CONNEXION', `MDP incorrect pour: ${tempUsername}`);
            addLine('[ERREUR] Mot de passe incorrect.', 'error');
            if (result.count >= 3) {
                addLine(`[ATTENTION] ${MAX_LOGIN_ATTEMPTS - result.count} tentative(s) restante(s)`, 'warning');
            }
            if (result.locked) {
                addLine(`[BLOQUÉ] Compte bloqué pour ${LOCKOUT_TIME / 60000} min`, 'error');
            }
        }
    }
}

// ===== TRAITEMENT COMMANDES =====
function processCommand(input) {
    const trimmed = input.trim();
    
    if (!isLoggedIn) {
        processLogin(trimmed);
        return;
    }
    
    // Update activité
    updateActivity();
    
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    const prompt = currentUser.role === 'dev' ? 'dev' : 'admin';
    addLine(`${prompt}@plomberie:~$ ${trimmed}`);
    
    const commands = currentUser.role === 'dev' ? devCommands : adminCommands;
    
    if (commands[cmd]) {
        commands[cmd](args);
    } else if (trimmed !== '') {
        addLine(`[ERREUR] Commande inconnue: ${cmd}`, 'error');
        addLine('[INFO] help = liste commandes', 'info');
    }
}

if (terminalInput) {
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processCommand(terminalInput.value);
            terminalInput.value = '';
        }
    });
}

// ===== NAV ACTIVE SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (scrollY >= section.offsetTop - 200) current = section.getAttribute('id');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
});

// ===== INIT =====
console.log('%c🔧 Plomberie Expert v' + SITE_VERSION, 'font-size: 16px; font-weight: bold; color: #ff6b35;');




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
