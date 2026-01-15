// ==========================================
// PLOMBERIE EXPERT - JAVASCRIPT COMPLET
// Version avec accès ADMIN + DEV
// ==========================================

// ===== CONFIGURATION ACCÈS =====
// Les identifiants sont encodés en Base64 pour plus de discrétion
// Pour modifier, utilise un encodeur Base64 en ligne (ex: base64encode.org)
// 
// ADMIN actuel : admin / plombier2025
// DEV actuel : dev / CrosseRousse!Dev2025
//
// Format : btoa('texte') pour encoder, atob('code') pour décoder

const _0x = {
    a: atob('YWRtaW4='),           // utilisateur admin
    b: atob('cGxvbWJpZXIyMDI1'),   // mdp admin
    c: atob('ZGV2'),               // utilisateur dev  
    d: atob('Q3Jvc3NlUm91c3NlIURldjIwMjU='), // mdp dev
};

const USERS = {};
USERS[_0x.a] = { password: _0x.b, role: 'admin', name: 'Administrateur' };
USERS[_0x.c] = { password: _0x.d, role: 'dev', name: 'Développeur' };

let currentUser = null;
let isLoggedIn = false;
let loginStep = 'username';
let tempUsername = '';

// ===== VERSION DU SITE =====
const SITE_VERSION = '2.1.0';
const SITE_BUILD = '2025-01-15';

// ===== NAVIGATION FLUIDE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('navLinks').classList.remove('active');
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
    header.classList.toggle('scrolled', window.scrollY > 100);
});

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
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

// ===== STOCKAGE LOCAL =====
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

// ===== NOTES DE MAINTENANCE =====
function getNotes() {
    return JSON.parse(localStorage.getItem('devNotes') || '[]');
}
function addNote(text) {
    let notes = getNotes();
    notes.unshift({
        id: Date.now(),
        text: text,
        date: new Date().toLocaleString('fr-FR')
    });
    localStorage.setItem('devNotes', JSON.stringify(notes));
}
function deleteNote(id) {
    let notes = getNotes().filter(n => n.id !== id);
    localStorage.setItem('devNotes', JSON.stringify(notes));
}

// ===== CONFIGURATION SITE =====
function getConfig() {
    return JSON.parse(localStorage.getItem('siteConfig') || '{"maintenance": false, "message": ""}');
}
function setConfig(config) {
    localStorage.setItem('siteConfig', JSON.stringify(config));
}

// ===== FORMULAIRE CONTACT =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
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

// ==========================================
// ACCÈS SECRET DEV - Triple clic sur logo footer
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
                clickTimer = setTimeout(() => { 
                    clickCount = 0; 
                }, 800);
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
// TERMINAL ADMIN
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
    adminAccessBtn.addEventListener('click', () => {
        adminModal.classList.add('show');
        terminalInput.focus();
        if (!isLoggedIn) {
            loginStep = 'username';
            terminalInput.type = 'text';
            updatePrompt('login:~$');
        }
    });
}

if (closeTerminal) {
    closeTerminal.addEventListener('click', () => adminModal.classList.remove('show'));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal.classList.contains('show')) {
        adminModal.classList.remove('show');
    }
});

adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) adminModal.classList.remove('show');
});

function updatePrompt(prompt) {
    document.querySelector('.terminal-prompt').textContent = prompt;
}

function addLine(text, className = '') {
    const line = document.createElement('p');
    line.className = 'terminal-line' + (className ? ' ' + className : '');
    line.textContent = text;
    terminalOutput.appendChild(line);
    document.getElementById('terminalBody').scrollTop = document.getElementById('terminalBody').scrollHeight;
}

function getUrgenceLabel(type) {
    return { 'devis': 'Devis', 'urgence': 'URGENCE', 'rdv': 'RDV', 'info': 'Info' }[type] || type;
}

