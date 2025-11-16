class ThemeSwitcher {
    constructor() {
        // Load saved theme or fallback to light
        this.currentTheme = localStorage.getItem("brainvision-theme") || "light";
        this.toggleBtn = document.getElementById("themeToggle");

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    applyTheme(theme) {
        // Apply theme class to body
        document.body.className = `${theme}-theme`;

        // Update icon if toggle button exists
        if (this.toggleBtn) {
            const icon = this.toggleBtn.querySelector("i");
            if (icon) {
                icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
            }
        }

        // Store selected theme
        localStorage.setItem("brainvision-theme", theme);
    }

    bindEvents() {
        if (!this.toggleBtn) return;

        // Toggle between light and dark themes
        this.toggleBtn.addEventListener("click", () => {
            this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
            this.applyTheme(this.currentTheme);
        });
    }
}

// Initialize theme switcher when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new ThemeSwitcher();
});
