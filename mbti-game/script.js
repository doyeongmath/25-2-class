// MBTI 게임 상태 관리
let gameState = {
    currentDimension: 0,
    results: [],
    score: 0,
    startTime: null,
    timeSpent: 0,
    timer: null,
    darkMode: false
};

// 정답: INTP
const correctAnswers = ['I', 'N', 'T', 'P'];

// 게임 데이터
const dimensions = [
    {
        title: "에너지 방향",
        description: "이 사람은 어디서 에너지를 얻을까요?",
        options: [
            { 
                label: "E - 외향적 (사람들과의 상호작용)", 
                value: "E",
                hint: "이 사람은 대화를 통해 아이디어를 발전시키고, 그룹 활동에서 활력을 얻습니다."
            },
            { 
                label: "I - 내향적 (혼자만의 시간)", 
                value: "I",
                hint: "이 사람은 혼자 있을 때 더 깊이 생각하고, 조용한 환경에서 집중력을 발휘합니다."
            }
        ]
    },
    {
        title: "인식 기능", 
        description: "이 사람은 정보를 어떻게 받아들일까요?",
        options: [
            { 
                label: "S - 감각적 (현실적, 구체적)", 
                value: "S",
                hint: "이 사람은 실제 경험과 구체적인 사실을 중시하며, 실용적인 해결책을 선호합니다."
            },
            { 
                label: "N - 직관적 (가능성, 패턴)", 
                value: "N",
                hint: "이 사람은 새로운 가능성을 탐구하고, 숨겨진 패턴과 의미를 찾아냅니다."
            }
        ]
    },
    {
        title: "판단 기능",
        description: "이 사람은 어떻게 결정을 내릴까요?", 
        options: [
            { 
                label: "T - 사고형 (논리, 분석)", 
                value: "T",
                hint: "이 사람은 논리적 분석과 객관적 사실을 바탕으로 결정을 내리며, 효율성을 중시합니다."
            },
            { 
                label: "F - 감정형 (가치, 조화)", 
                value: "F",
                hint: "이 사람은 사람들의 감정과 가치를 고려하며, 조화로운 관계를 중요하게 여깁니다."
            }
        ]
    },
    {
        title: "생활 양식",
        description: "이 사람은 어떤 생활 방식을 선호할까요?",
        options: [
            { 
                label: "J - 판단형 (계획적, 체계적)", 
                value: "J",
                hint: "이 사람은 명확한 계획과 마감일을 선호하며, 체계적이고 정리된 환경에서 편안함을 느낍니다."
            },
            { 
                label: "P - 인식형 (유연한, 즉흥적)", 
                value: "P",
                hint: "이 사람은 유연한 계획과 자발적인 선택을 선호하며, 새로운 기회에 열려있습니다."
            }
        ]
    }
];

// DOM 요소들
const elements = {
    startScreen: document.getElementById('startScreen'),
    gameScreen: document.getElementById('gameScreen'),
    resultScreen: document.getElementById('resultScreen'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    startGameBtn: document.getElementById('startGameBtn'),
    hintBtn: document.getElementById('hintBtn'),
    hintBox: document.getElementById('hintBox'),
    hintText: document.getElementById('hintText'),
    optionsContainer: document.getElementById('optionsContainer'),
    progressCounter: document.getElementById('progressCounter'),
    progressBar: document.getElementById('progressBar'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    timeDisplay: document.getElementById('timeDisplay'),
    questionTitle: document.getElementById('questionTitle'),
    questionDescription: document.getElementById('questionDescription'),
    resultsDisplay: document.getElementById('resultsDisplay'),
    resultsContainer: document.getElementById('resultsContainer'),
    resultEmoji: document.getElementById('resultEmoji'),
    resultText: document.getElementById('resultText'),
    finalScore: document.getElementById('finalScore'),
    timeResult: document.getElementById('timeResult'),
    answersSection: document.getElementById('answersSection'),
    detailedResults: document.getElementById('detailedResults'),
    showAnswersBtn: document.getElementById('showAnswersBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn')
};

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    elements.startGameBtn.addEventListener('click', startGame);
    elements.hintBtn.addEventListener('click', toggleHint);
    elements.showAnswersBtn.addEventListener('click', showAnswers);
    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.backToHomeBtn.addEventListener('click', goToHome);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // 키보드 접근성
    document.addEventListener('keydown', handleKeyboard);
});

