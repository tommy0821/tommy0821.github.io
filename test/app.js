// Firebase SDK import
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC1076S4k-OJrWKLfJk4n-A0j90nR9dcOo",
  authDomain: "test-56d81.firebaseapp.com",
  projectId: "test-56d81",
  storageBucket: "test-56d81.firebasestorage.app",
  messagingSenderId: "775651922698",
  appId: "1:775651922698:web:5622714e9ffb7ec0ffe0f3",
  measurementId: "G-R79FVZNYKC"
};

// init
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

// 로그인 (Email)
document.getElementById('login-email').onclick = () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("로그인 성공"))
    .catch(err => alert("로그인 실패: " + err.message));
};

// 로그인 (Google)
document.getElementById('login-google').onclick = () => {
  signInWithPopup(auth, provider)
    .then(() => alert("Google 로그인 성공"))
    .catch(() => alert("Google 로그인 실패"));
};

// 로그아웃
document.getElementById('logout').onclick = () => {
  signOut(auth)
  alert("로그아웃 완료")
};

// 영화 저장 OR 수정
document.getElementById('add-movie').onclick = async () => {
  const title = document.getElementById('movie-title').value;

  if (!title) {
    alert("영화 제목을 입력하세요");
    return;
  }

  // Firestore에 저장
  await addDoc(collection(db, "movies"), { title });

  alert("영화 저장 완료!");
  loadMovies();
};

// 영화 목록 출력
async function loadMovies() {
  const list = document.getElementById("movie-list");
  list.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "movies"));
  querySnapshot.forEach((docItem) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${docItem.data().title}
      <button onclick="editMovie('${docItem.id}', '${docItem.data().title}')">수정</button>
    `;
    list.appendChild(li);
  });
}

// 수정 기능
window.editMovie = async (id, oldTitle) => {
  const newTitle = prompt("새 영화 제목", oldTitle);
  if (newTitle) {
    await updateDoc(doc(db, "movies", id), { title: newTitle });
    alert("수정 완료!");
    loadMovies();
  }
};

// 로그인 상태 감시
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('movie-area').style.display = 'block';
    loadMovies();
  } else {
    document.getElementById('movie-area').style.display = 'none';
  }
});
