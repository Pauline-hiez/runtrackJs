//Inscription
function register(email, password, nom, prenom) {
    if (!isValidEmail(email)) {
        return { success: false, message: "Format d'email invalide" };
    }
    if (!isLaPlateformeEmail(email)) {
        return { success: false, message: "Seuls les emails @laplateforme.io sont acceptés" };
    }
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

//Valide les emails
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

//Vérifie que les adresses soient bien laplateforme.io

function isLaPlateformeEmail(email) {
    return email.endsWith("@laplateforme.io");
}

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

// Gestion du formulaire de connexion sur connexion.html
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.endsWith("/connexion.html")) {
        const form = document.querySelector("form");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                const email = form.querySelector("input[name='email']").value.trim();
                const password = form.querySelector("input[name='password']").value;
                login(email, password);
            });
        }
    }
});

// Connexion utilisateur (admin ou standard) via users.json
function login(email, password) {
    fetch('assets/data/users.json')
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                sessionStorage.setItem("currentUser", JSON.stringify(user));
                if (user.role === 'admin') {
                    alert('Bienvenue, administrateur !');
                    window.location.href = 'admin.html';
                } else {
                    alert('Bienvenue, utilisateur standard.');
                    window.location.href = 'index.html';
                }
            } else {
                alert('Identifiants incorrects.');
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        });
}

// Récupère l'utilisateur courant une seule fois
const user = JSON.parse(sessionStorage.getItem("currentUser"));

// Gestion du formulaire de création d'utilisateur sur admin.html
document.addEventListener("DOMContentLoaded", function () {
    const createUserForm = document.getElementById("create-user-form");
    if (createUserForm) {
        createUserForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const nom = createUserForm.querySelector('#username').value.trim();
            const prenom = "";
            const email = createUserForm.querySelector('#email').value.trim();
            const password = createUserForm.querySelector('#password').value;
            const role = createUserForm.querySelector('#role').value;
            const messageDiv = document.getElementById('create-user-message');
            if (!nom || !email || !password || !role) {
                messageDiv.textContent = "Tous les champs sont obligatoires.";
                messageDiv.className = "text-red-600 mt-2";
                return;
            }
            if (!isValidEmail(email)) {
                messageDiv.textContent = "Format d'email invalide.";
                messageDiv.className = "text-red-600 mt-2";
                return;
            }
            let users = JSON.parse(localStorage.getItem("users")) || [];
            if (users.some(u => u.email === email)) {
                messageDiv.textContent = "Cet email existe déjà.";
                messageDiv.className = "text-red-600 mt-2";
                return;
            }
            const newUser = {
                id: Date.now(),
                nom,
                prenom,
                email,
                password,
                role
            };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            messageDiv.textContent = "Utilisateur créé (stocké localement).";
            messageDiv.className = "text-green-600 mt-2";
            createUserForm.reset();
        });
    }
});

// Vérifie si l'utilisateur est modérateur uniquement sur backoffice.html
if (window.location.pathname.endsWith("/backoffice.html")) {
    if (!user || (user.role !== "moderateur" && user.role !== "admin")) {
        window.location.href = "connexion.html";
    }
}

// Gestion des droits par l'administrateur (admin.html)
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.endsWith("/admin.html")) {
        // Vérifie que l'utilisateur est admin
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user || user.role !== "admin") {
            window.location.href = "connexion.html";
            return;
        }

        afficherUtilisateurs();

        function afficherUtilisateurs() {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const container = document.getElementById("users-list");
            container.innerHTML = "";
            users.forEach((u, idx) => {
                let roleOptions = `
                    <option value="user" ${u.role === "user" ? "selected" : ""}>Utilisateur</option>
                    <option value="moderateur" ${u.role === "moderateur" ? "selected" : ""}>Modérateur</option>
                    <option value="admin" ${u.role === "admin" ? "selected" : ""}>Administrateur</option>
                `;
                const nomComplet = u.nom + (u.prenom ? ' ' + u.prenom : '');
                container.innerHTML += `
                    <div class="flex flex-col md:flex-row md:items-center justify-between bg-white/80 rounded-xl shadow p-4 border border-cyan-200">
                        <div>
                            <div class="font-bold text-cyan-700">${nomComplet} <span class="text-gray-500 text-sm">(${u.email})</span></div>
                            <div class="text-sm text-gray-500">Rôle actuel : <span class="font-semibold">${u.role}</span></div>
                        </div>
                        <div class="flex items-center gap-4 mt-2 md:mt-0">
                            <select class="role-select border rounded px-2 py-1" data-idx="${idx}">
                                ${roleOptions}
                            </select>
                            <button class="delete-btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded" data-idx="${idx}">Supprimer</button>
                        </div>
                    </div>
                `;
            });

            // Listener pour changement de rôle
            document.querySelectorAll('.role-select').forEach(sel => {
                sel.addEventListener('change', function () {
                    const idx = this.getAttribute('data-idx');
                    const users = JSON.parse(localStorage.getItem("users") || "[]");
                    users[idx].role = this.value;
                    localStorage.setItem("users", JSON.stringify(users));
                    afficherUtilisateurs();
                });
            });

            // Listener pour suppression
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const idx = this.getAttribute('data-idx');
                    let users = JSON.parse(localStorage.getItem("users") || "[]");
                    if (users[idx].email === user.email) {
                        alert("Vous ne pouvez pas vous supprimer vous-même !");
                        return;
                    }
                    users.splice(idx, 1);
                    localStorage.setItem("users", JSON.stringify(users));
                    afficherUtilisateurs();
                });
            });
        }
    }
});

