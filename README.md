# HOVIE

> 영화와 TV 시리즈를 탐색하고, 감상 기록을 관리하며, 리뷰를 남기는 개인 영화 플랫폼

**[hovie.vercel.app](https://hovie.vercel.app)**

---

## 소개

TMDB API를 기반으로 영화와 TV 시리즈 정보를 제공하며, Firebase를 통해 사용자별 위시리스트·감상 기록·코멘트를 관리할 수 있는 풀스택 웹 애플리케이션입니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + CSS Variables |
| Backend | Firebase (Authentication + Firestore) |
| External API | TMDB (The Movie Database) v3 |
| Deploy | Vercel |

---

## 주요 기능

### 콘텐츠 탐색
- **홈** - 실제 작품 스틸과 검색, 개인 목록으로 이어지는 탐색 화면
- **트렌딩** — 이번 주 인기 영화 & TV 시리즈
- **통합검색** - 영화·TV·인물 자동완성, 키보드 이동, 최근 검색, 이전 요청 취소
- **검색 & 디스커버** - 장르, 현재 연도, 평점, 러닝타임, 원어, 한국 OTT 구독 서비스 조건 탐색. 제목 검색에서는 지원하지 않는 조건을 명확히 구분
- **영화 / TV 상세** — 출연진, 스태프, 예고편, 이미지 갤러리, OTT 스트리밍 정보, 추천 작품
- **인물 상세** — 배우/감독 프로필 및 필모그래피
- **개봉 예정** — 국내 기준 다가오는 신작 목록
- **비교** — 두 작품을 나란히 비교

### 개인 라이브러리
- **위시리스트** — 보고 싶은 작품 저장 및 관리
- **감상 기록** — 본 작품에 별점 부여 및 기록 관리
- **오늘 볼 작품** - 최근 저장한 최대 30편에서 남은 시간과 한국 OTT 조건으로 최대 3편 선택. TV는 회당 길이 기준
- **회차별 기록** - 시즌별 에피소드 시청 체크와 다음에 볼 회차 표시
- **공유 목록** - 저장한 작품에서 최대 24편을 선택해 링크 생성. 개인 계정·별점은 제외한 고정 스냅샷

### 소셜 & 인증
- **코멘트** — 영화 / TV 시리즈에 리뷰 & 평점 작성
- **인증** — Google OAuth 또는 이메일/비밀번호 로그인

---

## 구현 포인트

- **Intersection Observer 기반 무한 스크롤** — 검색/디스커버 페이지에서 스크롤 시 자동으로 다음 페이지를 불러오는 UX 구현
- **Firebase Firestore 저장** - 영화·TV 식별자를 분리하고 트랜잭션으로 기록·예전 데이터 복구·회차 체크를 처리. 원본 문서는 백업으로 보존
- **통합 타입 시스템** — TV 시리즈를 Movie 타입으로 정규화해 동일한 컴포넌트를 재사용, 코드 중복 최소화
- **CSS Variables 기반 다크/라이트 테마** — Tailwind와 병행하여 커스텀 디자인 토큰 관리, localStorage에 유지
- **모바일 우선 반응형 레이아웃** — 모바일에서는 하단 탭 내비게이션, 데스크탑에서는 상단 내비게이션으로 전환
- **커스텀 훅으로 관심사 분리** — `useMovieDetail`, `useSearch`, `useTrending` 등 데이터 페칭 로직을 훅으로 추출

## 실행과 검증

`.env.example`을 참고해 `.env`를 설정합니다. TMDB에는 v3 API key 대신 **API Read Access Token**을 입력합니다.

```bash
npm install
npm run dev
npm run verify
```

`verify`는 린트, 회귀 테스트, 타입 검사와 프로덕션 빌드를 실행합니다. `npm run preview`로 빌드를 확인할 수 있습니다.

UI는 CSS 변수로 다크·라이트 모드와 시스템 선호 설정을 지원합니다. 모바일과 데스크톱 모두 공식 Pretendard Variable 원본을 로컬에서 불러옵니다. 45~920의 가변 굵기를 지원합니다. 글꼴의 원 저작권과 SIL OFL 라이선스는 `public/font-license.txt`에 포함합니다.

저장 모델의 이전 방식, Firebase 회차 기록 경로, Vercel 공유 미리보기 배포 조건은 [MIGRATION.md](MIGRATION.md)를 확인하세요. 공유 링크는 링크 소지자가 열 수 있으며, 생성 후 수정·회수되지 않습니다.

---

## 프로젝트 구조

```
src/
├── pages/
│   ├── Home/           # 랜딩 페이지
│   ├── Search/         # 검색 & 디스커버
│   ├── Trending/       # 트렌딩
│   ├── MovieDetail/    # 영화 상세
│   ├── TVDetail/       # TV 상세
│   ├── PersonDetail/   # 인물 상세
│   ├── Watchlist/      # 위시리스트
│   ├── Watched/        # 감상 기록
│   ├── Upcoming/       # 개봉 예정
│   └── Compare/        # 작품 비교
├── components/
│   ├── layout/         # Navbar, Footer, BottomNav, Layout
│   └── ui/             # MovieCard, AuthModal, StarRating, CommentSection 등
├── contexts/           # ThemeContext, AuthModalContext, ToastContext
├── hooks/              # useTrending, useSearch, useMovieDetail 등
├── lib/
│   ├── tmdb.ts         # TMDB API 클라이언트
│   └── firebase.ts     # Firebase 연동 (Auth, Firestore CRUD)
└── types/              # TypeScript 타입 정의
```
