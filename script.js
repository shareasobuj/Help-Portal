// আপনার Firebase কনফিগারেশন এখানে বসান
const firebaseConfig = {
  apiKey: "AIzaSyCZ3x4d_VDdlh1D0uiZHQhJBR_y1qd63GI",
  authDomain: "help-portal-affdb.firebaseapp.com",
  databaseURL: "https://help-portal-affdb-default-rtdb.firebaseio.com",
  projectId: "help-portal-affdb",
  storageBucket: "help-portal-affdb.firebasestorage.app",
  messagingSenderId: "658170191843",
  appId: "1:658170191843:web:c81998a37acffdfe07cad6",
  measurementId: "G-WHCTK7ZN99"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Authentication Functions ---
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(result => {
        console.log("Logged in:", result.user.displayName);
    }).catch(error => alert(error.message));
}

function logOut() {
    auth.signOut();
}

// Auth State Observer
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('userInfo').innerHTML = `
            <p>নাম: ${user.displayName}</p>
            <p>ইমেইল: ${user.email}</p>
            <img src="${user.photoURL}" width="50" style="border-radius:50%">
        `;
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('userInfo').innerText = "লগইন করুন।";
    }
});

// --- Navigation Logic ---
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- Firestore Data Management (Form Submission) ---
const requestForm = document.getElementById('requestForm');
requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("দয়া করে আগে লগইন করুন!");

    db.collection("requests").add({
        name: user.displayName,
        email: user.email,
        item: document.getElementById('itemName').value,
        reason: document.getElementById('reason').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("আবেদন সফলভাবে জমা হয়েছে!");
        requestForm.reset();
    });
});