// 게임 시작
function startGame() {
    gameState.currentDimension = 0;
    gameState.results = [];
    gameState.score = 0;
    gameState.startTime = Date.now();
    gameState.timeSpent = 0;
    
    elements.startScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    elements.resultScreen.classList.add('hidden');
    
    updateGameDisplay();
    startTimer();
}

// 게임 화면 업데이트
function updateGameDisplay() {
    const dimension = dimensions[gameState.currentDimension];
    
    // 질문 정보 업데이트
    elements.questionTitle.textContent = dimension.title;
    elements.questionDescription.textContent = dimension.description;
    
    // 진행률 업데이트
    const progress = ((gameState.currentDimension + 1) / 4) * 100;
    elements.progressCounter.textContent = `${gameState.currentDimension + 1}/4`;
    elements.progressBar.style.width = `${progress}%`;
    
    // 선택지 생성
    elements.optionsContainer.innerHTML = '';
    dimension.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'w-full p-6 text-left bg-gray-50 hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-300 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-300';
        button.textContent = option.label;
        button.addEventListener('click', () => handleGuess(option.value));
        button.setAttribute('aria-label', `${option.label} 선택`);
        elements.optionsContainer.appendChild(button);
    });
    
    // 힌트 초기화
    elements.hintBox.classList.add('hidden');
    elements.hintText.textContent = dimension.options.find(opt => opt.value === correctAnswers[gameState.currentDimension])?.hint || '';
    
    // 결과 표시 업데이트
    updateResultsDisplay();
}

// 답 선택 처리
function handleGuess(guess) {
    const isCorrect = guess === correctAnswers[gameState.currentDimension];
    const result = {
        dimension: dimensions[gameState.currentDimension].title,
        guess: guess,
        correct: correctAnswers[gameState.currentDimension],
        isCorrect: isCorrect
    };
    
    gameState.results.push(result);
    
    if (isCorrect) {
        gameState.score += 25;
    }
    
    if (gameState.currentDimension < dimensions.length - 1) {
        gameState.currentDimension++;
        updateGameDisplay();
    } else {
        endGame();
    }
}

// 게임 종료
function endGame() {
    stopTimer();
    elements.gameScreen.classList.add('hidden');
    elements.resultScreen.classList.remove('hidden');
    
    const correctCount = gameState.results.filter(r => r.isCorrect).length;
    const finalScore = calculateFinalScore();
    
    // 결과 표시 업데이트
    elements.resultEmoji.textContent = correctCount === 4 ? '🎉' : correctCount >= 2 ? '👏' : '🤔';
    elements.resultText.textContent = `${correctCount}개 맞춤! (4개 중)`;
    elements.finalScore.textContent = `최종 점수: ${finalScore}점`;
    
    const minutes = Math.floor(gameState.timeSpent / 60);
    const seconds = gameState.timeSpent % 60;
    elements.timeResult.textContent = `소요 시간: ${minutes}분 ${seconds}초`;
    
    // 상세 결과 섹션 숨기기
    elements.answersSection.classList.add('hidden');
}

// 최종 점수 계산
function calculateFinalScore() {
    const correctCount = gameState.results.filter(r => r.isCorrect).length;
    const baseScore = correctCount * 25;
    const timeBonus = Math.max(0, 300 - gameState.timeSpent) * 0.5;
    return Math.round(baseScore + timeBonus);
}

