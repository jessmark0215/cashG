import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function verifySecurity(event) {
    if (event) event.preventDefault();

    const answer = document.getElementById("answer").value.trim().toLowerCase();
    const email = localStorage.getItem("currentUserEmail");

    if (!email) {
        alert("Session expired. Please login again.");
        window.location.href = "index.html";
        return;
    }

    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("User not found!");
            window.location.href = "index.html";
            return;
        }

        const userData = snapshot.docs[0].data();

        if (userData.securityAnswer !== answer) {
            alert("Incorrect answer!");
            return;
        }

        localStorage.setItem("authVerified", "true");

        alert("Verification successful!");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 120);

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
    }
}

window.verifySecurity = verifySecurity;