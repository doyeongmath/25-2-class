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
  document.getElementById('result').innerText =
    `|X/n - 1/6| < ${h} 를 만족한 비율: ${ratio}% (${successCount}/${repeat})`;

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

// 이론적 확률분포 결과 그래프 그리기
function drawTheoryChart() {
  const ctx = document.getElementById('theoryChart');
  if (!ctx) {
    console.error('theoryChart canvas를 찾을 수 없음');
    return;
  }
  
  console.log('이론적 그래프 그리기 시작');
  
  // n 값들
  const nValues = [10, 20, 30, 40, 50];
  const p = 1/6; // 3의 눈이 나올 확률
  
  // 모든 x 값의 범위 결정 (가장 큰 n에 대해)
  const maxN = Math.max(...nValues);
  const maxX = Math.min(maxN, Math.floor(maxN * p * 4)); // 그래프 범위 조정
  
  // x축 레이블 생성
  const xLabels = [];
  for (let x = 0; x <= maxX; x++) {
    xLabels.push(x.toString());
  }
  
  // 각 n에 대한 데이터셋 생성
  const datasets = nValues.map((n, index) => {
    const data = [];
    
    for (let x = 0; x <= maxX; x++) {
      if (x <= n) {
        const prob = binomialPMF(n, p, x);
        data.push(prob);
      } else {
        data.push(0); // n보다 큰 x 값은 0
      }
    }
    
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)'
    ];
    
    console.log(`n=${n} 데이터:`, data.slice(0, 10)); // 처음 10개만 로그
    
    return {
      label: `n = ${n}`,
      data: data,
      borderColor: colors[index],
      backgroundColor: colors[index].replace('0.8', '0.3'),
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3
    };
  });
  
  // 기존 차트가 있으면 제거
  if (window.theoryChart) {
    window.theoryChart.destroy();
  }
  
  console.log('Chart 생성 시작, 레이블:', xLabels.slice(0, 10));
  
  window.theoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '이론적 이항분포 (p = 1/6)'
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
          type: 'linear',
          position: 'bottom'
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
      drawTheoryChart();
      console.log('이론적 그래프 그리기 완료');
    } catch (error) {
      console.error('그래프 그리기 오류:', error);
    }
  } else {
    console.log('Chart.js 아직 로드되지 않음, 500ms 후 재시도...');
    setTimeout(waitForChartJS, 500);
  }
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
      drawTheoryChart();
    } catch (error) {
      console.error('그래프 그리기 오류 (window.onload):', error);
    }
  }
});
