//Inscription
function register(email, password, nom, prenom) {
    // Validation de l'email
    if (!isValidEmail(email)) {
        return { success: false, message: "Format d'email invalide" };
    }
    if (!isLaPlateformeEmail(email)) {
        return { success: false, message: "Seuls les emails @laplateforme.io sont acceptés" };
    }

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

//Verfifie la session
// Récupération de l'utilisateur connecté
const user = JSON.parse(sessionStorage.getItem("currentUser"));
// Protection d'une page
if (!user) {
    window.location.href = "login.html";
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
