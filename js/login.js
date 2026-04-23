import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function login(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

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
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error("No account found!");
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== password) {
            throw new Error("Incorrect email or password!");
        }

        localStorage.removeItem("loginAttempts_" + email);

        await addDoc(collection(db, "loginLogs"), {
            email,
            status: "SUCCESS LOGIN",
            time: new Date().toLocaleString()
        });

        // 🔥 FIXED SESSION SYSTEM
        localStorage.setItem("currentUserEmail", email);
        localStorage.setItem("authVerified", "false");

        let role = userData.role || "user";
        localStorage.setItem("userRole", role);

        if (role === "admin") {
            alert("Admin login successful!");
            window.location.href = "admin.html";
            return;
        }

        alert("Login successful! Proceeding to security verification...");

        setTimeout(() => {
            window.location.href = "authenticate.html";
        }, 100);

    } catch (error) {
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

window.login = login;