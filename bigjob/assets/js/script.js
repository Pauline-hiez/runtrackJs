// Récupère l'utilisateur courant une seule fois
const user = JSON.parse(sessionStorage.getItem("currentUser"));

//Inscription
function register(email, password, nom, prenom) {
    // Validation de l'email
    if (!isValidEmail(email)) {
        return { success: false, message: "Format d'email invalide" };
    }
    if (!isLaPlateformeEmail(email)) {
        return { success: false, message: "Seuls les emails @laplateforme.io sont acceptés" };
    }

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("form");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                const inputs = form.querySelectorAll("input");
                const nom = inputs[0].value;
                const prenom = inputs[1].value;
                const email = inputs[2].value;
                const password = inputs[3].value;
                const confirm = inputs[4] ? inputs[4].value : password;
                if (password !== confirm) {
                    alert("Les mots de passe ne correspondent pas.");
                    return;
                }
                const result = register(email, password, nom, prenom);
                if (result.success) {
                    alert("Inscription réussie ! Vous pouvez vous connecter.");
                    window.location.href = "connexion.html";
                } else {
                    alert(result.message);
                }
            });
        }
    });

    // Création de l'utilisateur
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const newUser = {
        id: Date.now(),
        email, password, nom, prenom,
        role: "user"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return { success: true };
}

//Connexion
function login(email, password) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        return { success: true };
    }
    return { success: false, message: "Identifiants incorrects" };
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const inputs = form.querySelectorAll("input");
            const email = inputs[0].value;
            const password = inputs[1].value;
            const result = login(email, password);
            if (result.success) {
                alert("Connexion réussie !");
                window.location.href = "calendrier.html";
            } else {
                alert(result.message);
            }
        });
    }
});

// Vérifie la session uniquement pour calendrier.html
if (
    window.location.pathname.endsWith("/calendrier.html") &&
    !user
) {
    window.location.href = "connexion.html";
}

//Charge le fichier .json
async function loadUsers() {
    try {
        const response = await fetch("data/users.json");
        const users = await response.json();
        return users;
    } catch (error) {
        console.error("Erreur de chargement:", error);
        return [];
    }
}

//Valide les emails
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

//Vérifie que les adresses soient bien laplateforme.io

function isLaPlateformeEmail(email) {
    return email.endsWith("@laplateforme.io");
}


// --- Beau calendrier stylisé avec Tailwind ---
if (window.location.pathname.endsWith("/calendrier.html") && user) {
    document.addEventListener("DOMContentLoaded", function () {
        afficherCalendrierBeau();
    });
}

function afficherCalendrierBeau() {
    const moisNoms = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const aujourdHui = new Date();
    const annee = aujourdHui.getFullYear();
    const mois = aujourdHui.getMonth();
    const nbJours = new Date(annee, mois + 1, 0).getDate();

    let calendrierDiv = document.getElementById("calendrier");
    if (!calendrierDiv) {
        calendrierDiv = document.createElement("div");
        calendrierDiv.id = "calendrier";
        calendrierDiv.className = "bg-gradient-to-br from-cyan-200 via-white to-blue-200 rounded-3xl shadow-2xl p-10 w-full max-w-3xl flex flex-col items-center border-4 border-cyan-400 calendrier-custom mx-auto";
        document.body.appendChild(calendrierDiv);
    }
    calendrierDiv.innerHTML = `
            <h2 class="text-4xl font-extrabold mb-8 text-cyan-700 tracking-wide calendrier-mois">${moisNoms[mois]} ${annee}</h2>
            <div id="jours" class="grid grid-cols-7 gap-4 w-full calendrier-jours"></div>
        `;

    const joursDiv = document.getElementById("jours");
    const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    // En-tête des jours de la semaine
    joursSemaine.forEach(j => {
        const span = document.createElement("span");
        span.textContent = j;
        span.className = "text-center font-bold text-cyan-600 text-lg";
        joursDiv.appendChild(span);
    });

    // Premier jour du mois (0=dimanche, 1=lundi...)
    const premierJour = new Date(annee, mois, 1).getDay();
    let decalage = premierJour === 0 ? 6 : premierJour - 1;
    for (let i = 0; i < decalage; i++) {
        const vide = document.createElement("span");
        joursDiv.appendChild(vide);
    }

    for (let jour = 1; jour <= nbJours; jour++) {
        const dateStr = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
        const btn = document.createElement("button");
        btn.textContent = jour;
        btn.className = "jour-btn text-lg font-semibold rounded-xl py-2 transition-all duration-200 w-full ";

        // Vérifie si une demande existe déjà pour ce jour
        const demandes = getDemandes();
        const demande = demandes.find(d => d.userId === user.id && d.date === dateStr);
        if (demande) {
            btn.textContent += demande.statut === "acceptée" ? " ✅" : demande.statut === "refusée" ? " ❌" : " ⏳";
            btn.className += " bg-cyan-400/80 text-white cursor-not-allowed opacity-70 border-2 border-cyan-600";
            btn.disabled = true;
        } else {
            // Si la date est passée, on ne peut plus faire de demande
            const dateJour = new Date(dateStr + "T23:59:59");
            if (dateJour < aujourdHui) {
                btn.className += " bg-blue-100 text-blue-300 cursor-not-allowed opacity-50 border-2 border-blue-200";
                btn.disabled = true;
            } else {
                btn.className += " bg-cyan-500 hover:bg-cyan-600 text-white shadow-md border-2 border-cyan-700";
                btn.addEventListener("click", function () {
                    demanderAutorisation(dateStr);
                });
            }
        }
        joursDiv.appendChild(btn);
    }
}

