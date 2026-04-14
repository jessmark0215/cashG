import { auth, db } from "./firebase.js";
import {
    doc, getDoc, updateDoc, increment, arrayUnion,
    collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

// 🔒 AUTH GATE
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    let authDone = localStorage.getItem("authDone");
    if (authDone !== "true") {
        window.location.href = "authenticate.html";
        return;
    }

    currentUser = user;
    loadUserData();
});

// ========== LOAD USER DATA ==========
async function loadUserData() {
    if (!currentUser) return;

    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("User data not found!");
        return;
    }

    let data = docSnap.data();

    document.getElementById("userFullName").innerText =
        "Welcome, " + (data.name || data.email);

    document.getElementById("balance").innerText =
        "₱" + (data.balance || 0);

    let historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";

    if (!data.history || data.history.length === 0) {
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

// ========== UI TOGGLES ==========
function showAdd() {
    document.getElementById("addBox").style.display = "block";
    document.getElementById("sendBox").style.display = "none";
}

function showSend() {
    document.getElementById("sendBox").style.display = "block";
    document.getElementById("addBox").style.display = "none";
}

// ========== ADD MONEY ==========
async function addMoney() {
    let amount = Number(document.getElementById("addAmount").value);

    if (amount <= 0 || isNaN(amount)) {
        alert("Enter valid amount!");
        return;
    }

    await updateDoc(doc(db, "users", currentUser.uid), {
        balance: increment(amount),
        history: arrayUnion(`+₱${amount} added to wallet`)
    });

    document.getElementById("addAmount").value = "";
    loadUserData();

    alert("Money added successfully!");
}

// ========== SEND MONEY ==========
async function sendMoney() {
    let receiverEmail = document.getElementById("receiver").value.trim();
    let amount = Number(document.getElementById("sendAmount").value);

    if (amount <= 0 || isNaN(amount)) {
        alert("Enter valid amount!");
        return;
    }

    // find receiver
    const q = query(collection(db, "users"), where("email", "==", receiverEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        alert("Receiver not found!");
        return;
    }

    const receiverDoc = querySnapshot.docs[0];

    // sender data
    const senderRef = doc(db, "users", currentUser.uid);
    const senderSnap = await getDoc(senderRef);

    let senderData = senderSnap.data();

    if ((senderData.balance || 0) < amount) {
        alert("Insufficient balance!");
        return;
    }

    // 💸 update sender
    await updateDoc(senderRef, {
        balance: increment(-amount),
        history: arrayUnion(`-₱${amount} sent to ${receiverEmail}`)
    });

    // 💰 update receiver
    await updateDoc(doc(db, "users", receiverDoc.id), {
        balance: increment(amount),
        history: arrayUnion(`+₱${amount} received from ${currentUser.email}`)
    });

    document.getElementById("receiver").value = "";
    document.getElementById("sendAmount").value = "";

    loadUserData();
    alert("Money sent successfully!");
}

// ========== LOGOUT ==========
function logout() {
    localStorage.removeItem("authDone");

    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
}

// expose functions
window.showAdd = showAdd;
window.showSend = showSend;
window.addMoney = addMoney;
window.sendMoney = sendMoney;
window.logout = logout;
