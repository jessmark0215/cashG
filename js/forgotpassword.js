import { auth, db } from "./firebase.js";
import { 
    collection, query, where, getDocs, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

async function resetPassword(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let answer = document.getElementById("answer").value.trim().toLowerCase();
    let newPassword = document.getElementById("newPassword").value.trim();

    // 🔐 Validate strong password
    let strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strong.test(newPassword)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    try {
        // 🔍 Find user in Firestore
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No account found with this email!");
            return;
        }

        let userDoc = snapshot.docs[0];
        let userData = userDoc.data();

        // 🔴 Check security answer
        if (userData.securityAnswer !== answer) {
            alert("Incorrect security answer!");
            return;
        }

        // 🔥 Firebase DOES NOT allow direct password change like this
        // You MUST send a reset email instead
        await sendPasswordResetEmail(auth, email);

        alert("Password reset email sent! Check your Gmail.");

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}
