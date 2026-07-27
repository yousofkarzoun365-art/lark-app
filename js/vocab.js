/* ===== VOCAB.JS ===== */

function initVocab() {
  document.getElementById('addVocabBtn').addEventListener('click', () => showModal('addVocabModal'));
  document.getElementById('addVocabModalClose').addEventListener('click', () => closeModal('addVocabModal'));
  document.getElementById('submitNewWord').addEventListener('click', handleAddWord);
  document.getElementById('newWordInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleAddWord(); });
}

function renderVocabList() {
  const list = document.getElementById('vocabList');
  const empty = document.getElementById('vocabEmpty');
  list.querySelectorAll('.vocab-item').forEach(el => el.remove());

  if (!AppState.vocab?.length) {
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  AppState.vocab.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'vocab-item';
    div.innerHTML = `
      <div class="vocab-item-left">
        <div class="vocab-word">${escHtml(item.word)}</div>
        ${item.phonetic ? `<div class="vocab-phonetic">${escHtml(item.phonetic)}</div>` : ''}
        ${item.translation ? `<div class="vocab-translation">${escHtml(item.translation)}</div>` : ''}
      </div>
      <button class="vocab-delete" onclick="deleteVocabItem(${i})">🗑️</button>`;
    list.appendChild(div);
  });

  const wordsEl = document.getElementById('wordsLearned');
  if (wordsEl) wordsEl.textContent = AppState.vocab.length;
}

async function handleAddWord() {
  const input = document.getElementById('newWordInput');
  const word = input.value.trim();
  if (!word) return;

  const btn = document.getElementById('submitNewWord');
  const resultDiv = document.getElementById('vocabAiResult');
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;

  try {
    const result = await translateWord(word);
    resultDiv.style.display = 'block';
    document.getElementById('vocabWordResult').textContent = word;
    document.getElementById('vocabPhonetic').textContent = result.phonetic || '';
    document.getElementById('vocabTranslation').textContent = result.translation || '';

    if (!AppState.vocab) AppState.vocab = [];
    AppState.vocab.unshift({ word, phonetic: result.phonetic || '', translation: result.translation || '', addedAt: new Date().toISOString() });
    AppState.save();
    renderVocabList();

    setTimeout(() => {
      input.value = '';
      resultDiv.style.display = 'none';
      closeModal('addVocabModal');
      showToast('✅ Word added!', 'success');
    }, 1400);
  } catch {
    showToast('Failed to add word', '');
  } finally {
    btn.textContent = t('add_word_btn');
    btn.disabled = false;
  }
}

function deleteVocabItem(index) {
  AppState.vocab.splice(index, 1);
  AppState.save();
  renderVocabList();
}
