// Firebase configuration and authentication
const firebaseConfig = {
    apiKey: "AIzaSyAe4GmQn4xLFlT6T3CjitDiIT5HiIqlrrI",
    authDomain: "swflow1250.firebaseapp.com",
    projectId: "swflow1250",
    storageBucket: "swflow1250.firebasestorage.app",
    messagingSenderId: "459441590687",
    appId: "1:459441590687:web:249f329fcf4c5fc08cadaa",
    measurementId: "G-P7J5X1EQY2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// User state observer with proper redirects
auth.onAuthStateChanged(user => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        console.log("User logged in:", user.uid);
        // If on signin/signup page while logged in, redirect to dashboard
        if (currentPage === 'user-login.html' || currentPage === 'user-registration.html') {
            window.location.href = 'home-dashboard.html';
        }
    } else {
        console.log("User logged out");
        // If on protected page while logged out, redirect to signin
        const protectedPages = [
            'home-dashboard.html', 
            'user-profile.html', 
            'flight-management.html',
            'luggage-tracking.html',
            'travel-notifications.html',
            'travel-settings.html'
        ];
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'user-login.html';
        }
    }
});

// Password reset function
function sendPasswordReset(email) {
    return auth.sendPasswordResetEmail(email)
        .then(() => alert("Password reset email sent!"))
        .catch(error => alert("Error: " + error.message));
}

// Logout function
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut()
                .then(() => window.location.href = 'user-login.html')
                .catch(error => console.error("Logout error:", error));
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupLogout();
});