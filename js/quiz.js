/* ===== QUIZ.JS ===== */

let quizData = [], currentQuestion = 0, score = 0, quizAnswered = false, quizIsRetry = false;

function initQuiz() {
  document.getElementById('takeQuizBtn').addEventListener('click', openQuiz);
  document.getElementById('quizModalClose').addEventListener('click', () => closeModal('quizModal'));
}

function loadQuizPreview(content) {
  if (!content?.quiz?.length) return;
  const el = document.getElementById('quizFirstQ');
  if (el) el.textContent = '1. ' + content.quiz[0].question;
  if (AppState.quizDoneToday) {
    const badge = document.getElementById('quizScoreBadge');
    if (badge) badge.textContent = t('quiz_already');
  }
}

function openQuiz() {
  const content = AppState.dailyContent;
  if (!content?.quiz) return;
  quizData = content.quiz;
  currentQuestion = 0; score = 0; quizAnswered = false;
  quizIsRetry = AppState.quizDoneToday;
  showModal('quizModal');
  renderQuestion();
}

function renderQuestion() {
  const body = document.getElementById('quizModalBody');
  if (currentQuestion >= quizData.length) { renderResults(body); return; }
  const q = quizData[currentQuestion];
  const progress = (currentQuestion / quizData.length) * 100;
  body.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
      <div class="quiz-counter">${currentQuestion + 1} / ${quizData.length}</div>
      <p class="quiz-question-text">${escHtml(q.question)}</p>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-option" data-index="${i}" onclick="selectAnswer(${i})">${escHtml(opt)}</button>`).join('')}
      </div>
      <div class="quiz-feedback" id="quizFeedback" style="display:none;"></div>
      <button class="quiz-next-btn" id="quizNextBtn" style="display:none;" onclick="nextQuestion()">
        ${currentQuestion + 1 < quizData.length ? t('next_q') : t('finish')}
      </button>
    </div>`;
}

function selectAnswer(index) {
  if (quizAnswered) return;
  quizAnswered = true;
  const q = quizData[currentQuestion];
  const options = document.querySelectorAll('.quiz-option');
  const feedback = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');
  options.forEach(b => b.disabled = true);
  if (index === q.answer) {
    options[index].classList.add('correct');
    feedback.className = 'quiz-feedback correct';
    feedback.textContent = t('quiz_correct');
    score++;
  } else {
    options[index].classList.add('wrong');
    options[q.answer].classList.add('correct');
    feedback.className = 'quiz-feedback wrong';
    feedback.textContent = `${t('quiz_wrong')} "${escHtml(q.options[q.answer])}"`;
  }
  feedback.style.display = 'block';
  nextBtn.style.display = 'block';
  nextBtn.textContent = currentQuestion + 1 < quizData.length ? t('next_q') : t('finish');
}

function nextQuestion() {
  currentQuestion++;
  quizAnswered = false;
  renderQuestion();
}

function renderResults(body) {
  const total = quizData.length;
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '😔';
  let pointsMsg = '';
  if (!quizIsRetry) {
    AppState.addPoints(score);
    AppState.markQuizDone();
    pointsMsg = `<div class="points-earned">+${score} ${t('points_earned_quiz')}</div>`;
    const badge = document.getElementById('quizScoreBadge');
    if (badge) badge.textContent = t('quiz_already');
    updatePointsDisplay();
    showToast(`+${score} 🪙`, 'gold');
  }
  body.innerHTML = `
    <div class="quiz-results">
      <span class="score-emoji">${emoji}</span>
      <div class="score-text">${t('results_title')}</div>
      <div class="score-detail">${t('score_label')}: ${score}/${total} (${pct}%)</div>
      ${pointsMsg}
      <button class="quiz-next-btn" onclick="retryQuiz()" style="background:#888;margin-top:10px;">${t('try_again')}</button>
      <button class="quiz-next-btn" onclick="closeModal('quizModal')" style="margin-top:10px;">${t('done')}</button>
    </div>`;
}

function retryQuiz() {
  quizIsRetry = true; currentQuestion = 0; score = 0; quizAnswered = false;
  renderQuestion();
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
