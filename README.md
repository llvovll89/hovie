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
- **홈** — 트렌딩 영화 하이라이트 및 플랫폼 소개
- **트렌딩** — 이번 주 인기 영화 & TV 시리즈
- **검색 & 디스커버** — 장르, 연도, 평점, 러닝타임, 언어, 정렬 기준으로 필터링하는 고급 검색
- **영화 / TV 상세** — 출연진, 스태프, 예고편, 이미지 갤러리, OTT 스트리밍 정보, 추천 작품
- **인물 상세** — 배우/감독 프로필 및 필모그래피
- **개봉 예정** — 국내 기준 다가오는 신작 목록
- **비교** — 두 작품을 나란히 비교

### 개인 라이브러리
- **위시리스트** — 보고 싶은 작품 저장 및 관리
- **감상 기록** — 본 작품에 별점 부여 및 기록 관리

### 소셜 & 인증
- **코멘트** — 영화 / TV 시리즈에 리뷰 & 평점 작성
- **인증** — Google OAuth 또는 이메일/비밀번호 로그인

---

## 구현 포인트

- **Intersection Observer 기반 무한 스크롤** — 검색/디스커버 페이지에서 스크롤 시 자동으로 다음 페이지를 불러오는 UX 구현
- **Firebase Firestore 실시간 연동** — 위시리스트, 감상 기록, 코멘트를 사용자별로 분리해 Firestore에 저장하고 즉시 반영
- **통합 타입 시스템** — TV 시리즈를 Movie 타입으로 정규화해 동일한 컴포넌트를 재사용, 코드 중복 최소화
- **CSS Variables 기반 다크/라이트 테마** — Tailwind와 병행하여 커스텀 디자인 토큰 관리, localStorage에 유지
- **모바일 우선 반응형 레이아웃** — 모바일에서는 하단 탭 내비게이션, 데스크탑에서는 상단 내비게이션으로 전환
- **커스텀 훅으로 관심사 분리** — `useMovieDetail`, `useSearch`, `useTrending` 등 데이터 페칭 로직을 훅으로 추출

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
