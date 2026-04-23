import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// ✅ attach event
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetForm");
    if (form) form.addEventListener("submit", resetPassword);
});

async function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const answer = document.getElementById("securityAnswer").value.trim().toLowerCase();
    const newPassword = document.getElementById("newPassword").value.trim();

    if (!email || !answer || !newPassword) {
        alert("Please fill in all fields!");
        return;
    }

    if (!isStrongPassword(newPassword)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    try {
        // 🔍 find user by email (same as register.js structure)
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No account found with this email!");
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // 🔴 check security answer
        if (userData.securityAnswer !== answer) {
            alert("Incorrect security answer!");
            return;
        }

        // 🔄 update password directly in Firestore (same style as register.js)
        await updateDoc(doc(db, "users", userDoc.id), {
            password: newPassword   // same storage style as registration
        });

        alert("Password reset successful!");

        window.location.href = "index.html";

    } catch (error) {
        console.error("RESET ERROR:", error);
        alert(error.message);
    }
}

window.resetPassword = resetPassword;