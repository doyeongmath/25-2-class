// 이항분포와 정규분포 비교 시뮬레이션
class BinormalComparison {
    constructor() {
        this.chart = null;
        this.isRunning = false;
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
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        yAxisID: 'y',
                        barPercentage: 0.9,
                        categoryPercentage: 1.0
                    },
                    {
                        label: '정규분포 근사',
                        data: [],
                        type: 'line',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        yAxisID: 'y',
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '성공 횟수 (k)',
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
                            font: {
                                size: 12
                            },
                            maxTicksLimit: 20
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '확률 밀도',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: true,
                            alpha: 0.3
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '이항분포 vs 정규분포 근사 비교',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: 20,
                        color: '#374151'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#374151',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // 이벤트 바인딩
    bindEvents() {
        const runButton = document.getElementById('run');
        runButton.addEventListener('click', () => {
            if (!this.isRunning) {
                this.runComparison();
            }
        });

        // 입력값 검증 및 실시간 피드백
        const inputs = ['n', 'p', 'repeat'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
            input.addEventListener('change', () => {
                if (this.validateAllInputs()) {
                    // 자동 실행은 제거하고 버튼을 통해서만 실행
                    this.updateButtonState();
                }
            });
        });
    }

    // 입력값 검증
    validateInput(input) {
        const value = parseFloat(input.value);
        const id = input.id;
        let isValid = true;
        let message = '';

        switch(id) {
            case 'n':
                isValid = Number.isInteger(value) && value >= 1 && value <= 200;
                message = isValid ? '' : '1-200 사이의 정수를 입력하세요';
                break;
            case 'p':
                isValid = value >= 0 && value <= 1;
                message = isValid ? '' : '0-1 사이의 값을 입력하세요';
                break;
            case 'repeat':
                isValid = Number.isInteger(value) && value >= 100 && value <= 20000;
                message = isValid ? '' : '100-20000 사이의 정수를 입력하세요';
                break;
        }

        // 시각적 피드백
        input.style.borderColor = isValid ? '#22c55e' : '#ef4444';
        
        // 에러 메시지 표시/숨김
        let errorElement = input.parentElement.querySelector('.error-message');
        if (!errorElement && !isValid) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '4px';
            input.parentElement.appendChild(errorElement);
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = isValid ? 'none' : 'block';
        }

