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

    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;

    const tempText = sourceText.value;
    sourceText.value = targetText.textContent;
    targetText.textContent = tempText;

    updateCharCount();
}

async function handleTranslate() {
    const text = sourceText.value.trim();
    if (!text) {
        showToast('Please enter text to translate');
        return;
    }

    const effectiveKey = apiKey || DEFAULT_GROQ_KEY;
    const sLang = sourceLang.options[sourceLang.selectedIndex].text;
    const tLang = targetLang.options[targetLang.selectedIndex].text;

    setLoading(true);
    targetText.textContent = ''; // clear

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveKey}`
            },
            body: JSON.stringify({
                model: 'qwen/qwen3.8-27b',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator. Translate the following text from ${sLang} to ${tLang}. Provide only the translation, no explanations. If source is Auto-detect, identify the language first.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Translation failed');
        }

        const data = await response.json();
        targetText.textContent = data.choices[0].message.content.trim();
        
    } catch (error) {
        showToast(`Error: ${error.message}`);
        targetText.textContent = 'Translation error occurred.';
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        translateBtn.disabled = true;
        btnText.textContent = 'Translating...';
        spinner.classList.remove('hidden');
    } else {
        translateBtn.disabled = false;
        btnText.textContent = 'Translate';
        spinner.classList.add('hidden');
    }
}

function copyTranslation() {
    const text = targetText.textContent;
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Translation copied to clipboard');
    }).catch(err => {
        showToast('Failed to copy');
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Keyboard shortcuts: Escape to dismiss dialogs
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) modal.classList.add('hidden');
    }
});