// 정답 공개
function showAnswers() {
    elements.answersSection.classList.remove('hidden');
    elements.showAnswersBtn.classList.add('hidden');
    
    // 상세 결과 생성
    elements.detailedResults.innerHTML = '';
    gameState.results.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = `p-4 rounded-lg border-2 ${
            result.isCorrect 
                ? 'bg-green-100 border-green-300' 
                : 'bg-red-100 border-red-300'
        }`;
        
        resultDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${result.dimension}</span>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-lg ${
                        result.isCorrect ? 'text-green-600' : 'text-red-600'
                    }">${result.guess}</span>
                    ${result.isCorrect 
                        ? '<span class="text-green-600 text-xl">✓</span>' 
                        : `<span class="text-red-600">✗ (정답: ${result.correct})</span>`
                    }
                </div>
            </div>
        `;
        
        elements.detailedResults.appendChild(resultDiv);
    });
}

// 게임 리셋
function resetGame() {
    gameState.currentDimension = 0;
    gameState.results = [];
    gameState.score = 0;
    gameState.timeSpent = 0;
    
    elements.resultScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    
    updateGameDisplay();
    startTimer();
}

// 홈으로 돌아가기
function goToHome() {
    gameState.currentDimension = 0;
    gameState.results = [];
    gameState.score = 0;
    gameState.timeSpent = 0;
    
    elements.resultScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
    
    stopTimer();
}

// 힌트 토글
function toggleHint() {
    elements.hintBox.classList.toggle('hidden');
    elements.hintBtn.textContent = elements.hintBox.classList.contains('hidden') ? '💡 힌트 보기' : '💡 힌트 숨기기';
}

// 타이머 시작
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeSpent = Math.floor((Date.now() - gameState.startTime) / 1000);
        updateTimeDisplay();
    }, 1000);
}

// 타이머 정지
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// 시간 표시 업데이트
function updateTimeDisplay() {
    const minutes = Math.floor(gameState.timeSpent / 60);
    const seconds = gameState.timeSpent % 60;
    elements.timeDisplay.textContent = `시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 점수 표시 업데이트
function updateScoreDisplay() {
    elements.scoreDisplay.textContent = `점수: ${gameState.score}점`;
}

// 결과 표시 업데이트
function updateResultsDisplay() {
    if (gameState.results.length === 0) {
        elements.resultsDisplay.classList.add('hidden');
        return;
    }
    
    elements.resultsDisplay.classList.remove('hidden');
    elements.resultsContainer.innerHTML = '';
    
    gameState.results.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = `w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
            result.isCorrect ? 'bg-green-500 shadow-lg' : 'bg-red-500 shadow-lg'
        }`;
        resultDiv.textContent = result.guess;
        resultDiv.title = `${result.dimension}: ${result.guess} ${result.isCorrect ? '✓' : '✗'}`;
        elements.resultsContainer.appendChild(resultDiv);
    });
}

// 다크모드 토글
function toggleDarkMode() {
    gameState.darkMode = !gameState.darkMode;
    
    if (gameState.darkMode) {
        document.body.classList.add('dark');
        elements.darkModeToggle.textContent = '🌞';
        elements.darkModeToggle.classList.add('bg-gray-800/20');
    } else {
        document.body.classList.remove('dark');
        elements.darkModeToggle.textContent = '🌙';
        elements.darkModeToggle.classList.remove('bg-gray-800/20');
    }
}

// 키보드 접근성
function handleKeyboard(event) {
    switch(event.key) {
        case 'Enter':
        case ' ':
            if (document.activeElement === elements.startGameBtn) {
                startGame();
            } else if (document.activeElement === elements.hintBtn) {
                toggleHint();
            } else if (document.activeElement === elements.showAnswersBtn) {
                showAnswers();
            } else if (document.activeElement === elements.playAgainBtn) {
                resetGame();
            } else if (document.activeElement === elements.backToHomeBtn) {
                goToHome();
            }
            break;
        case 'Escape':
            if (!elements.startScreen.classList.contains('hidden')) {
                // 시작 화면에서는 아무것도 하지 않음
            } else if (!elements.gameScreen.classList.contains('hidden')) {
                // 게임 중에는 홈으로 돌아가기
                goToHome();
            } else if (!elements.resultScreen.classList.contains('hidden')) {
                // 결과 화면에서는 홈으로 돌아가기
                goToHome();
            }
            break;
    }
}

// 다크모드 CSS 클래스 추가
document.addEventListener('DOMContentLoaded', function() {
    // 사용자의 시스템 테마 설정 확인
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        toggleDarkMode();
    }
    
    // 시스템 테마 변경 감지
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (e.matches && !gameState.darkMode) {
            toggleDarkMode();
        } else if (!e.matches && gameState.darkMode) {
            toggleDarkMode();
        }
    });
});
