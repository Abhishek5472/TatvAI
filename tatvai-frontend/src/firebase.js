// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDktfTechzyJTAEWfaZImRVOBgYiEgDqPg",
  authDomain: "tatvai-810aa.firebaseapp.com",
  projectId: "tatvai-810aa",
  storageBucket: "tatvai-810aa.firebasestorage.app",
  messagingSenderId: "446947718935",
  appId: "1:446947718935:web:b81ebbfa2fe21620696952"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// convenience wrappers
export async function loginWithGoogle() {
  const res = await signInWithPopup(auth, provider);
  const user = res.user;
  // save basic profile in Firestore
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }, { merge: true });
  return user;
}

export async function logout() {
  await signOut(auth);
}

export async function saveBookmarkForUser(uid, bookmark) {
  // each user has a subcollection bookmarks
  const ref = collection(db, "users", uid, "bookmarks");
  await addDoc(ref, bookmark);
}

export async function getBookmarksForUser(uid) {
  const ref = collection(db, "users", uid, "bookmarks");
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}