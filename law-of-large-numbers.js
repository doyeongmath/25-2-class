// 큰수의 법칙 실험기 - 주사위 버전
function runSimulation() {
  const n = parseInt(document.getElementById('n').value);
  const h = parseFloat(document.getElementById('h').value);
  const repeat = parseInt(document.getElementById('repeat').value);
  const p = 1/6; // 주사위 3의 눈 확률
  
  let successCount = 0;
  const freqList = [];
  
  for (let i = 0; i < repeat; i++) {
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (Math.random() < p) count++;
    }
    const freq = count / n;
    freqList.push(freq);
    
    if (Math.abs(freq - p) < h) {
      successCount++;
    }
  }
  
  const ratio = ((successCount / repeat) * 100).toFixed(2);
  document.getElementById('result').innerHTML = `
    <div class="result-content">
      <p>\\(\\left|\\frac{X}{n} - \\frac{1}{6}\\right| < ${h}\\) 를 만족한 비율:</p>
      <p><strong>${ratio}%</strong> (${successCount}/${repeat})</p>
      <p class="result-note">수학적 확률: \\(\\frac{1}{6} \\approx 0.1667\\)</p>
    </div>
  `;
  
  // MathJax 재렌더링
  if (window.MathJax && window.MathJax.typesetPromise) {
    setTimeout(() => {
      MathJax.typesetPromise([document.getElementById('result')]).catch((err) => {
        console.log('MathJax 재렌더링 오류:', err);
      });
    }, 50);
  }
  
  drawChart(freqList, p, h);
}

function drawChart(data, p, h) {
  const ctx = document.getElementById('chart');
  if (!ctx) {
    console.error('chart canvas를 찾을 수 없음');
    return;
  }
  
  const context = ctx.getContext('2d');
  const bins = new Array(21).fill(0);
  
  data.forEach(v => {
    const idx = Math.min(20, Math.floor(v * 20));
    bins[idx]++;
  });
  
  const labels = [];
  for (let i = 0; i < 21; i++) {
    labels.push((i / 20).toFixed(2));
  }
  
  if (window.chart && typeof window.chart.destroy === 'function') {
    window.chart.destroy();
  }
  
  console.log('실험결과 그래프 그리기 시작');
  
  window.chart = new Chart(context, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '상대도수 분포',
        data: bins,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '실험 결과: 상대도수 분포'
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '상대도수 X/n'
          },
          grid: {
            display: true
          },
          ticks: {
            stepSize: 0.05
          }
        },
        y: {
          title: {
            display: true,
            text: '빈도'
          },
          beginAtZero: true,
          grid: {
            display: true
          }
        }
      }
    }
  });
  
  console.log('실험결과 그래프 완성');
}

// 이론적 이항분포 그래프 그리기
function drawTheoryChart() {
  const ctx = document.getElementById('theoryChart');
  if (!ctx) {
    console.error('theoryChart canvas를 찾을 수 없음');
    return;
  }
  
  // 기존 차트가 있으면 제거
  if (window.theoryChart && typeof window.theoryChart.destroy === 'function') {
    window.theoryChart.destroy();
  }
  
  const nValues = [10, 20, 30, 40, 50];
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
  const maxX = 25; // x축 범위 확장
  
  const datasets = nValues.map((n, index) => {
    const data = [];
    for (let x = 0; x <= maxX; x++) {
      data.push(binomialPMF(n, 1/6, x));
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
  
  const xLabels = Array.from({length: maxX + 1}, (_, i) => i);
  
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
          position: 'top',
          labels: {
            font: {
              size: window.innerWidth < 768 ? 12 : 14
            },
            usePointStyle: true, // 점 스타일 사용
            pointStyle: 'line', // 선 스타일로 표시
            padding: 15
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
          grid: {
            display: true // x축 그리드 표시
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            },
            stepSize: 2, // 2씩 증가하여 라벨 간소화
            callback: function(value, index, values) {
              return value % 2 === 0 ? value : ''; // 짝수만 표시
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
          grid: {
            display: true // y축 그리드 표시
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            },
            stepSize: 0.01, // 0.01씩 증가
            callback: function(value, index, values) {
              return value.toFixed(3); // 소수점 3자리까지 표시
            }
          }
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

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('페이지 로드됨');
  
  // Chart.js 로드 확인
  if (typeof Chart !== 'undefined') {
    console.log('Chart.js 이미 로드됨');
    waitForChartJS();
  } else {
    console.log('Chart.js 로드 대기 중...');
    // Chart.js 스크립트가 로드될 때까지 대기
    const checkChartJS = setInterval(() => {
      if (typeof Chart !== 'undefined') {
        console.log('Chart.js 로드됨!');
        clearInterval(checkChartJS);
        waitForChartJS();
      }
    }, 100);
  }

  // 이론 표 동적 계산 채우기
  try {
    fillTheoryTable();
  } catch (e) {
    console.error('이론 표 계산 중 오류', e);
  }
});

// |X/n - 1/6| < h 를 만족하는 X의 정수 구간을 구해 합산
function fillTheoryTable() {
  const tbody = document.getElementById('theoryTableBody');
  if (!tbody) return;
  const p = 1/6;
  const h = 0.1;
  const nValues = [10,20,30,40,50];
  tbody.innerHTML = '';
  nValues.forEach(n => {
    // Strict: |X/n - p| < h  =>  n(p-h) < X < n(p+h)
    const lower = Math.floor(n * (p - h)) + 1;
    const upper = Math.ceil(n * (p + h)) - 1;
    let prob = 0;
    for (let x = Math.max(0, lower); x <= Math.min(n, upper); x++) {
      prob += binomialPMF(n, p, x);
    }
    const xRange = rangeList(lower, upper, 0, n);
    const tr = document.createElement('tr');
    const tdN = document.createElement('td');
    const tdX = document.createElement('td');
    const tdP = document.createElement('td');
    tdN.textContent = String(n);
    tdX.textContent = xRange;
    tdP.textContent = prob.toFixed(4);
    tr.appendChild(tdN); tr.appendChild(tdX); tr.appendChild(tdP);
    tbody.appendChild(tr);
  });
}

function rangeList(lower, upper, minX, maxX) {
  const l = Math.max(minX, lower);
  const u = Math.min(maxX, upper);
  if (l > u) return '-';
  const arr = [];
  for (let x = l; x <= u; x++) arr.push(x);
  return arr.join(', ');
}
