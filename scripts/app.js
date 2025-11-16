// Use strict mode for safer JS
'use strict';

class BrainVisionApp {
    constructor() {
        // Application state
        this.currentLanguage = 'en';   // default language
        this.currentTheme = 'dark';    // default theme
        this.currentImage = null;      // data URL
        this.isProcessing = false;
        this.model = null;
        this.currentResults = null;

        // DOM references cached when available
        this.dom = {
            langToggle: null,
            themeToggle: null,
            fileInput: null,
            dropZone: null,
            imagePreview: null,
            uploadProgress: null,
            progressFill: null,
            progressPercent: null,
            resultsSection: null,
            resultsContent: null
        };

        // Initialize after DOM ready
        this._onDomReady(() => this.init());
    }

    // Initialization

    init() {
        // Cache DOM elements
        this._cacheDom();

        // Load preferences (localStorage) with defaults: en / dark
        this.loadPreferences();

        // Bind event handlers (single registration)
        this.bindEvents();

        // Attempt to warm-up model loader if present
        this._warmUpModelLoader();
    }

    _cacheDom() {
        this.dom.langToggle = document.getElementById('langToggle');
        this.dom.themeToggle = document.getElementById('themeToggle');
        this.dom.fileInput = document.getElementById('fileInput');
        this.dom.dropZone = document.getElementById('dropZone');
        this.dom.imagePreview = document.getElementById('imagePreview');
        this.dom.uploadProgress = document.getElementById('uploadProgress');
        this.dom.progressFill = document.getElementById('progressFill');
        this.dom.progressPercent = document.getElementById('progressPercent');
        this.dom.resultsSection = document.getElementById('resultsSection');
        this.dom.resultsContent = document.getElementById('resultsContent');
    }

