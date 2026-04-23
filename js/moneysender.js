import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc, increment, arrayUnion, collection, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function sendMoney() {
    let receiverEmail = document.getElementById("email").value.trim();
    let amount = Number(document.getElementById("amount").value);

    if (amount <= 0 || isNaN(amount)) {
        alert("Enter a valid amount!");
        return;
    }

    let currentUser = auth.currentUser;

    if (!currentUser) {
        alert("Not logged in!");
        return;
    }

    // 🔍 find receiver
    const q = query(collection(db, "users"), where("email", "==", receiverEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
        alert("Receiver account not found!");
        return;
    }

    const receiverDoc = snap.docs[0];

    // 💰 NO BALANCE CHECK (FAKE SYSTEM)
    await updateDoc(doc(db, "users", receiverDoc.id), {
        balance: increment(amount),
        history: arrayUnion(`+₱${amount} received from Admin Money Sender`)
    });

    // optional: still log sender history (even if fake system)
    await updateDoc(doc(db, "users", currentUser.uid), {
        history: arrayUnion(`+₱${amount} received from Admin Money Sender`)
    });

    // clear inputs
    document.getElementById("email").value = "";
    document.getElementById("amount").value = "";

    alert("Money sent successfully!");
}
window.sendMoney = sendMoney;