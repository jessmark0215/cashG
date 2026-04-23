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

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strong.test(newPassword)) {
        alert("Weak password.");
        return;
    }

    try {
        // 🔍 find user
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("No account found.");
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userRef = doc(db, "users", userDoc.id);

        // 🚫 check attempts (max 3)
        if (userData.attempts >= 3) {
            alert("Too many attempts. Try again later.");
            return;
        }

        // ❌ wrong answer
        if (userData.securityAnswer !== answer) {
            await updateDoc(userRef, {
                attempts: increment(1)
            });
            alert("Incorrect answer.");
            return;
        }

        // ✅ reset attempts after success
        await updateDoc(userRef, {
            attempts: 0
        });

        // 🔐 sign in using stored password
        await signInWithEmailAndPassword(auth, email, userData.password);

        // 🔄 update password
        await updatePassword(auth.currentUser, newPassword);

        // 🔒 sign out after reset
        await signOut(auth);

        alert("Password successfully reset!");
        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}
