function runSimulation() {
  const n = parseInt(document.getElementById('n').value);
  const h = parseFloat(document.getElementById('h').value);
  const repeat = parseInt(document.getElementById('repeat').value);
  const p = 1/6; // 성공 확률 (주사위 3의 눈)

  let successCount = 0;
  let freqList = [];

  for (let i = 0; i < repeat; i++) {
    let X = 0;
    for (let j = 0; j < n; j++) {
      if (Math.random() < p) X++;
    }
    const relFreq = X / n;
    freqList.push(relFreq);

    if (Math.abs(relFreq - p) < h) {
      successCount++;
    }
  }

  const ratio = ((successCount / repeat) * 100).toFixed(2);
  document.getElementById('result').innerHTML = `
    <div class="result-content">
      <p>|X/n - 1/6| < ${h} 를 만족한 비율:</p>
      <p><strong>${ratio}%</strong> (${successCount}/${repeat})</p>
      <p class="result-note">이론적 확률: 1/6 ≈ 0.1667</p>
    </div>
  `;
  
  // MathJax 재렌더링
  if (window.MathJax) {
    MathJax.typesetPromise([document.getElementById('result')]).catch((err) => {
      console.log('MathJax 재렌더링 오류:', err);
    });
  }

  drawChart(freqList, p, h);
}

function drawChart(data, p, h) {
  const ctx = document.getElementById('chart').getContext('2d');
  const bins = new Array(21).fill(0);

  data.forEach(v => {
    const idx = Math.min(20, Math.floor(v * 20));
    bins[idx]++;
  });

  const labels = bins.map((_, i) => (i / 20).toFixed(2));
  const backgroundColors = labels.map(label => {
    const x = parseFloat(label);
    return Math.abs(x - p) < h ? 'rgba(54, 162, 235, 0.7)' : 'rgba(200, 200, 200, 0.5)';
  });

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'X/n 분포',
        data: bins,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: '상대도수 X/n' }
        },
        y: {
          title: { display: true, text: '빈도' }
        }
      }
    }
  });
}

// 이론적 확률분포 결과 그래프 그리기 (실제 이항분포 계산)
function drawTheoryChart() {
  const ctx = document.getElementById('theoryChart');
  if (!ctx) {
    console.error('theoryChart canvas를 찾을 수 없음');
    return;
  }
  
  console.log('이론적 그래프 그리기 시작');
  
  // 기존 차트가 있으면 제거
  if (window.theoryChart && typeof window.theoryChart.destroy === 'function') {
    window.theoryChart.destroy();
  }
  
  // n 값들과 색상
  const nValues = [10, 20, 30, 40, 50];
  const colors = [
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)', 
    'rgb(255, 206, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)'
  ];
  
  const p = 1/6; // 3의 눈이 나올 확률
  
  // x축 범위 설정 (0부터 15까지)
  const maxX = 15;
  const xLabels = [];
  for (let x = 0; x <= maxX; x++) {
    xLabels.push(x);
  }
  
  // 각 n에 대한 데이터셋 생성
  const datasets = nValues.map((n, index) => {
    const data = [];
    
    for (let x = 0; x <= maxX; x++) {
      if (x <= n) {
        data.push(binomialPMF(n, p, x));
      } else {
        data.push(null); // n을 초과하는 값은 null
      }
    }
    
    return {
      label: `n = ${n}`,
      data: data,
      borderColor: colors[index],
      backgroundColor: colors[index] + '40', // 투명도 추가
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 2,
      spanGaps: false
    };
  });
  
  console.log('데이터셋 생성 완료');
  
  window.theoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '이론적 이항분포 (p = 1/6)',
          font: {
            size: 16
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: '3의 눈이 나온 횟수 (X)'
          },
          min: 0,
          max: maxX
        },
        y: {
          title: { 
            display: true, 
            text: '확률 P(X = x)' 
          },
          beginAtZero: true
        }
      }
    }
  });
  
  console.log('이론적 그래프 완성');
}