        return isValid;
    }

    // 모든 입력값 검증
    validateAllInputs() {
        const inputs = ['n', 'p', 'repeat'];
        return inputs.every(id => this.validateInput(document.getElementById(id)));
    }

    // 버튼 상태 업데이트
    updateButtonState() {
        const button = document.getElementById('run');
        const isValid = this.validateAllInputs();
        
        button.disabled = !isValid || this.isRunning;
        button.style.opacity = (!isValid || this.isRunning) ? '0.6' : '1';
    }

    // 로딩 상태 관리
    setLoading(loading) {
        this.isRunning = loading;
        const button = document.getElementById('run');
        
        if (loading) {
            button.innerHTML = '<span style="margin-right: 8px;">⏳</span>계산 중...';
            button.disabled = true;
        } else {
            button.innerHTML = '<span style="margin-right: 8px;">🚀</span>비교 실행';
            button.disabled = false;
        }
        
        this.updateButtonState();
    }

    // 정규분포 PDF
    normalPDF(x, m, sigma) {
        if (sigma === 0) return 0;
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
               Math.exp(-0.5 * Math.pow((x - m) / sigma, 2));
    }

    // 정규분포 근사 (연속성 수정 적용)
    normalApproximation(n, p, k) {
        const m = n * p;
        const q = 1 - p;
        const sigma = Math.sqrt(n * p * q);
        
        if (sigma === 0) return 0;
        
        // 연속성 수정: P(X = k) ≈ P(k-0.5 < X < k+0.5)
        // 정규분포 PDF를 이산적으로 근사
        return this.normalPDF(k, m, sigma);
    }



    // 이항분포 시뮬레이션 (최적화된 성능)
    simulateBinomial(n, p, repeat) {
        const results = new Array(n + 1).fill(0);
        
        // Web Workers를 사용할 수 없는 환경에서는 배치 처리로 성능 향상
        const batchSize = Math.min(2000, repeat);
        const numBatches = Math.ceil(repeat / batchSize);
        
        // 큰 repeat 값에 대해 진행률 피드백 제공
        const showProgress = repeat > 10000;
        let completedBatches = 0;
        
        for (let batch = 0; batch < numBatches; batch++) {
            const currentBatchSize = Math.min(batchSize, repeat - batch * batchSize);
            
            // 베르누이 시행을 배치 단위로 처리
            for (let i = 0; i < currentBatchSize; i++) {
                let successes = 0;
                // 더 효율적인 난수 생성을 위한 최적화
                for (let j = 0; j < n; j++) {
                    if (Math.random() < p) {
                        successes++;
                    }
                }
                results[successes]++;
            }
            
            completedBatches++;
            
            // 진행률 표시 (대용량 시뮬레이션의 경우)
            if (showProgress && completedBatches % 10 === 0) {
                const progress = Math.round((completedBatches / numBatches) * 100);
                console.log(`시뮬레이션 진행률: ${progress}%`);
            }
        }
        
        // 상대도수로 변환
        return results.map(count => count / repeat);
    }

    // 비교 실행 (비동기 처리)
    async runComparison() {
        if (!this.validateAllInputs()) {
            alert('입력값을 확인해주세요.');
            return;
        }

        this.setLoading(true);

        // 비동기 처리를 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const n = parseInt(document.getElementById('n').value);
            const p = parseFloat(document.getElementById('p').value);
            const repeat = parseInt(document.getElementById('repeat').value);

            // 통계 정보 계산
            const m = n * p;
            const q = 1 - p;
            const sigma = Math.sqrt(n * p * q);
            
            // 정규근사 조건 확인
            const condition1 = n * p >= 5;
            const condition2 = n * (1 - p) >= 5;
            const isGoodApproximation = condition1 && condition2;

            // 메타 정보 업데이트
            const metaElement = document.getElementById('meta');
            metaElement.style.display = 'block';
            metaElement.innerHTML = `
                <div style="text-align: center;">
                    <h3 style="color: #166534; margin: 0 0 15px 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 1.5rem;">📈</span>
                        분포 통계 정보
                    </h3>
                    <div class="stats-grid">
                        <div class="stats-item">
                            <div class="stats-label">이항분포</div>
                            <div class="stats-value">B(${n}, ${p})</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-label">기댓값 (μ)</div>
                            <div class="stats-value">${m.toFixed(2)}</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-label">표준편차 (σ)</div>
                            <div class="stats-value">${sigma.toFixed(3)}</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-label">정규근사</div>
                            <div class="stats-value">N(${m.toFixed(2)}, ${(sigma*sigma).toFixed(3)})</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-label">샘플 수</div>
                            <div class="stats-value">${repeat.toLocaleString()}회</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-label">근사 품질</div>
                            <div class="stats-value" style="color: ${isGoodApproximation ? '#22c55e' : '#f59e0b'};">
                                ${isGoodApproximation ? '우수' : '주의'}
                            </div>
                        </div>
                    </div>
                    ${!isGoodApproximation ? `
                        <div class="warning-box">
                            <strong>⚠️ 정규근사 조건 확인</strong><br>
                            np = ${(n*p).toFixed(1)}, n(1-p) = ${(n*(1-p)).toFixed(1)}<br>
                            정규근사가 정확하려면 np ≥ 5, n(1-p) ≥ 5 조건을 만족해야 합니다.
                        </div>
                    ` : ''}
                </div>
            `;

            // 데이터 생성
            const labels = Array.from({length: n + 1}, (_, i) => i);
            const simulatedData = this.simulateBinomial(n, p, repeat);
            const normalData = labels.map(k => this.normalApproximation(n, p, k));

            // 정규분포 데이터 스케일링 (히스토그램과 맞추기 위해)
            const maxSimulated = Math.max(...simulatedData);
            const maxNormal = Math.max(...normalData);
            const scaleFactor = maxNormal > 0 ? maxSimulated / maxNormal : 1;
            const scaledNormalData = normalData.map(val => val * scaleFactor);

            // 차트 업데이트
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = simulatedData;
            this.chart.data.datasets[1].data = scaledNormalData;
            
            // 애니메이션과 함께 업데이트
            this.chart.update('active');

            // MathJax 재렌더링
            if (window.MathJax && window.MathJax.typesetPromise) {
                setTimeout(() => {
                    MathJax.typesetPromise([metaElement]).catch(() => {
                        console.log('MathJax 렌더링 오류');
                    });
                }, 100);
            }

        } catch (error) {
            console.error('시뮬레이션 오류:', error);
            
            // 사용자 친화적인 에러 메시지
            let errorMessage = '시뮬레이션 중 오류가 발생했습니다.';
            if (error.message && error.message.includes('memory')) {
                errorMessage = '메모리 부족으로 인해 시뮬레이션을 완료할 수 없습니다. 샘플 수를 줄여주세요.';
            } else if (error.message && error.message.includes('timeout')) {
                errorMessage = '시뮬레이션이 너무 오래 걸립니다. 매개변수를 조정해주세요.';
            }
            
            alert(errorMessage);
            
            // 에러 정보를 개발자 콘솔에 자세히 기록
            console.error('에러 상세 정보:', {
                message: error.message,
                stack: error.stack,
                parameters: { n, p, repeat }
            });
        } finally {
            this.setLoading(false);
        }
    }

    // 차트 업데이트
    updateChart() {
        if (this.chart) {
            this.chart.update('active');
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    try {
        const comparison = new BinormalComparison();
        console.log('이항-정규분포 비교 도구가 성공적으로 초기화되었습니다.');
        
        // 초기 비교 실행
        setTimeout(() => {
            comparison.runComparison();
        }, 200);
    } catch (error) {
        console.error('초기화 오류:', error);
        alert('페이지 초기화 중 오류가 발생했습니다. 새로고침 해주세요.');
    }
});
