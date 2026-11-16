# 꽃나라 Flower Land · 꽃다발 그려보기

사이트: https://flowerland.vercel.app

테마(연인, 축하, 감사, 계절별 등)를 고르고 꽃과 포장을 담으면 꽃다발 시안이 그려지는 웹사이트입니다.
꽃말 사전, 카드·편지 쓰기, 시안 이미지(PNG/SVG) 저장, 주문 메모 복사를 지원합니다.

- 꽃나라: 경상북도 포항시 북구 삼호로 67 · 0507-1396-0776
- 꽃 사진: 위키미디어 공용(Wikimedia Commons)의 자유 이용 허락 사진 (출처는 `photos/credits.json`과 사이트 하단에 표기)
- 가게 꽃다발 고르기: `shop/` 사진(번호 = 파일 번호, 이름·색감은 index.html의 SHOP 표). 손님이 "이 느낌으로" 고르면 주문 메모를 만들어 줌. 사진 (꽃나라 사장님이 직접 만든 꽃바구니·꽃다발, 저작권 꽃나라, 무단 사용 금지, 큰 사진 shopNN.jpg / 작은 사진 shopNN_s.jpg)

`index.html` 하나로 동작하는 정적 사이트입니다.

## 사진 관리 (사장님용)
- 관리 화면: https://flowerland.vercel.app/admin.html (비밀번호는 Vercel 환경 변수 `ADMIN_PASSWORD`)
- 올린 사진과 목록은 Vercel Blob 저장 공간(flowerland-photos)에 보관돼요. 처음 27장은 `shop/` 폴더 사진을 쓰고, 목록 기본값은 `api/_seed.json`이에요.
- `api/shop.js` 목록 읽기, `api/admin.js` 올리기·고치기·사진 바꾸기·순서·삭제.