// Affiche/Masque les liens navbar selon l'état de connexion (unique)
document.addEventListener("DOMContentLoaded", function () {
    // Affiche le lien backoffice si modérateur ou admin
    if (user && (user.role === 'moderateur' || user.role === 'admin')) {
        const backofficeLi = document.getElementById('backoffice-li');
        if (backofficeLi) backofficeLi.style.display = '';
    }
    // Affiche le lien admin uniquement pour l'admin
    if (user && user.role === 'admin') {
        const adminLi = document.getElementById('admin-li');
        if (adminLi) adminLi.style.display = '';
    }
    // Masque inscription/connexion si connecté
    if (user) {
        const inscriptionLi = document.getElementById('inscription-li');
        const connexionLi = document.getElementById('connexion-li');
        if (inscriptionLi) inscriptionLi.style.display = 'none';
        if (connexionLi) connexionLi.style.display = 'none';
    }
});

//Bouton de déconnexion sur la navbar
document.addEventListener('DOMContentLoaded', function () {
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

// Vérifie la session uniquement pour calendrier.html
if (
    window.location.pathname.endsWith("/calendrier.html") &&
    !user
) {
    window.location.href = "connexion.html";
}

// Calendrier
function afficherCalendrier() {
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

if (window.location.pathname.endsWith("/calendrier.html") && user) {
    document.addEventListener("DOMContentLoaded", function () {
        afficherCalendrier();
    });
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
    afficherCalendrier();
}

function getDemandes() {
    return JSON.parse(localStorage.getItem("demandes") || "[]");
}

function setDemandes(demandes) {
    localStorage.setItem("demandes", JSON.stringify(demandes));
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
    // Trie les demandes : en attente d'abord, puis les autres
    demandes.sort((a, b) => {
        if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
        if (a.statut !== 'en_attente' && b.statut === 'en_attente') return 1;
        return 0;
    });
    demandes.forEach((d, idx) => {
        const demandeur = users.find(u => u.id === d.userId);
        let nom = 'Utilisateur inconnu';
        if (demandeur) {
            if (demandeur.nom && demandeur.prenom) {
                nom = demandeur.nom + (demandeur.prenom ? ' ' + demandeur.prenom : '');
            } else if (demandeur.nom) {
                nom = demandeur.nom;
            } else if (demandeur.email) {
                nom = demandeur.email;
            }
        }
        let statutAffiche =
            d.statut === 'en_attente' ? 'En attente' :
                d.statut === 'acceptée' ? 'Acceptée' :
                    d.statut === 'refusée' ? 'Refusée' : d.statut;
        let statutColor = d.statut === 'acceptée' ? 'text-green-600' : d.statut === 'refusée' ? 'text-red-600' : 'text-yellow-600';
        let actions = '';
        // On ne peut plus changer la décision si la date est passée
        const dateJour = new Date(d.date + "T23:59:59");
        const maintenant = new Date();
        if (d.statut === 'en_attente' && dateJour >= maintenant) {
            actions = `
                    <button class="accept-btn bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded mr-2" data-userid="${d.userId}" data-date="${d.date}">Accepter</button>
                    <button class="refuse-btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded" data-userid="${d.userId}" data-date="${d.date}">Refuser</button>
                `;
        }
        container.innerHTML += `
                <div class="flex flex-col md:flex-row md:items-center justify-between bg-white/80 rounded-xl shadow p-4 border border-cyan-200">
                    <div>
                        <div class="font-bold text-cyan-700">${nom}</div>
                        <div class="text-sm text-gray-500">${(() => {
                const parts = d.date.split('-');
                if (parts.length === 3) {
                    return parts[2] + '/' + parts[1] + '/' + parts[0];
                } else {
                    return d.date;
                }
            })()}</div>
                    </div>
                    <div class="flex items-center gap-4 mt-2 md:mt-0">
                        <span class="font-semibold ${statutColor}">${statutAffiche}</span>
                        ${actions}
                    </div>
                </div>
            `;
    });

    // Ajoute les listeners pour accepter/refuser uniquement si modérateur ou admin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && (currentUser.role === 'moderateur' || currentUser.role === 'admin')) {
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const userId = this.getAttribute('data-userid');
                const date = this.getAttribute('data-date');
                changerStatutDemande(userId, date, 'acceptée');
            });
        });
        document.querySelectorAll('.refuse-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const userId = this.getAttribute('data-userid');
                const date = this.getAttribute('data-date');
                changerStatutDemande(userId, date, 'refusée');
            });
        });
    }
}


function changerStatutDemande(userId, date, statut) {
    const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
    const demande = demandes.find(d => String(d.userId) === String(userId) && d.date === date);
    if (demande) {
        demande.statut = statut;
        localStorage.setItem("demandes", JSON.stringify(demandes));
        afficherDemandes();
    }
}

afficherDemandes();


//Responsive
// Menu hamburger responsive pour la navbar
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector('[data-collapse-toggle="navbar-default"]');
    const navbar = document.getElementById('navbar-default');
    if (toggleBtn && navbar) {
        toggleBtn.addEventListener('click', function () {
            navbar.classList.toggle('hidden');
        });
    }
});