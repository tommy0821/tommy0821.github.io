import { app } from "./firebase-config.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const TMDB_API_KEY = '63710bd60232dd09d92328f6cc699005'; 
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

// [수정 상태 관리용 변수]
let editingId = null;

// 1. 영화 검색 로직
document.getElementById('tmdb-search')?.addEventListener('input', async (e) => {
  const queryText = e.target.value;
  const resultsDiv = document.getElementById('search-results');
  if (queryText.length < 2) { resultsDiv.style.display = 'none'; return; }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${queryText}&language=ko-KR`);
    const data = await res.json();
    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';

    data.results.slice(0, 5).forEach(movie => {
      const item = document.createElement('div');
      item.className = 'search-item';
      const posterImg = movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/40x60?text=No+Img';
      item.innerHTML = `<img src="${posterImg}"><span>${movie.title}</span>`;
      item.onclick = () => {
        document.getElementById('movie-title').value = movie.title;
        document.getElementById('movie-poster-url').value = posterImg;
        document.getElementById('poster-preview').innerHTML = `<img src="${posterImg}" style="width:120px; border-radius:8px;">`;
        resultsDiv.style.display = 'none';
        document.getElementById('tmdb-search').value = '';
      };
      resultsDiv.appendChild(item);
    });
  } catch (err) { console.error("검색 에러:", err); }
});

// 2. 통합 저장/수정 로직
document.getElementById('add-movie')?.addEventListener("click", async () => {
  const title = document.getElementById('movie-title').value;
  const date = document.getElementById('movie-date').value;
  const locationName = document.getElementById('movie-location').value;
  const rating = document.getElementById('movie-rating').value;
  // const review = document.getElementById('movie-review').value;
  const reviewMale = document.getElementById('movie-review-male').value;
  const reviewFemale = document.getElementById('movie-review-female').value;

  const posterUrl = document.getElementById('movie-poster-url').value;

  if (!title || !rating || !date) { alert("영화 선택, 본 날짜, 별점은 필수입니다!"); return; }

  const movieData = {
    title,
    date,
    location: locationName,
    rating: Number(rating),
    reviewMale,
    reviewFemale,
    posterUrl,
    userId: auth.currentUser.uid,
    updatedAt: new Date()
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "movies", editingId), movieData);
      alert("수정 완료!");
    } else {
      await addDoc(collection(db, "movies"), { ...movieData, createdAt: new Date() });
      alert("저장 완료!");
    }
    location.reload(); 
  } catch (e) { alert("오류 발생: " + e.message); }
});

// 3. 목록 불러오기
async function loadMovies(userId) {
  const list = document.getElementById("movie-list");
  if (!list) return;

  const q = query(collection(db, "movies"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const movieData = [];
  querySnapshot.forEach((doc) => movieData.push({ id: doc.id, ...doc.data() }));

  // 본 날짜 순으로 정렬
  movieData.sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = "";
  
  movieData.forEach((data, i) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    const safeData = encodeURIComponent(JSON.stringify(data));
    
    card.innerHTML = `
      <div class="movie-number">${i + 1}</div>
      <img src="${data.posterUrl || 'https://via.placeholder.com/90x130'}">
      <div class="movie-info">
        <div class="menu-container">
          <button class="menu-btn" onclick="toggleMenu('${data.id}')">⋮</button>
          <div id="menu-${data.id}" class="menu-dropdown">
            <button onclick="editMovie('${data.id}', '${safeData}')">수정</button>
            <button onclick="deleteMovie('${data.id}')" style="color:red;">삭제</button>
          </div>
        </div>
        <h3>${data.title}</h3>
        <div class="info-row">🗓️ 본 날짜: ${data.date}</div>
        <div class="info-row">📍 장소: ${data.location || '미기입'}</div>
        <div class="info-row">⭐ ${data.rating} / 5</div>
        <p style="margin-top:10px; font-style: italic; color:#444;">
          👨 ${data.reviewMale || ""}
        </p>
        <p style="margin-top:2px; font-style: italic; color:#444;">
          👩 ${data.reviewFemale || ""}
        </p>
      </div>
    `;
    list.appendChild(card);
  });
}

// 4. 수정 모드 진입 함수
window.editMovie = (id, dataJson) => {
  const data = JSON.parse(decodeURIComponent(dataJson));
  
  editingId = id; // 수정 중인 ID 저장
  document.getElementById('movie-title').value = data.title;
  document.getElementById('movie-date').value = data.date;
  document.getElementById('movie-location').value = data.location || '';
  document.getElementById('movie-rating').value = data.rating;
  document.getElementById('movie-review-male').value = data.reviewMale || "";
  document.getElementById('movie-review-female').value = data.reviewFemale || "";
  document.getElementById('movie-poster-url').value = data.posterUrl || '';
  document.getElementById('poster-preview').innerHTML = `<img src="${data.posterUrl}" style="width:120px; border-radius:8px;">`;

  const btn = document.getElementById('add-movie');
  btn.innerText = "수정 완료하기";
  btn.style.background = "#ff9800"; 
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 5. 기타 유틸리티 함수
window.deleteMovie = async (id) => {
  if (confirm("정말 삭제할까요?")) {
    await deleteDoc(doc(db, "movies", id));
    location.reload();
  }
};

window.toggleMenu = (id) => {
  const menu = document.getElementById(`menu-${id}`);
  document.querySelectorAll('.menu-dropdown').forEach(m => { if(m !== menu) m.style.display = 'none'; });
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('menu-btn')) {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.style.display = 'none');
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) { loadMovies(user.uid); } 
  else { location.href = "index.html"; }
});

document.getElementById('logout')?.addEventListener("click", () => {
  signOut(auth).then(() => location.href = "index.html");
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

// movies.js 끝 부분 근처
document.addEventListener("DOMContentLoaded", () => {
  const ratingInput = document.getElementById("movie-rating");
  if (ratingInput && !ratingInput.value) {
    ratingInput.value = 5; // 기본 별점
  }
});

// D-Day 아래 컨텐츠 접기/펼치기
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("dday-bar");
  const container = document.querySelector(".container");
  const scrollArea = document.getElementById("scroll-area");
  if (!bar || !container || !scrollArea) return;

  let collapsed = false;

  // 펼쳐진 상태 기본 높이 = 화면 높이 - 여백 (흰 박스가 꽉 차도록)
  const fullHeight = window.innerHeight - 32;   // 필요 시 여백 숫자 조절
  container.style.height = fullHeight + "px";

  // 스크롤 영역 애니메이션 설정
  scrollArea.style.transition = "max-height 0.25s ease, opacity 0.2s ease";
  scrollArea.style.maxHeight = scrollArea.scrollHeight + "px";
  scrollArea.style.opacity = "1";

  bar.style.cursor = "pointer";

  bar.addEventListener("click", () => {
    collapsed = !collapsed;

    if (collapsed) {
      // 내용 접기 + 컨테이너 높이를 D-Day 바 정도만 남기기
      scrollArea.style.maxHeight = "0";
      scrollArea.style.opacity = "0";
      container.style.height = bar.offsetHeight + 24 + "px";  // 위아래 여백 조금

      bar.classList.add("collapsed");
    } else {
      // 내용 펼치기 + 컨테이너를 다시 화면 높이만큼
      scrollArea.style.maxHeight = scrollArea.scrollHeight + "px";
      scrollArea.style.opacity = "1";
      container.style.height = fullHeight + "px";

      bar.classList.remove("collapsed");
    }
  });
});

