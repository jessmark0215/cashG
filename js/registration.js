import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function isStrongPassword(password) {
    // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number
    let strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strong.test(password);
}

async function register(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let securityAnswer = document.getElementById("securityAnswer").value.trim().toLowerCase();

    // 🔴 Validate required fields
    if (!name || !email || !password || !securityAnswer) {
        alert("Please fill in all fields!");
        return;
    }

    // 🔴 Validate password strength
    if (!isStrongPassword(password)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    try {
        // 🔐 Create account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 💾 Save extra user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            securityAnswer: securityAnswer,
            balance: 0,
            history: []
        });

        alert("Registration successful!");

        // ✅ Firebase auto-login already happens
        window.location.href = "index.html";

    } catch (error) {
        // 🔴 Handle errors (like duplicate email)
        if (error.code === "auth/email-already-in-use") {
            alert("Account already exists! Please login.");
        } else {
            alert(error.message);
        }
    }
}

window.register = register;