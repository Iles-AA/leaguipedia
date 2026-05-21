const data = {
    title: "Ma Tierlist",
    layout: { S: ["Aatrox", "Darius"], A: ["Garen"] }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, initialisation des boutons...");
    
    const buttons = document.querySelectorAll('.sidebar-btn');
    const sections = document.querySelectorAll('.profile-section');

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Bouton cliqué :", btn.dataset.section);
            
            // Masquer tout
            sections.forEach(s => s.style.display = 'none');
            buttons.forEach(b => b.classList.remove('active'));
            
            // Afficher le bon
            btn.classList.add('active');
            const target = document.getElementById('section-' + btn.dataset.section);
            if (target) {
                target.style.display = 'block';
                console.log("Section affichée :", target.id);
            } else {
                console.error("Erreur : section-", btn.dataset.section, " introuvable !");
            }
        });
    });
});