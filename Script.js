// Récupération des deux calques
const contentCanvas = document.getElementById("contentCanvas");
const contentCtx = contentCanvas.getContext("2d");
const scratchCanvas = document.getElementById("scratchCanvas");
const scratchCtx = scratchCanvas.getContext("2d");

// Configuration des canevas
const canvasWidth = 400; // Largeur du canevas
const canvasHeight = 300; // Hauteur de la photo
const totalHeight = 350; // Hauteur totale incluant l'espace pour le texte

contentCanvas.width = scratchCanvas.width = canvasWidth;
contentCanvas.height = scratchCanvas.height = totalHeight;

// Variable pour stocker le lot déterminé
let determinedReward = null;
let isScratchComplete = false; // Verrouillage une fois gratté

// Empêcher le refresh avec F5, Ctrl+R, ou Cmd+R
document.addEventListener("keydown", (e) => {
    if (
        e.key === "F5" || 
        (e.ctrlKey && e.key === "r") || 
        (e.metaKey && e.key === "r") // Pour Mac (Cmd+R)
    ) {
        e.preventDefault();
        alert("Le rafraîchissement est désactivé !");
    }
});

// Empêcher la fermeture ou le refresh via l'événement beforeunload
window.addEventListener("beforeunload", (event) => {
    alert("Le rafraîchissement est désactivé !");
    event.preventDefault();
});

// Chargement de l'image de fond sur le calque de contenu
const backgroundImage = new Image();
backgroundImage.src = "your-lot-image.jpg"; // Remplacez par le chemin de votre image
backgroundImage.onload = () => {
    // Dessine l'image de fond
    contentCtx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

    // Ajoute un message initial (facultatif)
    contentCtx.fillStyle = "#ffffff";
    contentCtx.font = "20px Clear Sans";
    contentCtx.textAlign = "center";
    contentCtx.fillText("Grattez pour découvrir votre lot !", canvasWidth / 2, canvasHeight - 10);

    // Ajoute une couche grise sur le canevas de grattage
    scratchCtx.fillStyle = "#003A23"; // Couleur grise
    scratchCtx.fillRect(0, 0, canvasWidth, canvasHeight); // Recouvre la photo
};

// Fonction pour gérer le grattage
function scratch(x, y) {
    if (isScratchComplete) return; // Empêche le grattage si terminé

    scratchCtx.globalCompositeOperation = "destination-out"; // Mode pour gratter
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 20, 0, Math.PI * 2, false); // Taille du "pinceau"
    scratchCtx.fill();
}

// Gestion des événements de souris
scratchCanvas.addEventListener("mousemove", (e) => {
    if (e.buttons === 1 && !isScratchComplete) { // Si clic gauche maintenu
        const rect = scratchCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        scratch(x, y);
    }
});

// Gestion des événements tactiles
scratchCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Empêche le défilement de la page
    if (isScratchComplete) return;
    const rect = scratchCanvas.getBoundingClientRect();
    for (const touch of e.touches) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        scratch(x, y);
    }
});

// Vérification après grattage
function checkScratchProgress() {
    if (isScratchComplete) return; // Vérifie si déjà terminé

    const imageData = scratchCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const totalPixels = imageData.data.length / 4; // Nombre total de pixels
    let transparentPixels = 0;

    // Compte des pixels transparents
    for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) {
            transparentPixels++;
        }
    }

    // Si plus de 50% sont grattés, affiche un lot
    if (transparentPixels / totalPixels > 0.5) {
        if (!determinedReward) {
            determinedReward = getReward(); // Détermine le lot une seule fois
        }
        isScratchComplete = true; // Verrouille le grattage
        setTimeout(() => {
            displayReward(determinedReward);
        }, 200); // Petite pause pour laisser l'utilisateur finir le grattage
    }
}

// Ajout des événements pour déclencher la vérification
scratchCanvas.addEventListener("mouseup", checkScratchProgress);
scratchCanvas.addEventListener("touchend", checkScratchProgress);

// Détermine un lot basé sur les probabilités
function getReward() {
    const rewards = [
        { text: "", chance: 50 }, // Pas de gain
        { text: "Billet VIP", chance: 30 },
        { text: "Réduction 10%", chance: 5 },
        { text: "Goodies Stylo", chance: 2 },
        { text: "Goodies Clés USB", chance: 6 },
        { text: "Goodies Stickers", chance: 2 },
        { text: "Goodies Vachette", chance: 5 },
    ];

    const random = Math.random() * 100; // Génère un nombre aléatoire entre 0 et 100
    let cumulativeChance = 0;

    for (let reward of rewards) {
        cumulativeChance += reward.chance;
        if (random < cumulativeChance) {
            return reward.text;
        }
    }

    return ""; // Par défaut, pas de gain
}

// Fonction pour lancer des confettis
function launchConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 } // Position des confettis (au centre bas)
    });
}

// Affiche le texte sous la photo
function displayReward(text) {
    // Efface la couche de grattage
    scratchCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Redessine l'image et l'espace texte
    contentCtx.clearRect(0, 0, canvasWidth, totalHeight);
    contentCtx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

    // Affiche le texte en bas
    contentCtx.fillStyle = "#000";
    contentCtx.font = "22px Clear Sans";
    contentCtx.textAlign = "center";
    contentCtx.fillText(text || "Désolé, pas de gain cette fois !", canvasWidth / 2, totalHeight - 10);

    // Lancer des confettis uniquement si un lot est gagné
    if (text && text !== "") {
        launchConfetti();
    }
}
