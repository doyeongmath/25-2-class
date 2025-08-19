import React, { useState, useCallback, useMemo, useEffect } from 'react';

const MBTIGuessGame = () => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [results, setResults] = useState([]);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hints, setHints] = useState([]);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  
  // 정답: INTP
  const correctAnswers = ['I', 'N', 'T', 'P'];
  
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

  // 시간 측정
  useEffect(() => {
    if (!showFinalResult) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showFinalResult, startTime]);

  // 점수 계산
  const calculateScore = useCallback((correctCount, timeSpent) => {
    const baseScore = correctCount * 25;
    const timeBonus = Math.max(0, 300 - timeSpent) * 0.5;
    return Math.round(baseScore + timeBonus);
  }, []);

  // 힌트 토글
  const toggleHint = useCallback((dimensionIndex) => {
    setHints(prev => 
      prev.includes(dimensionIndex) 
        ? prev.filter(i => i !== dimensionIndex)
        : [...prev, dimensionIndex]
    );
  }, []);

  // 게임 진행
  const handleGuess = useCallback((guess) => {
    const isCorrect = guess === correctAnswers[currentDimension];
    const newResult = {
      dimension: dimensions[currentDimension].title,
      guess: guess,
      correct: correctAnswers[currentDimension],
      isCorrect: isCorrect,
      timestamp: Date.now()
    };
    
    const newResults = [...results, newResult];
    setResults(newResults);
    
    if (isCorrect) {
      setScore(prev => prev + 25);
    }
    
    if (currentDimension < dimensions.length - 1) {
      setCurrentDimension(currentDimension + 1);
    } else {
      setShowFinalResult(true);
    }
  }, [currentDimension, correctAnswers, dimensions, results]);

  // 게임 리셋
  const resetGame = useCallback(() => {
    setCurrentDimension(0);
    setResults([]);
    setShowFinalResult(false);
    setShowAnswers(false);
    setHints([]);
    setScore(0);
    setTimeSpent(0);
  }, []);

  // 정답 공개
  const revealAnswers = useCallback(() => {
    setShowAnswers(true);
  }, []);

  // 다크모드 토글
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // 메모이제이션된 값들
  const correctCount = useMemo(() => results.filter(r => r.isCorrect).length, [results]);
  const finalScore = useMemo(() => calculateScore(correctCount, timeSpent), [correctCount, timeSpent, calculateScore]);
  const progressPercentage = useMemo(() => ((currentDimension + 1) / 4) * 100, [currentDimension]);

  // 최종 결과 화면
  if (showFinalResult) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
          : 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500'
      } flex items-center justify-center p-4`}>
        <div className={`${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } rounded-3xl shadow-2xl p-8 max-w-2xl w-full transform animate-fadeIn`}>
          <div className="text-center mb-8">
            <div className="text-8xl mb-6 animate-bounce">
              {correctCount === 4 ? '🎉' : correctCount >= 2 ? '👏' : '🤔'}
            </div>
            <h2 className="text-4xl font-bold mb-4">결과 발표!</h2>
            <div className="space-y-4">
              <p className="text-2xl">
                {correctCount}개 맞춤! (4개 중)
              </p>
              <div className="text-xl">
                <span className="font-bold text-purple-600">최종 점수: {finalScore}점</span>
              </div>
              <p className="text-lg opacity-75">
                소요 시간: {Math.floor(timeSpent / 60)}분 {timeSpent % 60}초
              </p>
            </div>
          </div>

          {!showAnswers ? (
            <div className="text-center mb-8">
              <div className={`${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              } rounded-lg p-6`}>
                <p className="text-lg mb-4">어떤 답이 맞았는지 궁금하다면?</p>
                <button
                  onClick={revealAnswers}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  aria-label="정답 공개하기"
                >
                  정답 공개하기
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      result.isCorrect 
                        ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-600' 
                        : 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.dimension}</span>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${
                          result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {result.guess}
                        </span>
                        {result.isCorrect ? (
                          <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">
                            ✗ (정답: {result.correct})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mb-8">
                <div className={`${
                  darkMode ? 'bg-purple-900' : 'bg-purple-100'
                } rounded-lg p-6`}>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-2">정답: INTP</p>
                  <p className="text-lg text-purple-600 dark:text-purple-300">
                    논리술사 - 지식에 대한 갈증이 많은 혁신적인 발명가
                  </p>
                  <p className="text-sm text-purple-500 dark:text-purple-400 mt-2">
                    독창적이고 창의적인 사고를 하는 분석가
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
              aria-label="다시 도전하기"
            >
              다시 도전하기
            </button>
            
            <button
              onClick={toggleDarkMode}
              className={`w-full py-3 px-6 rounded-full transition-all duration-300 border-2 ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-label="테마 변경"
            >
              {darkMode ? '🌞 라이트 모드' : '🌙 다크 모드'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 메인 게임 화면
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600'
    } flex items-center justify-center p-4`}>
      <div className={`${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } rounded-3xl shadow-2xl p-8 max-w-2xl w-full transform animate-fadeIn`}>
        
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">MBTI 맞히기 게임</h1>
            <div className="flex items-center gap-4">
              <span className={`${
                darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-600'
              } px-4 py-2 rounded-full text-sm font-medium`}>
                {currentDimension + 1}/4
              </span>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-label="테마 변경"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* 점수 및 시간 */}
          <div className="flex justify-between text-sm opacity-75">
            <span>점수: {score}점</span>
            <span>시간: {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</span>
          </div>
        </div>

        {/* 현재 질문 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">
            {dimensions[currentDimension].title}
          </h2>
          <p className="text-lg mb-6 opacity-90">
            {dimensions[currentDimension].description}
          </p>
          
          {/* 힌트 버튼 */}
          <div className="mb-6">
            <button
              onClick={() => toggleHint(currentDimension)}
              className={`text-sm px-4 py-2 rounded-full transition-all duration-300 ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              aria-label="힌트 보기"
            >
              💡 힌트 {hints.includes(currentDimension) ? '숨기기' : '보기'}
            </button>
          </div>
          
          {/* 힌트 표시 */}
          {hints.includes(currentDimension) && (
            <div className={`${
              darkMode ? 'bg-blue-900 border-blue-600' : 'bg-blue-50 border-blue-200'
            } border-2 rounded-lg p-4 mb-6 animate-fadeIn`}>
              <p className="text-sm font-medium mb-2">💡 힌트:</p>
              <p className="text-sm opacity-90">
                {dimensions[currentDimension].options.find(opt => opt.value === correctAnswers[currentDimension])?.hint}
              </p>
            </div>
          )}
          
          {/* 선택지 */}
          <div className="space-y-4">
            {dimensions[currentDimension].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleGuess(option.value)}
                className={`w-full p-6 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-indigo-400' 
                    : 'bg-gray-50 hover:bg-indigo-50 border-gray-200 hover:border-indigo-300'
                }`}
                aria-label={`${option.label} 선택`}
              >
                <span className="text-lg font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 지금까지 선택한 답 */}
        {results.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium opacity-75 mb-3">지금까지 선택:</h3>
            <div className="flex gap-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
                    result.isCorrect 
                      ? 'bg-green-500 shadow-lg' 
                      : 'bg-red-500 shadow-lg'
                  }`}
                  title={`${result.dimension}: ${result.guess} ${result.isCorrect ? '✓' : '✗'}`}
                >
                  {result.guess}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="text-center">
          <p className="text-sm opacity-75">
            나의 MBTI를 맞춰보세요! 🎯
          </p>
        </div>
      </div>
    </div>
  );
};

export default MBTIGuessGame;