    _onDomReady(cb) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cb, { once: true });
        } else {
            cb();
        }
    }

    // Preferences (language & theme)

    loadPreferences() {
        // Load language with default 'en'
        const savedLang = localStorage.getItem('brainvision-language');
        this.currentLanguage = savedLang || 'en';
        this.applyLanguage(this.currentLanguage, { persist: false });

        // Load theme with default 'dark'
        const savedTheme = localStorage.getItem('brainvision-theme');
        this.currentTheme = savedTheme || 'dark';
        this.applyTheme(this.currentTheme, { persist: false });
    }

    applyLanguage(lang, { persist = true } = {}) {
        // Toggle display for language-specific elements
        document.querySelectorAll('.persian, .english').forEach(el => {
            el.style.display = 'none';
        });

        const selector = lang === 'fa' ? '.persian' : '.english';
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'inline';
        });

        // Update document attributes
        document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';
        document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

        this.currentLanguage = lang;
        if (persist) localStorage.setItem('brainvision-language', lang);

        // Update language button label if exists
        this._updateLangToggleLabel();

        // If results already present, re-render them in the new language
        if (this.currentResults) this.displayResults(this.currentResults);
    }

    toggleLanguage() {
        const next = this.currentLanguage === 'fa' ? 'en' : 'fa';
        this.applyLanguage(next);
    }

    _updateLangToggleLabel() {
        const btn = this.dom.langToggle;
        if (!btn) return;

        // Expect two child spans: .persian and .english - toggle visibility handled above
        // Ensure the small label inside matches opposite language abbreviation
        const pers = btn.querySelector('.persian');
        const eng = btn.querySelector('.english');

        if (this.currentLanguage === 'fa') {
            if (pers) pers.textContent = 'EN';
            if (eng) eng.textContent = 'FA';
        } else {
            if (pers) pers.textContent = 'EN';
            if (eng) eng.textContent = 'FA';
        }
    }

    applyTheme(theme, { persist = true } = {}) {
        // Apply theme class to body (light-theme / dark-theme)
        document.body.className = `${theme}-theme`;
        this.currentTheme = theme;
        if (persist) localStorage.setItem('brainvision-theme', theme);

        // Update theme toggle icon/text
        this._updateThemeToggle();
    }

    toggleTheme() {
        const next = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
    }

    _updateThemeToggle() {
        const btn = this.dom.themeToggle;
        if (!btn) return;

        const icon = btn.querySelector('i');
        const pers = btn.querySelector('.persian');
        const eng = btn.querySelector('.english');

        if (this.currentTheme === 'dark') {
            if (icon) icon.className = 'fas fa-sun';
            if (pers) pers.textContent = 'روشن';
            if (eng) eng.textContent = 'Light';
        } else {
            if (icon) icon.className = 'fas fa-moon';
            if (pers) pers.textContent = 'تاریک';
            if (eng) eng.textContent = 'Dark';
        }
    }

    // Events & UI binding

    bindEvents() {
        // Language toggle
        if (this.dom.langToggle) {
            this.dom.langToggle.removeEventListener('click', this._langClickHandler);
            this._langClickHandler = () => this.toggleLanguage();
            this.dom.langToggle.addEventListener('click', this._langClickHandler, { passive: true });
        }

        // Theme toggle
        if (this.dom.themeToggle) {
            this.dom.themeToggle.removeEventListener('click', this._themeClickHandler);
            this._themeClickHandler = () => this.toggleTheme();
            this.dom.themeToggle.addEventListener('click', this._themeClickHandler, { passive: true });
        }

        // File input change
        if (this.dom.fileInput) {
            this.dom.fileInput.removeEventListener('change', this._fileChangeHandler);
            this._fileChangeHandler = (e) => this.handleFileSelect(e.target.files && e.target.files[0]);
            this.dom.fileInput.addEventListener('change', this._fileChangeHandler);
        }

        // Drop zone behavior (drag/drop/click)
        if (this.dom.dropZone) {
            // dragover
            this.dom.dropZone.removeEventListener('dragover', this._dragOverHandler);
            this._dragOverHandler = (e) => {
                e.preventDefault();
                this.dom.dropZone.classList.add('drag-over');
            };
            this.dom.dropZone.addEventListener('dragover', this._dragOverHandler);

            // dragleave
            this.dom.dropZone.removeEventListener('dragleave', this._dragLeaveHandler);
            this._dragLeaveHandler = () => this.dom.dropZone.classList.remove('drag-over');
            this.dom.dropZone.addEventListener('dragleave', this._dragLeaveHandler);

            // drop
            this.dom.dropZone.removeEventListener('drop', this._dropHandler);
            this._dropHandler = (e) => {
                e.preventDefault();
                this.dom.dropZone.classList.remove('drag-over');
                const file = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null;
                this.handleFileSelect(file);
            };
            this.dom.dropZone.addEventListener('drop', this._dropHandler);

            // click opens file selector
            this.dom.dropZone.removeEventListener('click', this._dropClickHandler);
            this._dropClickHandler = () => {
                if (this.dom.fileInput) this.dom.fileInput.click();
            };
            this.dom.dropZone.addEventListener('click', this._dropClickHandler);
        }

        // Esc to remove image preview
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = (e) => {
            if (e.key === 'Escape') this.removeImage();
        };
        document.addEventListener('keydown', this._escHandler);
    }

    // File handling & preview

    handleFileSelect(file) {
        if (!file || !file.type || !file.type.match('image.*')) {
            this.showError(this._t('Please select an image file', 'لطفاً یک فایل تصویری انتخاب کنید'));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showError(this._t('File size must be less than 5MB', 'حجم فایل باید کمتر از ۵ مگابایت باشد'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            this.showImagePreview(this.currentImage);

            // Auto analyze shortly after preview is shown
            setTimeout(() => this.analyzeImage(), 500);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(imageSrc) {
        const preview = this.dom.imagePreview;
        if (!preview) return;

        preview.innerHTML = `
            <div class="preview-container">
                <img class="preview-img" src="${imageSrc}" alt="Uploaded MRI preview">
                <button class="remove-image-btn" id="removeImageBtn" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        preview.style.display = 'block';

        // Wire remove button
        const removeBtn = document.getElementById('removeImageBtn');
        if (removeBtn) {
            removeBtn.removeEventListener('click', this._removeBtnHandler);
            this._removeBtnHandler = () => this.removeImage();
            removeBtn.addEventListener('click', this._removeBtnHandler);
        }
    }

    removeImage() {
        this.currentImage = null;

        if (this.dom.imagePreview) {
            this.dom.imagePreview.style.display = 'none';
            this.dom.imagePreview.innerHTML = '';
        }
        if (this.dom.fileInput) {
            this.dom.fileInput.value = '';
        }
        if (this.dom.resultsSection) {
            this.dom.resultsSection.style.display = 'none';
        }

        this.currentResults = null;
        this.hideProgressBar();
    }

    // Model orchestration & prediction 
    async _warmUpModelLoader() {
        // If a global modelLoader exists, attempt to warm it up (non-blocking)
        try {
            if (window.modelLoader) {
                if (window.modelLoader.loadPromise) {
                    await window.modelLoader.loadPromise.catch(() => {});
                }
            }
        } catch (err) {
            // Non-fatal; we do not block UI
            console.error('Model warm-up error', err);
        }
    }

    async analyzeImage() {
        if (!this.currentImage || this.isProcessing) return;

        // Ensure model loader is present
        if (!window.modelLoader) {
            this.showError(this._t(
                'AI system not ready. Please refresh the page.',
                'سامانه AI آماده نیست — صفحه را رفرش کنید'
            ));
            return;
        }

        // Guard: ensure predict function exists after model is loaded
        if (window.modelLoader.loadPromise) {
            // show progress while waiting
            this.showProgressBar();
            try {
                await window.modelLoader.loadPromise;
            } catch (err) {
                this.hideProgressBar();
                this.showError(this._t('Failed to load model', 'خطا در بارگذاری مدل'));
                return;
            }
        }

        if (typeof window.modelLoader.predict !== 'function') {
            this.showError(this._t('Model predict function is not available', 'توابع مدل در دسترس نیست'));
            return;
        }

        this.isProcessing = true;
        this.showProgressBar(0.2); // start at 20%

        try {
            // Create an Image element and wait to load
            const img = await this._createImageFromDataUrl(this.currentImage);
            this.showProgressBar(0.35); // 35%

            // Call model predict (allow modelLoader to accept image or canvas)
            const results = await window.modelLoader.predict(img);

            // Validate results shape (expect array-like)
            if (!results || !Array.isArray(results) || results.length === 0) {
                throw new Error('Invalid prediction output');
            }

            this.currentResults = results;
            this.displayResults(results);
            this.showProgressBar(1); // complete

        } catch (err) {
            console.error('Analysis error:', err);
            const msg = err && err.message ? err.message : this._t('Unknown analysis error', 'خطای ناشناخته در تحلیل');
            this.showError(this._t(`Analysis error: ${msg}`, `خطا در تحلیل تصویر: ${msg}`));
        } finally {
            this.isProcessing = false;
            // hide progress after brief delay to allow user see 100%
            setTimeout(() => this.hideProgressBar(), 600);
        }
    }

    _createImageFromDataUrl(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error('Failed to load image'));
        });
    }

    // Progress UI

    showProgressBar(initial = 0.0) {
        if (!this.dom.uploadProgress || !this.dom.progressFill) return;
        this.dom.uploadProgress.style.display = 'block';
        const pct = Math.min(Math.max(initial, 0), 1);
        this.dom.progressFill.style.width = `${Math.round(pct * 100)}%`;
        if (this.dom.progressPercent) this.dom.progressPercent.textContent = `${Math.round(pct * 100)}%`;
    }

    hideProgressBar() {
        if (!this.dom.uploadProgress || !this.dom.progressFill) return;
        this.dom.uploadProgress.style.display = 'none';
        this.dom.progressFill.style.width = '0%';
        if (this.dom.progressPercent) this.dom.progressPercent.textContent = '0%';
    }

    scrollToResults() {
        const box = this.dom.resultsSection;
        if (!box) return;

        const offset = 165; 

        window.scrollTo({
            top: box.offsetTop - offset,
            behavior: "smooth"
        });
    }

    // Results rendering

    displayResults(results) {
        const section = this.dom.resultsSection;
        const content = this.dom.resultsContent;
        if (!section || !content) return;

        // Primary result
        const primary = results[0] || { className: 'unknown', confidence: 0 };
        const diagnosisText = this._diagnosisText(primary.className);

        const warningText = this.currentLanguage === 'fa'
            ? '<strong>توجه:</strong> این نتایج توسط هوش مصنوعی تولید شده و جایگزین تشخیص پزشک نیست.'
            : '<strong>Disclaimer:</strong> These results are generated by AI and should not replace medical diagnosis.';

        // Prediction list
        const predictionsHtml = results.map(r => {
            const pct = Math.round((r.confidence || 0) * 1000) / 10;
            return `
                <div class="prediction-item">
                    <span class="prediction-label">${this._diagnosisText(r.className)}</span>
                    <div class="prediction-bar">
                        <div class="prediction-fill" style="width:${pct}%;"></div>
                    </div>
                    <span class="prediction-percent">${pct.toFixed(1)}%</span>
                </div>
            `;
        }).join('');

        // Render HTML
        content.innerHTML = `
            <div class="results-grid">
                <div class="diagnosis-main">
                    <div class="results-separator"></div>

                    <h4 class="diagnosis-title">${this.currentLanguage === 'fa' ? 'تشخیص نهایی:' : 'Final Diagnosis:'}</h4>
                    <div class="diagnosis-badge">${diagnosisText}</div>
                    <p class="confidence">
                        ${this.currentLanguage === 'fa' ? 'میزان اطمینان:' : 'Confidence:'}
                        <strong>${(primary.confidence * 100).toFixed(1)}%</strong>
                    </p>
                </div>

                <div class="predictions-list">
                    <h5>${this.currentLanguage === 'fa' ? 'همه احتمالات:' : 'All Predictions:'}</h5>
                    ${predictionsHtml}
                </div>
            </div>

            <div class="medical-warning">
                <div class="warning-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="warning-text"><p>${warningText}</p></div>
            </div>
        `;

        section.style.display = 'block';

        this.scrollToResults();
    }


    _diagnosisText(key) {
        const map = {
            'glioma': { fa: 'گلیوما', en: 'Glioma' },
            'meningioma': { fa: 'مننژیوما', en: 'Meningioma' },
            'notumor': { fa: 'بدون تومور', en: 'No Tumor' },
            'pituitary': { fa: 'تومور هیپوفیز', en: 'Pituitary Tumor' }
        };
        return (map[key] && map[key][this.currentLanguage]) || key;
    }

    // Small utilities

    // Localized helper: prefer English/ then fallback Persian when showing errors internally
    _t(en, fa) {
        return this.currentLanguage === 'fa' ? fa : en;
    }

    showError(message) {
        // Non-blocking toast at top center
        try {
            const toast = document.createElement('div');
            toast.className = 'position-fixed top-0 start-50 translate-middle-x bg-danger text-white p-2 rounded';
            toast.style.zIndex = 1060;
            toast.textContent = `BrainVision AI: ${message}`;
            document.body.appendChild(toast);
            setTimeout(() => {
                try { document.body.removeChild(toast); } catch (e) {}
            }, 3500);
        } catch (err) {
            // Fallback
            try { alert(`BrainVision AI: ${message}`); } catch (e) {}
        }
    }
}

// Instantiate singleton
(function bootstrap() {
    // Avoid duplicate initialization in case script is loaded twice
    if (window.brainVisionApp && window.brainVisionApp instanceof BrainVisionApp) {
        return;
    }
    window.brainVisionApp = new BrainVisionApp();
})();