function demanderAutorisation(dateStr) {
    // Vérifie si la date est passée
    const maintenant = new Date();
    const dateJour = new Date(dateStr + "T23:59:59");
    if (dateJour < maintenant) {
        alert("Impossible de faire une demande pour une date passée.");
        return;
    }
    // Vérifie si une demande existe déjà
    const demandes = getDemandes();
    if (demandes.find(d => d.userId === user.id && d.date === dateStr)) {
        alert("Vous avez déjà fait une demande pour ce jour.");
        return;
    }
    demandes.push({ userId: user.id, date: dateStr, statut: "en_attente" });
    setDemandes(demandes);
    alert("Demande envoyée pour le " + dateStr);
    afficherCalendrierBeau();
}

function getDemandes() {
    return JSON.parse(localStorage.getItem("demandes") || "[]");
}

function setDemandes(demandes) {
    localStorage.setItem("demandes", JSON.stringify(demandes));
}

//Bouton de déconnexion sur la navbar
document.addEventListener('DOMContentLoaded', function () {
    const user = sessionStorage.getItem('currentUser');
    const logoutLi = document.getElementById('logout-li');
    if (user && logoutLi) {
        logoutLi.style.display = '';
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'connexion.html';
        });
    }
});

// Vérifie si l'utilisateur est modérateur uniquement sur backoffice.html
if (window.location.pathname.endsWith("/backoffice.html")) {
    if (!user || user.role !== "moderateur") {
        window.location.href = "connexion.html";
    }
}

// Affiche les demandes en attente
function afficherDemandes() {
    const container = document.getElementById("demandes-list");
    if (!container) return; // Ne fait rien si l'élément n'existe pas
    const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    container.innerHTML = "";
    if (demandes.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500">Aucune demande.</div>';
        return;
    }
    demandes.forEach((d, idx) => {
        const demandeur = users.find(u => u.id === d.userId);
        const nom = demandeur ? (demandeur.nom + ' ' + demandeur.prenom) : 'Utilisateur inconnu';
        let statutColor = d.statut === 'acceptée' ? 'text-green-600' : d.statut === 'refusée' ? 'text-red-600' : 'text-yellow-600';
        let actions = '';
        // On ne peut plus changer la décision si la date est passée
        const dateJour = new Date(d.date + "T23:59:59");
        const maintenant = new Date();
        if (d.statut === 'en_attente' && dateJour >= maintenant) {
            actions = `
                    <button class="accept-btn bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded mr-2" data-idx="${idx}">Accepter</button>
                    <button class="refuse-btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded" data-idx="${idx}">Refuser</button>
                `;
        }
        container.innerHTML += `
                <div class="flex flex-col md:flex-row md:items-center justify-between bg-white/80 rounded-xl shadow p-4 border border-cyan-200">
                    <div>
                        <div class="font-bold text-cyan-700">${nom}</div>
                        <div class="text-sm text-gray-500">${d.date}</div>
                    </div>
                    <div class="flex items-center gap-4 mt-2 md:mt-0">
                        <span class="font-semibold ${statutColor}">${d.statut}</span>
                        ${actions}
                    </div>
                </div>
            `;
    });

    // Ajoute les listeners pour accepter/refuser
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = this.getAttribute('data-idx');
            changerStatutDemande(idx, 'acceptée');
        });
    });
    document.querySelectorAll('.refuse-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = this.getAttribute('data-idx');
            changerStatutDemande(idx, 'refusée');
        });
    });
}

function changerStatutDemande(idx, statut) {
    const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
    demandes[idx].statut = statut;
    localStorage.setItem("demandes", JSON.stringify(demandes));
    afficherDemandes();
}

afficherDemandes(); // Sans effet sur les pages sans 'demandes-list'

// Affiche le lien backoffice si modérateur sur toutes les pages
document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (user && user.role === 'moderateur') {
        const backofficeLi = document.getElementById('backoffice-li');
        if (backofficeLi) backofficeLi.style.display = '';
    }
});

// Gestion du formulaire d'inscription sur inscription.html
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.endsWith("/inscription.html")) {
        const form = document.querySelector("form");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                const inputs = form.querySelectorAll("input");
                const nom = inputs[0].value;
                const email = inputs[1].value;
                const password = inputs[2].value;
                const confirm = inputs[3] ? inputs[3].value : password;
                if (password !== confirm) {
                    alert("Les mots de passe ne correspondent pas.");
                    return;
                }
                const result = register(email, password, nom, "");
                if (result.success) {
                    alert("Inscription réussie ! Vous pouvez vous connecter.");
                    window.location.href = "connexion.html";
                } else {
                    alert(result.message);
                }
            });
        }
    }
});

// Affiche le lien backoffice si modérateur sur toutes les pages
document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (user && user.role === 'moderateur') {
        const backofficeLi = document.getElementById('backoffice-li');
        if (backofficeLi) backofficeLi.style.display = '';
    }
});
