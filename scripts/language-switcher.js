// scripts/language-switcher.js

class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('brainvision-language') || 'en';
        this.init();
    }

    init() {
        this.applyLanguage(this.currentLang);
        this.bindEvents();
    }

    applyLanguage(lang) {
        document.documentElement.dir  = lang === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        const btn = document.getElementById('langToggle');
        if (btn) {
            const text = btn.querySelector('span');
            if (text) text.textContent = lang === 'fa' ? 'EN' : 'FA';
        }

        localStorage.setItem('brainvision-language', lang);
    }

    bindEvents() {
        const btn = document.getElementById('langToggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.currentLang = this.currentLang === 'fa' ? 'en' : 'fa';
            this.applyLanguage(this.currentLang);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});
