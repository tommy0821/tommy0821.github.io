// Firebase SDK import
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 서비스 초기화
const auth = getAuth();

// Google Provider
const provider = new GoogleAuthProvider();

// ------------------------------
// 이메일 회원가입
// ------------------------------
document.getElementById('signup').onclick = () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(result => {
      alert("회원가입 성공");
      console.log(result.user);
    })
    .catch(err => {
      alert("회원가입 실패: " + err.message);
    });
};

// ------------------------------
// 이메일 로그인
// ------------------------------
document.getElementById('login-email').onclick = () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(result => {
      alert("이메일 로그인 성공");
      console.log(result.user);
    })
    .catch(err => {
      alert("이메일 로그인 실패: " + err.message);
    });
};

// ------------------------------
// Google 로그인
// ------------------------------
document.getElementById('login').onclick = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      alert("Google 로그인 성공");
      console.log(result.user);
    })
    .catch(err => {
      alert("Google 로그인 실패");
      console.error(err);
    });
};

// ------------------------------
// 로그아웃
// ------------------------------
document.getElementById('logout').onclick = () => {
  signOut(auth);
  alert("로그아웃 완료");
};

// ------------------------------
// 로그인 상태 감지
// ------------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("현재 로그인:", user.email);
  } else {
    console.log("로그아웃 상태");
  }
});
