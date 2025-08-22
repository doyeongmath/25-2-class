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
                    },
                    {
                        label: '정확한 이항 PMF',
                        data: [],
                        type: 'line',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
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

        ['cc', 'showExact'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.runComparison();
            });
        });
    }

    // 이항분포 계산
    binomialPMF(n, p, k) {
        if (k < 0 || k > n) return 0;
        return this.combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    // 조합 계산
    combination(n, k) {
        if (k > n - k) k = n - k;
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    // 정규분포 PDF
    normalPDF(x, mu, sigma) {
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
               Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    }

    // 정규분포 근사 (연속성 보정 포함)
    normalApproximation(n, p, k, useContinuityCorrection = true) {
        const mu = n * p;
        const sigma = Math.sqrt(n * p * (1 - p));
        
        if (useContinuityCorrection) {
            // 연속성 보정: P(X = k) ≈ P(k-0.5 ≤ X ≤ k+0.5)
            const lower = this.normalCDF(k - 0.5, mu, sigma);
            const upper = this.normalCDF(k + 0.5, mu, sigma);
            return upper - lower;
        } else {
            // 연속성 보정 없음: 구간 [k-0.5, k+0.5]의 확률밀도를 근사적으로 사용
            return this.normalPDF(k, mu, sigma);
        }
    }

    // 정규분포 CDF (근사)
    normalCDF(x, mu, sigma) {
        return 0.5 * (1 + this.erf((x - mu) / (sigma * Math.sqrt(2))));
    }

    // 오차 함수 근사
    erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
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
        const useCC = document.getElementById('cc').checked;
        const showExact = document.getElementById('showExact').checked;

        // 메타 정보 업데이트
        const mu = n * p;
        const sigma = Math.sqrt(n * p * (1 - p));
        document.getElementById('meta').innerHTML = `
            <strong>이항분포 B(${n}, ${p})</strong><br>
            기댓값: μ = ${n} × ${p} = ${mu.toFixed(2)}<br>
            표준편차: σ = √(${n} × ${p} × ${(1-p).toFixed(3)}) = ${sigma.toFixed(3)}<br>
            정규근사: N(${mu.toFixed(2)}, ${sigma.toFixed(3)})<br>
            샘플 수: ${repeat.toLocaleString()}회
        `;

        // 데이터 생성
        const labels = Array.from({length: n + 1}, (_, i) => i);
        const simulatedData = this.simulateBinomial(n, p, repeat);
        const normalData = labels.map(k => this.normalApproximation(n, p, k, useCC));
        const exactData = labels.map(k => this.binomialPMF(n, p, k));

        // 차트 업데이트
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = simulatedData;
        this.chart.data.datasets[1].data = normalData;
        this.chart.data.datasets[2].data = showExact ? exactData : [];
        
        this.chart.data.datasets[2].hidden = !showExact;
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
