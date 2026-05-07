import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ফায়ারবেজ কনফিগারেশন (আপনার কনসোল থেকে সংগ্রহ করুন)
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ১. ভিজিটর কাউন্টার (Firestore ভিত্তিক)
async function handleVisitors() {
    const vRef = doc(db, "stats", "visitors");
    await setDoc(vRef, { count: increment(1) }, { merge: true });
    const snap = await getDoc(vRef);
    document.getElementById('vCount').innerText = snap.data().count || 1;
}
handleVisitors();

// ২. লগইন ও অথেনটিকেশন লজিক
const loginBtn = document.getElementById('loginBtn');
loginBtn.onclick = () => {
    if (auth.currentUser) {
        signOut(auth);
    } else {
        signInWithPopup(auth, provider);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.innerText = "লগআউট";
        document.getElementById('uID').innerText = user.uid.substring(0, 12);
        document.getElementById('userInfo').classList.remove('hidden');
    } else {
        loginBtn.innerText = "লগইন";
        document.getElementById('userInfo').classList.add('hidden');
    }
});

// ৩. ডাটা সেভ করা (পোস্ট তৈরি)
window.saveData = async () => {
    const user = auth.currentUser;
    if (!user) return alert("দয়া করে আগে লগইন করুন!");

    const desc = document.getElementById('helpDesc').value;
    const type = document.getElementById('userType').value;

    if (desc.trim() === "") return alert("বিস্তারিত কিছু লিখুন!");

    try {
        await addDoc(collection(db, "posts"), {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            type: type,
            message: desc,
            timestamp: serverTimestamp()
        });
        document.getElementById('helpDesc').value = "";
        alert("আপনার পোস্টটি সফলভাবে প্রকাশ করা হয়েছে!");
    } catch (e) {
        console.error("Error: ", e);
    }
};

// ৪. ডায়নামিক ফিড লোডিং (Real-time)
const loadFeed = (filterType = 'all') => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        const feed = document.getElementById('feed');
        feed.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (filterType !== 'all' && data.type !== filterType) return;

            const isDonor = data.type === 'donor';
            const cardUI = `
                <div class="bg-white p-5 rounded-xl border-l-4 ${isDonor ? 'border-green-500 shadow-green-50' : 'border-red-500 shadow-red-50'} shadow-md transition hover:shadow-lg">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="font-bold text-gray-800">${data.name}</h4>
                            <span class="text-xs font-mono text-gray-400">ID: ${data.uid.substring(0, 10)}</span>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${isDonor ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                            ${isDonor ? 'দাতা' : 'গ্রহীতা'}
                        </span>
                    </div>
                    <p class="text-gray-700 leading-relaxed mb-4">${data.message}</p>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400 italic font-light">${data.timestamp?.toDate().toLocaleTimeString() || 'এখনই'}</span>
                        <a href="mailto:${data.email}" class="text-blue-600 font-bold hover:underline">যোগাযোগ করুন &rarr;</a>
                    </div>
                </div>
            `;
            feed.innerHTML += cardUI;
        });
    });
};

loadFeed();

// ফিল্টারিং ফাংশন
window.filterPosts = (type) => loadFeed(type);
