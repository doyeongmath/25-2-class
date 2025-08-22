// 간단한 테스트 그래프 그리기
function drawSimpleTestChart() {
  const ctx = document.getElementById('theoryChart');
  if (!ctx) {
    console.error('theoryChart canvas를 찾을 수 없음');
    return;
  }
  
  console.log('테스트 그래프 그리기 시작');
  
  // 기존 차트가 있으면 제거
  if (window.theoryChart) {
    window.theoryChart.destroy();
  }
  
  window.theoryChart = new Chart(ctx, {

->

// 간단한 테스트 그래프 그리기
function drawSimpleTestChart() {
  const ctx = document.getElementById('theoryChart');
  if (!ctx) {
    console.error('theoryChart canvas를 찾을 수 없음');
    return;
  }
  
  console.log('테스트 그래프 그리기 시작');
  
  // 기존 차트가 있으면 제거 (안전하게)
  if (window.theoryChart && typeof window.theoryChart.destroy === 'function') {
    try {
      window.theoryChart.destroy();
    } catch (error) {
      console.log('기존 차트 제거 중 오류:', error);
    }
  }
  
  window.theoryChart = new Chart(ctx, {
