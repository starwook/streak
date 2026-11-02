# Streak PWA

정적 PWA. 빌드 없음.

## 폰에 설치
1. 배포된 HTTPS URL을 iPhone Safari로 연다.
2. 공유 버튼 → "홈 화면에 추가".

## 배포
파일 그대로 정적 호스팅(GitHub Pages 등)에 올리면 된다. 파일을 바꾸면 `sw.js`의 `CACHE` 버전을 올린다.

## 백업
앱 하단 "내보내기"로 JSON 저장. Safari 데이터를 지우면 localStorage도 사라진다.