// 이항분포 확률질량함수
function binomialPMF(n, p, x) {
  if (x < 0 || x > n) return 0;
  return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

// 조합 계산
function combination(n, k) {
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

// Chart.js 로드 확인 및 이론적 그래프 그리기
function waitForChartJS() {
  console.log('Chart.js 확인 중...', typeof Chart);
  
  if (typeof Chart !== 'undefined') {
    console.log('Chart.js 로드됨, 이론적 그래프 그리기 시작');
    try {
      // 실제 이항분포 그래프 그리기
      drawTheoryChart();
      console.log('이론적 그래프 완성');
    } catch (error) {
      console.error('이론적 그래프 그리기 오류:', error);
    }
  } else {
    console.log('Chart.js 아직 로드되지 않음, 100ms 후 재시도...');
    setTimeout(waitForChartJS, 100);
  }
}

// 실제 이항분포 그래프 그리기
function drawSimpleTestChart() {
  const ctx = document.getElementById('theoryChart');
  if (!ctx) {
    console.error('theoryChart canvas를 찾을 수 없음');
    return;
  }
  
  console.log('이항분포 그래프 그리기 시작');
  
  // 기존 차트가 있으면 제거 (안전하게)
  if (window.theoryChart && typeof window.theoryChart.destroy === 'function') {
    try {
      window.theoryChart.destroy();
    } catch (error) {
      console.log('기존 차트 제거 중 오류:', error);
    }
  }
  
  // 전역 변수 초기화
  window.theoryChart = null;
  
  // n 값들과 색상 (더 선명하게)
  const nValues = [10, 20, 30, 40, 50];
  const colors = [
    'rgb(255, 99, 132)',    // 빨강
    'rgb(54, 162, 235)',    // 파랑
    'rgb(255, 206, 86)',    // 노랑
    'rgb(75, 192, 192)',    // 청록
    'rgb(153, 102, 255)'    // 보라
  ];
  
  console.log('n 값들:', nValues);
  
  const p = 1/6; // 3의 눈이 나올 확률
  
  // x축 범위 설정 (0부터 25까지로 확장)
  const maxX = 25;
  const xLabels = [];
  for (let x = 0; x <= maxX; x++) {
    xLabels.push(x);
  }
  
  // 각 n에 대한 데이터셋 생성
  const datasets = nValues.map((n, index) => {
    const data = [];
    
    for (let x = 0; x <= maxX; x++) {
      if (x <= n) {
        const prob = binomialPMF(n, p, x);
        data.push(prob);
      } else {
        data.push(null); // n을 초과하는 값은 null
      }
    }
    
    console.log(`n=${n} 데이터:`, data.slice(0, 15)); // 처음 15개 로그
    
    return {
      label: `n = ${n}`,
      data: data,
      borderColor: colors[index],
      backgroundColor: colors[index] + '30', // 투명도 증가
      borderWidth: 3, // 선 두께 증가
      fill: false,
      tension: 0.1,
      pointRadius: 3, // 점 크기 증가
      spanGaps: false
    };
  });
  
  console.log('데이터셋 생성 완료');
  
  // 새 차트 생성
  const newChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '이론적 이항분포 (p = 1/6)',
          font: {
            size: window.innerWidth < 768 ? 14 : 16
          }
        },
        legend: {
          position: 'top',
          labels: {
            font: {
              size: window.innerWidth < 768 ? 12 : 14
            }
          }
        }
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: '3의 눈이 나온 횟수 (X)',
            font: {
              size: window.innerWidth < 768 ? 12 : 14
            }
          },
          min: 0,
          max: maxX,
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            },
            stepSize: 1, // 1씩 증가
            callback: function(value, index, values) {
              return value; // 모든 x값 표시
            }
          }
        },
        y: {
          title: { 
            display: true, 
            text: '확률 P(X = x)',
            font: {
              size: window.innerWidth < 768 ? 12 : 14
            }
          },
          beginAtZero: true,
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            },
            callback: function(value, index, values) {
              return value.toFixed(3); // 소수점 3자리까지 표시
            }
          }
        }
      }
    }
  });
  
  // 전역 변수에 할당
  window.theoryChart = newChart;
  
  console.log('이항분포 그래프 완성');
}



// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료');
  waitForChartJS();
});

// 추가로 window.onload에서도 시도
window.addEventListener('load', function() {
  console.log('Window 로드 완료');
  if (typeof Chart !== 'undefined') {
    console.log('Chart.js 로드됨 (window.onload)');
    try {
      drawSimpleTestChart();
    } catch (error) {
      console.error('그래프 그리기 오류 (window.onload):', error);
    }
  }
});
