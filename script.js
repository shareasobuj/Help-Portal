import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ফায়ারবেজ কনফিগ (আপনার প্রজেক্ট সেটিংস থেকে বসান)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ১. ভিজিটর কাউন্টার লজিক
const updateVisitors = async () => {
    const vRef = doc(db, "siteStats", "visitors");
    await setDoc(vRef, { count: increment(1) }, { merge: true });
    const snap = await getDoc(vRef);
    document.getElementById('visitorDisplay').innerText = `ভিজিটর: ${snap.data().count}`;
};
updateVisitors();

// ২. গুগল লগইন ফাংশন
window.handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
        .then(() => window.showPage('dashboardPage'))
        .catch(err => alert("Error: " + err.message));
};

// ৩. লগআউট
window.handleLogout = () => {
    signOut(auth).then(() => location.reload());
};

// ৪. ইউজার স্টেট পরিবর্তন পর্যবেক্ষণ
onAuthStateChanged(auth, (user) => {
    const navAuth = document.getElementById('navAuthLinks');
    if (user) {
        navAuth.innerHTML = `<button onclick="handleLogout()" class="bg-red-500 px-4 py-1 rounded-lg">লগআউট</button>`;
        window.showPage('dashboardPage');
    } else {
        navAuth.innerHTML = `<button onclick="showPage('loginPage')" class="bg-green-500 px-4 py-1 rounded-lg">লগইন</button>`;
    }
});

// ৫. পোস্ট সাবমিট করা
window.submitPost = async () => {
    const user = auth.currentUser;
    if (!user) return alert("আগে লগইন করুন!");

    const msg = document.getElementById('postMsg').value;
    const type = document.getElementById('postType').value;

    if (!msg.trim()) return alert("বার্তা লিখুন!");

    try {
        await addDoc(collection(db, "posts"), {
            uid: user.uid,
            name: user.displayName,
            type: type,
            message: msg,
            time: serverTimestamp()
        });
        document.getElementById('postMsg').value = "";
        alert("পোস্ট সফল হয়েছে!");
    } catch (e) {
        alert("এরর: " + e.message);
    }
};

// ৬. রিয়েল-টাইম ফিড লোড করা
const q = query(collection(db, "posts"), orderBy("time", "desc"));
onSnapshot(q, (snapshot) => {
    const feed = document.getElementById('postFeed');
    feed.innerHTML = "";
    snapshot.forEach(doc => {
        const data = doc.data();
        const color = data.type === 'donor' ? 'border-green-500' : 'border-red-500';
        feed.innerHTML += `
            <div class="bg-white p-5 rounded-xl shadow border-l-4 ${color}">
                <div class="flex justify-between font-bold text-blue-600 mb-2">
                    <span>${data.name}</span>
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">${data.type === 'donor' ? 'দাতা' : 'গ্রহীতা'}</span>
                </div>
                <p class="text-gray-700">${data.message}</p>
            </div>
        `;
    });
});
