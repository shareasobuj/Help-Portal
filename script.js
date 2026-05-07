// Firebase Configuration (আপনার ফায়ারবেজ থেকে কনফিগ কপি করুন)
const firebaseConfig = {
    apiKey: "AIzaSyCZ3x4d_VDdlh1D0uiZHQhJBR_y1qd63GI",
  authDomain: "help-portal-affdb.firebaseapp.com",
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

// ১. ভিজিটর কাউন্টার (LocalStorage দিয়ে সিম্পল করা হয়েছে)
let count = localStorage.getItem('visitus') || 0;
count++;
localStorage.setItem('visitus', count);
document.getElementById('visitor-count').innerText = `ভিজিটর সংখ্যা: ${count}`;

// ২. লগইন ফাংশন
function handleLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, pass)
        .then((user) => {
            alert("সফলভাবে লগইন হয়েছে!");
            location.reload();
        })
        .catch(err => alert(err.message));
}

// ৩. ডাটা জমা দেওয়া
document.getElementById('help-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if(!user) return alert("দয়া করে আগে লগইন করুন");

    db.collection("requests").add({
        uid: user.uid,
        message: document.getElementById('message').value,
        type: document.getElementById('type').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("আপনার আবেদনটি সফলভাবে সংরক্ষিত হয়েছে।");
        e.target.reset();
    });
});

// ৪. ডাটা প্রদর্শন (Real-time Fetch)
db.collection("requests").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    let list = document.getElementById('data-list');
    list.innerHTML = "";
    snapshot.forEach(doc => {
        let data = doc.data();
        list.innerHTML += `
            <div class="card">
                <h4>আইডি: ${data.uid.substring(0, 8)}...</h4>
                <p>${data.message}</p>
                <strong>ধরণ: ${data.type === 'donor' ? 'দাতা' : 'গ্রহীতা'}</strong>
            </div>
        `;
    });
});
