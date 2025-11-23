// State
let selectedFile = null;

// Tab Switching
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-button').classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tab === 'youtube') {
        document.getElementById('youtubeTab').classList.add('active');
    } else if (tab === 'tiktok') {
        document.getElementById('tiktokTab').classList.add('active');
    } else if (tab === 'image') {
        document.getElementById('imageTab').classList.add('active');
    }

    // Hide results when switching tabs
    hideResults();
    hideError();
}

// YouTube Analysis
const youtubeUrlInput = document.getElementById('youtubeUrl');
youtubeUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeYouTube();
});

async function analyzeYouTube() {
    const url = youtubeUrlInput.value.trim();

    if (!url) {
        showError('Vui lòng nhập URL video YouTube');
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        showError('URL không hợp lệ. Vui lòng nhập URL YouTube hợp lệ');
        return;
    }

    await analyzeVideo(url, '/api/analyze', 'analyzeYouTubeBtn', 'btnTextYT', 'btnLoaderYT');
}

// TikTok Analysis
const tiktokUrlInput = document.getElementById('tiktokUrl');
tiktokUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeTikTok();
});

async function analyzeTikTok() {
    const url = tiktokUrlInput.value.trim();

    if (!url) {
        showError('Vui lòng nhập URL video TikTok');
        return;
    }

    if (!isValidTikTokUrl(url)) {
        showError('URL không hợp lệ. Vui lòng nhập URL TikTok hợp lệ');
        return;
    }

    await analyzeVideo(url, '/api/analyze-tiktok', 'analyzeTikTokBtn', 'btnTextTT', 'btnLoaderTT');
}

// Generic Video Analysis
async function analyzeVideo(url, endpoint, btnId, textId, loaderId) {
    hideError();
    hideResults();
    showLoading();
    disableButton(btnId, textId, loaderId);

    try {
        const response = await fetch(endpoint, {
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
        enableButton(btnId, textId, loaderId);
    }
}

// Image Upload
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const analyzeImageBtn = document.getElementById('analyzeImageBtn');

// Click to upload
uploadArea.addEventListener('click', () => {
    imageInput.click();
});

// File input change
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
    } else {
        showError('Vui lòng chọn file ảnh hợp lệ');
    }
});

function handleImageFile(file) {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh < 10MB');
        return;
    }

    selectedFile = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.classList.add('hidden');
        imagePreview.classList.remove('hidden');
        analyzeImageBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedFile = null;
    imageInput.value = '';
    previewImg.src = '';
    uploadArea.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    analyzeImageBtn.disabled = true;
    hideResults();
}

async function analyzeImage() {
    if (!selectedFile) {
        showError('Vui lòng chọn ảnh để phân tích');
        return;
    }

    hideError();
    hideResults();
    showLoading();
    disableButton('analyzeImageBtn', 'btnTextImg', 'btnLoaderImg');

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Có lỗi xảy ra khi phân tích ảnh');
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
        hideLoading();
        enableButton('analyzeImageBtn', 'btnTextImg', 'btnLoaderImg');
    }
}

// Display Results
function displayResults(data) {
    const videoTitle = document.getElementById('videoTitle');
    const videoDescription = document.getElementById('videoDescription');
    const recommendationReason = document.getElementById('recommendationReason');
    const ideasGrid = document.getElementById('ideasGrid');

    // Video/Image Info
    videoTitle.textContent = data.video_title || 'Thumbnail Ideas';
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

    // Show results
    showResults();

    // Scroll to results
    setTimeout(() => {
        document.getElementById('resultsSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
}

// Create Idea Card
function createIdeaCard(idea, number, isBest) {
    const card = document.createElement('div');
    card.className = 'idea-card' + (isBest ? ' best' : '');

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

// Extract Colors
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

function isValidTikTokUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
        /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
}

// UI State Management
function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorState = document.getElementById('errorState');

    errorMessage.textContent = message;
    errorState.classList.remove('hidden');

    setTimeout(() => hideError(), 5000);
}

function hideError() {
    document.getElementById('errorState').classList.add('hidden');
}

function showResults() {
    document.getElementById('resultsSection').classList.remove('hidden');
}

function hideResults() {
    document.getElementById('resultsSection').classList.add('hidden');
}

function disableButton(btnId, textId, loaderId) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const loader = document.getElementById(loaderId);

    btn.disabled = true;
    text.classList.add('hidden');
    loader.classList.remove('hidden');
}

function enableButton(btnId, textId, loaderId) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const loader = document.getElementById(loaderId);

    btn.disabled = false;
    text.classList.remove('hidden');
    loader.classList.add('hidden');
}

// Initialize
console.log('🎨 AI Thumbnail Maker - Ready!');
console.log('✅ YouTube Support');
console.log('✅ TikTok Support');
console.log('✅ Image Analysis Support');
