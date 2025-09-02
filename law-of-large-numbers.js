// 큰수의 법칙 실험기 - 주사위 버전
function runSimulation() {
  // 입력값 검증
  const n = parseInt(document.getElementById('n').value);
  const h = parseFloat(document.getElementById('h').value);
  const repeat = parseInt(document.getElementById('repeat').value);
  
  if (isNaN(n) || isNaN(h) || isNaN(repeat) || n < 10 || h <= 0 || repeat < 100) {
    showError('입력값을 올바르게 입력해주세요.');
    return;
  }
  
  // 로딩 상태 표시
  showLoading();
  
  // 비동기 실행으로 UI 블로킹 방지
  setTimeout(() => {
    const p = 1/6; // 주사위 3의 눈 확률
    
    let successCount = 0;
    const freqList = [];
    const progressCallback = (progress) => {
      updateProgress(progress);
    };
    
    // 큰 repeat 값에 대해 진행상황 표시
    const batchSize = Math.max(100, Math.floor(repeat / 10));
    
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
      
      // 진행상황 업데이트 (배치 단위로)
      if (i % batchSize === 0) {
        updateProgress((i / repeat) * 100);
      }
    }
    
    const ratio = ((successCount / repeat) * 100).toFixed(2);
    const theoreticalProb = (1/6).toFixed(4);
    
    // 결과 표시 (개선된 UI)
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').innerHTML = `
      <div style="text-align: center;">
        <h3 style="color: #166534; margin: 0 0 15px 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-size: 1.5rem;">📊</span>
          실험 결과
        </h3>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid #bbf7d0;">
          <p style="margin: 0 0 10px 0; font-size: 1rem; color: #374151;">
            \\(\\left|\\frac{X}{n} - \\frac{1}{6}\\right| < ${h}\\) 조건을 만족한 비율
          </p>
          <p class="result-highlight">${ratio}%</p>
          <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #6b7280;">
            (${successCount.toLocaleString()}/${repeat.toLocaleString()}회)
          </p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
            <p style="margin: 0; font-size: 0.9rem; color: #1e40af; font-weight: 600;">수학적 확률</p>
            <p style="margin: 5px 0 0 0; font-size: 1.1rem; font-weight: 700;">\\(\\frac{1}{6} ≈ ${theoreticalProb}\\)</p>
          </div>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 0.9rem; color: #166534; font-weight: 600;">실험 평균</p>
            <p style="margin: 5px 0 0 0; font-size: 1.1rem; font-weight: 700;">${(freqList.reduce((a, b) => a + b, 0) / freqList.length).toFixed(4)}</p>
          </div>
        </div>
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
    
    // 차트 그리기
    drawChart(freqList, p, h);
    hideLoading();
  }, 100);
}

// 로딩 상태 표시
function showLoading() {
  const button = document.querySelector('.btn-primary');
  button.disabled = true;
  button.innerHTML = '<span style="margin-right: 8px;">⏳</span>실험 진행 중...';
}

// 로딩 상태 해제
function hideLoading() {
  const button = document.querySelector('.btn-primary');
  button.disabled = false;
  button.innerHTML = '<span style="margin-right: 8px;">🚀</span>실험 시작';
}

// 진행상황 업데이트
function updateProgress(progress) {
  const button = document.querySelector('.btn-primary');
  if (progress < 100) {
    button.innerHTML = `<span style="margin-right: 8px;">⏳</span>진행 중... ${Math.round(progress)}%`;
  }
}

// 오류 표시
function showError(message) {
  document.getElementById('result').style.display = 'block';
  document.getElementById('result').innerHTML = `
    <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 15px; border-radius: 8px; text-align: center;">
      <span style="margin-right: 8px;">⚠️</span>${message}
    </div>
  `;
}

