function resetPassword(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let answer = document.getElementById("answer").value.trim().toLowerCase();
    let newPassword = document.getElementById("newPassword").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || {};

    // 🔴 Check if account exists
    if (!users[email]) {
        alert("No account found with this email!");
        return;
    }

    // 🔴 Check security answer (pet's name)
    if (users[email].securityAnswer !== answer) {
        alert("Incorrect security answer!");
        return;
    }

    // 🔐 Validate strong password
    let strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strong.test(newPassword)) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
    }

    // 🔐 Simulated hashing (must match registration/login)
    users[email].password = btoa(newPassword);

    // 💾 Save updated data
    localStorage.setItem("users", JSON.stringify(users));

    alert("Password reset successful!");

    window.location.href = "index.html";
}