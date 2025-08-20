// 페이지 로드 시 이론적 확률분포 차트 생성
document.addEventListener('DOMContentLoaded', function() {
  createTheoryChart();
});

// 이론적 확률분포 차트 생성
function createTheoryChart() {
  const ctx = document.getElementById('theoryChart').getContext('2d');
  
  const data = {
    labels: ['N=10', 'N=20', 'N=30', 'N=40', 'N=50'],
    datasets: [{
      label: 'P(|X/N - 1/6| < 0.1)',
      data: [0.6137, 0.7835, 0.7835, 0.9455, 0.9455],
      backgroundColor: 'rgba(53, 126, 221, 0.8)',
      borderColor: 'rgba(53, 126, 221, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '이론적 확률분포: P(|X/N - 1/6| < 0.1)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 0.1,
          callback: function(value) {
            return (value * 100).toFixed(0) + '%';
          }
        },
        title: {
          display: true,
          text: '확률'
        }
      },
      x: {
        title: {
          display: true,
          text: '주사위를 던진 횟수 (N)'
        }
      }
    }
  };

  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  });
}

// 주사위 실험 실행
function runSimulation() {
  const n = parseInt(document.getElementById('n').value);
  const h = parseFloat(document.getElementById('h').value);
  const repeat = parseInt(document.getElementById('repeat').value);
  const p = 1/6; // 3의 눈이 나올 이론적 확률

  let successCount = 0;
  let freqList = [];

  // 실험 진행 상황 표시
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = '🔄 실험 진행 중... <br><small>주사위를 ' + (n * repeat).toLocaleString() + '번 던지는 중입니다.</small>';

  // 비동기로 실험 실행 (UI 블로킹 방지)
  setTimeout(() => {
    for (let i = 0; i < repeat; i++) {
      let X = 0;
      for (let j = 0; j < n; j++) {
        // 주사위 던지기 (1~6 중 랜덤)
        const diceResult = Math.floor(Math.random() * 6) + 1;
        if (diceResult === 3) X++; // 3의 눈이 나오면 카운트
      }
      const relFreq = X / n;
      freqList.push(relFreq);

      if (Math.abs(relFreq - p) < h) {
        successCount++;
      }
    }

    const ratio = ((successCount / repeat) * 100).toFixed(2);
    const expectedProb = calculateExpectedProbability(n, h);
    
    resultElement.innerHTML = `
      <strong>🎯 실험 결과</strong><br>
      <strong>|X/N - 1/6| < ${h}</strong> 를 만족한 비율: <strong>${ratio}%</strong> (${successCount}/${repeat})<br>
      <small>이론적 확률: ${(expectedProb * 100).toFixed(2)}% (N=${n}, h=${h})</small>
    `;

    drawChart(freqList, p, h);
  }, 100);
}

// 이론적 확률 계산 (근사값)
function calculateExpectedProbability(n, h) {
  // 이항분포 B(n, 1/6)에서 |X/n - 1/6| < h 조건을 만족하는 확률
  // 실제로는 정확한 계산이 복잡하므로 근사값 사용
  const lowerBound = Math.max(0, Math.floor(n * (1/6 - h)));
  const upperBound = Math.min(n, Math.ceil(n * (1/6 + h)));
  
  // 간단한 근사: 중심극한정리에 의해 정규분포로 근사
  const mean = n * (1/6);
  const variance = n * (1/6) * (5/6);
  const stdDev = Math.sqrt(variance);
  
  // 표준정규분포로 변환하여 확률 계산
  const z1 = (lowerBound - mean) / stdDev;
  const z2 = (upperBound - mean) / stdDev;
  
  // 표준정규분포 누적확률의 차이 (근사값)
  return Math.max(0, Math.min(1, 0.5 + 0.5 * (Math.atan(z2) / Math.PI) - (0.5 + 0.5 * (Math.atan(z1) / Math.PI))));
}

// 실험 결과 차트 그리기
function drawChart(data, p, h) {
  const ctx = document.getElementById('chart').getContext('2d');
  
  // 데이터를 구간별로 분류 (히스토그램)
  const bins = new Array(21).fill(0);
  const binWidth = 1/20; // 0~1을 20개 구간으로 분할
  
  data.forEach(value => {
    const binIndex = Math.min(20, Math.floor(value / binWidth));
    bins[binIndex]++;
  });

  const labels = bins.map((_, i) => (i * binWidth).toFixed(2));
  const backgroundColors = labels.map(label => {
    const x = parseFloat(label);
    return Math.abs(x - p) < h ? 'rgba(40, 167, 69, 0.7)' : 'rgba(108, 117, 125, 0.5)';
  });

  // 기존 차트 제거
  if (window.experimentChart) {
    window.experimentChart.destroy();
  }

  window.experimentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'X/N 분포 (실험 결과)',
        data: bins,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '실험 결과: 상대도수 X/N의 분포',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '빈도'
          }
        },
        x: {
          title: {
            display: true,
            text: '상대도수 X/N'
          }
        }
      }
    }
  });
}
