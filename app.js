// Initialize Lucide icons
lucide.createIcons();

// Elements
const sourceLang = document.getElementById('source-lang');
const targetLang = document.getElementById('target-lang');
const sourceText = document.getElementById('source-text');
const targetText = document.getElementById('target-text');
const swapBtn = document.getElementById('swap-btn');
const translateBtn = document.getElementById('translate-btn');
const copyBtn = document.getElementById('copy-btn');
const charCount = document.getElementById('char-count');
const btnText = translateBtn.querySelector('.btn-text');
const spinner = translateBtn.querySelector('.spinner');

// Settings modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const saveSettings = document.getElementById('save-settings');
const apiKeyInput = document.getElementById('api-key');
const toast = document.getElementById('toast');

const DEFAULT_GROQ_KEY = '';

// Load API key
let apiKey = localStorage.getItem('groq_api_key') || DEFAULT_GROQ_KEY;
apiKeyInput.value = apiKey;

// Event Listeners
sourceText.addEventListener('input', updateCharCount);
swapBtn.addEventListener('click', swapLanguages);
translateBtn.addEventListener('click', handleTranslate);
copyBtn.addEventListener('click', copyTranslation);

// Settings Events
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
saveSettings.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('groq_api_key', apiKey);
        settingsModal.classList.add('hidden');
        showToast('API Key saved successfully');
    }
});
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.add('hidden');
});

function updateCharCount() {
    const count = sourceText.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

function swapLanguages() {
    if (sourceLang.value === 'auto') {
        showToast('Cannot swap when source is Auto-detect');
        return;
    }