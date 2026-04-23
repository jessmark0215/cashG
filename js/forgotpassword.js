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
    const answer = document.getElementById("securityAnswer").value.trim().toLowerCase();
    const newPassword = document.getElementById("newPassword").value.trim();

    // 🔐 Password validation
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strong.test(newPassword)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    try {
        // 🔍 STEP 1: find user by email
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No account found.");
            return;
        }

        const userDocFromQuery = snapshot.docs[0];
        const userData = userDocFromQuery.data();

        // ✅ IMPORTANT: get UID (same as login.js)
        const uid = userDocFromQuery.id;

        // 🎯 now match login.js structure
        const userRef = doc(db, "users", uid);

        // 🔢 attempts safe fallback
        const attempts = userData.attempts || 0;

        if (attempts >= 3) {
            alert("Too many attempts. Try again later.");
            return;
        }

        // ❌ wrong answer
        if (userData.securityAnswer !== answer) {
            await updateDoc(userRef, {
                attempts: increment(1)
            });
            alert("Incorrect security answer.");
            return;
        }

        // ✅ reset attempts
        await updateDoc(userRef, {
            attempts: 0
        });

        // 🔐 sign in (must match how you stored password)
        await signInWithEmailAndPassword(auth, email, userData.password);

        // 🔄 update password
        await updatePassword(auth.currentUser, newPassword);

        // 🔒 sign out
        await signOut(auth);

        alert("Password reset successful!");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);

    } catch (error) {
        console.error("RESET ERROR:", error);
        alert("Error: " + error.message);
    }
}

window.resetPassword = resetPassword;