function drawChart(data, p, h) {
  const ctx = document.getElementById('chart');
  if (!ctx) {
    console.error('chart canvas를 찾을 수 없음');
    return;
  }
  
  const context = ctx.getContext('2d');
  
  // 더 세밀한 구간으로 히스토그램 생성 (50개 구간)
  const numBins = 50;
  const bins = new Array(numBins).fill(0);
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  
  data.forEach(v => {
    const idx = Math.min(numBins - 1, Math.floor((v - minVal) / range * numBins));
    bins[idx]++;
  });
  
  const labels = [];
  for (let i = 0; i < numBins; i++) {
    const binStart = minVal + (i / numBins) * range;
    labels.push(binStart.toFixed(3));
  }
  
  // 허용 오차 범위 계산
  const theoreticalLower = p - h;
  const theoreticalUpper = p + h;
  
  // 색상 배열 생성 (허용 범위 내는 초록색, 외부는 빨간색)
  const backgroundColors = bins.map((_, i) => {
    const binCenter = minVal + ((i + 0.5) / numBins) * range;
    if (binCenter >= theoreticalLower && binCenter <= theoreticalUpper) {
      return 'rgba(34, 197, 94, 0.7)'; // 초록색 (성공)
    } else {
      return 'rgba(239, 68, 68, 0.7)'; // 빨간색 (실패)
    }
  });
  
  const borderColors = backgroundColors.map(color => 
    color.replace('0.7', '1')
  );
  
  if (window.chart && typeof window.chart.destroy === 'function') {
    window.chart.destroy();
  }
  
  window.chart = new Chart(context, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '상대도수 분포',
        data: bins,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `실험 결과: 상대도수 분포 (허용 범위: ${theoreticalLower.toFixed(3)} ~ ${theoreticalUpper.toFixed(3)})`,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: true,
          labels: {
            generateLabels: function(chart) {
              return [
                {
                  text: `허용 범위 내 (|X/n - 1/6| < ${h})`,
                  fillStyle: 'rgba(34, 197, 94, 0.7)',
                  strokeStyle: 'rgba(34, 197, 94, 1)',
                  lineWidth: 1
                },
                {
                  text: `허용 범위 외`,
                  fillStyle: 'rgba(239, 68, 68, 0.7)',
                  strokeStyle: 'rgba(239, 68, 68, 1)',
                  lineWidth: 1
                }
              ];
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '상대도수 (X/n)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            alpha: 0.3
          },
          ticks: {
            maxTicksLimit: 10,
            callback: function(value, index, values) {
              return parseFloat(this.getLabelForValue(value)).toFixed(2);
            }
          }
        },
        y: {
          title: {
            display: true,
            text: '빈도',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          beginAtZero: true,
          grid: {
            display: true,
            alpha: 0.3
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
  
  // 이론적 확률 수직선을 그리기 위한 플러그인 등록
  Chart.register({
    id: 'theoreticalLine',
    afterDraw: function(chart) {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const scales = chart.scales;
      
      // p = 1/6의 실제 x축 위치 계산 (히스토그램 bin 인덱스로 변환)
      const theoreticalBinIndex = (p - minVal) / range * numBins;
      const theoreticalX = scales.x.getPixelForValue(theoreticalBinIndex);
      
      if (theoreticalX >= chartArea.left && theoreticalX <= chartArea.right) {
        ctx.save();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(theoreticalX, chartArea.top);
        ctx.lineTo(theoreticalX, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
        
        // 레이블 추가
        ctx.save();
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`이론값 (1/6 ≈ ${(1/6).toFixed(4)})`, theoreticalX, chartArea.top - 5);
        ctx.restore();
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

  // 탭 전환 로직 (업데이트된 클래스명 사용)
  try {
    const buttons = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.classList.add('active');
        // MathJax 재렌더링 (수식 있는 탭 전환 시)
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([target]).catch(()=>{});
        }
      });
    });
  } catch(e) {
    console.error('탭 초기화 오류', e);
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
  const summary = [];
  nValues.forEach(n => {
    // Strict: |X/n - 1/6| < 0.1  =>  n/15 < X < 4n/15
    // 부동소수 오차 방지를 위해 정수 산술로 경계 계산
    const lower = Math.floor(n / 15) + 1;          // 최소 정수 X (n/15보다 큰 최소 정수)
    const upper = Math.floor((4 * n - 1) / 15);    // 최대 정수 X (4n/15보다 작은 최대 정수)
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

    summary.push(`n=${n}: ${prob.toFixed(4)}`);
  });

  // 요약 출력 제거 (요구사항에 따라 숨김)
}

function rangeList(lower, upper, minX, maxX) {
  const l = Math.max(minX, lower);
  const u = Math.min(maxX, upper);
  if (l > u) return '-';
  const arr = [];
  for (let x = l; x <= u; x++) arr.push(x);
  return arr.join(', ');
}
