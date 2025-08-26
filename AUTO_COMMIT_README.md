# 🚀 자동 Commit Summary 생성 시스템

GitHub Desktop에서 commit 시 자동으로 commit message를 생성해주는 시스템입니다!

## ✨ **주요 기능**

- 📄 **파일 타입별 자동 분류**: HTML, CSS, JS, MD 파일 자동 인식
- 🕐 **타임스탬프 자동 추가**: commit 시간 자동 기록
- 🌿 **브랜치 정보 자동 포함**: 현재 작업 중인 브랜치 표시
- 📝 **변경사항 자동 요약**: 수정된 파일 목록 자동 생성
- 🎨 **이모지 자동 추가**: 가독성 향상을 위한 이모지 포함

## 🔧 **설치 방법**

### 1. Git Hooks 폴더 확인
```
.git/hooks/ 폴더에 다음 파일들이 있는지 확인:
- prepare-commit-msg (Linux/Mac용)
- prepare-commit-msg.ps1 (PowerShell용)
- prepare-commit-msg.bat (Windows 배치용)
```

### 2. 실행 권한 부여 (Linux/Mac)
```bash
chmod +x .git/hooks/prepare-commit-msg
```

### 3. Git 설정 적용
```bash
git config core.hooksPath .git/hooks
```

## 🎯 **사용 방법**

### **GitHub Desktop에서:**
1. 파일 변경 후 **Changes** 탭에서 확인
2. **Commit to main** 클릭
3. 자동으로 생성된 commit message 확인
4. 필요시 수정 후 **Commit to main** 클릭

### **터미널에서:**
```bash
git add .
git commit
# 자동으로 commit message 생성됨
```

## 📋 **생성되는 Commit Message 예시**

```
🔄 📄 HTML 파일 수정 🎨 CSS 스타일 수정

📅 2025-01-27 15:30
🌿 브랜치: main

💡 변경사항:
- statistical_thinking_outlier.html
- common-styles.css
- README.md

✨ 자동 생성된 commit message입니다.
```

## 🛠️ **파일 타입별 이모지**

- **📄 HTML**: HTML 파일 수정
- **🎨 CSS**: CSS 스타일 수정
- **⚡ JavaScript**: JavaScript 기능 수정
- **📖 문서**: Markdown, README 등 문서 수정
- **🔧 기타**: 그 외 파일 수정

## 🔍 **문제 해결**

### **자동 생성이 안 될 때:**
1. `.git/hooks/` 폴더에 스크립트 파일이 있는지 확인
2. 파일 실행 권한 확인 (Linux/Mac)
3. Git 설정에서 hooks 경로 확인

### **Windows에서 문제가 있을 때:**
- `prepare-commit-msg.bat` 파일 사용
- PowerShell 스크립트 대신 배치 파일 사용

## 🎉 **장점**

- ⚡ **시간 절약**: commit message 작성 시간 단축
- 📊 **일관성**: 통일된 형식의 commit message
- 🔍 **가독성**: 이모지와 구조화된 정보로 가독성 향상
- 📝 **자동화**: 반복 작업 자동화로 실수 방지

## 🚀 **커스터마이징**

필요에 따라 스크립트를 수정하여:
- 다른 파일 타입 추가
- 다른 이모지 사용
- 추가 정보 포함
- 다른 형식으로 변경

---

💡 **팁**: 이 시스템을 사용하면 GitHub Desktop에서 commit할 때마다 자동으로 전문적인 commit message가 생성됩니다!
