// 이항분포와 정규분포 비교 시뮬레이션
class BinormalComparison {
    constructor() {
        this.chart = null;
        this.initChart();
        this.bindEvents();
    }

    // Chart.js 초기화
    initChart() {
        const ctx = document.getElementById('chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                                 datasets: [
                     {
                         label: '이항분포 샘플링',
                         data: [],
                         backgroundColor: 'rgba(54, 162, 235, 0.6)',
                         borderColor: 'rgba(54, 162, 235, 1)',
                         borderWidth: 1,
                         yAxisID: 'y'
                     },
                     {
                         label: '정규분포 근사',
                         data: [],
                         type: 'line',
                         borderColor: 'rgba(255, 99, 132, 1)',
                         backgroundColor: 'rgba(255, 99, 132, 0.1)',
                         borderWidth: 2,
                         fill: false,
                         yAxisID: 'y'
                     }
                 ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '성공 횟수 (k)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '확률'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '이항분포 vs 정규분포 근사'
                    },
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    // 이벤트 바인딩
    bindEvents() {
        document.getElementById('run').addEventListener('click', () => {
            this.runComparison();
        });

        // 입력값 변경 시 자동 실행
        ['n', 'p', 'repeat'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.runComparison();
            });
        });
    }



    // 정규분포 PDF
    normalPDF(x, m, sigma) {
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
               Math.exp(-0.5 * Math.pow((x - m) / sigma, 2));
    }

    // 정규분포 근사 (단순화)
    normalApproximation(n, p, k) {
        const m = n * p;
        const q = 1 - p;
        const sigma = Math.sqrt(n * p * q);
        
        // 정규분포 PDF 값 사용 (간단한 근사)
        return this.normalPDF(k, m, sigma);
    }



    // 이항분포 시뮬레이션
    simulateBinomial(n, p, repeat) {
        const results = new Array(n + 1).fill(0);
        
        for (let i = 0; i < repeat; i++) {
            let successes = 0;
            for (let j = 0; j < n; j++) {
                if (Math.random() < p) {
                    successes++;
                }
            }
            results[successes]++;
        }
        
        // 확률로 변환
        return results.map(count => count / repeat);
    }

    // 비교 실행
    runComparison() {
        const n = parseInt(document.getElementById('n').value);
        const p = parseFloat(document.getElementById('p').value);
        const repeat = parseInt(document.getElementById('repeat').value);

        // 메타 정보 업데이트
        const m = n * p;
        const q = 1 - p;
        const sigma = Math.sqrt(n * p * q);
        document.getElementById('meta').innerHTML = `
            <strong>이항분포 B(${n}, ${p})</strong><br>
            기댓값: m = ${n} × ${p} = ${m.toFixed(2)}<br>
            표준편차: σ = √(${n} × ${p} × ${q.toFixed(3)}) = ${sigma.toFixed(3)}<br>
            정규근사: N(${m.toFixed(2)}, ${(sigma*sigma).toFixed(3)})<br>
            샘플 수: ${repeat.toLocaleString()}회
        `;

        // 데이터 생성
        const labels = Array.from({length: n + 1}, (_, i) => i);
        const simulatedData = this.simulateBinomial(n, p, repeat);
        const normalData = labels.map(k => this.normalApproximation(n, p, k));

        // 차트 업데이트
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = simulatedData;
        this.chart.data.datasets[1].data = normalData;
        
        this.chart.update();

        // 조건 확인
        const condition1 = n * p >= 5;
        const condition2 = n * (1 - p) >= 5;
        
        if (!condition1 || !condition2) {
            document.getElementById('meta').innerHTML += `
                <br><span style="color: orange;">⚠️ 주의: np = ${(n*p).toFixed(1)}, n(1-p) = ${(n*(1-p)).toFixed(1)}</span><br>
                <span style="color: orange;">정규근사 조건(np ≥ 5, n(1-p) ≥ 5)을 만족하지 않습니다.</span>
            `;
        }
    }

    // 차트 업데이트
    updateChart() {
        if (this.chart) {
            this.chart.update();
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const comparison = new BinormalComparison();
    // 초기 비교 실행
    setTimeout(() => {
        comparison.runComparison();
    }, 100);
});