// ===== COMMANDES ADMIN =====
const adminCommands = {
    help: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    COMMANDES DISPONIBLES                     ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('  list          - Afficher toutes les demandes');
        addLine('  count         - Nombre total de demandes');
        addLine('  view [id]     - Voir le détail d\'une demande');
        addLine('  delete [id]   - Supprimer une demande');
        addLine('  clear-all     - Supprimer TOUTES les demandes');
        addLine('  urgences      - Afficher les urgences');
        addLine('  search [mot]  - Rechercher');
        addLine('  stats         - Statistiques');
        addLine('  export        - Exporter en JSON');
        addLine('  clear         - Effacer l\'écran');
        addLine('  logout        - Se déconnecter');
        addLine('');
    },
    
    list: () => {
        const submissions = getSubmissions();
        if (submissions.length === 0) {
            addLine(''); addLine('[INFO] Aucune demande enregistrée.', 'info'); addLine('');
            return;
        }
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                   LISTE DES DEMANDES                         ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        submissions.forEach(sub => {
            const tag = sub.urgence === 'urgence' ? ' [URGENCE]' : '';
            const readTag = sub.read ? '' : ' [NEW]';
            addLine(`┌─ #${sub.id}${tag}${readTag}`, sub.urgence === 'urgence' ? 'error' : (sub.read ? '' : 'warning'));
            addLine(`│  Date: ${sub.date}`);
            addLine(`│  Nom: ${sub.nom}`);
            addLine(`│  Tél: ${sub.tel}`);
            addLine(`│  Type: ${getUrgenceLabel(sub.urgence)}`);
            addLine(`└────────────────────────────────`);
            addLine('');
        });
        addLine(`[INFO] Total: ${submissions.length} demande(s)`, 'info');
    },
    
    count: () => {
        const submissions = getSubmissions();
        const urgences = submissions.filter(s => s.urgence === 'urgence').length;
        const unread = submissions.filter(s => !s.read).length;
        addLine('');
        addLine(`[STATS] Total: ${submissions.length}`, 'success');
        addLine(`[STATS] Urgences: ${urgences}`, urgences > 0 ? 'warning' : 'success');
        addLine(`[STATS] Non lues: ${unread}`, unread > 0 ? 'warning' : 'success');
        addLine('');
    },
    
    view: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: view [id]', 'error'); return; }
        const sub = getSubmissions().find(s => s.id.toString() === args[0]);
        if (!sub) { addLine(`[ERREUR] Demande #${args[0]} non trouvée.`, 'error'); return; }
        
        markAsRead(parseInt(args[0]));
        
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine(`║  DÉTAIL DEMANDE #${sub.id}`);
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Date:   ${sub.date}`);
        addLine(`  Type:   ${getUrgenceLabel(sub.urgence)}`, sub.urgence === 'urgence' ? 'warning' : '');
        addLine(`  Nom:    ${sub.nom}`);
        addLine(`  Tél:    ${sub.tel}`);
        addLine(`  Email:  ${sub.email}`);
        addLine(`  Ville:  ${sub.ville || 'Non renseignée'}`);
        addLine('');
        addLine('  Message:');
        addLine(`  ${sub.message}`);
        addLine('');
    },
    
    delete: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: delete [id]', 'error'); return; }
        const sub = getSubmissions().find(s => s.id.toString() === args[0]);
        if (!sub) { addLine(`[ERREUR] Demande #${args[0]} non trouvée.`, 'error'); return; }
        deleteSubmission(parseInt(args[0]));
        addLog('SUPPRESSION', `Demande #${args[0]} supprimée`);
        addLine(`[OK] Demande #${args[0]} supprimée.`, 'success');
    },
    
    'clear-all': () => {
        const count = getSubmissions().length;
        if (count === 0) { addLine('[INFO] Aucune demande à supprimer.', 'info'); return; }
        addLine(`[ATTENTION] Supprimer ${count} demande(s)?`, 'warning');
        addLine('[ATTENTION] Tapez "confirm-delete" pour confirmer.', 'warning');
    },
    
    'confirm-delete': () => {
        const count = getSubmissions().length;
        clearAllSubmissions();
        addLog('SUPPRESSION_TOTALE', `${count} demandes supprimées`);
        addLine('[OK] Toutes les demandes supprimées.', 'success');
    },
    
    urgences: () => {
        const submissions = getSubmissions().filter(s => s.urgence === 'urgence');
        if (submissions.length === 0) {
            addLine(''); addLine('[INFO] Aucune urgence.', 'info'); addLine('');
            return;
        }
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                      🚨 URGENCES 🚨                          ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        submissions.forEach(sub => {
            addLine(`┌─ #${sub.id} [URGENCE]`, 'error');
            addLine(`│  Date: ${sub.date}`, 'warning');
            addLine(`│  Nom: ${sub.nom} | Tél: ${sub.tel}`);
            addLine(`└────────────────────────────────`);
            addLine('');
        });
        addLine(`[ALERTE] ${submissions.length} urgence(s)!`, 'error');
    },
    
    search: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: search [mot]', 'error'); return; }
        const keyword = args.join(' ').toLowerCase();
        const results = getSubmissions().filter(s => 
            s.nom.toLowerCase().includes(keyword) ||
            s.email.toLowerCase().includes(keyword) ||
            s.message.toLowerCase().includes(keyword) ||
            (s.ville && s.ville.toLowerCase().includes(keyword)) ||
            s.tel.includes(keyword)
        );
        if (results.length === 0) { addLine(`[INFO] Aucun résultat pour "${keyword}".`, 'info'); return; }
        addLine('');
        addLine(`[RECHERCHE] ${results.length} résultat(s):`);
        results.forEach(s => addLine(`  #${s.id} - ${s.nom} - ${s.tel}`));
        addLine('');
    },
    
    stats: () => {
        const submissions = getSubmissions();
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                      STATISTIQUES                            ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Total:    ${submissions.length}`);
        addLine(`  Devis:    ${submissions.filter(s => s.urgence === 'devis').length}`);
        addLine(`  Urgences: ${submissions.filter(s => s.urgence === 'urgence').length}`, submissions.filter(s => s.urgence === 'urgence').length > 0 ? 'warning' : '');
        addLine(`  RDV:      ${submissions.filter(s => s.urgence === 'rdv').length}`);
        addLine(`  Info:     ${submissions.filter(s => s.urgence === 'info').length}`);
        addLine(`  Non lues: ${submissions.filter(s => !s.read).length}`);
        if (submissions.length > 0) {
            addLine('');
            addLine(`  Dernière: ${submissions[0].date} - ${submissions[0].nom}`);
        }
        addLine('');
    },
    
    export: () => {
        const submissions = getSubmissions();
        if (submissions.length === 0) { addLine('[INFO] Aucune donnée.', 'info'); return; }
        addLine('');
        addLine('[EXPORT] JSON:');
        addLine(JSON.stringify(submissions, null, 2));
        addLine('');
    },
    
    clear: () => {
        terminalOutput.innerHTML = '';
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║     PLOMBERIE EXPERT - ADMINISTRATION                        ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`[SYSTÈME] Connecté en tant que: ${currentUser.name}`, 'info');
        addLine('[SYSTÈME] Tapez "help" pour l\'aide.', 'info');
        addLine('');
    },
    
    logout: () => {
        addLog('DÉCONNEXION', currentUser.name);
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
        addLine('[SYSTÈME] Déconnecté.', 'success');
        addLine('[SYSTÈME] Entrez votre nom d\'utilisateur.');
        addLine('');
    }
};

// ===== COMMANDES DEV (toutes les fonctionnalités) =====
const devCommands = {
    ...adminCommands,
    
    help: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║              COMMANDES DEV - PANNEAU COMPLET                 ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('  ═══ GESTION DEMANDES ═══', 'info');
        addLine('  list              - Toutes les demandes');
        addLine('  view [id]         - Détail d\'une demande');
        addLine('  delete [id]       - Supprimer une demande');
        addLine('  clear-all         - Supprimer tout');
        addLine('  urgences          - Voir les urgences');
        addLine('  search [mot]      - Rechercher');
        addLine('  unread            - Voir les non lues');
        addLine('  mark-all-read     - Tout marquer comme lu');
        addLine('');
        addLine('  ═══ STATISTIQUES ═══', 'info');
        addLine('  stats             - Stats générales');
        addLine('  count             - Compteurs rapides');
        addLine('  export            - Exporter JSON');
        addLine('  export-csv        - Exporter CSV');
        addLine('');
        addLine('  ═══ LOGS & MONITORING ═══', 'info');
        addLine('  logs              - Voir les logs');
        addLine('  logs [n]          - Voir les n derniers logs');
        addLine('  clear-logs        - Effacer les logs');
        addLine('  errors            - Voir les erreurs');
        addLine('');
        addLine('  ═══ MAINTENANCE ═══', 'info');
        addLine('  status            - État du site');
        addLine('  sysinfo           - Infos système');
        addLine('  performance       - Perfs navigateur');
        addLine('  storage           - Espace utilisé');
        addLine('  backup            - Sauvegarder tout');
        addLine('  restore           - Restaurer backup');
        addLine('');
        addLine('  ═══ NOTES & TODO ═══', 'info');
        addLine('  notes             - Voir les notes');
        addLine('  note [texte]      - Ajouter une note');
        addLine('  note-del [id]     - Supprimer note');
        addLine('  todo              - Liste des tâches');
        addLine('');
        addLine('  ═══ OUTILS DEV ═══', 'info');
        addLine('  test-form         - Créer demande test');
        addLine('  test-urgence      - Créer urgence test');
        addLine('  fill [n]          - Créer n demandes test');
        addLine('  users             - Liste utilisateurs');
        addLine('  version           - Version du site');
        addLine('  reload            - Recharger la page');
        addLine('  reset-all         - RESET COMPLET');
        addLine('');
        addLine('  ═══ AUTRES ═══', 'info');
        addLine('  clear             - Effacer écran');
        addLine('  date              - Date/heure actuelle');
        addLine('  whoami            - Utilisateur actuel');
        addLine('  uptime            - Temps de session');
        addLine('  logout            - Se déconnecter');
        addLine('');
    },
    
    // === GESTION DEMANDES ===
    unread: () => {
        const submissions = getSubmissions().filter(s => !s.read);
        if (submissions.length === 0) {
            addLine('[INFO] Toutes les demandes sont lues.', 'success');
            return;
        }
        addLine('');
        addLine(`[INFO] ${submissions.length} demande(s) non lue(s):`, 'warning');
        addLine('');
        submissions.forEach(sub => {
            addLine(`  #${sub.id} - ${sub.nom} - ${sub.date}`);
        });
        addLine('');
    },
    
    'mark-all-read': () => {
        let submissions = getSubmissions();
        submissions = submissions.map(s => ({...s, read: true}));
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        addLine('[OK] Toutes les demandes marquées comme lues.', 'success');
    },
    
    // === EXPORT ===
    'export-csv': () => {
        const submissions = getSubmissions();
        if (submissions.length === 0) { addLine('[INFO] Aucune donnée.', 'info'); return; }
        
        let csv = 'ID,Date,Nom,Tel,Email,Ville,Type,Message\n';
        submissions.forEach(s => {
            csv += `${s.id},"${s.date}","${s.nom}","${s.tel}","${s.email}","${s.ville || ''}","${s.urgence}","${s.message.replace(/"/g, '""')}"\n`;
        });
        
        addLine('');
        addLine('[EXPORT CSV]');
        addLine(csv);
        addLine('');
        addLine('[INFO] Copiez ce texte dans un fichier .csv', 'info');
    },
    
    // === LOGS ===
    logs: (args) => {
        const logs = getLogs();
        const limit = args[0] ? parseInt(args[0]) : 20;
        
        if (logs.length === 0) {
            addLine('[INFO] Aucun log.', 'info');
            return;
        }
        
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                      LOGS SYSTÈME                            ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        
        logs.slice(0, limit).forEach(log => {
            const color = log.action.includes('ERREUR') ? 'error' : 
                         log.action.includes('CONNEXION') ? 'success' : 'info';
            addLine(`[${log.timestamp}] ${log.action}`, color);
            if (log.details) addLine(`   └─ ${log.details}`);
        });
        
        addLine('');
        addLine(`[INFO] ${logs.length} log(s) total - Affichage: ${Math.min(limit, logs.length)}`, 'info');
    },
    
    'clear-logs': () => {
        clearLogs();
        addLine('[OK] Logs effacés.', 'success');
    },
    
    errors: () => {
        const logs = getLogs().filter(l => 
            l.action.includes('ERREUR') || 
            l.action.includes('ÉCHEC')
        );
        
        if (logs.length === 0) {
            addLine('[OK] Aucune erreur enregistrée.', 'success');
            return;
        }
        
        addLine('');
        addLine(`[ERREURS] ${logs.length} erreur(s):`, 'error');
        logs.forEach(log => {
            addLine(`  [${log.timestamp}] ${log.action}`, 'error');
            if (log.details) addLine(`     └─ ${log.details}`);
        });
        addLine('');
    },
    
    // === MAINTENANCE ===
    status: () => {
        const submissions = getSubmissions();
        const logs = getLogs();
        const config = getConfig();
        
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                     ÉTAT DU SITE                             ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Version:        ${SITE_VERSION}`);
        addLine(`  Build:          ${SITE_BUILD}`);
        addLine(`  Status:         ${config.maintenance ? '🔴 MAINTENANCE' : '🟢 EN LIGNE'}`, config.maintenance ? 'error' : 'success');
        addLine('');
        addLine(`  Demandes:       ${submissions.length}`);
        addLine(`  Non lues:       ${submissions.filter(s => !s.read).length}`);
        addLine(`  Urgences:       ${submissions.filter(s => s.urgence === 'urgence').length}`);
        addLine(`  Logs:           ${logs.length}`);
        addLine('');
        addLine(`  LocalStorage:   ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`);
        addLine('');
    },
    
    sysinfo: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                  INFORMATIONS SYSTÈME                        ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Navigateur:     ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
        addLine(`  Plateforme:     ${navigator.platform}`);
        addLine(`  Langue:         ${navigator.language}`);
        addLine(`  Cookies:        ${navigator.cookieEnabled ? 'Activés' : 'Désactivés'}`);
        addLine(`  Online:         ${navigator.onLine ? 'Oui' : 'Non'}`);
        addLine(`  Écran:          ${window.screen.width}x${window.screen.height}`);
        addLine(`  Fenêtre:        ${window.innerWidth}x${window.innerHeight}`);
        addLine(`  Pixel ratio:    ${window.devicePixelRatio}`);
        addLine(`  Mémoire:        ${navigator.deviceMemory || 'N/A'} GB`);
        addLine(`  Cores CPU:      ${navigator.hardwareConcurrency || 'N/A'}`);
        addLine('');
    },
    
    performance: () => {
        const perf = window.performance;
        const timing = perf.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    PERFORMANCES                              ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Chargement page:   ${loadTime}ms`);
        addLine(`  DOM ready:         ${domReady}ms`);
        addLine(`  Mémoire JS:        ${(perf.memory?.usedJSHeapSize / 1048576).toFixed(2) || 'N/A'} MB`);
        addLine('');
        
        if (loadTime < 1000) addLine('  [OK] Performances excellentes!', 'success');
        else if (loadTime < 3000) addLine('  [OK] Performances correctes.', 'info');
        else addLine('  [ATTENTION] Page lente à charger.', 'warning');
        addLine('');
    },
    
    storage: () => {
        const total = JSON.stringify(localStorage).length;
        const submissions = localStorage.getItem('contactSubmissions')?.length || 0;
        const logs = localStorage.getItem('systemLogs')?.length || 0;
        const notes = localStorage.getItem('devNotes')?.length || 0;
        
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                  ESPACE STOCKAGE                             ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Total utilisé:     ${(total / 1024).toFixed(2)} KB`);
        addLine(`  ├─ Demandes:       ${(submissions / 1024).toFixed(2)} KB`);
        addLine(`  ├─ Logs:           ${(logs / 1024).toFixed(2)} KB`);
        addLine(`  └─ Notes:          ${(notes / 1024).toFixed(2)} KB`);
        addLine('');
        addLine(`  Limite:            ~5 MB`);
        addLine(`  Disponible:        ~${(5120 - total/1024).toFixed(2)} KB`);
        addLine('');
    },
    
    backup: () => {
        const backup = {
            version: SITE_VERSION,
            date: new Date().toISOString(),
            submissions: getSubmissions(),
            logs: getLogs(),
            notes: getNotes(),
            config: getConfig()
        };
        
        addLine('');
        addLine('[BACKUP] Copiez ce JSON:');
        addLine('');
        addLine(JSON.stringify(backup));
        addLine('');
        addLine('[INFO] Gardez ce backup en sécurité!', 'warning');
    },
    
    restore: (args) => {
        addLine('[INFO] Pour restaurer, tapez: restore-data {json}', 'info');
        addLine('[INFO] Collez le JSON du backup après restore-data', 'info');
    },
    
    'restore-data': (args) => {
        try {
            const json = args.join(' ');
            const backup = JSON.parse(json);
            
            if (backup.submissions) localStorage.setItem('contactSubmissions', JSON.stringify(backup.submissions));
            if (backup.logs) localStorage.setItem('systemLogs', JSON.stringify(backup.logs));
            if (backup.notes) localStorage.setItem('devNotes', JSON.stringify(backup.notes));
            if (backup.config) localStorage.setItem('siteConfig', JSON.stringify(backup.config));
            
            addLine('[OK] Backup restauré avec succès!', 'success');
            addLog('RESTORE', `Backup du ${backup.date} restauré`);
        } catch (e) {
            addLine('[ERREUR] JSON invalide.', 'error');
        }
    },
    
    // === NOTES ===
    notes: () => {
        const notes = getNotes();
        if (notes.length === 0) {
            addLine('[INFO] Aucune note.', 'info');
            addLine('[INFO] Utilisez: note [texte] pour ajouter.', 'info');
            return;
        }
        
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    NOTES DE DEV                              ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        
        notes.forEach(n => {
            addLine(`  [#${n.id}] ${n.date}`, 'info');
            addLine(`  ${n.text}`);
            addLine('');
        });
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
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    TODO - AMÉLIORATIONS                      ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('  [ ] Configurer hébergement IONOS', 'warning');
        addLine('  [ ] Mettre en place la BDD MySQL');
        addLine('  [ ] Configurer les emails PHP');
        addLine('  [ ] Ajouter Google Analytics');
        addLine('  [ ] Optimiser le SEO');
        addLine('  [ ] Ajouter plus de témoignages');
        addLine('  [ ] Créer page mentions légales');
        addLine('');
    },
    
    // === OUTILS DEV ===
    'test-form': () => {
        const testData = {
            nom: 'Client Test',
            tel: '06 00 00 00 00',
            email: 'test@test.com',
            ville: 'Lyon Test',
            urgence: 'devis',
            message: 'Demande de test générée automatiquement.'
        };
        saveSubmission(testData);
        addLog('TEST', 'Formulaire test créé');
        addLine('[OK] Demande test créée.', 'success');
    },
    
    'test-urgence': () => {
        const testData = {
            nom: 'URGENCE Test',
            tel: '06 11 22 33 44',
            email: 'urgence@test.com',
            ville: 'Lyon 6ème',
            urgence: 'urgence',
            message: '🚨 URGENCE TEST - Fuite importante!'
        };
        saveSubmission(testData);
        addLog('TEST', 'Urgence test créée');
        addLine('[OK] Urgence test créée.', 'success');
    },
    
    fill: (args) => {
        const n = parseInt(args[0]) || 5;
        const noms = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand'];
        const villes = ['Lyon 1er', 'Lyon 2ème', 'Lyon 3ème', 'Lyon 6ème', 'Villeurbanne', 'Caluire'];
        const types = ['devis', 'urgence', 'rdv', 'info'];
        
        for (let i = 0; i < n; i++) {
            saveSubmission({
                nom: noms[Math.floor(Math.random() * noms.length)] + ' ' + Math.floor(Math.random() * 100),
                tel: '06 ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10),
                email: 'client' + i + '@test.com',
                ville: villes[Math.floor(Math.random() * villes.length)],
                urgence: types[Math.floor(Math.random() * types.length)],
                message: 'Message de test #' + i
            });
        }
        addLog('TEST', `${n} demandes test créées`);
        addLine(`[OK] ${n} demandes test créées.`, 'success');
    },
    
    users: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    UTILISATEURS                              ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        Object.keys(USERS).forEach(u => {
            const user = USERS[u];
            addLine(`  ${u}`, user.role === 'dev' ? 'warning' : '');
            addLine(`  └─ ${user.name} (${user.role})`);
            addLine('');
        });
    },
    
    version: () => {
        addLine('');
        addLine(`  Version: ${SITE_VERSION}`);
        addLine(`  Build:   ${SITE_BUILD}`);
        addLine(`  Auteur:  Dev Plomberie Expert`);
        addLine('');
    },
    
    reload: () => {
        addLine('[INFO] Rechargement dans 2 secondes...', 'warning');
        setTimeout(() => location.reload(), 2000);
    },
    
    'reset-all': () => {
        addLine('[DANGER] Ceci va TOUT supprimer!', 'error');
        addLine('[DANGER] Demandes + Logs + Notes + Config', 'error');
        addLine('[INFO] Tapez "confirm-reset" pour confirmer.', 'warning');
    },
    
    'confirm-reset': () => {
        localStorage.clear();
        addLog('RESET', 'Reset complet effectué');
        addLine('[OK] Reset complet effectué.', 'success');
    },
    
    // === AUTRES ===
    date: () => {
        addLine(`[DATE] ${new Date().toLocaleString('fr-FR')}`);
    },
    
    whoami: () => {
        addLine(`[USER] ${currentUser.name} (${currentUser.role})`);
    },
    
    uptime: () => {
        addLine(`[UPTIME] Session démarrée il y a ${Math.floor((Date.now() - sessionStart) / 1000)} secondes`);
    },
    
    clear: () => {
        terminalOutput.innerHTML = '';
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║     PLOMBERIE EXPERT - MODE DÉVELOPPEUR                      ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`[SYSTÈME] ${currentUser.name} | v${SITE_VERSION}`, 'success');
        addLine('[SYSTÈME] Tapez "help" pour toutes les commandes.', 'info');
        addLine('');
    }
};

