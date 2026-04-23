import { db } from "./firebase.js";

import {
    doc,
    updateDoc,
    increment,
    arrayUnion,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

window.addEventListener("DOMContentLoaded", async () => {

    const email = localStorage.getItem("currentUserEmail");
    const authVerified = localStorage.getItem("authVerified");

    if (!email || authVerified !== "true") {
        window.location.href = "index.html";
        return;
    }

    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            window.location.href = "index.html";
            return;
        }

        currentUser = snapshot.docs[0];

        loadUserData();

    } catch (error) {
        console.error(error);
        window.location.href = "index.html";
    }
});

async function loadUserData() {
    if (!currentUser) return;

    const data = currentUser.data();

    document.getElementById("userFullName").innerText =
        "Welcome Bossing! " + (data.name || data.email);

    document.getElementById("balance").innerText =
        "₱" + (data.balance || 0);

    let historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";

    if (!data.history?.length) {
        historyDiv.innerHTML = "<p>No transactions yet</p>";
        return;
    }

    data.history.slice().reverse().forEach(tx => {
        let div = document.createElement("div");
        div.classList.add("tx");
        div.innerText = tx;
        historyDiv.appendChild(div);
    });
}

// ===== FIXED MONEY FUNCTIONS =====
async function addMoney() {
    let amount = Number(document.getElementById("addAmount").value);

    if (amount <= 0 || isNaN(amount)) return alert("Invalid amount");

    await updateDoc(doc(db, "users", currentUser.id), {
        balance: increment(amount),
        history: arrayUnion(`+₱${amount} added to wallet`)
    });

    loadUserData();
    alert("Money added!");
}

async function sendMoney() {
    let receiverEmail = document.getElementById("receiver").value.trim();
    let amount = Number(document.getElementById("sendAmount").value);

    if (amount <= 0 || isNaN(amount)) return alert("Invalid amount");

    const q = query(collection(db, "users"), where("email", "==", receiverEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return alert("Receiver not found");

    const receiverDoc = snapshot.docs[0];

    const senderData = currentUser.data();

    if ((senderData.balance || 0) < amount) {
        return alert("Insufficient balance");
    }

    await updateDoc(doc(db, "users", currentUser.id), {
        balance: increment(-amount),
        history: arrayUnion(`-₱${amount} sent to ${receiverEmail}`)
    });

    await updateDoc(doc(db, "users", receiverDoc.id), {
        balance: increment(amount),
        history: arrayUnion(`+₱${amount} received from ${senderData.email}`)
    });

    loadUserData();
    alert("Sent successfully");
}

function logout() {
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("authVerified");

    window.location.href = "index.html";
}

window.showAdd = () => document.getElementById("addBox").style.display = "block";
window.showSend = () => document.getElementById("sendBox").style.display = "block";
window.addMoney = addMoney;
window.sendMoney = sendMoney;
window.logout = logout;