# Partner in Thinking (사고 파트너)

> **복잡한 고민을 명확한 실행으로, 생각 파트너**  
> A Thinking Partner for leaders, founders, and executives.

---

## 🌟 프로젝트 소개 (About)

**PARTNER IN THINKING**은 불확실성과 막중한 책임감 속에서 중요한 의사결정을 내려야 하는 리더, 임원, 창업가를 위한 1:1 맞춤형 사고 파트너(Thinking Partner) 및 경영 자문 웹 애플리케이션입니다.

- **URL**: [https://partnerinthinking.com](https://partnerinthinking.com)
- **핵심 가치**: From Complexity to Clear Next Steps

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Motion (Framer Motion)
- **Icons**: Lucide React
- **Backend & Database**: Firebase Firestore (문의 내역 및 세션 신청 관리)
- **Authentication**: Firebase Auth (관리자 전용 대시보드 로그인)
- **Analytics**: Google Analytics 4 (GA4), Microsoft Clarity

---

## 🚀 시작하기 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3. 프로덕션 빌드
```bash
npm run build
```
`dist/` 폴더에 최적화된 번들이 생성됩니다.

---

## 📁 주요 폴더 구조 (Project Structure)

```
├── public/
│   ├── og-image.png             # SNS 공유용 썸네일 (1200x630)
│   ├── hero_study.jpg           # 메인 비주얼 이미지
│   └── partner-in-thinking-code.zip # 전체 소스코드 압축본
├── src/
│   ├── assets/                  # 이미지 에셋
│   ├── components/              # React 컴포넌트
│   │   ├── ErrorBoundary.tsx
│   │   └── ProgramDetailPage.tsx # 프로그램 상세 모달
│   ├── data/
│   │   └── programsData.ts      # 4대 핵심 코칭 프로그램 데이터
│   ├── App.tsx                  # 메인 애플리케이션
│   ├── firebase.ts              # Firebase 초기화 및 Auth
│   ├── index.css                # 글로벌 스타일 (Tailwind CSS)
│   ├── main.tsx                 # React 엔트리포인트
│   └── types.ts                 # TypeScript 타입 정의
├── index.html                   # HTML 템플릿 및 SEO/OG 메타 태그
└── package.json
```

---

## 📄 라이선스 (License)

Apache-2.0
