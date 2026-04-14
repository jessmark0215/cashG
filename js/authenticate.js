import { auth, db } from "./firebase.js";
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function verifySecurity() {
    let answer = document.getElementById("answer").value.trim().toLowerCase();

    let email = localStorage.getItem("pendingAuth");

    if (!email) {
        alert("Session expired. Please login again.");
        window.location.href = "index.html";
        return;
    }

    try {
        // 🔐 get current user from Firebase Auth
        const user = auth.currentUser;

        if (!user) {
            alert("Authentication lost. Please login again.");
            window.location.href = "index.html";
            return;
        }

        // 🔍 get user data from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("User not found!");
            window.location.href = "login.html";
            return;
        }

        let userData = docSnap.data();

        // 🔴 check security answer
        if (userData.securityAnswer !== answer) {
            alert("Incorrect answer!");
            return;
        }

        // 🔐 SUCCESS STEP (CRITICAL FIX)
        localStorage.setItem("authDone", "true");
        localStorage.removeItem("pendingAuth");

        alert("Verification successful!");

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
    }
}

// expose function to HTML
window.verifySecurity = verifySecurity;