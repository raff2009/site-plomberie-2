// ===== NAVIGATION FLUIDE =====
// Défilement doux quand on clique sur les liens du menu
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== GESTION DU FORMULAIRE DE CONTACT =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Récupération des valeurs du formulaire
    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const telephone = document.getElementById('telephone').value;
    const message = document.getElementById('message').value;
    
    // Affichage d'un message de confirmation
    // Note : Dans un vrai site, il faudrait envoyer ces données à un serveur
    alert(`Merci ${nom} !\n\nVotre demande de devis a bien été enregistrée.\nNous vous contacterons rapidement au ${telephone}.\n\nÀ très bientôt !`);
    
    // Réinitialisation du formulaire après envoi
    this.reset();
});

// ===== ANIMATIONS AU SCROLL =====
// Configuration de l'observateur pour détecter quand les éléments apparaissent à l'écran
const observerOptions = {
    threshold: 0.1, // L'élément doit être visible à 10%
    rootMargin: '0px 0px -50px 0px' // Marge de détection
};

// Création de l'observateur qui va gérer les animations
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Quand l'élément devient visible, on l'anime
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Application des animations sur les cartes et éléments
document.querySelectorAll('.service-card, .gallery-item, .stat-item').forEach(el => {
    // État initial : invisible et légèrement vers le bas
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    // On observe l'élément pour déclencher l'animation quand il apparaît
    observer.observe(el);
});