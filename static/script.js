// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const videoTitle = document.getElementById('videoTitle');
const videoDescription = document.getElementById('videoDescription');
const recommendationReason = document.getElementById('recommendationReason');
const ideasGrid = document.getElementById('ideasGrid');

// Event Listeners
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeVideo();
    }
});

// Main Analysis Function
async function analyzeVideo() {
    const url = videoUrlInput.value.trim();

    // Validation
    if (!url) {
        showError('Vui lòng nhập URL video YouTube');
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        showError('URL không hợp lệ. Vui lòng nhập URL YouTube hợp lệ');
        return;
    }

    // Reset states
    hideError();
    hideResults();

    // Show loading
    showLoading();
    disableButton();

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Có lỗi xảy ra khi phân tích video');
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
        hideLoading();
        enableButton();
    }
}

// Display Results
function displayResults(data) {
    // Video Info
    videoTitle.textContent = data.video_title || 'Video YouTube';
    videoDescription.textContent = data.video_description || '';

    // Recommendation
    recommendationReason.textContent = data.recommendation_reason;

    // Ideas
    ideasGrid.innerHTML = '';
    data.ideas.forEach((idea, index) => {
        const isBest = index === data.best_idea_index;
        const ideaCard = createIdeaCard(idea, index + 1, isBest);
        ideasGrid.appendChild(ideaCard);
    });

    // Show results with animation
    showResults();

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Create Idea Card
function createIdeaCard(idea, number, isBest) {
    const card = document.createElement('div');
    card.className = 'idea-card' + (isBest ? ' best' : '');

    // Extract colors from color_scheme
    const colors = extractColors(idea.color_scheme);

    card.innerHTML = `
        ${isBest ? '<div class="best-label">⭐ BEST</div>' : ''}

        <div class="idea-number">${number}</div>

        <div class="idea-text" style="background: ${colors.background}; color: ${colors.text}">
            ${idea.text}
        </div>

        <div class="idea-details">
            <div class="detail-item">
                <div class="detail-label">🎨 Màu Sắc</div>
                <div class="detail-value">
                    <span class="color-preview" style="background: ${colors.background}"></span>
                    <span class="color-preview" style="background: ${colors.text}"></span>
                    ${idea.color_scheme}
                </div>
            </div>

            <div class="detail-item">
                <div class="detail-label">🔤 Font Chữ</div>
                <div class="detail-value">${idea.font_suggestion}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">💡 Mô Tả</div>
                <div class="detail-value">${idea.description}</div>
            </div>
        </div>

        <div class="ctr-score">
            <span class="score-label">CTR Score:</span>
            <div class="score-bar">
                <div class="score-fill" style="width: ${idea.ctr_score * 10}%"></div>
            </div>
            <span class="score-value">${idea.ctr_score}/10</span>
        </div>
    `;

    return card;
}

// Extract Colors from color_scheme string
function extractColors(colorScheme) {
    const bgMatch = colorScheme.match(/Background:\s*(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|\w+)/i);
    const textMatch = colorScheme.match(/Text:\s*(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|\w+)/i);

    return {
        background: bgMatch ? bgMatch[1] : '#667eea',
        text: textMatch ? textMatch[1] : '#ffffff'
    };
}

// Validation
function isValidYouTubeUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
        /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
        /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/
    ];

    return patterns.some(pattern => pattern.test(url));
}

// UI State Management
function showLoading() {
    loadingState.classList.remove('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');

    // Auto hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorState.classList.add('hidden');
}

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function disableButton() {
    analyzeBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
}

function enableButton() {
    analyzeBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
}

// Initialize
console.log('🎨 AI Thumbnail Maker - Ready!');
