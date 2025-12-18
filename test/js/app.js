// app.js
import { app } from "./firebase-config.js";

import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Auth 설정
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 이메일 로그인
document.getElementById('login-email')?.addEventListener("click", () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("로그인 성공");
      location.href = "movies.html";
    })
    .catch(err => alert("로그인 실패: " + err.message));
});

// Google 로그인
document.getElementById('login-google')?.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Google 로그인 성공");
      location.href = "movies.html";
    })
    .catch(() => alert("Google 로그인 실패"));
});

// D-Day 관리 로직
function initDDay() {
  // 1. 시작일 설정 (여기만 수정하면 전체 반영됩니다)
  const START_DATE_STR = "2023-08-24"; 
  const startDate = new Date(START_DATE_STR);
  
  // 2. 오늘 날짜 가져오기 (2025-12-18)
  const today = new Date();
  
  // 3. 시간차 계산 (D+일수)
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // 4. 화면에 출력
  const ddayCountElem = document.getElementById('dday-count');
  const startDateElem = document.getElementById('start-date-display');

  if (ddayCountElem) {
    ddayCountElem.innerText = `D+${diffDays}`;
  }
  
  if (startDateElem) {
    // 하이픈(-)을 점(.)으로 바꿔서 표시 (예: 2023.08.23)
    const formattedDate = START_DATE_STR.replace(/-/g, '.');
    startDateElem.innerText = `(${formattedDate}~)`;
  }
}

// 실행
initDDay();
