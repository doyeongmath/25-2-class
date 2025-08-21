function runSimulation() {
  const n = parseInt(document.getElementById('n').value);
  const h = parseFloat(document.getElementById('h').value);
  const repeat = parseInt(document.getElementById('repeat').value);
  const p = 0.5; // 성공 확률 (동전 앞면)

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
    `|X/n - p| < ${h} 를 만족한 비율: ${ratio}% (${successCount}/${repeat})`;

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
