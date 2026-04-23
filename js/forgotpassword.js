import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const answer = document.getElementById("securityAnswer").value.trim().toLowerCase();
    const newPassword = document.getElementById("newPassword").value.trim();

    // 🔐 Password strength check
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strong.test(newPassword)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    try {
        // 🔍 Find user in Firestore by email
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No account found with this email!");
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // 🔴 Check security answer
        if (userData.securityAnswer !== answer) {
            alert("Incorrect security answer!");
            return;
        }

        // 🔄 Update password in Firestore
        await updateDoc(doc(db, "users", userDoc.id), {
            password: btoa(newPassword) // keeping your old "hashing style"
        });

        alert("Password reset successful!");

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}

window.resetPassword = resetPassword;
