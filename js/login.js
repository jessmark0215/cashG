import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function login(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    // 🔒 login attempts (local only)
    let attemptsData = JSON.parse(localStorage.getItem("loginAttempts_" + email)) || {
        attempts: 0,
        lockTime: 0
    };

    let now = Date.now();

    if (attemptsData.lockTime && now < attemptsData.lockTime) {
        let remaining = Math.ceil((attemptsData.lockTime - now) / 1000);
        alert(`Too many failed attempts. Try again in ${remaining} seconds.`);
        return;
    }

    try {
        // 🔐 Firebase login
        await signInWithEmailAndPassword(auth, email, password);

        // reset attempts
        localStorage.removeItem("loginAttempts_" + email);

        // 📌 log login
        await addDoc(collection(db, "loginLogs"), {
            email: email,
            status: "SUCCESS LOGIN",
            time: new Date().toLocaleString()
        });

        // 🔍 GET USER ROLE FROM FIRESTORE
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        let role = "user"; // default role

        if (userSnap.exists()) {
            role = userSnap.data().role || "user";
        }

        // 💾 store role safely
        localStorage.setItem("userRole", role);

        // 👑 ADMIN FLOW (SKIP AUTH)
        if (role === "admin") {
            alert("Admin login successful!");
            window.location.href = "admin.html";
            return;
        }

        // 👤 USER FLOW (GO AUTH PAGE)
        localStorage.setItem("pendingAuth", email);

        alert("Login successful! Proceeding to security verification...");
        window.location.href = "authenticate.html";

    } catch (error) {
        // ❌ FAILED LOGIN
        attemptsData.attempts++;

        if (attemptsData.attempts < 3) {
            alert(`Incorrect email or password! Attempts left: ${3 - attemptsData.attempts}`);
        }

        if (attemptsData.attempts >= 3) {
            attemptsData.lockTime = now + 30000;
            attemptsData.attempts = 0;

            alert("Account locked for 30 seconds due to multiple failed attempts.");
        }

        localStorage.setItem("loginAttempts_" + email, JSON.stringify(attemptsData));
    }
}

// ===================== ADMIN BUTTON =====================
function goAdmin() {
    window.location.href = "admin.html";
}

window.login = login;
window.goAdmin = goAdmin; 