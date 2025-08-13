document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup-form");
    const usernameField = document.getElementById("username");
    const phoneField = document.getElementById("phone");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirm-password");

    const errorMessage = document.createElement("p");
    errorMessage.style.color = "red";
    errorMessage.style.marginTop = "10px";
    form.appendChild(errorMessage);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get form values
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const username = usernameField.value.trim();
        const phone = phoneField.value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        // Validation
        let errors = [];
        
        if (/^\d/.test(username)) {
            errors.push("❌ Username cannot start with a number");
        }

        if (!/^\d{10}$/.test(phone)) {
            errors.push("❌ Phone number must be exactly 10 digits");
        }

        if (password !== confirmPassword) {
            errors.push("❌ Passwords don't match");
        }

        if (password.length < 6) {
            errors.push("❌ Password must be at least 6 characters");
        }

        if (errors.length > 0) {
            errorMessage.innerHTML = errors.join("<br>");
            return;
        }

        try {
            // 1. Create auth account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // 2. Save additional data to Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                firstName,
                lastName,
                username,
                phone,
                email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Account created successfully!');
            window.location.href = "SignHome.html";
            
        } catch (error) {
            console.error("Signup error:", error);
            
            // Firebase error handling
            let errorMsg = "Signup failed: ";
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMsg += "Email already exists";
                    break;
                case 'auth/invalid-email':
                    errorMsg += "Invalid email format";
                    break;
                case 'auth/weak-password':
                    errorMsg += "Password is too weak";
                    break;
                default:
                    errorMsg += error.message;
            }
            
            errorMessage.innerHTML = errorMsg;
        }
    });

    // Clear errors when typing
    [usernameField, phoneField, passwordField, confirmPasswordField].forEach(input => {
        input.addEventListener('input', () => errorMessage.innerHTML = "");
    });
});