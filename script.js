// ==========================================
// PLOMBERIE EXPERT - JAVASCRIPT COMPLET
// Version avec accès ADMIN + DEV
// ==========================================

// ===== CONFIGURATION ACCÈS =====
const USERS = {
    admin: {
        password: 'plombier2025',
        role: 'admin',
        name: 'Administrateur'
    },
    dev: {
        password: 'CrosseRousse!Dev2025',
        role: 'dev',
        name: 'Développeur'
    }
};

let currentUser = null;
let isLoggedIn = false;
let loginStep = 'username'; // 'username' ou 'password'
let tempUsername = '';

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
    submissions.unshift({ ...data, id: Date.now(), date: new Date().toLocaleString('fr-FR') });
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

// ===== LOGS SYSTÈME (pour DEV) =====
function addLog(action, details = '') {
    let logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    logs.unshift({
        timestamp: new Date().toLocaleString('fr-FR'),
        action: action,
        details: details,
        user: currentUser?.name || 'Système'
    });
    // Garder que les 100 derniers logs
    if (logs.length > 100) logs = logs.slice(0, 100);
    localStorage.setItem('systemLogs', JSON.stringify(logs));
}
function getLogs() {
    return JSON.parse(localStorage.getItem('systemLogs') || '[]');
}
function clearLogs() {
    localStorage.removeItem('systemLogs');
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
    const footerLogo = document.querySelector('.footer .logo');
    if (footerLogo) {
        footerLogo.style.cursor = 'default';
        footerLogo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => { clickCount = 0; }, 500);
            }
            if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                openTerminal(true); // Mode DEV
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
            addLine(`┌─ #${sub.id}${tag}`, sub.urgence === 'urgence' ? 'error' : '');
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
        addLine('');
        addLine(`[STATS] Total: ${submissions.length}`, 'success');
        addLine(`[STATS] Urgences: ${urgences}`, urgences > 0 ? 'warning' : 'success');
        addLine('');
    },
    
    view: (args) => {
        if (!args[0]) { addLine('[ERREUR] Usage: view [id]', 'error'); return; }
        const sub = getSubmissions().find(s => s.id.toString() === args[0]);
        if (!sub) { addLine(`[ERREUR] Demande #${args[0]} non trouvée.`, 'error'); return; }
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

// ===== COMMANDES DEV (en plus des commandes admin) =====
const devCommands = {
    ...adminCommands,
    
    help: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║              COMMANDES DISPONIBLES (MODE DEV)                ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('  --- COMMANDES STANDARD ---');
        addLine('  list          - Afficher toutes les demandes');
        addLine('  count         - Nombre total de demandes');
        addLine('  view [id]     - Voir le détail d\'une demande');
        addLine('  delete [id]   - Supprimer une demande');
        addLine('  clear-all     - Supprimer TOUTES les demandes');
        addLine('  urgences      - Afficher les urgences');
        addLine('  search [mot]  - Rechercher');
        addLine('  stats         - Statistiques');
        addLine('  export        - Exporter en JSON');
        addLine('');
        addLine('  --- COMMANDES DEV ---', 'info');
        addLine('  logs          - Voir les logs système');
        addLine('  clear-logs    - Effacer les logs');
        addLine('  sysinfo       - Infos système');
        addLine('  users         - Liste des utilisateurs');
        addLine('  test-form     - Créer une demande test');
        addLine('  reset-all     - RESET COMPLET (données + logs)');
        addLine('');
        addLine('  clear         - Effacer l\'écran');
        addLine('  logout        - Se déconnecter');
        addLine('');
    },
    
    logs: () => {
        const logs = getLogs();
        if (logs.length === 0) {
            addLine(''); addLine('[INFO] Aucun log enregistré.', 'info'); addLine('');
            return;
        }
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                      LOGS SYSTÈME                            ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        logs.slice(0, 20).forEach(log => {
            addLine(`[${log.timestamp}] ${log.action}`, 'info');
            if (log.details) addLine(`   └─ ${log.details}`);
            addLine(`   └─ Par: ${log.user}`);
        });
        addLine('');
        addLine(`[INFO] ${logs.length} log(s) total - Affichage des 20 derniers`, 'info');
        addLine('');
    },
    
    'clear-logs': () => {
        clearLogs();
        addLine('[OK] Logs système effacés.', 'success');
    },
    
    sysinfo: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    INFORMATIONS SYSTÈME                      ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`  Version:      2.0.0`);
        addLine(`  Utilisateur:  ${currentUser.name} (${currentUser.role})`);
        addLine(`  Navigateur:   ${navigator.userAgent.split(' ').slice(-1)[0]}`);
        addLine(`  Plateforme:   ${navigator.platform}`);
        addLine(`  Langue:       ${navigator.language}`);
        addLine(`  Écran:        ${window.innerWidth}x${window.innerHeight}`);
        addLine(`  LocalStorage: ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB utilisé`);
        addLine(`  Demandes:     ${getSubmissions().length}`);
        addLine(`  Logs:         ${getLogs().length}`);
        addLine('');
        addLine(`  Session:      ${new Date().toLocaleString('fr-FR')}`);
        addLine('');
    },
    
    users: () => {
        addLine('');
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║                    UTILISATEURS SYSTÈME                      ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        Object.keys(USERS).forEach(username => {
            const user = USERS[username];
            const isCurrent = currentUser && tempUsername === username ? ' (connecté)' : '';
            addLine(`  ${username}`, user.role === 'dev' ? 'info' : '');
            addLine(`   └─ Rôle: ${user.role}${isCurrent}`);
            addLine(`   └─ Nom: ${user.name}`);
            addLine('');
        });
    },
    
    'test-form': () => {
        const testData = {
            nom: 'Test Utilisateur',
            tel: '06 00 00 00 00',
            email: 'test@test.com',
            ville: 'Lyon Test',
            urgence: 'devis',
            message: 'Ceci est une demande de test générée par le mode DEV.'
        };
        saveSubmission(testData);
        addLog('TEST_FORM', 'Formulaire de test créé');
        addLine('[OK] Demande de test créée avec succès.', 'success');
    },
    
    'reset-all': () => {
        addLine('[ATTENTION] Ceci va supprimer TOUTES les données!', 'error');
        addLine('[ATTENTION] Tapez "confirm-reset" pour confirmer.', 'warning');
    },
    
    'confirm-reset': () => {
        clearAllSubmissions();
        clearLogs();
        addLog('RESET_COMPLET', 'Toutes les données ont été effacées');
        addLine('[OK] Reset complet effectué.', 'success');
        addLine('[INFO] Données et logs supprimés.', 'info');
    },
    
    clear: () => {
        terminalOutput.innerHTML = '';
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║     PLOMBERIE EXPERT - MODE DÉVELOPPEUR                      ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine(`[SYSTÈME] Connecté en tant que: ${currentUser.name}`, 'success');
        addLine('[SYSTÈME] Tapez "help" pour l\'aide.', 'info');
        addLine('');
    }
};

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
        }
    } else if (loginStep === 'password') {
        if (USERS[tempUsername] && USERS[tempUsername].password === trimmed) {
            currentUser = { ...USERS[tempUsername], username: tempUsername };
            isLoggedIn = true;
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
            }
            
            addLine('[SYSTÈME] Tapez "help" pour les commandes.');
            addLine('');
            
            // Alertes
            const urgences = getSubmissions().filter(s => s.urgence === 'urgence');
            if (urgences.length > 0) {
                addLine(`[ALERTE] ${urgences.length} urgence(s) en attente!`, 'error');
                addLine('');
            }
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

console.log('🔧 Plomberie Expert chargé!');
console.log('💡 Admin: bouton ⚙ en bas du site');
console.log('🔐 Dev: triple-clic sur le logo du footer');