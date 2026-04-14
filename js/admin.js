import { auth, db } from "./firebase.js";
import {
    doc, getDoc, collection, getDocs, deleteDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==================== ADMIN AUTH CHECK ====================
auth.onAuthStateChanged(async (user) => {

    if (!user) {
        alert("Admin access only!");
        window.location.href = "login.html";
        return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        alert("Access denied!");
        window.location.href = "login.html";
        return;
    }

    const role = (userSnap.data().role || "").trim().toLowerCase();

    if (role !== "admin") {
        alert("Admin access only!");
        window.location.href = "login.html";
        return;
    }

    console.log("Admin verified");
});

// ==================== SHOW USERS ====================
async function showUsers() {
    hideAll();

    const box = document.getElementById("usersBox");
    box.classList.remove("hidden");
    box.innerHTML = "<h3>All Users</h3>";

    const snapshot = await getDocs(collection(db, "users"));

    if (snapshot.empty) {
        box.innerHTML += "<p>No users found.</p>";
        return;
    }

    snapshot.forEach(docSnap => {
        const user = docSnap.data();

        const div = document.createElement("div");
        div.classList.add("user-card");

        div.innerHTML = `
            <b>${user.name || "No Name"}</b><br>
            ${user.email || "No Email"}<br>
            Balance: ₱${user.balance || 0}
            <button class="delete-btn" onclick="deleteUser('${docSnap.id}')">Delete</button>
        `;

        box.appendChild(div);
    });
}

// ==================== ADD USER ====================
async function addUser() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!fullName || !email || !password) {
        alert("Please fill all fields!");
        return;
    }

    const newUserRef = doc(collection(db, "users"));

    await setDoc(newUserRef, {
        name: fullName,
        email: email,
        password: password,
        role: "user",
        balance: 1000,
        history: []
    });

    alert("User added!");

    document.getElementById("fullName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    showUsers();
}

// ==================== DELETE USER ====================
async function deleteUser(userId) {
    if (!confirm("Delete this user?")) return;

    await deleteDoc(doc(db, "users", userId));

    alert("User deleted!");
    showUsers();
}

// ==================== LOGIN LOGS (FIXED SORT + FAILED RED) ====================
async function showLogs() {
    hideAll();

    const box = document.getElementById("logsBox");
    box.classList.remove("hidden");
    box.innerHTML = "<h3>Login Logs</h3>";

    const snapshot = await getDocs(collection(db, "loginLogs"));

    if (snapshot.empty) {
        box.innerHTML += "<p>No login logs found.</p>";
        return;
    }

    let logs = [];

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

        // 🔥 normalize time for perfect sorting
        const timeValue =
            typeof data.time === "number"
                ? data.time
                : new Date(data.time || 0).getTime();

        logs.push({
            email: data.email || "Unknown",
            status: data.status || "NO STATUS",
            time: timeValue
        });
    });

    // 🔥 SORT: NEWEST → OLDEST (STRICT)
    logs.sort((a, b) => b.time - a.time);

    logs.forEach(log => {

        const div = document.createElement("div");
        div.classList.add("user-card");

        const statusText = log.status.toUpperCase();
        const isFail = statusText.includes("FAILED");

        div.innerHTML = `
            <b>${log.email}</b><br>

            <span style="
                color:${isFail ? "red" : "green"};
                font-weight:bold;
            ">
                ${statusText}
            </span><br>

            <small>
                ${new Date(log.time).toLocaleString()}
            </small>
        `;

        box.appendChild(div);
    });
}

// ==================== UI HELPERS ====================
function showAddUser() {
    hideAll();
    document.getElementById("addUserBox").classList.remove("hidden");
}

function hideAll() {
    document.getElementById("usersBox").classList.add("hidden");
    document.getElementById("logsBox").classList.add("hidden");
    document.getElementById("addUserBox").classList.add("hidden");
}

// ==================== LOGOUT ====================
function logout() {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
}

// expose to HTML
window.showUsers = showUsers;
window.addUser = addUser;
window.deleteUser = deleteUser;
window.showLogs = showLogs;
window.showAddUser = showAddUser;
window.logout = logout;