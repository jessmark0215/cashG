import { auth, db } from "./firebase.js";
import { 
    doc, getDoc, updateDoc, increment, arrayUnion,
    collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function sendMoney() {
    let receiverEmail = document.getElementById("receiver").value.trim();
    let amount = Number(document.getElementById("amount").value);

    const currentUser = auth.currentUser;

    // 🔴 Check login
    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "index.html";
        return;
    }

    // 🔴 Prevent self send
    if (receiverEmail === currentUser.email) {
        alert("You cannot send money to yourself!");
        return;
    }

    // 🔴 Validate amount
    if (amount <= 0 || isNaN(amount)) {
        alert("Enter a valid amount!");
        return;
    }

    // 🔍 Find receiver in database
    const q = query(collection(db, "users"), where("email", "==", receiverEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        alert("Receiver account not found!");
        return;
    }

    const receiverDoc = querySnapshot.docs[0];

    // 🔍 Get sender data
    const senderRef = doc(db, "users", currentUser.uid);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data();

    // 🔴 Check balance
    if (senderData.balance < amount) {
        alert("Insufficient balance!");
        return;
    }

    // 💸 Deduct from sender
    await updateDoc(senderRef, {
        balance: increment(-amount),
        history: arrayUnion(`-₱${amount} sent to ${receiverEmail}`)
    });

    // 💰 Add to receiver
    await updateDoc(doc(db, "users", receiverDoc.id), {
        balance: increment(amount),
        history: arrayUnion(`+₱${amount} received from ${currentUser.email}`)
    });

    // 🧹 Clear inputs
    document.getElementById("receiver").value = "";
    document.getElementById("amount").value = "";

    alert("Money sent successfully!");
}