let sessionStart = Date.now();

// ===== TRAITEMENT LOGIN =====
function processLogin(input) {
    const trimmed = input.trim();
    
    if (loginStep === 'username') {
        if (USERS[trimmed]) {
            tempUsername = trimmed;
            loginStep = 'password';
            terminalInput.type = 'password';
            updatePrompt('password:~$');
            addLine(`[SYSTÈME] Utilisateur: ${trimmed}`, 'info');
            addLine('[SYSTÈME] Entrez le mot de passe.');
        } else {
            addLine('[ERREUR] Utilisateur inconnu.', 'error');
            addLog('ÉCHEC_CONNEXION', `User inconnu: ${trimmed}`);
        }
    } else if (loginStep === 'password') {
        if (USERS[tempUsername] && USERS[tempUsername].password === trimmed) {
            currentUser = { ...USERS[tempUsername], username: tempUsername };
            isLoggedIn = true;
            sessionStart = Date.now();
            loginStep = 'username';
            terminalInput.type = 'text';
            
            const promptName = currentUser.role === 'dev' ? 'dev@plomberie' : 'admin@plomberie';
            updatePrompt(`${promptName}:~$`);
            
            addLog('CONNEXION', `${currentUser.name} (${currentUser.role})`);
            
            addLine('');
            addLine('[OK] Authentification réussie!', 'success');
            addLine(`[SYSTÈME] Bienvenue ${currentUser.name}!`, 'info');
            
            if (currentUser.role === 'dev') {
                addLine('[SYSTÈME] Mode DÉVELOPPEUR activé.', 'warning');
                addLine(`[SYSTÈME] Version ${SITE_VERSION}`, 'info');
            }
            
            addLine('[SYSTÈME] Tapez "help" pour les commandes.');
            addLine('');
            
            const submissions = getSubmissions();
            const urgences = submissions.filter(s => s.urgence === 'urgence');
            const unread = submissions.filter(s => !s.read);
            
            if (urgences.length > 0) {
                addLine(`[ALERTE] ${urgences.length} urgence(s) en attente!`, 'error');
            }
            if (unread.length > 0) {
                addLine(`[INFO] ${unread.length} demande(s) non lue(s).`, 'warning');
            }
            addLine('');
        } else {
            addLine('[ERREUR] Mot de passe incorrect.', 'error');
            addLog('ÉCHEC_CONNEXION', `Tentative pour: ${tempUsername}`);
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
    
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    const promptName = currentUser.role === 'dev' ? 'dev@plomberie' : 'admin@plomberie';
    addLine(`${promptName}:~$ ${trimmed}`);
    
    const commands = currentUser.role === 'dev' ? devCommands : adminCommands;
    
    if (commands[cmd]) {
        commands[cmd](args);
    } else if (trimmed !== '') {
        addLine(`[ERREUR] Commande inconnue: ${cmd}`, 'error');
        addLine('[INFO] Tapez "help" pour l\'aide.', 'info');
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

// ===== NAV ACTIVE AU SCROLL =====
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

console.log('%c🔧 Plomberie Expert', 'font-size: 20px; font-weight: bold;');
console.log('%c💡 Admin: bouton ⚙ en bas', 'color: gray;');





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
