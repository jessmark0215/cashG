import { auth, db } from "./firebase.js";

import {
    collection, query, where, getDocs,
    updateDoc, doc, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

async function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const answer = document.getElementById("answer").value.trim().toLowerCase();
    const newPassword = document.getElementById("newPassword").value.trim();

    // 🔐 Password validation
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strong.test(newPassword)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    try {
        // 🔍 Find user in Firestore
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No account found.");
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userRef = doc(db, "users", userDoc.id);

        // 🔢 Ensure attempts exists
        const attempts = userData.attempts || 0;

        // 🚫 Max 3 attempts
        if (attempts >= 3) {
            alert("Too many attempts. Try again later.");
            return;
        }

        // ❌ Wrong answer
        if (userData.securityAnswer !== answer) {
            await updateDoc(userRef, {
                attempts: increment(1)
            });
            alert("Incorrect security answer.");
            return;
        }

        // ✅ Reset attempts on success
        await updateDoc(userRef, {
            attempts: 0
        });

        // 🔐 Sign in using stored password
        await signInWithEmailAndPassword(auth, email, userData.password);

        // 🔄 Update password
        await updatePassword(auth.currentUser, newPassword);

        // 🔒 Sign out after reset
        await signOut(auth);

        // ✅ SUCCESS MESSAGE + DELAY
        alert("Password reset successful!");

        setTimeout(() => {
            window.location.href = "index.html"; // login page
        }, 1200);

    } catch (error) {
        console.error("RESET ERROR:", error);
        alert("Error: " + error.message);
    }
}
