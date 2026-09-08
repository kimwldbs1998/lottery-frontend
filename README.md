# CenLottery 파워픽 - Frontend

React(Vite) + React Router 기반 프론트엔드입니다. 백엔드(`../backend`)가 먼저 실행되어 있어야 합니다.

## 실행 방법

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

기본적으로 백엔드가 `http://localhost:8080/api` 에서 실행 중이라고 가정합니다. 다른 주소를 쓰려면
`.env` 파일의 `VITE_API_BASE_URL` 값을 바꿔주세요.

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 빌드

```bash
npm run build
```

`dist/` 폴더에 정적 파일이 생성됩니다. 아무 정적 웹서버(nginx 등)로 배포하면 됩니다.

## 화면 구성

- `/login`, `/register` : 로그인/회원가입
- `/` : 번호 선택 · PowerUp · 구매 (메인 화면)
- `/history` : 전체 구매내역 (회차/상태 필터링)
- `/results` : 회차별 추첨결과

## 요구사항 대비 구현 메모

- 예상 당첨금 표시는 5초마다 자동 갱신되고, 구매 완료/회차 변경 시 즉시 갱신됩니다 (8장).
- 회차가 바뀌면(1초마다 폴링) 선택한 번호/PowerUp/미확정 구매정보가 초기화되고, 안내 배너가 표시됩니다.
  나만의 번호·구매내역·잔액은 유지됩니다 (3장, 9장).
- 구매 확인 팝업 → 구매 확정 → 완료 화면까지 요구사항 11장의 흐름을 그대로 구현했습니다. 중복 클릭/통신
  재시도로 인한 중복 구매를 막기 위해 매 구매 확인마다 idempotency key를 발급합니다.
- PowerUp 토글에는 스파크 애니메이션이 적용되며, "화면 움직임 줄이기" 체크박스로 마퀴/애니메이션을 끌 수
  있습니다 (10장, 14장).
- 세션이 만료되면 사유를 안내하며 로그인 화면으로 이동합니다 (15장).

## 디자인

카지노/슬롯머신 느낌의 짙은 네이비 배경 + 금색/네온 레드/네온 블루 조합으로 구성했습니다. 스리랑카 고객을
대상으로 하는 서비스라는 요구사항에 따라 종교적/국가적 상징이나 특정 문화권 장식 요소는 사용하지 않고,
범용적인 카지노 잭팟 모티프(네온 사인, 반짝이는 볼, 스파크 효과)만 사용했습니다.

## E2E 테스트 (선택)

`e2e/` 폴더에 Playwright로 작성한 시나리오 스모크 테스트가 있습니다. 백엔드와 프론트엔드(`npm run dev`)가
모두 떠 있는 상태에서 실행하세요.

```bash
npm install
npx playwright install chromium   # 최초 1회
ADMIN_KEY=<백엔드 실행 시 출력된 관리자 키> node e2e/01-purchase-and-settlement.cjs
node e2e/02-saved-number-and-controls.cjs
node e2e/03-round-change-reset.cjs
```

백엔드를 `ADMIN_KEY=test-admin-key-12345`로 실행했다면 `ADMIN_KEY` 환경 변수는 생략해도 됩니다
(스크립트의 기본값과 동일합니다).
