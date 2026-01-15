// ==========================================
// PLOMBERIE EXPERT - JAVASCRIPT COMPLET
// Version LOCAL (sans serveur)
// ==========================================

// ===== CONFIGURATION =====
const ADMIN_PASSWORD = 'plombier2025'; // Mot de passe admin
let isLoggedIn = false;

// ===== NAVIGATION FLUIDE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            document.getElementById('navLinks').classList.remove('active');
        }
    });
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== SCROLL TO TOP BUTTON =====
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== GESTION FAQ =====
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

// ===== FORMULAIRE DE CONTACT =====
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
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('show');
        this.reset();
        setTimeout(() => successMessage.classList.remove('show'), 5000);
    });
}

// ===== ANIMATIONS AU SCROLL =====
const observer = new IntersectionObserver(function(entries) {
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
// TERMINAL ADMIN
// ==========================================

const adminModal = document.getElementById('adminModal');
const adminAccessBtn = document.getElementById('adminAccessBtn');
const closeTerminal = document.getElementById('closeTerminal');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

if (adminAccessBtn) {
    adminAccessBtn.addEventListener('click', () => {
        adminModal.classList.add('show');
        terminalInput.focus();
        if (!isLoggedIn) {
            terminalInput.type = 'password';
            updatePrompt('password:~$');
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

// === COMMANDES ===
const commands = {
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
        addLine(`[OK] Demande #${args[0]} supprimée.`, 'success');
    },
    
    'clear-all': () => {
        const count = getSubmissions().length;
        if (count === 0) { addLine('[INFO] Aucune demande à supprimer.', 'info'); return; }
        addLine(`[ATTENTION] Supprimer ${count} demande(s)?`, 'warning');
        addLine('[ATTENTION] Tapez "confirm-delete" pour confirmer.', 'warning');
    },
    
    'confirm-delete': () => {
        clearAllSubmissions();
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
        addLine('║     PLOMBERIE EXPERT - ADMINISTRATION v2.0                   ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('[SYSTÈME] Tapez "help" pour l\'aide.', 'info');
        addLine('');
    },
    
    logout: () => {
        isLoggedIn = false;
        terminalInput.type = 'password';
        updatePrompt('password:~$');
        terminalOutput.innerHTML = '';
        addLine('╔══════════════════════════════════════════════════════════════╗');
        addLine('║     PLOMBERIE EXPERT - ADMINISTRATION v2.0                   ║');
        addLine('╚══════════════════════════════════════════════════════════════╝');
        addLine('');
        addLine('[SYSTÈME] Déconnecté.', 'success');
        addLine('[SYSTÈME] Entrez le mot de passe.');
        addLine('');
    }
};

// === TRAITEMENT COMMANDES ===
function processCommand(input) {
    const trimmed = input.trim();
    
    if (!isLoggedIn) {
        if (trimmed === ADMIN_PASSWORD) {
            isLoggedIn = true;
            terminalInput.type = 'text';
            updatePrompt('admin@plomberie:~$');
            addLine('');
            addLine('[OK] Authentification réussie!', 'success');
            addLine('[SYSTÈME] Tapez "help" pour les commandes.');
            addLine('');
            const urgences = getSubmissions().filter(s => s.urgence === 'urgence');
            if (urgences.length > 0) {
                addLine(`[ALERTE] ${urgences.length} urgence(s) en attente!`, 'error');
                addLine('');
            }
        } else {
            addLine('[ERREUR] Mot de passe incorrect.', 'error');
        }
        return;
    }
    
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    addLine(`admin@plomberie:~$ ${trimmed}`);
    
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