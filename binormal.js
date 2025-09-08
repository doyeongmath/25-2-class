// 이항분포와 정규분포 비교 시뮬레이션 (연속성 보정 없음)
class BinormalComparison {
    constructor() {
        this.chart = null;
        this.initialChart = null;
        this.ex1Chart = null;
        this.pr1Chart = null;
        this.pr2Chart = null;
        this.isRunning = false;
        this.initChart();
        this.bindEvents();
        this.initMath();
    }

    // 수학 유틸리티 초기화
    initMath() {
        // logGamma (Lanczos Approximation)
        this.logGamma = function(z) {
            const g = 7;
            const p = [
                0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                771.32342877765313, -176.61502916214059, 12.507343278686905,
                -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
            ];
            if (z < 0.5) {
                return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - this.logGamma(1 - z);
            }
            z -= 1;
            let x = p[0];
            for (let i = 1; i < p.length; i++) x += p[i] / (z + i);
            const t = z + g + 0.5;
            return 0.5*Math.log(2*Math.PI) + (z + 0.5)*Math.log(t) - t + Math.log(x);
        };

        this.logChoose = function(n, k) {
            if (k < 0 || k > n) return -Infinity;
            return this.logGamma(n+1) - this.logGamma(k+1) - this.logGamma(n-k+1);
        };

        this.binomPMF = function(n, p, k) {
            if (k < 0 || k > n) return 0;
            const logp = this.logChoose(n,k) + k*Math.log(p) + (n-k)*Math.log(1-p);
            return Math.exp(logp);
        };

        // 표준정규 PDF/CDF (erf 근사)
        this.stdNormPDF = function(z) { 
            return Math.exp(-0.5*z*z) / Math.sqrt(2*Math.PI); 
        };

        this.erf = function(x) { // Abramowitz & Stegun 7.1.26
            const sign = x < 0 ? -1 : 1; 
            x = Math.abs(x);
            const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429;
            const p=0.3275911; 
            const t = 1/(1+p*x);
            const y = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
            return sign*y;
        };

        this.stdNormCDF = function(z) { 
            return 0.5*(1+this.erf(z/Math.SQRT2)); 
        };
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

        // 새로운 단계별 버튼들
        document.getElementById('btnInitialPMF').addEventListener('click', () => {
            this.drawInitialPMF();
        });

        document.getElementById('btnEx1Visual').addEventListener('click', () => {
            this.visualizeExample1();
        });

        document.getElementById('btnPr1Visual').addEventListener('click', () => {
            this.visualizeProblem1();
        });

        document.getElementById('btnPr2Visual').addEventListener('click', () => {
            this.visualizeProblem2();
        });

        // Reset with R key
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                this.resetCharts();
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

    // 새로운 메소드들 추가

    // 차트 리셋 기능
    resetCharts() {
        const charts = [this.initialChart, this.ex1Chart, this.pr1Chart, this.pr2Chart];
        const chartIds = ['initialChart', 'ex1Chart', 'pr1Chart', 'pr2Chart'];
        
        charts.forEach((chart, index) => {
            if (chart) {
                chart.destroy();
                this[Object.keys(this).find(key => this[key] === chart)] = null;
            }
            const canvas = document.getElementById(chartIds[index]);
            if (canvas) {
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            }
        });
        
        // 결과 텍스트 리셋
        ['ex1Result', 'pr1Result', 'pr2Result'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<p>버튼을 눌러 계산해보세요!</p>';
            }
        });
    }

    // 1단계: 초기 PMF 그리기 (n=15,30,50, p=1/3)
    drawInitialPMF() {
        const p = 1/3;
        const ns = [15, 30, 50];
        const datasets = ns.map((n, idx) => {
            const x = Array.from({length:n+1}, (_,k)=>k);
            const y = x.map(k => this.binomPMF(n,p,k));
            const colors = ['#3b82f6', '#22c55e', '#ef4444'];
            return { 
                label:`n=${n}`, 
                data:y, 
                borderColor: colors[idx],
                backgroundColor: colors[idx] + '30',
                borderWidth:3, 
                pointRadius:2,
                pointHoverRadius:5,
                fill: false
            };
        });

        if (this.initialChart) this.initialChart.destroy();
        this.initialChart = new Chart(document.getElementById('initialChart'), {
            type:'line',
            data:{ labels: Array.from({length:51},(_,k)=>k), datasets },
            options:{
                responsive:true,
                maintainAspectRatio: false,
                interaction:{ mode:'nearest', intersect:false },
                plugins:{ 
                    legend:{ 
                        labels:{ color:'#374151', font: { size: 14, weight: 'bold' } },
                        position: 'top'
                    },
                    title: { 
                        display: true, 
                        text: 'B(n, 1/3) - n값 변화에 따른 분포 모양', 
                        color: '#374151',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales:{
                    x:{ 
                        title:{ display:true, text:'성공 횟수 (k)', color:'#374151', font: { size: 14, weight: 'bold' } }, 
                        ticks:{ color:'#6b7280', font: { size: 12 } }, 
                        grid:{ color:'#e5e7eb' } 
                    },
                    y:{ 
                        title:{ display:true, text:'확률 P(X=k)', color:'#374151', font: { size: 14, weight: 'bold' } }, 
                        ticks:{ color:'#6b7280', font: { size: 12 } }, 
                        grid:{ color:'#e5e7eb' } 
                    }
                }
            }
        });
    }

    // ② 시뮬레이션 (p=1/2) + 정규근사(무 CC)
    simulateHeads(n, m) {
        const counts = Array(n+1).fill(0);
        for (let i=0;i<m;i++) {
            let h=0; 
            for (let j=0;j<n;j++) h += Math.random()<0.5 ? 1 : 0;
            counts[h]++;
        }
        return counts;
    }

    runSimulation() {
        const n = parseInt(document.getElementById('simN').value, 10);
        const m = parseInt(document.getElementById('simM').value, 10);
        const counts = this.simulateHeads(n,m);

        // 정규근사(무 CC), 도수 스케일
        const mu = n*0.5, sigma = Math.sqrt(n*0.25);
        const x = Array.from({length:n+1}, (_,k)=>k);
        const yNorm = x.map(k => this.stdNormPDF((k - mu)/sigma) * (1/sigma) * m);

        if (this.simChart) this.simChart.destroy();
        this.simChart = new Chart(document.getElementById('simChart'), {
            data:{
                labels:x,
                datasets:[
                    { 
                        type:'bar', 
                        label:'도수', 
                        data:counts,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)'
                    },
                    { 
                        type:'line', 
                        label:'정규근사(무 CC, m 스케일)', 
                        data:yNorm, 
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth:2, 
                        pointRadius:0,
                        fill: false
                    }
                ]
            },
            options:{
                responsive:true,
                maintainAspectRatio: false,
                plugins:{ 
                    legend:{ labels:{ color:'#374151', font: { size: 10 } } },
                    title: { display: true, text: `동전 ${n}번 던지기 (${m}회 시행)`, color: '#374151', font: { size: 12 } }
                },
                scales:{
                    x:{ title:{ display:true, text:'앞면 횟수', color:'#374151' }, ticks:{ color:'#6b7280' }, grid:{ color:'#e5e7eb' } },
                    y:{ title:{ display:true, text:'도수', color:'#374151' }, ticks:{ color:'#6b7280' }, grid:{ color:'#e5e7eb' } }
                }
            }
        });
    }

    // ③ 정확값 vs 정규근사(무 CC) 계산 메소드들
    binomIntervalProb(n,p,a,b) {
        let s=0; 
        for (let k=a;k<=b;k++) s += this.binomPMF(n,p,k); 
        return s;
    }

    binomLE(n,p,k) { 
        return this.binomIntervalProb(n,p,0,k); 
    }

    addRow(label, exact, approx) {
        const tr = document.createElement('tr');
        const err = approx - exact;
        tr.innerHTML = `
            <td style="padding: 6px; border: 1px solid #e5e7eb;">${label}</td>
            <td style="padding: 6px; border: 1px solid #e5e7eb; text-align: right;">${exact.toFixed(6)}</td>
            <td style="padding: 6px; border: 1px solid #e5e7eb; text-align: right;">${approx.toFixed(6)}</td>
            <td style="padding: 6px; border: 1px solid #e5e7eb; text-align: right; color: ${Math.abs(err)>0.02? '#ef4444':'#22c55e'};">${err.toExponential(3)}</td>
        `;
        document.getElementById('resultBody').appendChild(tr);
    }

    // 예제1: Bin(72,1/3), P(26≤X≤34)
    calculateExample1() {
        const n=72, p=1/3, a=26, b=34;
        const exact = this.binomIntervalProb(n,p,a,b);
        const mu=n*p, sigma=Math.sqrt(n*p*(1-p));
        const approx = this.stdNormCDF((b - mu)/sigma) - this.stdNormCDF((a - mu)/sigma);
        this.addRow(`Bin(${n},1/3), P(${a}≤X≤${b})`, exact, approx);
    }

    // 문제1: Bin(100,1/2), P(45≤X≤54)
    calculateProblem1() {
        const n=100, p=1/2, a=45, b=54;
        const exact = this.binomIntervalProb(n,p,a,b);
        const mu=n*p, sigma=Math.sqrt(n*p*(1-p));
        const approx = this.stdNormCDF((b - mu)/sigma) - this.stdNormCDF((a - mu)/sigma);
        this.addRow(`Bin(${n},1/2), P(${a}≤X≤${b})`, exact, approx);
    }

    // 문제2: Bin(400,0.1), P(X≥33) = 1 - P(X≤32)
    calculateProblem2() {
        const n=400, p=0.1, k=32;
        const exact = 1 - this.binomLE(n,p,k);
        const mu=n*p, sigma=Math.sqrt(n*p*(1-p));
        const approx = 1 - this.stdNormCDF((k - mu)/sigma);
        this.addRow(`Bin(${n},0.1), P(X≥${k+1})`, exact, approx);
    }

    // 예제 1 시각화
    visualizeExample1() {
        const n=72, p=1/3, a=26, b=35;
        const mu=n*p, sigma=Math.sqrt(n*p*(1-p));
        
        // 이항분포 PMF 계산
        const x = Array.from({length: n+1}, (_, k) => k);
        const binomData = x.map(k => this.binomPMF(n, p, k));
        
        // 정규분포 근사 계산
        const normalData = x.map(k => this.stdNormPDF((k - mu)/sigma) / sigma);
        
        // 구간 [a,b] 표시를 위한 색상 데이터
        const barColors = x.map(k => 
            k >= a && k <= b ? 'rgba(34, 197, 94, 0.8)' : 'rgba(59, 130, 246, 0.3)'
        );

        if (this.ex1Chart) this.ex1Chart.destroy();
        this.ex1Chart = new Chart(document.getElementById('ex1Chart'), {
            type: 'bar',
            data: {
                labels: x,
                datasets: [
                    {
                        label: '이항분포 B(72, 1/3)',
                        data: binomData,
                        backgroundColor: barColors,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '정규분포 근사',
                        data: normalData,
                        type: 'line',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '예제 1: B(72, 1/3)에서 P(26 ≤ X ≤ 35)',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        labels: { font: { size: 12 } }
                    }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'k', font: { weight: 'bold' } },
                        ticks: { maxTicksLimit: 15 }
                    },
                    y: { 
                        title: { display: true, text: '확률', font: { weight: 'bold' } }
                    }
                }
            }
        });

        // 계산 결과 표시
        const exact = this.binomIntervalProb(n, p, a, b);
        const approx = this.stdNormCDF((b - mu)/sigma) - this.stdNormCDF((a - mu)/sigma);
        const error = Math.abs(approx - exact);
        
        document.getElementById('ex1Result').innerHTML = `
            <div style="display: grid; gap: 15px;">
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; font-size: 0.9rem; color: #166534; font-weight: 600;">이항분포 정확값</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: #22c55e;">P(26 ≤ X ≤ 35) = ${exact.toFixed(6)}</p>
                </div>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1e40af; font-weight: 600;">정규분포 근사값</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: #3b82f6;">P(26 ≤ X ≤ 35) ≈ ${approx.toFixed(6)}</p>
                </div>
                <div style="background: ${error < 0.01 ? '#f0fdf4' : '#fef3c7'}; padding: 15px; border-radius: 8px; border-left: 4px solid ${error < 0.01 ? '#22c55e' : '#f59e0b'};">
                    <p style="margin: 0; font-size: 0.9rem; color: ${error < 0.01 ? '#166534' : '#92400e'}; font-weight: 600;">절대 오차</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: ${error < 0.01 ? '#22c55e' : '#f59e0b'};">${error.toFixed(6)} (${(error*100).toFixed(4)}%)</p>
                </div>
            </div>
        `;
    }

    // 문제 1 시각화
    visualizeProblem1() {
        const n=100, p=1/2, a=45, b=55;
        const mu=n*p, sigma=Math.sqrt(n*p*(1-p));
        
        const x = Array.from({length: n+1}, (_, k) => k);
        const binomData = x.map(k => this.binomPMF(n, p, k));
        const normalData = x.map(k => this.stdNormPDF((k - mu)/sigma) / sigma);
        
        const barColors = x.map(k => 
            k >= a && k <= b ? 'rgba(34, 197, 94, 0.8)' : 'rgba(59, 130, 246, 0.3)'
        );

        if (this.pr1Chart) this.pr1Chart.destroy();
        this.pr1Chart = new Chart(document.getElementById('pr1Chart'), {
            type: 'bar',
            data: {
                labels: x,
                datasets: [
                    {
                        label: '이항분포 B(100, 1/2)',
                        data: binomData,
                        backgroundColor: barColors,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '정규분포 근사',
                        data: normalData,
                        type: 'line',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '문제 1: B(100, 1/2)에서 P(45 ≤ X ≤ 55)',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        labels: { font: { size: 12 } }
                    }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'k', font: { weight: 'bold' } },
                        ticks: { maxTicksLimit: 20 }
                    },
                    y: { 
                        title: { display: true, text: '확률', font: { weight: 'bold' } }
                    }
                }
            }
        });

        const exact = this.binomIntervalProb(n, p, a, b);
        const approx = this.stdNormCDF((b - mu)/sigma) - this.stdNormCDF((a - mu)/sigma);
        const error = Math.abs(approx - exact);
        
        document.getElementById('pr1Result').innerHTML = `
            <div style="display: grid; gap: 15px;">
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; font-size: 0.9rem; color: #166534; font-weight: 600;">이항분포 정확값</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: #22c55e;">P(45 ≤ X ≤ 55) = ${exact.toFixed(6)}</p>
                </div>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1e40af; font-weight: 600;">정규분포 근사값</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: #3b82f6;">P(45 ≤ X ≤ 55) ≈ ${approx.toFixed(6)}</p>
                </div>
                <div style="background: ${error < 0.01 ? '#f0fdf4' : '#fef3c7'}; padding: 15px; border-radius: 8px; border-left: 4px solid ${error < 0.01 ? '#22c55e' : '#f59e0b'};">
                    <p style="margin: 0; font-size: 0.9rem; color: ${error < 0.01 ? '#166534' : '#92400e'}; font-weight: 600;">절대 오차</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: ${error < 0.01 ? '#22c55e' : '#f59e0b'};">${error.toFixed(6)} (${(error*100).toFixed(4)}%)</p>
                </div>
            </div>
        `;
    }

    // 문제 2 시각화
    visualizeProblem2() {
        const n=400, p=0.1, threshold=34;
        const mu=n*p, sigma=Math.sqrt(n*p*(1-p));
        
        // 관심 구간만 표시 (20~60 정도)
        const startK = Math.max(0, Math.floor(mu - 4*sigma));
        const endK = Math.min(n, Math.ceil(mu + 4*sigma));
        const x = Array.from({length: endK - startK + 1}, (_, i) => startK + i);
        
        const binomData = x.map(k => this.binomPMF(n, p, k));
        const normalData = x.map(k => this.stdNormPDF((k - mu)/sigma) / sigma);
        
        const barColors = x.map(k => 
            k >= threshold ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.3)'
        );

        if (this.pr2Chart) this.pr2Chart.destroy();
        this.pr2Chart = new Chart(document.getElementById('pr2Chart'), {
            type: 'bar',
            data: {
                labels: x,
                datasets: [
                    {
                        label: '이항분포 B(400, 0.1)',
                        data: binomData,
                        backgroundColor: barColors,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '정규분포 근사',
                        data: normalData,
                        type: 'line',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '문제 2: B(400, 0.1)에서 P(X ≥ 34)',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        labels: { font: { size: 12 } }
                    }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'k', font: { weight: 'bold' } },
                        ticks: { maxTicksLimit: 15 }
                    },
                    y: { 
                        title: { display: true, text: '확률', font: { weight: 'bold' } }
                    }
                }
            }
        });

        const exact = 1 - this.binomLE(n, p, threshold - 1);
        const approx = 1 - this.stdNormCDF((threshold - mu)/sigma);
        const error = Math.abs(approx - exact);
        
        document.getElementById('pr2Result').innerHTML = `
            <div style="display: grid; gap: 15px;">
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; font-size: 0.9rem; color: #166534; font-weight: 600;">이항분포 정확값</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: #22c55e;">P(X ≥ 34) = ${exact.toFixed(6)}</p>
                </div>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 0.9rem; color: #dc2626; font-weight: 600;">정규분포 근사값</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: #ef4444;">P(X ≥ 34) ≈ ${approx.toFixed(6)}</p>
                </div>
                <div style="background: ${error < 0.01 ? '#f0fdf4' : '#fef3c7'}; padding: 15px; border-radius: 8px; border-left: 4px solid ${error < 0.01 ? '#22c55e' : '#f59e0b'};">
                    <p style="margin: 0; font-size: 0.9rem; color: ${error < 0.01 ? '#166534' : '#92400e'}; font-weight: 600;">절대 오차</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 700; color: ${error < 0.01 ? '#22c55e' : '#f59e0b'};">${error.toFixed(6)} (${(error*100).toFixed(4)}%)</p>
                </div>
            </div>
        `;
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
