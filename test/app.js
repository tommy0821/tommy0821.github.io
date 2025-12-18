// Firebase SDK import
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1076S4k-OJrWKLfJk4n-A0j90nR9dcOo",
  authDomain: "test-56d81.firebaseapp.com",
  projectId: "test-56d81",
  storageBucket: "test-56d81.firebasestorage.app",
  messagingSenderId: "775651922698",
  appId: "1:775651922698:web:5622714e9ffb7ec0ffe0f3",
  measurementId: "G-R79FVZNYKC"
};
const app = initializeApp(firebaseConfig);

// Auth 서비스 초기화
const auth = getAuth();
const provider = new GoogleAuthProvider();

// 로그인 버튼 이벤트
document.getElementById('login').onclick = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      alert("로그인 성공");
      console.log(result.user);
    })
    .catch(err => {
      alert("로그인 실패");
      console.error(err);
    });
};
